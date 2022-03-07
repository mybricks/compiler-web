import {compile, createIO, I_Frame, I_Node, I_Pin, I_Runner} from "@mybricks/compiler-js";
import React, {useMemo} from "react";
import {clone, observable} from "@mybricks/rxui";
import RenderCom from "./RenderCom";

window['@mybricks/compiler-js'] = {
  compile,
  createIO
}

type T_LogItem = { catelog: string, content: string, isBaseType: boolean, focus: Function, blur: Function }

import * as css from './skin.less'

export function RenderReact({
                              mainModule,
                              comDefs,
                              inputParams,
                              inputs,
                              outputs,
                              env,
                              runtimeCfg,
                              logs,
                              events,
                              logger = () => {},
                              createPortal = () => {}
                            }: {
  mainModule: { frame: I_Frame, slot: {} },
  comDefs: { [nsAndVersion: string]: Function },
  inputParams?,
  inputs?: { [id: string]: (fn: Function) => void },
  outputs?: { [id: string]: Function },
  env: {
    // createPortal?: (children) => any,
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
  events: any[],
  logger: () => void,
  createPortal: (com: any) => void
}) {
  const jsx = useMemo(() => {
    const nComDefs = Object.assign({}, comDefs)

    const RT_MAPS = {}

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

            RT_MAPS[node.id] = {scopePath, frameLable, frames, io}

            const rtDef = node.def
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
                        pin?._exe(curScope, val, callback)
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
                  data: clone(node.model.data),
                  inputs: io.inputs,
                  outputs: io.outputs,
                  env: Object.assign({runtime: rtCfg}, env || {}),
                  logger: logger(node),
                  createPortal
                })
              } else {
                throw new Error(`未找到组件(${ns})`)
              }
            }

            return io
          }
        }
      }, pin(pin: I_Pin) {//处理Pin extension
        const comRT = pin.parent ? pin.parent : void 0

        return {
          exe(value: any) {
            if (pin.type.match(/^ext$/gi)) {
              if (pin.direction.match(/^input|inner-output$/gi)) {
                if (pin.hostId === 'show') {
                  pin.parent.model.style.display = 'block'
                } else if (pin.hostId === 'hide') {
                  pin.parent.model.style.display = 'none'
                }
              }

              return false
            }

            if (pin.direction.match(/^output|inner-input$/gi)) {
              if(comRT){
                const evts = comRT.model?.outputEvents
                if (evts) {
                  const eAry = evts[pin.id]
                  if (eAry && Array.isArray(eAry)) {
                    const activeEvt = eAry.find(e => e.active)
                    if (activeEvt) {
                      if (activeEvt.type === 'none') {
                        return false
                      }
                      if (activeEvt.type === 'defined') {
                        return
                      }

                      if (Array.isArray(events)) {
                        const def = events.find(ce => {
                          if (ce.type === activeEvt.type) {
                            return ce
                          }
                        })
                        if (def && typeof def.exe === 'function') {
                          def.exe({options: activeEvt.options}, value)
                        }
                      }
                      return false
                    }
                  }
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
                        catelog: `程序运行 ${comRT.title} | ${pin.title} ${pin.direction == 'input' || pin.direction == 'inner-input' ? '传入' : '传出'}`,
                        content: strVal,
                        isBaseType: !value || typeof value !== 'object',
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
    } as any)

    runner.run()({
      inputParams,
      inputs,
      outputs
    })

    const jsx = []

    // const rid = uuid()

    slot.comAry.forEach((node: I_Node) => {
      jsx.push(
        <ErrorBoundary key={node.id}   title={`${node.title} 组件发生错误`}>
          <RenderCom events={events} node={node} comDefs={nComDefs} env={env} runtimeCfg={runtimeCfg} createPortal={createPortal}
                     logger={logger}  rtMaps={RT_MAPS}/>
        </ErrorBoundary>
      )
    })
    return jsx
  }, [])

  return jsx
}

class ErrorBoundary extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {error: null, errorInfo: null};
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    // You can also log error messages to an error reporting service here
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <div className={css.errorRT}>
          <div className={css.tt}>{this.props.title}</div>
          <div className={css.info}>
            {this.state.error && this.state.error.toString()}
          </div>
          <div className={css.stack}>
            {this.state.errorInfo.componentStack}
          </div>
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}