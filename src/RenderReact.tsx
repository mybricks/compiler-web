import {compile, createIO, I_Frame, I_Node, I_Pin, I_Runner} from "@mybricks/compiler-js";
import {useMemo} from "react";
import {igonreObservableBefore, observable, clone} from "@mybricks/rxui";

import css from './skin.less'

const RT_MAPS = {}

type T_LogItem = { catelog: string, content: string, focus: Function, blur: Function }

export function RenderReact({
                              mainModule, comDefs, inputParams, output,
                              env,
                              runtimeCfg, logs, logger
                            }: {
  mainModule: { frame: I_Frame, slot: {} },
  comDefs: { [nsAndVersion: string]: Function },
  inputParams?,
  output?,
  env: {
    createPortal?: (children) => any,
    fetch?: (url: string) => Promise<any>
  },
  runtimeCfg: {
    getUserToken: () => string
    getEnvType: () => string
    getEnvParam: (name: string) => any,
    [name: string]: any
  },
  logs: {
    info: (item: T_LogItem) => void,
    error: (item: T_LogItem) => void
  },
  logger: () => {}
}) {
  const nComDefs = Object.assign({}, comDefs)

  const {frame, slot} = useMemo(() => {
    const {frame, slot} = observable(mainModule)
    const runner: I_Runner = compile(frame, {
      // envVars,
      node(node: I_Node) {
        return {
          render(scopePath: string, frameLable: string, frames: {}, curScope) {
            const io = createIO(node, {
              output() {
                //igonreObservableBefore()//TODO 待测试
              }
            })
            RT_MAPS[node.runtime.id] = {scopePath, frameLable, frames, io}

            const rtDef = node.runtime.def
            const rtType = rtDef.rtType

            if (rtType && rtType.match(/js/gi)) {//逻辑组件
              const rtCfg = Object.assign({
                get curModule() {
                  const module = node.parent.parent
                  if (module) {
                    const frame = node.parent
                    const outPins = frame.outputPins
                    const outputs = {}

                    outPins.forEach(pin => {
                      outputs[pin.id] = (val, callback) => {
                        pin._exe(curScope, val, callback)
                      }
                    })
                    return {
                      outputs
                    }
                  }
                }
              }, runtimeCfg)

              const ns = rtDef.namespace + '@' + rtDef.version
              const comRt = nComDefs[ns]
              if (comRt && typeof comRt === 'function') {
                comRt({
                  data: clone(node.runtime.model.data),
                  inputs: io.inputs,
                  outputs: io.outputs,
                  env: Object.assign({runtime: rtCfg}, env || {}),
                  logger: logger(node.runtime)
                })
              } else {
                throw new Error(`未找到组件(${ns})`)
              }
            }

            return io
          }
        }
      }, pin(pin: I_Pin) {//处理Pin extension
        const comRT = pin.parent.runtime ? pin.parent.runtime : void 0

        return {
          exe(value: any) {
            if (pin.type.match(/^ext$/gi)) {
              if (pin.direction.match(/^input|inner-output$/gi)) {
                if (pin.hostId === 'show') {
                  pin.parent.runtime.model.style.display = 'block'
                } else if (pin.hostId === 'hide') {
                  pin.parent.runtime.model.style.display = 'none'
                }
              }
            }

            const strVal = typeof value === 'object' && value ?
              JSON.stringify(value) :
              String(value)

            if (comRT) {
              if (logs) {
                if (typeof logs.info === 'function') {
                  setTimeout(v => {
                    logs.info({
                        catelog: '程序运行',
                        content: `${comRT.title} | ${pin.title} ${pin.direction == 'input' || pin.direction == 'inner-input' ? '传入' : '传出'} ${strVal}`,
                        focus() {
                          comRT._focus = true
                        },
                        blur() {
                          comRT._focus = void 0
                        }
                      }
                    )
                  })
                }
              }
            }
          }
        }
      }
    })

    runner.run()(inputParams ? {params: inputParams} : void 0)

    return {frame, slot}
  }, [])

  const jsx = []

  slot.comAry.forEach((node: I_Node) => {
    jsx.push(<RenderCom key={node.runtime.id} node={node} comDefs={nComDefs} env={env} runtimeCfg={runtimeCfg} logger={logger}/>)
  })
  return jsx
}

