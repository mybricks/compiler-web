import {compile, createIO, I_Frame, I_Node, I_Pin, I_Runner} from "@mybricks/compiler-js";
import {useMemo} from "react";
import {clone, observable} from "@mybricks/rxui";
import RenderCom from "./RenderCom";

type T_LogItem = { catelog: string, content: string, focus: Function, blur: Function }

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
                              logger = () => {
                              }
                            }: {
  mainModule: { frame: I_Frame, slot: {} },
  comDefs: { [nsAndVersion: string]: Function },
  inputParams?,
  inputs?: { [id: string]: (fn: Function) => void },
  outputs?: { [id: string]: Function },
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
  logger: () => void
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

    runner.run()({
      inputParams,
      inputs,
      outputs
    })

    const jsx = []

    // const rid = uuid()

    slot.comAry.forEach((node: I_Node) => {
      jsx.push(
        <ErrorBoundary key={node.runtime.id}   title={`${node.runtime.title} 组件发生错误`}>
          <RenderCom node={node} comDefs={nComDefs} env={env} runtimeCfg={runtimeCfg}
                     logger={logger} rtMaps={RT_MAPS}/>
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