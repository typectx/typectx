import { supplier } from "#index"
import { $B, $F, $J } from "./B"

// @ts-expect-error - circular dependency
export const $C = supplier("C").product({
    suppliers: [$B],
    factory: () => "C"
})

// @ts-expect-error - circular dependency
export const $G = supplier("G").product({
    assemblers: [$F],
    factory: () => "G"
})

// @ts-expect-error - circular dependency
export const $K = supplier("K").product({
    suppliers: [$J],
    factory: () => "K"
})
