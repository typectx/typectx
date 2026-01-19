import { market } from "./market"
import { $C, $G, $K } from "./C"

// @ts-expect-error - circular dependency
export const $D = market.add("D").static({
    suppliers: [$C],
    factory: () => "D"
})

// @ts-expect-error - circular dependency
export const $H = market.add("H").static({
    assemblers: [$G],
    factory: () => "H"
})

// @ts-expect-error - circular dependency
export const $L = market.add("L").static({
    assemblers: [$K],
    factory: () => "L"
})
