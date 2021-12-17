import {E_ItemType, I_Frame, isTypeof} from "@mybricks/compiler-js";
import {KEY_STAGEVIEW, KEY_REF} from "./constants";

let allRefs, refLoaded, translatedMap, KREF
let transProps: (prop) => string

type T_Rtn = {
  requireComs: string[],
  mainModule: {
    frame: I_Frame,
    geo: {}
  }
}

export function parse(oriPageContent: { [KEY_STAGEVIEW] }): T_Rtn {
  //console.time("str")
  const pageContent = JSON.parse(JSON.stringify(oriPageContent))
  //let pageContent = oriPageContent

  translatedMap = new WeakMap()
  refLoaded = {}

  const stageView = pageContent[KEY_STAGEVIEW]

  const {def, refs, D, consts} = stageView

  if (consts) {//old version
    KREF = '_ref_'
    transProps = p => p
  } else {
    KREF = KEY_REF
    transProps = p => {
      if (D?.W) {
        return D.W[p]
      } else {
        return p
      }
    }
  }

  allRefs = refs;

  const requireComs = []

  //const uid = uuid()

  const model = getRef(def[KREF])
  const mainModule = model['mainModule']
  if (mainModule.frame) {
    function parseFrame(frame) {
      //frame.id +=uid
      if (frame.comAry) {
        frame.comAry.forEach(com => {
          if (isTypeof(com, E_ItemType.NODE)) {
            const {runtime} = com
            //runtime.id += uid//uuid
            const key = runtime.def.namespace + '@' + runtime.def.version
            if (requireComs.indexOf(key) <= 0) {
              requireComs.push(key)
            }
            if (com.frames) {
              com.frames.forEach(fr => parseFrame(fr))
            }

          }
        })
      }
    }

    parseFrame(mainModule.frame)
  }

  const rtn = {mainModule, requireComs}

  allRefs = void 0
  refLoaded = void 0
  translatedMap = void 0

  //console.timeEnd("str") //结束

  return rtn
}

function getRef(ref: string) {
  let model = refLoaded[ref]
  if (model) {
    return model
  }
//debugger
  refLoaded[ref] = model = allRefs[ref]
  translate(model)
  return model
}


function translate(obj) {
  if (obj && translatedMap.has(obj)) {
    return translatedMap.get(obj)
  }

  if (typeof obj === 'object' && obj) {
    let rtn

    if (obj[KREF]) {
      rtn = getRef(obj[KREF])
      translatedMap.set(obj, rtn)
    } else {
      translatedMap.set(obj, obj)

      Object.keys(obj).forEach(nm => {
        let tv = obj[nm]

        if (Array.isArray(tv)) {
          tv.forEach((item, index) => {
            tv[index] = translate(item)
          })
        } else {
          const nprop = transProps(nm)
          obj[nprop] = translate(tv)
        }
      })
      rtn = obj
    }

    return rtn
  }
  return obj
}
