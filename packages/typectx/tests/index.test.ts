import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMarket } from "#index"
import { index, once, sleep } from "#utils"

describe("typectx", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("Dynamic suppliers", () => {
        it("should add a dynamic supplier and return it packed", () => {
            const market = createMarket()
            const $dynamic = market.add("dynamic").dynamic<string>()

            const pack = $dynamic.pack("test-value")

            expect(pack.unpack()).toBe("test-value")
            expect(pack.supplier.name).toBe("dynamic")
            expect($dynamic.name).toBe("dynamic")
            expect($dynamic._.dynamic).toBe(true)
        })

        it("should throw error if two suppliers with the same name", () => {
            const market = createMarket()

            market.add("duplicate").dynamic<string>()
            expect(() => {
                market.add("duplicate").dynamic<string>()
            }).toThrow("Name duplicate already exists")
        })

        it("should handle different types correctly", () => {
            const market = createMarket()
            const $string = market.add("string").dynamic<string>()
            const $number = market.add("number").dynamic<number>()
            const $object = market.add("object").dynamic<{
                name: string
            }>()

            expect($string.pack("hello").unpack()).toBe("hello")
            expect($number.pack(42).unpack()).toBe(42)
            expect($object.pack({ name: "test" }).unpack()).toEqual({
                name: "test"
            })
        })
    })

    describe("Static Suppliers", () => {
        it("should add a static supplier with no suppliers (resource)", () => {
            const market = createMarket()
            const $resource = market.add("resource").static({
                factory: () => "resource"
            })

            expect($resource.assemble({}).unpack()).toBe("resource")
            expect($resource.name).toBe("resource")
            expect($resource._.static).toBe(true)
        })

        it("should add a static supplier with suppliers", () => {
            const market = createMarket()
            const $A = market.add("A").static({
                factory: () => "A"
            })

            const $B = market.add("B").static({
                factory: () => "B"
            })

            const $test = market.add("test").static({
                suppliers: [$A, $B],
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
        it("should assemble supplies from suppliers", () => {
            const market = createMarket()
            const $A = market.add("A").static({
                factory: () => "A"
            })

            const $B = market.add("B").static({
                factory: () => "B"
            })

            const $main = market.add("main").static({
                suppliers: [$A, $B],
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
            const market = createMarket()
            const $resource = market.add("resource").static({
                factory: () => "resource"
            })

            const $main = market.add("main").static({
                suppliers: [$resource],
                factory: ({ resource }) => {
                    return {
                        resource
                    }
                }
            })

            expect(
                $main.assemble(index($resource.pack("initial-resource"))).unpack()
            ).toEqual({
                resource: "initial-resource"
            })
        })

        it("should enable context switching by calling ctx()", () => {
            const market = createMarket()
            const $config = market.add("config").dynamic<string>()
            const $name = market.add("name").dynamic<string>()
            const $count = market.add("count").dynamic<number>()

            const $test = market.add("test").static({
                suppliers: [$config, $name, $count],
                factory: ({ config, name, count }) => {
                    return {
                        config,
                        name,
                        count
                    }
                }
            })

            const $main = market.add("main").static({
                suppliers: [$test],
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

            const market = createMarket()
            const $resource = market.add("resource").static({
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

            const market = createMarket()
            const $spy = market.add("spy").static({
                factory: factorySpy
            })

            const $test = market.add("test").static({
                suppliers: [$spy],
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

            const market = createMarket()
            const $A = market.add("A").static({
                factory: factory1Spy
            })

            const $B = market.add("B").static({
                suppliers: [$A],
                factory: ({ A }) => {
                    return "B"
                }
            })

            const $test = market.add("test").static({
                suppliers: [$A, $B],
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

        it("should reassemble if dependent suppliers reassembles", async () => {
            const market = createMarket()
            // A will be reassembled
            const $A = market.add("A").static({
                factory: () => Date.now()
            })

            // B will be reassembled when A reassembles
            const $B = market.add("B").static({
                suppliers: [$A],
                factory: () => Date.now()
            })

            // C - doesn't depend on anything, so it will not be reassembled
            const $C = market.add("C").static({
                factory: () => Date.now()
            })

            // D will be reassembled when B reassembles
            const $D = market.add("D").static({
                suppliers: [$B],
                factory: () => Date.now()
            })

            const $E = market.add("E").static({
                suppliers: [$A, $B, $C, $D],
                factory: ({ A, B, C, D }) => {
                    return {
                        A,
                        B,
                        C,
                        D
                    }
                }
            })

            const $main = market.add("main").static({
                suppliers: [$E],
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
    describe("Preload Feature", () => {
        it("should init eager static suppliers, not lazy ones ", async () => {
            const market = createMarket()
            const initedValueSpy = vi
                .fn<() => "inited">()
                .mockReturnValue("inited")
            const normalValueSpy = vi.fn().mockReturnValue("normal")
            const lazyValueSpy = vi.fn().mockReturnValue("lazy")

            const $inited = market.add("inited").static({
                factory: () => initedValueSpy,
                init: (value) => value()
            })

            const $normal = market.add("normal").static({
                factory: () => normalValueSpy
            })

            const $lazy = market.add("lazy").static({
                factory: () => lazyValueSpy,
                init: (value) => value(),
                lazy: true
            })

            const $main = market.add("main").static({
                suppliers: [$inited, $normal, $lazy],
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
            const market = createMarket()
            const errorValueSpy = vi.fn().mockImplementation(() => {
                throw new Error()
            })

            const $error = market.add("error").static({
                factory: () => once(errorValueSpy),
                init: (value) => value()
            })

            const $main = market.add("main").static({
                suppliers: [$error],
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

        it("should still throw error when accessing a failed inited supplier's value", async () => {
            const market = createMarket()
            const errorValueSpy = vi.fn().mockImplementation(() => {
                throw new Error()
            })

            const $error = market.add("error").static({
                factory: () => once(errorValueSpy),
                init: (value) => value()
            })

            const $main = market.add("main").static({
                suppliers: [$error],
                factory: ({ error }) => {
                    return "main"
                }
            })

            await sleep(10)

            // Accessing the value should still throw the error
            expect(() => $main.assemble({}).unpack()).toThrow()
        })

        it("should work with complex dependency chains and selective initing", async () => {
            const market = createMarket()
            const ASpy = vi.fn().mockReturnValue("A")
            const BSpy = vi.fn().mockReturnValue("B")

            const $A = market.add("A").static({
                factory: () => once(ASpy),
                init: (value) => value()
            })

            const $B = market.add("B").static({
                factory: () => once(BSpy)
            })

            const $main = market.add("main").static({
                suppliers: [$A, $B],
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
        it("should run factory for non-lazy suppliers during assemble", async () => {
            const eagerSpy = vi.fn().mockReturnValue("eager")

            const market = createMarket()
            const $eager = market.add("eager").static({
                factory: eagerSpy,
                lazy: false // explicitly non-lazy
            })

            const $main = market.add("main").static({
                suppliers: [$eager],
                factory: () => "main"
            })

            // Factory should be called during assemble, even though we don't access it
            $main.assemble({})
            await sleep(10)
            expect(eagerSpy).toHaveBeenCalledTimes(1)
        })

        it("should NOT run factory for lazy suppliers during assemble", () => {
            const lazySpy = vi.fn().mockReturnValue("lazy")

            const market = createMarket()
            const $lazy = market.add("lazy").static({
                factory: lazySpy,
                lazy: true
            })

            const $main = market.add("main").static({
                suppliers: [$lazy],
                factory: () => "main"
            })

            // Factory should NOT be called during assemble
            $main.assemble({})

            expect(lazySpy).toHaveBeenCalledTimes(0)
        })

        it("should run lazy supplier factory only when first accessed", () => {
            const lazySpy = vi.fn().mockReturnValue("lazy")

            const market = createMarket()
            const $lazy = market.add("lazy").static({
                factory: lazySpy,
                lazy: true
            })

            const $main = market.add("main").static({
                suppliers: [$lazy],
                factory: ({ lazy }) => {
                    return lazy
                }
            })
            const main = $main.assemble({}).unpack()
            expect(main).toBe("lazy")
            expect(lazySpy).toHaveBeenCalledTimes(1)
        })

        it("should handle lazy suppliers with reassembly", () => {
            const lazySpy = vi.fn().mockReturnValue("lazy")

            const market = createMarket()
            const $lazy = market.add("lazy").static({
                factory: lazySpy,
                lazy: true
            })

            const $main = market.add("main").static({
                suppliers: [$lazy],
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

        it("should handle lazy suppliers with mocks", () => {
            const originalSpy = vi.fn().mockReturnValue("original")
            const mockSpy = vi.fn().mockReturnValue("mock")

            const market = createMarket()
            const $original = market.add("original").static({
                factory: originalSpy,
                lazy: true
            })

            const $mock = $original.mock({
                factory: mockSpy,
                lazy: true
            })

            const $main = market.add("main").static({
                suppliers: [$original],
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

            const market = createMarket()
            const $default = market.add("default").static({
                factory: eagerSpy
                // lazy not specified, should default to false
            })

            const $main = market.add("main").static({
                suppliers: [$default],
                factory: () => "main"
            })

            // Factory should be called during assemble (default behavior)
            $main.assemble({})
            await sleep(10)
            expect(eagerSpy).toHaveBeenCalledTimes(1)
        })

        it("should not init lazy suppliers even when init is specified", async () => {
            const initSpy = vi.fn()
            const factorySpy = vi.fn().mockReturnValue("lazy-with-init")

            const market = createMarket()
            const $lazy = market.add("lazy").static({
                factory: factorySpy,
                init: initSpy,
                lazy: true
            })

            const $main = market.add("main").static({
                suppliers: [$lazy],
                factory: () => "main"
            })

            const mainSupply = $main.assemble({})

            // Wait a bit for any initing to complete
            await sleep(10)

            // Lazy supplier should not be inited
            expect(factorySpy).toHaveBeenCalledTimes(0)
            expect(initSpy).toHaveBeenCalledTimes(0)

            // Only when accessed should the factory run
            expect(mainSupply.unpack()).toBe("main")
            expect(factorySpy).toHaveBeenCalledTimes(0) // Still not called since we don't access the lazy supplier
        })

        it("should init non-lazy suppliers when init is specified", async () => {
            const initSpy = vi.fn()
            const factorySpy = vi.fn().mockReturnValue(() => "eager-with-init")

            const market = createMarket()
            const $eager = market.add("eager").static({
                factory: factorySpy,
                init: initSpy,
                lazy: false
            })

            const $main = market.add("main").static({
                suppliers: [$eager],
                factory: () => "main"
            })

            const mainSupply = $main.assemble({})

            await sleep(10)

            // Eager supplier should be inited
            expect(factorySpy).toHaveBeenCalledTimes(1)
            expect(initSpy).toHaveBeenCalledTimes(1)
            expect(mainSupply.unpack()).toBe("main")
        })
    })

    describe("Type Safety and Edge Cases", () => {
        it("should handle empty suppliers correctly", () => {
            const market = createMarket()
            const $empty = market.add("empty").static({
                factory: () => "empty"
            })

            const emptySupply = $empty.assemble({})
            expect(emptySupply.unpack()).toBe("empty")
        })
    })
})
