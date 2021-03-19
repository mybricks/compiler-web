import {E_ItemType, I_Frame, isTypeof} from "@mybricks/compiler-js";
import {KEY_STAGEVIEW} from "./constants";

let allRefs, refLoaded = {};

type T_Rtn = {
  requireComs: string[],
  mainModule: {
    frame: I_Frame,
    geo: {}
  }
}

export function parse(pageContent: { [KEY_STAGEVIEW] }): T_Rtn {
  refLoaded = {}

  const stageView = pageContent[KEY_STAGEVIEW]

  const {def, refs} = stageView

  allRefs = refs;

  const requireComs = []

  const model = getRef(def['_ref_'])
  const mainModule = model['mainModule']
  if (mainModule.frame) {
    function parseFrame(frame) {
      if (frame.comAry) {
        frame.comAry.forEach(com => {
          if (isTypeof(com, E_ItemType.NODE)) {
            const {runtime} = com
            const key = runtime.def.namespace + '@' + runtime.def.version
            if (requireComs.indexOf(key) <= 0) {
              if (!runtime.def.namespace.startsWith('xg-comlib')
                && !runtime.def.namespace.startsWith('xgraph.coms.module')
              ) {
                requireComs.push(key)
              }
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

  return {mainModule, requireComs}
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
  if (typeof obj === 'object' && obj) {
    if (obj['_ref_']) {
      return getRef(obj['_ref_'])
    } else {
      Object.keys(obj).forEach(nm => {
        let tv = obj[nm]

        if (Array.isArray(tv)) {
          tv.forEach((item, index) => {
            tv[index] = translate(item)
          })
        } else {
          obj[nm] = translate(tv)
        }
      })
    }
  }
  return obj
}
