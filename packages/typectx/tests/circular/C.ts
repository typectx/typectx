import { market } from "./market"
import { $B, $F, $J } from "./B"

// @ts-expect-error - circular dependency
export const $C = market.add("C").static({
    suppliers: [$B],
    factory: () => "C"
})

// @ts-expect-error - circular dependency
export const $G = market.add("G").static({
    assemblers: [$F],
    factory: () => "G"
})

// @ts-expect-error - circular dependency
export const $K = market.add("K").static({
    suppliers: [$J],
    factory: () => "K"
})
