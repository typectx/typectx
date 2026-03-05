import { describe, it, expectTypeOf } from "vitest"
import { supplier, type DuplicateDependencyError } from "#index"

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

    it("returns DuplicateDependencyError for duplicates across suppliers and assemblers", () => {
        const $shared = supplier("shared").product({
            factory: () => "shared"
        })

        const $withCrossTupleDuplicate = supplier(
            "withCrossTupleDuplicate"
        ).product({
            suppliers: [$shared],
            assemblers: [$shared],
            factory: () => "main"
        })

        expectTypeOf(
            $withCrossTupleDuplicate
        ).toExtend<DuplicateDependencyError>()
    })
})