function RenderCom({node, comDefs, env, runtimeCfg, logger}: { node: {} & I_Node, comDefs, env, runtimeCfg, logger }) {
  const {slots: comSlots, runtime, parent} = node

  const rtType = runtime.def.rtType

  if (rtType && rtType.match(/js/gi)) {//逻辑组件
    return
  }

  const nodeModel = runtime.model

  const comRuntime = comDefs[runtime.def.namespace + '@' + runtime.def.version]
  const rt = RT_MAPS[runtime.id]

  //
  // if (!comRuntime) {
  //   debugger
  //   return
  // }

  //if (comRuntime) {
  const io = rt.io//inputs outpus
  const slots = {}
  if (comSlots) {
    comSlots.forEach(slot => {
      slots[slot.id] = {
        id: slot.id,
        title: slot.title,
        //comAry:slot.comAry,
        render() {
          const {frames} = RT_MAPS[runtime.id]
          const fn = frames[slot.id]
          if (typeof fn === 'function') {
            fn()//兼容之前的非框图
          }
          const comAry = slot.comAry
          return (
            <section className={calSlotStyle(slot)}>
              {
                comAry.map(com => {
                    return (
                      <RenderCom key={com.runtime.id} node={com} comDefs={comDefs} env={env} runtimeCfg={runtimeCfg} logger={logger}/>
                    )
                  }
                )
              }
            </section>
          )
        }
      }
    })
  }

  const style = nodeModel.style

  let absoluteStyle = {}

  if (parent.style.layout === 'absolute') {
    absoluteStyle.position = 'absolute'
    absoluteStyle.width = 'fit-content'
    absoluteStyle.top = style.top + 'px'
    absoluteStyle.left = style.left + 'px'
  }

  const nenv = Object.assign({
    runtime: runtimeCfg || {}
  }, env || {})

  return (
    <div id={node.runtime.id} style={{
      width: style.width || '100%',
      display: style.display,
      paddingTop: style.marginTop + 'px',
      paddingBottom: style.marginBottom + 'px',
      paddingLeft: style.marginLeft + 'px',
      paddingRight: style.marginRight + 'px',
      ...absoluteStyle
    }} className={`${node.runtime._focus ? css.debugFocus : ''}`}>
      {
        comRuntime({
          slots: slots,
          env: nenv,
          data: nodeModel.data,
          style,
          inputs: io.inputs,
          outputs: io.outputs,
          logger: logger(node.runtime)
        })
      }
    </div>)
  //}
}

function calSlotStyle(model) {
  const rtn = [css.slot]

  const style = model.style
  if (style) {
    if (style.layout?.toLowerCase() == 'flex-column') {
      rtn.push(css.lyFlexColumn)
    } else if (style.layout?.toLowerCase() == 'flex-row') {
      rtn.push(css.lyFlexRow)
    }

    const justifyContent = style.justifyContent
    if (justifyContent) {
      if (justifyContent.toUpperCase() === 'FLEX-START') {
        rtn.push(css.justifyContentFlexStart)
      } else if (justifyContent.toUpperCase() === 'CENTER') {
        rtn.push(css.justifyContentFlexCenter)
      } else if (justifyContent.toUpperCase() === 'FLEX-END') {
        rtn.push(css.justifyContentFlexFlexEnd)
      } else if (justifyContent.toUpperCase() === 'SPACE-AROUND') {
        rtn.push(css.justifyContentFlexSpaceAround)
      } else if (justifyContent.toUpperCase() === 'SPACE-BETWEEN') {
        rtn.push(css.justifyContentFlexSpaceBetween)
      }
    }

    const alignItems = style.alignItems
    if (alignItems) {
      if (alignItems.toUpperCase() === 'FLEX-START') {
        rtn.push(css.alignItemsFlexStart)
      } else if (alignItems.toUpperCase() === 'CENTER') {
        rtn.push(css.alignItemsFlexCenter)
      } else if (alignItems.toUpperCase() === 'FLEX-END') {
        rtn.push(css.alignItemsFlexFlexEnd)
      }
    }
  }

  return rtn.join(' ')
}