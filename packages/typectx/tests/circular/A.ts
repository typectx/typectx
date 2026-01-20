import { market } from "./market"
import { $D, $H, $L } from "./D"

// @ts-expect-error - circular dependency
export const $A = market.add("A").product({
    suppliers: [$D],
    factory: () => "A"
})

// @ts-expect-error - circular dependency
export const $E = market.add("E").product({
    assemblers: [$H],
    factory: () => "E"
})

// @ts-expect-error - circular dependency
export const $I = market.add("I").product({
    suppliers: [$L],
    factory: () => "I"
})
