import {useEffect, useMemo} from "react";

const counterMap = {}

export function useStub(fn,key) {
  useEffect(() => {
    let t = counterMap[key]
    if (t === void 0) {
      t = 0
    }
    counterMap[key] = ++t

    if (t > 1000) {
      fn()
    }
  })


  // useEffect(() => {
  //   return () => {
  //     let t = counterMap[key]
  //     if (t === void 0) {
  //       t = 0
  //     }
  //     counterMap[key] = t++
  //
  //     if(t>1000){
  //       throw new Error(`xxxxx`)
  //     }
  //   }
  // })
}