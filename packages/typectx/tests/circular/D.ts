import { market } from "./market"
import { $C, $G, $K } from "./C"

// @ts-expect-error - circular dependency
export const $D = market.add("D").product({
    suppliers: [$C],
    factory: () => "D"
})

// @ts-expect-error - circular dependency
export const $H = market.add("H").product({
    assemblers: [$G],
    factory: () => "H"
})

// @ts-expect-error - circular dependency
export const $L = market.add("L").product({
    assemblers: [$K],
    factory: () => "L"
})
