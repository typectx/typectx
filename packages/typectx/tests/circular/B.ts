import { market } from "./market"
import { $A, $E, $I } from "./A"

// @ts-expect-error - circular dependency
export const $B = market.add("B").static({
    suppliers: [$A],
    factory: () => "B"
})

// @ts-expect-error - circular dependency
export const $F = market.add("F").static({
    assemblers: [$E],
    factory: () => "F"
})

// @ts-expect-error - circular dependency
export const $J = market.add("J").static({
    assemblers: [$I],
    factory: () => "J"
})
