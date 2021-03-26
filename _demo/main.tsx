import {render} from '@mybricks/rxui'
import {parse} from '..'
import {RenderReact} from "@mybricks/compiler-web";

import data from './dump.json'
import React from 'react'

// import libNormalLogic from '../../../opensource/comlib-logic-normal'
// import libPc from '../../../opensource/comlib-pc-normal'

import libNormalLogic from '../../../lib-normal-logic'
import libPc from '../../../lib-normal-ui-pc-v2'

// import libMab from '../../../demo-mpa/comlibs/comlib-pc-mab'

const pageAry = data['pageAry']
const allLibs = [libNormalLogic, libPc]

var parent = document.createElement('div')
render(GenRouter, parent, () => {
    document.getElementById('app').replaceWith(...[...parent.childNodes])
  }
)

function GenRouter() {
  const XX = genPage(pageAry[0].content, allLibs)
  return (
    <XX/>
  )
}

function genPage(pageContent, allLibs) {
  var {mainModule, requireComs} = parse(pageContent)

  var comDefs = {}

  requireComs.forEach(ns => {
    const onlyNs = ns.substring(0, ns.indexOf('@'))
    let comDef = findInLibs((com) => {
      if (`${com.namespace}@${com.version}` === ns) {
        return true
      }
    }, allLibs)

    if (!comDef) {
      comDef = findInLibs((com) => {
        if (com.namespace === onlyNs) {
          return true
        }
      }, allLibs)
    }
    if (!comDef) {
      throw new Error(`组件定义(${onlyNs})未找到.`)
    }

    comDefs[ns] = comDef.runtime
  })

  return PageCom(mainModule, comDefs)
}

function PageCom(mainModule, comDefs) {
  return () => {
    return RenderReact({
      mainModule: mainModule,
      comDefs: comDefs,
      runtimeCfg: {
        routeTo(id, params) {
          window.location.hash = id
        },
        getUserToken() {
          return '540a1e63a71e7fa3a494748356f790d1'
        },
        getEnvType() {
          return 'fat'
        },
        getEnvParam(name) {
          console.log(name)
          const TEMP = {////TODO
            userToken: '3b73a2405d2aafb9c0d3ba47ed8d8af7',
            env: 'fat',
            tripType: 0,
            id: '640872556332699648',
            bizType: 0
          }

          return TEMP[name]
        }
      }, logs: {
        info({catelog, content, focus, blur}) {
          console.log(catelog, content)
          // if(focus){//focus可以聚焦当前组件
          //   focus()
          // }
        },
        error({catelog, content, focus, blur}) {
          console.log(catelog, content)
        }
      }
    })
  }
}

function findInLibs(fn, libs) {
  var rtn;
  libs.find(lib => {
    if (lib && Array.isArray(lib.comAray)) {
      return rtn = lib.comAray.find(sth => fn(sth))
    }
  })
  return rtn;
}