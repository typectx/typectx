import { supplier } from "#index"
import { $D, $H, $L } from "./D"

// @ts-expect-error - circular dependency
export const $A = supplier("A").product({
    suppliers: [$D],
    factory: () => "A"
})

// @ts-expect-error - circular dependency
export const $E = supplier("E").product({
    assemblers: [$H],
    factory: () => "E"
})

// @ts-expect-error - circular dependency
export const $I = supplier("I").product({
    suppliers: [$L],
    factory: () => "I"
})
