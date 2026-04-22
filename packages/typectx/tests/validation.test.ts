import { describe, it, expect } from "vitest"
import { service } from "#index"

describe("Runtime Validation", () => {
    describe("request()", () => {
        it("should create request services and allow packing values", () => {
            const $value = service("value").request<string>()
            const packed = $value.pack("test")

            expect($value.name).toBe("value")
            expect(packed.unpack()).toBe("test")
        })

        it("should enforce runtime app service config validation under the flat API", () => {
            expect(() => service("test").app({} as any)).toThrow(TypeError)
            expect(() => service("test").app({} as any)).toThrow(
                "test must have a 'factory' property"
            )
        })
    })

    describe("app()", () => {
        it("should throw TypeError when config is not an object", () => {
            expect(() => service("A").app(null as any)).toThrow(TypeError)
            expect(() => service("B").app(null as any)).toThrow(
                "B must be an object, got null"
            )
        })

        it("should throw TypeError when config is an array", () => {
            expect(() => service("A").app([] as any)).toThrow(TypeError)
            expect(() => service("B").app([] as any)).toThrow(
                "B must be an object, not an array"
            )
        })

        it("should throw TypeError when factory is missing", () => {
            expect(() => service("A").app({} as any)).toThrow(TypeError)
            expect(() => service("B").app({} as any)).toThrow(
                "B must have a 'factory' property"
            )
        })

        it("should throw TypeError when factory is not a function", () => {
            expect(() =>
                service("A").app({ factory: "not a function" } as any)
            ).toThrow(TypeError)
            expect(() =>
                service("B").app({ factory: "not a function" } as any)
            ).toThrow("B must be a function, got string")
        })

        it("should throw TypeError when services is not an array", () => {
            expect(() =>
                service("A").app({
                    factory: () => ({}),
                    services: "not an array"
                } as any)
            ).toThrow(TypeError)
            expect(() =>
                service("B").app({
                    factory: () => ({}),
                    services: "not an array"
                } as any)
            ).toThrow("B must be an array")
        })
    })

    describe("appService.assemble()", () => {
        it("should throw TypeError when supplied is not an object", () => {
            const $resource = service("resource").app({
                factory: () => ({})
            })
            expect(() => $resource.assemble(null as any)).toThrow(TypeError)
            expect(() => $resource.assemble(null as any)).toThrow(
                "supplied must be an object, got null"
            )
        })

        it("should throw TypeError when supplied is an array", () => {
            const $resource = service("resource").app({
                factory: () => ({})
            })
            expect(() => $resource.assemble([] as any)).toThrow(TypeError)
            expect(() => $resource.assemble([] as any)).toThrow(
                "supplied must be an object, not an array"
            )
        })
    })

    describe("appService.hire()", () => {
        it("should throw TypeError when services contain invalid items", () => {
            const $resource = service("resource").app({
                factory: () => ({})
            })
            expect(() => $resource.hire(null as any)).toThrow(TypeError)
            expect(() => $resource.hire(null as any)).toThrow(TypeError)
        })

        it("should throw TypeError when service is missing name property", () => {
            const $resource = service("resource").app({
                factory: () => ({})
            })
            expect(() => $resource.hire({} as any)).toThrow(TypeError)
        })
    })

    describe("appService.mock()", () => {
        it("should throw TypeError when config is not an object", () => {
            const $resource = service("resource").app({
                factory: () => ({})
            })
            expect(() => $resource.mock(null as any)).toThrow(TypeError)
            expect(() => $resource.mock(null as any)).toThrow(
                "resource must be an object, got null"
            )
        })

        it("should throw TypeError when factory is missing", () => {
            const $resource = service("resource").app({
                factory: () => ({})
            })
            expect(() => $resource.mock({} as any)).toThrow(TypeError)
            expect(() => $resource.mock({} as any)).toThrow(
                "resource must have a 'factory' property"
            )
        })
    })
})
