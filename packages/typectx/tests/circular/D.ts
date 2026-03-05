import { supplier } from "#index"
import { $C, $G, $K } from "./C"

// @ts-expect-error - circular dependency
export const $D = supplier("D").product({
    suppliers: [$C],
    factory: () => "D"
})

// @ts-expect-error - circular dependency
export const $H = supplier("H").product({
    assemblers: [$G],
    factory: () => "H"
})

// @ts-expect-error - circular dependency
export const $L = supplier("L").product({
    assemblers: [$K],
    factory: () => "L"
})
