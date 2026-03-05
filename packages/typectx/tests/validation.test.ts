import { describe, it, expect } from "vitest"
import { supplier } from "#index"

describe("Runtime Validation", () => {
    describe("request()", () => {
        it("should create request suppliers and allow packing values", () => {
            const $value = supplier("value").request<string>()
            const packed = $value.pack("test")

            expect($value.name).toBe("value")
            expect(packed.unpack()).toBe("test")
        })

        it("should still enforce runtime product validation under the flat API", () => {
            expect(() => supplier("test").product({} as any)).toThrow(TypeError)
            expect(() => supplier("test").product({} as any)).toThrow(
                "test must have a 'factory' property"
            )
        })
    })

    describe("product()", () => {
        it("should throw TypeError when config is not an object", () => {
            expect(() => supplier("A").product(null as any)).toThrow(TypeError)
            expect(() => supplier("B").product(null as any)).toThrow(
                "B must be an object, got null"
            )
        })

        it("should throw TypeError when config is an array", () => {
            expect(() => supplier("A").product([] as any)).toThrow(TypeError)
            expect(() => supplier("B").product([] as any)).toThrow(
                "B must be an object, not an array"
            )
        })

        it("should throw TypeError when factory is missing", () => {
            expect(() => supplier("A").product({} as any)).toThrow(TypeError)
            expect(() => supplier("B").product({} as any)).toThrow(
                "B must have a 'factory' property"
            )
        })

        it("should throw TypeError when factory is not a function", () => {
            expect(() =>
                supplier("A").product({ factory: "not a function" } as any)
            ).toThrow(TypeError)
            expect(() =>
                supplier("B").product({ factory: "not a function" } as any)
            ).toThrow("B must be a function, got string")
        })

        it("should throw TypeError when suppliers is not an array", () => {
            expect(() =>
                supplier("A").product({
                    factory: () => ({}),
                    suppliers: "not an array"
                } as any)
            ).toThrow(TypeError)
            expect(() =>
                supplier("B").product({
                    factory: () => ({}),
                    suppliers: "not an array"
                } as any)
            ).toThrow("B must be an array")
        })

        it("should throw TypeError when lazy is not a boolean", () => {
            expect(() =>
                supplier("A").product({
                    factory: () => ({}),
                    lazy: "yes"
                } as any)
            ).toThrow(TypeError)
            expect(() =>
                supplier("B").product({
                    factory: () => ({}),
                    lazy: "yes"
                } as any)
            ).toThrow("B.lazy must be a boolean, got string")
        })
    })

    describe("productSupplier.assemble()", () => {
        it("should throw TypeError when supplied is not an object", () => {
            const $resource = supplier("resource").product({
                factory: () => ({})
            })
            expect(() => $resource.assemble(null as any)).toThrow(TypeError)
            expect(() => $resource.assemble(null as any)).toThrow(
                "supplied must be an object, got null"
            )
        })

        it("should throw TypeError when supplied is an array", () => {
            const $resource = supplier("resource").product({
                factory: () => ({})
            })
            expect(() => $resource.assemble([] as any)).toThrow(TypeError)
            expect(() => $resource.assemble([] as any)).toThrow(
                "supplied must be an object, not an array"
            )
        })
    })

    describe("productSupplier.hire()", () => {
        it("should throw TypeError when suppliers contain invalid items", () => {
            const $resource = supplier("resource").product({
                factory: () => ({})
            })
            expect(() => $resource.hire(null as any)).toThrow(TypeError)
            expect(() => $resource.hire(null as any)).toThrow(TypeError)
        })

        it("should throw TypeError when supplier is missing name property", () => {
            const $resource = supplier("resource").product({
                factory: () => ({})
            })
            expect(() => $resource.hire({} as any)).toThrow(TypeError)
        })
    })

    describe("productSupplier.mock()", () => {
        it("should throw TypeError when config is not an object", () => {
            const $resource = supplier("resource").product({
                factory: () => ({})
            })
            expect(() => $resource.mock(null as any)).toThrow(TypeError)
            expect(() => $resource.mock(null as any)).toThrow(
                "resource must be an object, got null"
            )
        })

        it("should throw TypeError when factory is missing", () => {
            const $resource = supplier("resource").product({
                factory: () => ({})
            })
            expect(() => $resource.mock({} as any)).toThrow(TypeError)
            expect(() => $resource.mock({} as any)).toThrow(
                "resource must have a 'factory' property"
            )
        })
    })
})
