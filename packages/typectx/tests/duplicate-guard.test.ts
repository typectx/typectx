import { describe, it, expectTypeOf } from "vitest"
import { service } from "#index"
import type { DuplicateDependencyError } from "#types/guards"

describe("Duplicate Guard", () => {
    it("returns DuplicateDependencyError type for duplicate services", () => {
        const $dep = service("dep").app({
            factory: () => "dep"
        })

        const $withDuplicate = service("withDuplicate").app({
            services: [$dep, $dep],
            factory: () => "main"
        })

        expectTypeOf($withDuplicate).toExtend<DuplicateDependencyError>()
    })
})
