import { supplier } from "#index"
import type { CircularDependencyError } from "#types/guards"
import { describe, expect, expectTypeOf, it } from "vitest"

describe("Circular test", () => {
    it("throws for circular dependencies at runtime", () => {
        const $a1 = supplier("a1").product({
            factory: () => "a1"
        })

        expect(() => {
            const $a11 = supplier("a1").product({
                suppliers: [$a1],
                factory: () => "a2"
            })
        }).toThrow()
    })

    it("types circular product as CircularDependencyError", () => {
        const $a1 = supplier("a1").product({
            factory: () => "a1"
        })

        function circularProduct() {
            return supplier("a1").product({
                suppliers: [$a1],
                factory: () => "a2"
            })
        }

        expectTypeOf(
            circularProduct
        ).returns.toExtend<CircularDependencyError>()
    })
})
