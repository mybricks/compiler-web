import {render} from '@mybricks/rxui'
import {parse} from '..'
import {RenderReact} from "@mybricks/compiler-web";

import data from './dump.json'
import React, {useMemo} from 'react'

// import libNormalLogic from '../../../opensource/comlib-logic-normal'
// import libPc from '../../../opensource/comlib-pc-normal'

import libPc from '../../../Kwai/comlibs/h5-common-lib/test.js'
import {getComLogger} from "../../../Kwai/fangzhou-paas/src/apps/eshop-activity/desn/publish/entry/utils";

// import libMab from '../../../demo-mpa/comlibs/comlib-pc-mab'

const pageAry = data['pageAry']
const allLibs = [libPc]

var parent = document.createElement('div')
render(GenRouter, document.getElementById('app'), () => {
    //document.getElementById('app').replaceWith(...[...parent.childNodes])
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

  console.log('-------111')

  return PageCom(mainModule, comDefs)
}

function PageCom(mainModule, comDefs) {
  return () => {
    console.log('-------222')

    const xx = useMemo(()=><RenderReact mainModule={mainModule} comDefs={comDefs}
                                        logs={{
                                          info({catelog, content, focus, blur}) {
                                          console.log(catelog, content)
                                        },
                                          error({catelog, content, focus, blur}) {
                                          console.log(catelog, content)
                                        }
                                        }}/>,[])

    return xx
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