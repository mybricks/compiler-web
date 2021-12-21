import {KEY_REF, PIN_KEYS} from "./constants";

export function parse(pageData) {
  const refs = pageData.refs
  const slot = getRef(refs, pageData.slot)
  const frame = getRef(refs, pageData.frame)
  const requireComs: string[] = []
  
  function parseFrame(frame) {
    const { comAry, model, def, parent } = frame

    PIN_KEYS.forEach(key => {
      const pins = frame[key]

      pins?.forEach((pin, idx) => {
        const realPin = getRef(refs, pin) || pin

        if (realPin) {
          if (Array.isArray(realPin.conAry)) {
            realPin.conAry.forEach((con, idx) => {
              const realCon = getRef(refs, con)
  
              if (!realCon && !con.id) {
                delete realPin.conAry[idx]
              }
  
              if (!realCon) return
  
              const { finishPin, startPin } = realCon
              const realFinishPin = getRef(refs, finishPin)
              const realStartPin = getRef(refs, startPin)
  
              if (realFinishPin) {
                realCon.finishPin = realFinishPin
              }
  
              if (realStartPin) {
                realCon.startPin = realStartPin
              }
  
              realPin.conAry[idx] = realCon
            })

            const conAry = realPin.conAry.filter(con => con)

            if (!conAry?.length) {
              delete realPin.conAry
            } else {
              realPin.conAry = conAry
            }
          }

          const realParent = getRef(refs, realPin.parent)

          if (realParent) {
            realPin.parent = realParent
          }

          frame[key][idx] = realPin
        }
      })
    })

    if (model) {
      const realModel = getRef(refs, model)

      if (realModel) {
        parseFrame(realModel)
        frame.model = realModel
      }
    }

    if (def) {
      const key = def.namespace + '@' + def.version
  
      if (requireComs.indexOf(key) <= 0) {
        requireComs.push(key)
      }
    }

    if (parent) {
      const realParent = getRef(refs, parent)

      if (realParent) {
        frame.parent = realParent
      }
    }

    comAry?.forEach((com, idx) => {
      const realCom = getRef(refs, com) || com

      parseFrame(realCom)

      comAry[idx] = realCom
    })
  }
  
  function parseSlot(slot) {
    const { comAry } = slot

    comAry?.forEach((com, idx) => {
      const realCom = getRef(refs, com)
      
      if (!realCom) return

      const { model, parent, slots } = realCom

      const realModel = getRef(refs, model)

      if (realModel) {
        com = realCom

        if (getRef(refs, realCom.model)) {
          realCom.model = getRef(refs, realCom.model)
        }
      }

      const realParent = getRef(refs, parent)

      if (realParent) {
        com.parent = realParent
      }

      slots?.forEach((slot, idx) => {
        const realSlot = getRef(refs, slot)

        if (realSlot) {
          
          parseSlot(realSlot)
          slots[idx] = realSlot
        }
      })

      comAry[idx] = com
    })
  }

  parseFrame(frame)
  parseSlot(slot)

  return {mainModule: {frame, slot}, requireComs}
}

function getRef(refs, obj) {
  const refKey = obj?.[KEY_REF]

  return refKey && refs?.[refKey]
}



// import {E_ItemType, I_Frame, isTypeof} from "@mybricks/compiler-js";
// import {KEY_STAGEVIEW, KEY_REF} from "./constants";

// let allRefs, refLoaded, translatedMap, KREF
// let transProps: (prop) => string

// type T_Rtn = {
//   requireComs: string[],
//   mainModule: {
//     frame: I_Frame,
//     geo: {}
//   }
// }

// export function parse(oriPageContent: { [KEY_STAGEVIEW] }): T_Rtn {
//   //console.time("str")
//   const pageContent = JSON.parse(JSON.stringify(oriPageContent))
//   //let pageContent = oriPageContent

//   translatedMap = new WeakMap()
//   refLoaded = {}

//   const stageView = pageContent[KEY_STAGEVIEW]

//   const {def, refs, D, consts} = stageView

//   if (consts) {//old version
//     KREF = '_ref_'
//     transProps = p => p
//   } else {
//     KREF = KEY_REF
//     transProps = p => {
//       if (D?.W) {
//         return D.W[p]
//       } else {
//         return p
//       }
//     }
//   }

//   allRefs = refs;

//   const requireComs = []

//   //const uid = uuid()

//   const model = getRef(def[KREF])
//   const mainModule = model['mainModule']
//   if (mainModule.frame) {
//     function parseFrame(frame) {
//       //frame.id +=uid
//       if (frame.comAry) {
//         frame.comAry.forEach(com => {
//           if (isTypeof(com, E_ItemType.NODE)) {
//             const {runtime} = com
//             //runtime.id += uid//uuid
//             const key = runtime.def.namespace + '@' + runtime.def.version
//             if (requireComs.indexOf(key) <= 0) {
//               requireComs.push(key)
//             }
//             if (com.frames) {
//               com.frames.forEach(fr => parseFrame(fr))
//             }

//           }
//         })
//       }
//     }

//     parseFrame(mainModule.frame)
//   }

//   const rtn = {mainModule, requireComs}

//   allRefs = void 0
//   refLoaded = void 0
//   translatedMap = void 0

//   //console.timeEnd("str") //结束

//   return rtn
// }

// function getRef(ref: string) {
//   let model = refLoaded[ref]
//   if (model) {
//     return model
//   }
// //debugger
//   refLoaded[ref] = model = allRefs[ref]
//   translate(model)
//   return model
// }


// function translate(obj) {
//   if (obj && translatedMap.has(obj)) {
//     return translatedMap.get(obj)
//   }

//   if (typeof obj === 'object' && obj) {
//     let rtn

//     if (obj[KREF]) {
//       rtn = getRef(obj[KREF])
//       translatedMap.set(obj, rtn)
//     } else {
//       translatedMap.set(obj, obj)

//       Object.keys(obj).forEach(nm => {
//         let tv = obj[nm]

//         if (Array.isArray(tv)) {
//           tv.forEach((item, index) => {
//             tv[index] = translate(item)
//           })
//         } else {
//           const nprop = transProps(nm)
//           obj[nprop] = translate(tv)
//         }
//       })
//       rtn = obj
//     }

//     return rtn
//   }
//   return obj
// }
