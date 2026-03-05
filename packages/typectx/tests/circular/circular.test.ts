import { describe, it, expectTypeOf } from "vitest"
import type { CircularDependencyError } from "#types"

// Type-only reference: no runtime import of ./A, so no flakiness from ESM circular init order.
// The type checker still resolves the circular chain and infers CircularDependencyError for $A.
type TypeOfA = (typeof import("./A"))["$A"]

describe("Circular Dependencies", () => {
    it("should detect circular dependencies at type level", () => {
        expectTypeOf<TypeOfA>().not.toEqualTypeOf<any>()
        expectTypeOf<TypeOfA>().toExtend<CircularDependencyError>()
    })
})
