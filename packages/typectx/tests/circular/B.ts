import { supplier } from "#index"
import { $A, $E, $I } from "./A"

// @ts-expect-error - circular dependency
export const $B = supplier("B").product({
    suppliers: [$A],
    factory: () => "B"
})

// @ts-expect-error - circular dependency
export const $F = supplier("F").product({
    assemblers: [$E],
    factory: () => "F"
})

// @ts-expect-error - circular dependency
export const $J = supplier("J").product({
    assemblers: [$I],
    factory: () => "J"
})
