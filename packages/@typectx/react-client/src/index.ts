import { useLayoutEffect, useState } from "react"

export function use$<INIT$, INIT$$>(init$: INIT$, init$$: INIT$$) {
    const [$, set$] = useState<INIT$>(() => init$)
    return $
}
