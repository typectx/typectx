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
    describe("Eager init (prerun) behavior", () => {
        it("should init eager app services, not lazy ones ", async () => {
            const initedValueSpy = vi
                .fn<() => "inited">()
                .mockReturnValue("inited")
            const normalValueSpy = vi.fn().mockReturnValue("normal")
            const lazyValueSpy = vi.fn().mockReturnValue("lazy")

            const $inited = service("inited").app({
                factory: () => initedValueSpy,
                init: (product) => product()
            })

            const $normal = service("normal").app({
                factory: () => normalValueSpy
            })

            const $lazy = service("lazy").app({
                factory: () => lazyValueSpy,
                init: (product) => product(),
                lazy: true
            })

            const $main = service("main").app({
                services: [$inited, $normal, $lazy],
                factory: () => {
                    // Don't access any dependencies yet
                    return "main"
                }
            })

            const main = $main.assemble({}).unpack()

            await sleep(10)

            expect(initedValueSpy).toHaveBeenCalledTimes(1)
            expect(normalValueSpy).toHaveBeenCalledTimes(0)
            expect(lazyValueSpy).toHaveBeenCalledTimes(0)
            expect(main).toBe("main")
        })

        it("should handle init errors gracefully without breaking the supply chain", async () => {
            const errorValueSpy = vi.fn().mockImplementation(() => {
                throw new Error()
            })

            const $error = service("error").app({
                factory: () => once(errorValueSpy),
                init: (product) => product()
            })

            const $main = service("main").app({
                services: [$error],
                factory: () => {
                    // Don't access $error factory yet
                    return "main"
                }
            })

            // This should not throw even though $error factory will fail during init
            const main = $main.assemble({}).unpack()

            await sleep(10)

            expect(main).toBe("main")
            expect(errorValueSpy).toHaveBeenCalledTimes(1)
        })

        it("should still throw error when accessing a failed inited service's product", async () => {
            const errorValueSpy = vi.fn().mockImplementation(() => {
                throw new Error()
            })

            const $error = service("error").app({
                factory: () => once(errorValueSpy),
                init: (product) => product()
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
                init: (product) => product()
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

    describe("Lazy Feature", () => {
        it("should run factory for non-lazy services during assemble", async () => {
            const eagerSpy = vi.fn().mockReturnValue("eager")
            const $eager = service("eager").app({
                factory: eagerSpy,
                lazy: false // explicitly non-lazy
            })

            const $main = service("main").app({
                services: [$eager],
                factory: () => "main"
            })

            // Factory should be called during assemble, even though we don't access it
            $main.assemble({})
            await sleep(10)
            expect(eagerSpy).toHaveBeenCalledTimes(1)
        })

        it("should NOT run factory for lazy services during assemble", () => {
            const lazySpy = vi.fn().mockReturnValue("lazy")
            const $lazy = service("lazy").app({
                factory: lazySpy,
                lazy: true
            })

            const $main = service("main").app({
                services: [$lazy],
                factory: () => "main"
            })

            // Factory should NOT be called during assemble
            $main.assemble({})

            expect(lazySpy).toHaveBeenCalledTimes(0)
        })

        it("should run lazy service factory only when first accessed", () => {
            const lazySpy = vi.fn().mockReturnValue("lazy")
            const $lazy = service("lazy").app({
                factory: lazySpy,
                lazy: true
            })

            const $main = service("main").app({
                services: [$lazy],
                factory: ({ lazy }) => {
                    return lazy
                }
            })
            const main = $main.assemble({}).unpack()
            expect(main).toBe("lazy")
            expect(lazySpy).toHaveBeenCalledTimes(1)
        })

        it("should handle lazy services with reassembly", () => {
            const lazySpy = vi.fn().mockReturnValue("lazy")
            const $lazy = service("lazy").app({
                factory: lazySpy,
                lazy: true
            })

            const $main = service("main").app({
                services: [$lazy],
                factory: ({ lazy }, ctx) => {
                    expect(lazySpy).toHaveBeenCalledTimes(1)

                    const newLazySupply = ctx($lazy).assemble({})
                    expect(lazySpy).toHaveBeenCalledTimes(1)
                    const newLazy = newLazySupply.unpack()
                    expect(newLazy).toBe("lazy")
                    expect(lazySpy).toHaveBeenCalledTimes(2)
                    return newLazy
                }
            })
            const mainSupply = $main.assemble({})
            expect(lazySpy).toHaveBeenCalledTimes(0)
            expect(mainSupply.unpack()).toBe("lazy")
            expect(lazySpy).toHaveBeenCalledTimes(2)
        })

        it("should handle lazy services with mocks", () => {
            const originalSpy = vi.fn().mockReturnValue("original")
            const mockSpy = vi.fn().mockReturnValue("mock")
            const $original = service("original").app({
                factory: originalSpy,
                lazy: true
            })

            const $mock = $original.mock({
                factory: mockSpy,
                lazy: true
            })

            const $main = service("main").app({
                services: [$original],
                factory: ({ original }) => {
                    return original
                }
            })

            const mainSupply = $main.hire($mock).assemble({})

            // Neither factory should be called during assemble
            expect(originalSpy).toHaveBeenCalledTimes(0)
            expect(mockSpy).toHaveBeenCalledTimes(0)

            // Only mock factory should be called when accessed
            expect(mainSupply.unpack()).toBe("mock")
            expect(originalSpy).toHaveBeenCalledTimes(0)
            expect(mockSpy).toHaveBeenCalledTimes(1)
        })

        it("should default to non-lazy behavior when lazy is not specified", async () => {
            const eagerSpy = vi.fn().mockReturnValue("default-eager")
            const $default = service("default").app({
                factory: eagerSpy
                // lazy not specified, should default to false
            })

            const $main = service("main").app({
                services: [$default],
                factory: () => "main"
            })

            // Factory should be called during assemble (default behavior)
            $main.assemble({})
            await sleep(10)
            expect(eagerSpy).toHaveBeenCalledTimes(1)
        })

        it("should not init lazy services even when init is specified", async () => {
            const initSpy = vi.fn()
            const factorySpy = vi.fn().mockReturnValue("lazy-with-init")
            const $lazy = service("lazy").app({
                factory: factorySpy,
                init: initSpy,
                lazy: true
            })

            const $main = service("main").app({
                services: [$lazy],
                factory: () => "main"
            })

            const mainSupply = $main.assemble({})

            // Wait a bit for any initing to complete
            await sleep(10)

            // Lazy service should not be inited
            expect(factorySpy).toHaveBeenCalledTimes(0)
            expect(initSpy).toHaveBeenCalledTimes(0)

            // Only when accessed should the factory run
            expect(mainSupply.unpack()).toBe("main")
            expect(factorySpy).toHaveBeenCalledTimes(0) // Still not called since we don't access the lazy service
        })

        it("should init non-lazy services when init is specified", async () => {
            const initSpy = vi.fn()
            const factorySpy = vi.fn().mockReturnValue(() => "eager-with-init")
            const $eager = service("eager").app({
                factory: factorySpy,
                init: initSpy,
                lazy: false
            })

            const $main = service("main").app({
                services: [$eager],
                factory: () => "main"
            })

            const mainSupply = $main.assemble({})

            await sleep(10)

            // Eager service should be inited
            expect(factorySpy).toHaveBeenCalledTimes(1)
            expect(initSpy).toHaveBeenCalledTimes(1)
            expect(mainSupply.unpack()).toBe("main")
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
