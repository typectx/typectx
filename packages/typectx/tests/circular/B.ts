import { market } from "./market"
import { $A, $E, $I } from "./A"

// @ts-expect-error - circular dependency
export const $B = market.add("B").product({
    suppliers: [$A],
    factory: () => "B"
})

// @ts-expect-error - circular dependency
export const $F = market.add("F").product({
    assemblers: [$E],
    factory: () => "F"
})

// @ts-expect-error - circular dependency
export const $J = market.add("J").product({
    assemblers: [$I],
    factory: () => "J"
})
