import { describe, it, expect, vi, beforeEach } from "vitest"
import { service } from "#index"
import { index, once, sleep } from "#utils"

describe("typectx", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("Request services", () => {
        it("should add a request service and pack it", () => {
            const $input = service("input").request<string>()

            const pack = $input.pack("test-value")

            expect(pack.unpack()).toBe("test-value")
            expect(pack.service.name).toBe("input")
            expect($input.name).toBe("input")
            expect($input._request).toBe(true)
        })

        it("should allow creating services with the same name independently", () => {
            const $a = service("duplicate").request<string>()
            const $b = service("duplicate").request<string>()

            expect($a.name).toBe("duplicate")
            expect($b.name).toBe("duplicate")
        })

        it("should handle different types correctly", () => {
            const $string = service("string").request<string>()
            const $number = service("number").request<number>()
            const $object = service("object").request<{
                name: string
            }>()

            expect($string.pack("hello").unpack()).toBe("hello")
            expect($number.pack(42).unpack()).toBe(42)
            expect($object.pack({ name: "test" }).unpack()).toEqual({
                name: "test"
            })
        })
    })

    describe("App Services", () => {
        it("should add an app service with no dependencies", () => {
            const $product = service("product").app({
                factory: () => "product"
            })

            expect($product.assemble({}).unpack()).toBe("product")
            expect($product.name).toBe("product")
            expect($product._app).toBe(true)
        })

        it("should add an app service with dependencies", () => {
            const $A = service("A").app({
                factory: () => "A"
            })

            const $B = service("B").app({
                factory: () => "B"
            })

            const $test = service("test").app({
                services: [$A, $B],
                factory: ({ A, B }) => {
                    return {
                        A,
                        B
                    }
                }
            })

            expect($test.assemble({}).unpack()).toEqual({
                A: "A",
                B: "B"
            })
        })
    })

    describe("Supply Chain", () => {
        it("should assemble supplies from services", () => {
            const $A = service("A").app({
                factory: () => "A"
            })

            const $B = service("B").app({
                factory: () => "B"
            })

            const $main = service("main").app({
                services: [$A, $B],
                factory: ({ A, B }) => {
                    return {
                        A,
                        B
                    }
                }
            })

            expect($main.assemble({}).unpack()).toEqual({
                A: "A",
                B: "B"
            })
        })

        it("should respect initial supplies and not override them during assembly", () => {
            const $resource = service("resource").app({
                factory: () => "resource"
            })

            const $main = service("main").app({
                services: [$resource],
                factory: ({ resource }) => {
                    return {
                        resource
                    }
                }
            })

            expect(
                $main
                    .assemble(index($resource.pack("initial-resource")))
                    .unpack()
            ).toEqual({
                resource: "initial-resource"
            })
        })

        it("should enable context switching by calling ctx() in a factory", () => {
            const $config = service("config").request<string>()
            const $name = service("name").request<string>()
            const $count = service("count").request<number>()

            const $test = service("test").app({
                services: [$config, $name, $count],
                factory: ({ config, name, count }) => {
                    return {
                        config,
                        name,
                        count
                    }
                }
            })

            const $main = service("main").app({
                services: [$test],
                factory: (deps, ctx) => {
                    const newTestA = ctx($test)
                        .assemble(
                            index(
                                $config.pack("new-config"),
                                $name.pack("new-name"),
                                $count.pack(42)
                            )
                        )
                        .unpack()

                    const newTestB = ctx($test)
                        .assemble(index($config.pack("new-config")))
                        .unpack()

                    const newTestC = ctx($test)
                        .assemble(index($name.pack("new-name")))
                        .unpack()

                    const newTestD = ctx($test)
                        .assemble(
                            index($config.pack("new-config"), $count.pack(42))
                        )
                        .unpack()

                    expect(newTestA).toEqual({
                        config: "new-config",
                        name: "new-name",
                        count: 42
                    })

                    expect(newTestB).toEqual({
                        config: "new-config",
                        name: "initial-name",
                        count: 1
                    })

                    expect(newTestC).toEqual({
                        config: "initial-config",
                        name: "new-name",
                        count: 1
                    })

                    expect(newTestD).toEqual({
                        config: "new-config",
                        name: "initial-name",
                        count: 42
                    })
                }
            })

            $main
                .assemble(
                    index(
                        $config.pack("initial-config"),
                        $name.pack("initial-name"),
                        $count.pack(1)
                    )
                )
                .unpack()
        })
    })

    describe("Factory memoization", () => {
        it("should create separate memoization contexts for different assembly calls", () => {
            const factorySpy = vi.fn().mockReturnValue("resource")
            const $resource = service("resource").app({
                factory: factorySpy
            })

            expect($resource.assemble({}).unpack()).toBe("resource")
            expect(factorySpy).toHaveBeenCalledTimes(1)

            // The memoization works within the same assembly context
            // Each call to assemble() creates a new context, so the factory is called again
            expect($resource.assemble({}).unpack()).toBe("resource")
            // Factory is called again for the new assembly context
            expect(factorySpy).toHaveBeenCalledTimes(2)
        })

        it("should memoize factory calls when accessed multiple times within the same assembly context", () => {
            const factorySpy = vi.fn().mockReturnValue("memoized")
            const $spy = service("spy").app({
                factory: factorySpy
            })

            const $test = service("test").app({
                services: [$spy],
                factory: (deps) => {
                    const spyAccess = deps.spy
                    const spyAccess2 = deps.spy

                    return "test"
                }
            })

            $test.assemble({}).unpack()
            // Factory should only be called once due to memoization within the same assembly context
            expect(factorySpy).toHaveBeenCalledTimes(1)
        })

        it("should keep memoization even if multiple dependents are nested", () => {
            const factory1Spy = vi.fn().mockReturnValue("A")
            const $A = service("A").app({
                factory: factory1Spy
            })

            const $B = service("B").app({
                services: [$A],
                factory: ({ A }) => {
                    return "B"
                }
            })

            const $test = service("test").app({
                services: [$A, $B],
                factory: ({ A, B }) => {
                    return {
                        A,
                        B
                    }
                }
            })

            expect($test.assemble({}).unpack()).toEqual({
                A: "A",
                B: "B"
            })

            // factory1  should only be called once due to memoization within the same context
            expect(factory1Spy).toHaveBeenCalledTimes(1)
        })

        it("should reassemble if dependent services reassembles", async () => {
            // A will be reassembled
            const $A = service("A").app({
                factory: () => Date.now()
            })

            // B will be reassembled when A reassembles
            const $B = service("B").app({
                services: [$A],
                factory: () => Date.now()
            })

            // C - doesn't depend on anything, so it will not be reassembled
            const $C = service("C").app({
                factory: () => Date.now()
            })

            // D will be reassembled when B reassembles
            const $D = service("D").app({
                services: [$B],
                factory: () => Date.now()
            })

            const $E = service("E").app({
                services: [$A, $B, $C, $D],
                factory: ({ A, B, C, D }) => {
                    return {
                        A,
                        B,
                        C,
                        D
                    }
                }
            })

            const $main = service("main").app({
                services: [$E],
                factory: async ({ E }, ctx) => {
                    await sleep(100)

                    // Override A - this should trigger resupply of B and D
                    // but C should remain cached
                    const newE = ctx($E)
                        .assemble(index($A.pack(Date.now())))
                        .unpack()

                    expect(newE.A).not.toBe(E.A)
                    expect(newE.B).not.toBe(E.B)
                    expect(newE.C).toBe(E.C)
                    expect(newE.D).not.toBe(E.D)
                }
            })

            await $main.assemble({}).unpack()
        })
    })

    describe("Automatic lifecycle management", () => {
        it("should preserve referential identity for services without request dependencies", () => {
            const $session = service("session").request<{ userId: string }>()

            const $db = service("db").app({
                factory: () => ({ connection: Symbol("db") })
            })

            const $currentUser = service("currentUser").app({
                services: [$db, $session],
                factory: ({ db, session }) => ({
                    db,
                    userId: session.userId
                })
            })

            const $main = service("main").app({
                services: [$db, $currentUser],
                factory: ({ db, currentUser }) => ({
                    db,
                    currentUser
                })
            })

            const first = $main
                .assemble(index($session.pack({ userId: "user-a" })))
                .unpack()

            const second = $main
                .assemble(index($session.pack({ userId: "user-b" })))
                .unpack()

            expect(first.db).toBe(second.db)
            expect(first.currentUser).not.toBe(second.currentUser)
            expect(first.currentUser.userId).toBe("user-a")
            expect(second.currentUser.userId).toBe("user-b")
            expect(first).not.toBe(second)
        })
    })
    describe("Eager warmup behavior", () => {
        it("should warmup app services", async () => {
            const eagerFactorySpy = vi.fn().mockReturnValue("eager")
            const lazyProductSpy = vi.fn().mockReturnValue("lazy")
            const warmProductSpy = vi.fn().mockReturnValue("warm")

            const $eager = service("eager").app({
                factory: eagerFactorySpy
            })

            const $lazy = service("lazy").app({
                factory: () => once(lazyProductSpy)
            })

            const $warm = service("warm").app({
                factory: () => once(warmProductSpy),
                warmup: (lazyProduct) => lazyProduct()
            })

            const $main = service("main").app({
                services: [$eager, $lazy, $warm],
                factory: () => {
                    // Don't access any dependencies yet
                    return "main"
                }
            })

            const main = $main.assemble({}).unpack()

            await sleep(10)

            expect(eagerFactorySpy).toHaveBeenCalledTimes(1)
            expect(warmProductSpy).toHaveBeenCalledTimes(1)
            expect(lazyProductSpy).toHaveBeenCalledTimes(0)
            expect(main).toBe("main")
        })

        it("should handle warmup errors gracefully without breaking the supply chain", async () => {
            const errorFactorySpy = vi.fn().mockImplementation(() => {
                throw new Error()
            })
            const errorWarmProductSpy = vi.fn().mockImplementation(() => {
                throw new Error()
            })

            const $error = service("error").app({
                factory: errorFactorySpy
            })

            const $errorWarm = service("errorWarm").app({
                factory: () => once(errorWarmProductSpy),
                warmup: (errorWarmProduct) => errorWarmProduct()
            })

            const $main = service("main").app({
                services: [$error, $errorWarm],
                factory: () => {
                    // This should not throw error, as error products are not accessed by the factory
                    // Counter-intuitively, errorWarm throws when accessed from deps, even if not called, because warmup memoizes the error
                    // On access, unpack is called, which calls the warmup function. The warmup function does not run, because it is memoized,
                    // But the memoized error gets thrown.
                    return "main"
                }
            })

            const main = $main.assemble({}).unpack()

            await sleep(10)

            expect(main).toBe("main")
            expect(errorFactorySpy).toHaveBeenCalledTimes(1)
            expect(errorWarmProductSpy).toHaveBeenCalledTimes(1)
        })

        it("should still throw error when accessing a failed inited service's product", async () => {
            const errorWarmProductSpy = vi.fn().mockImplementation(() => {
                throw new Error()
            })

            const $error = service("error").app({
                factory: () => once(errorWarmProductSpy),
                warmup: (errorWarmProduct) => errorWarmProduct()
            })

            const $main = service("main").app({
                services: [$error],
                factory: ({ error }) => {
                    return "main"
                }
            })

            await sleep(10)

            // Accessing the product should still throw the error
            expect(() => $main.assemble({}).unpack()).toThrow()
        })

        it("should work with complex dependency chains and selective initing", async () => {
            const ASpy = vi.fn().mockReturnValue("A")
            const BSpy = vi.fn().mockReturnValue("B")

            const $A = service("A").app({
                factory: () => once(ASpy),
                warmup: (product) => product()
            })

            const $B = service("B").app({
                factory: () => once(BSpy)
            })

            const $main = service("main").app({
                services: [$A, $B],
                factory: () => {
                    return "main"
                }
            })

            const main = $main.assemble({}).unpack()

            await sleep(10)

            expect(ASpy).toHaveBeenCalledTimes(1)
            expect(BSpy).toHaveBeenCalledTimes(0)
            expect(main).toBe("main")
        })
    })

    describe("Type Safety and Edge Cases", () => {
        it("should handle empty services correctly", () => {
            const $empty = service("empty").app({
                factory: () => "empty"
            })

            const emptySupply = $empty.assemble({})
            expect(emptySupply.unpack()).toBe("empty")
        })
    })
})
