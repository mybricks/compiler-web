import {useEffect, useMemo} from "react";

const counterMap: { [key: string]: { c: number, last: number } } = {}

export function useStub(fn, key) {
  useEffect(() => {
    let tv = counterMap[key]
    if (tv === void 0) {
      tv = {c: 0, last: new Date().getTime()}
      counterMap[key] = tv
    }

    const now = new Date().getTime()
    if (now - tv.last < 17) {
      tv.c++
      tv.last = now
    }

    if (tv.c > 1000) {
      fn()
    }
  })
}