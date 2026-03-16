import { describe, it, expectTypeOf } from "vitest"
import { supplier } from "#index"
import type { DuplicateDependencyError } from "#types/guards"

describe("Duplicate Guard", () => {
    it("returns DuplicateDependencyError type for duplicate suppliers", () => {
        const $dep = supplier("dep").product({
            factory: () => "dep"
        })

        const $withDuplicate = supplier("withDuplicate").product({
            suppliers: [$dep, $dep],
            factory: () => "main"
        })

        expectTypeOf($withDuplicate).toExtend<DuplicateDependencyError>()
    })
})
