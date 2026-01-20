import { describe, it, expect } from "vitest"
import { createMarket } from "../src/index"

describe("Runtime Validation", () => {
    describe("market.add()", () => {
        it("should throw TypeError when name is not a string", () => {
            const market = createMarket()
            // @ts-expect-error - Testing runtime validation
            expect(() => market.add(123)).toThrow(TypeError)
            expect(() => market.add(123 as any)).toThrow(
                "123 contains invalid characters for a JavaScript identifier, or doesn't start with a letter, underscore, or dollar sign"
            )
        })

        it("should throw Error when name already exists", () => {
            const market = createMarket()
            market.add("test").request<string>()
            expect(() => market.add("test")).toThrow(
                "Name test already exists"
            )
        })
    })

    describe("product()", () => {
        it("should throw TypeError when config is not an object", () => {
            const market = createMarket()
            expect(() => market.add("A").product(null as any)).toThrow(
                TypeError
            )
            expect(() => market.add("B").product(null as any)).toThrow(
                "B must be an object, got null"
            )
        })

        it("should throw TypeError when config is an array", () => {
            const market = createMarket()
            expect(() => market.add("A").product([] as any)).toThrow(
                TypeError
            )
            expect(() => market.add("B").product([] as any)).toThrow(
                "B must be an object, not an array"
            )
        })

        it("should throw TypeError when factory is missing", () => {
            const market = createMarket()
            expect(() => market.add("A").product({} as any)).toThrow(
                TypeError
            )
            expect(() => market.add("B").product({} as any)).toThrow(
                "B must have a 'factory' property"
            )
        })

        it("should throw TypeError when factory is not a function", () => {
            const market = createMarket()
            expect(() =>
                market
                    .add("A")
                    .product({ factory: "not a function" } as any)
            ).toThrow(TypeError)
            expect(() =>
                market
                    .add("B")
                    .product({ factory: "not a function" } as any)
            ).toThrow("B must be a function, got string")
        })

        it("should throw TypeError when suppliers is not an array", () => {
            const market = createMarket()
            expect(() =>
                market.add("A").product({
                    factory: () => ({}),
                    suppliers: "not an array"
                } as any)
            ).toThrow(TypeError)
            expect(() =>
                market.add("B").product({
                    factory: () => ({}),
                    suppliers: "not an array"
                } as any)
            ).toThrow("B must be an array")
        })

        it("should throw TypeError when lazy is not a boolean", () => {
            const market = createMarket()
            expect(() =>
                market.add("A").product({
                    factory: () => ({}),
                    lazy: "yes"
                } as any)
            ).toThrow(TypeError)
            expect(() =>
                market.add("B").product({
                    factory: () => ({}),
                    lazy: "yes"
                } as any)
            ).toThrow("B.lazy must be a boolean, got string")
        })
    })

    describe("productSupplier.assemble()", () => {
        it("should throw TypeError when supplied is not an object", () => {
            const market = createMarket()
            const $resource = market.add("resource").product({
                factory: () => ({})
            })
            expect(() => $resource.assemble(null as any)).toThrow(TypeError)
            expect(() => $resource.assemble(null as any)).toThrow(
                "supplied must be an object, got null"
            )
        })

        it("should throw TypeError when supplied is an array", () => {
            const market = createMarket()
            const $resource = market.add("resource").product({
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
            const market = createMarket()
            const $resource = market.add("resource").product({
                factory: () => ({})
            })
            expect(() => $resource.hire(null as any)).toThrow(TypeError)
            expect(() => $resource.hire(null as any)).toThrow(TypeError)
        })

        it("should throw TypeError when supplier is missing name property", () => {
            const market = createMarket()
            const $resource = market.add("resource").product({
                factory: () => ({})
            })
            expect(() => $resource.hire({} as any)).toThrow(TypeError)
        })
    })

    describe("productSupplier.mock()", () => {
        it("should throw TypeError when config is not an object", () => {
            const market = createMarket()
            const $resource = market.add("resource").product({
                factory: () => ({})
            })
            expect(() => $resource.mock(null as any)).toThrow(TypeError)
            expect(() => $resource.mock(null as any)).toThrow(
                "resource must be an object, got null"
            )
        })

        it("should throw TypeError when factory is missing", () => {
            const market = createMarket()
            const $resource = market.add("resource").product({
                factory: () => ({})
            })
            expect(() => $resource.mock({} as any)).toThrow(TypeError)
            expect(() => $resource.mock({} as any)).toThrow(
                "resource must have a 'factory' property"
            )
        })
    })
})
