import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMarket } from "#index"
import { index, once, sleep } from "#utils"

describe("typectx", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("Type suppliers", () => {
        it("should add a type supplier and return it packed", () => {
            const market = createMarket()
            const $type = market.add("type").type<string>()

            const pack = $type.pack("test-value")

            expect(pack.unpack()).toBe("test-value")
            expect(pack.supplier.name).toBe("type")
            expect($type.name).toBe("type")
            expect($type._.type).toBe(true)
        })

        it("should throw error if two suppliers with the same name", () => {
            const market = createMarket()

            market.add("duplicate").type<string>()
            expect(() => {
                market.add("duplicate").type<string>()
            }).toThrow("Name duplicate already exists")
        })

        it("should handle different types correctly", () => {
            const market = createMarket()
            const $string = market.add("string").type<string>()
            const $number = market.add("number").type<number>()
            const $object = market.add("object").type<{
                name: string
            }>()

            expect($string.pack("hello").unpack()).toBe("hello")
            expect($number.pack(42).unpack()).toBe(42)
            expect($object.pack({ name: "test" }).unpack()).toEqual({
                name: "test"
            })
        })
    })

    describe("Product Suppliers", () => {
        it("should add a product with no suppliers", () => {
            const market = createMarket()
            const $product = market.add("product").product({
                factory: () => "product"
            })

            expect($product.assemble({}).unpack()).toBe("product")
            expect($product.name).toBe("product")
            expect($product._.product).toBe(true)
        })

        it("should add a product with suppliers", () => {
            const market = createMarket()
            const $A = market.add("A").product({
                factory: () => "A"
            })

            const $B = market.add("B").product({
                factory: () => "B"
            })

            const $test = market.add("test").product({
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
        it("should assemble products from suppliers", () => {
            const market = createMarket()
            const $A = market.add("A").product({
                factory: () => "A"
            })

            const $B = market.add("B").product({
                factory: () => "B"
            })

            const $$main = market.add("main").product({
                suppliers: [$A, $B],
                factory: ({ A, B }) => {
                    return {
                        A,
                        B
                    }
                }
            })

            expect($$main.assemble({}).unpack()).toEqual({
                A: "A",
                B: "B"
            })
        })

        it("should respect initial supplies and not override them during assembly", () => {
            const market = createMarket()
            const $product = market.add("product").product({
                factory: () => "product"
            })

            const $main = market.add("main").product({
                suppliers: [$product],
                factory: ({ product }) => {
                    return {
                        product
                    }
                }
            })

            expect(
                $main.assemble(index($product.pack("initial-product"))).unpack()
            ).toEqual({
                product: "initial-product"
            })
        })

        it("should enable context switching by calling ctx()", () => {
            const market = createMarket()
            const $config = market.add("config").type<string>()
            const $name = market.add("name").type<string>()
            const $count = market.add("count").type<number>()

            const $test = market.add("test").product({
                suppliers: [$config, $name, $count],
                factory: ({ config, name, count }) => {
                    return {
                        config,
                        name,
                        count
                    }
                }
            })

            const $main = market.add("main").product({
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
            const factorySpy = vi.fn().mockReturnValue("product")

            const market = createMarket()
            const $product = market.add("product").product({
                factory: factorySpy
            })

            expect($product.assemble({}).unpack()).toBe("product")
            expect(factorySpy).toHaveBeenCalledTimes(1)

            // The memoization works within the same assembly context
            // Each call to assemble() creates a new context, so the factory is called again
            expect($product.assemble({}).unpack()).toBe("product")
            // Factory is called again for the new assembly context
            expect(factorySpy).toHaveBeenCalledTimes(2)
        })

        it("should memoize factory calls when accessed multiple times within the same assembly context", () => {
            const factorySpy = vi.fn().mockReturnValue("memoized")

            const market = createMarket()
            const $spy = market.add("spy").product({
                factory: factorySpy
            })

            const $test = market.add("test").product({
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
            const $A = market.add("A").product({
                factory: factory1Spy
            })

            const $B = market.add("B").product({
                suppliers: [$A],
                factory: ({ A }) => {
                    return "B"
                }
            })

            const $test = market.add("test").product({
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

        it("should reassemble product if dependent suppliers reassembles", async () => {
            const market = createMarket()
            // productA will be reassembled
            const $A = market.add("A").product({
                factory: () => Date.now()
            })

            // productB will be reassembled when productA reassembles
            const $B = market.add("B").product({
                suppliers: [$A],
                factory: () => Date.now()
            })

            // productC - doesn't depend on anything, so it will not be reassembled
            const $C = market.add("C").product({
                factory: () => Date.now()
            })

            // productD will be reassembled when productB reassembles
            const $D = market.add("D").product({
                suppliers: [$B],
                factory: () => Date.now()
            })

            const $E = market.add("E").product({
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

            const $$main = market.add("main").product({
                suppliers: [$E],
                factory: async ({ E }, ctx) => {
                    await sleep(100)

                    // Override productA - this should trigger resupply of productB and productD
                    // but productC should remain cached
                    const newE = ctx($E)
                        .assemble(index($A.pack(Date.now())))
                        .unpack()

                    expect(newE.A).not.toBe(E.A)
                    expect(newE.B).not.toBe(E.B)
                    expect(newE.C).toBe(E.C)
                    expect(newE.D).not.toBe(E.D)
                }
            })

            await $$main.assemble({}).unpack()
        })
    })
    describe("Preload Feature", () => {
        it("should init eager products, not lazy ones ", async () => {
            const market = createMarket()
            const initedValueSpy = vi
                .fn<() => "inited">()
                .mockReturnValue("inited")
            const normalValueSpy = vi.fn().mockReturnValue("normal")
            const lazyValueSpy = vi.fn().mockReturnValue("lazy")

            const $inited = market.add("inited").product({
                factory: () => initedValueSpy,
                init: (value) => value()
            })

            const $normal = market.add("normal").product({
                factory: () => normalValueSpy
            })

            const $lazy = market.add("lazy").product({
                factory: () => lazyValueSpy,
                init: (value) => value(),
                lazy: true
            })

            const $main = market.add("main").product({
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

            const $error = market.add("error").product({
                factory: () => once(errorValueSpy),
                init: (value) => value()
            })

            const $main = market.add("main").product({
                suppliers: [$error],
                factory: () => {
                    // Don't access ErrorProduct yet
                    return "main"
                }
            })

            // This should not throw even though ErrorProduct will fail during init
            const main = $main.assemble({}).unpack()

            await sleep(10)

            expect(main).toBe("main")
            expect(errorValueSpy).toHaveBeenCalledTimes(1)
        })

        it("should still throw error when accessing a failed inited product", async () => {
            const market = createMarket()
            const errorValueSpy = vi.fn().mockImplementation(() => {
                throw new Error()
            })

            const $error = market.add("error").product({
                factory: () => once(errorValueSpy),
                init: (value) => value()
            })

            const $main = market.add("main").product({
                suppliers: [$error],
                factory: ({ error }) => {
                    return "main"
                }
            })

            await sleep(10)

            // Accessing the product should still throw the error
            expect(() => $main.assemble({}).unpack()).toThrow()
        })

        it("should work with complex dependency chains and selective initing", async () => {
            const market = createMarket()
            const ASpy = vi.fn().mockReturnValue("A")
            const BSpy = vi.fn().mockReturnValue("B")

            const $A = market.add("A").product({
                factory: () => once(ASpy),
                init: (value) => value()
            })

            const $B = market.add("B").product({
                factory: () => once(BSpy)
            })

            const $main = market.add("main").product({
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
            const $eager = market.add("eager").product({
                factory: eagerSpy,
                lazy: false // explicitly non-lazy
            })

            const $main = market.add("main").product({
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
            const $lazy = market.add("lazy").product({
                factory: lazySpy,
                lazy: true
            })

            const $main = market.add("main").product({
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
            const $lazy = market.add("lazy").product({
                factory: lazySpy,
                lazy: true
            })

            const $main = market.add("main").product({
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
            const $lazy = market.add("lazy").product({
                factory: lazySpy,
                lazy: true
            })

            const $main = market.add("main").product({
                suppliers: [$lazy],
                factory: ({ lazy }, ctx) => {
                    expect(lazySpy).toHaveBeenCalledTimes(1)

                    const newLazyProduct = ctx($lazy).assemble({})
                    expect(lazySpy).toHaveBeenCalledTimes(1)
                    const newLazy = newLazyProduct.unpack()
                    expect(newLazy).toBe("lazy")
                    expect(lazySpy).toHaveBeenCalledTimes(2)
                    return newLazy
                }
            })
            const mainProduct = $main.assemble({})
            expect(lazySpy).toHaveBeenCalledTimes(0)
            expect(mainProduct.unpack()).toBe("lazy")
            expect(lazySpy).toHaveBeenCalledTimes(2)
        })

        it("should handle lazy suppliers with mocks", () => {
            const originalSpy = vi.fn().mockReturnValue("original")
            const mockSpy = vi.fn().mockReturnValue("mock")

            const market = createMarket()
            const $original = market.add("original").product({
                factory: originalSpy,
                lazy: true
            })

            const $mock = $original.mock({
                factory: mockSpy,
                lazy: true
            })

            const $main = market.add("main").product({
                suppliers: [$original],
                factory: ({ original }) => {
                    return original
                }
            })

            const mainProduct = $main.hire($mock).assemble({})

            // Neither factory should be called during assemble
            expect(originalSpy).toHaveBeenCalledTimes(0)
            expect(mockSpy).toHaveBeenCalledTimes(0)

            // Only mock factory should be called when accessed
            expect(mainProduct.unpack()).toBe("mock")
            expect(originalSpy).toHaveBeenCalledTimes(0)
            expect(mockSpy).toHaveBeenCalledTimes(1)
        })

        it("should default to non-lazy behavior when lazy is not specified", async () => {
            const eagerSpy = vi.fn().mockReturnValue("default-eager")

            const market = createMarket()
            const $default = market.add("default").product({
                factory: eagerSpy
                // lazy not specified, should default to false
            })

            const $main = market.add("main").product({
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
            const $lazy = market.add("lazy").product({
                factory: factorySpy,
                init: initSpy,
                lazy: true
            })

            const $main = market.add("main").product({
                suppliers: [$lazy],
                factory: () => "main"
            })

            const mainProduct = $main.assemble({})

            // Wait a bit for any initing to complete
            await sleep(10)

            // Lazy supplier should not be inited
            expect(factorySpy).toHaveBeenCalledTimes(0)
            expect(initSpy).toHaveBeenCalledTimes(0)

            // Only when accessed should the factory run
            expect(mainProduct.unpack()).toBe("main")
            expect(factorySpy).toHaveBeenCalledTimes(0) // Still not called since we don't access the lazy supplier
        })

        it("should init non-lazy suppliers when init is specified", async () => {
            const initSpy = vi.fn()
            const factorySpy = vi.fn().mockReturnValue(() => "eager-with-init")

            const market = createMarket()
            const $eager = market.add("eager").product({
                factory: factorySpy,
                init: initSpy,
                lazy: false
            })

            const $main = market.add("main").product({
                suppliers: [$eager],
                factory: () => "main"
            })

            const mainProduct = $main.assemble({})

            await sleep(10)

            // Eager supplier should be inited
            expect(factorySpy).toHaveBeenCalledTimes(1)
            expect(initSpy).toHaveBeenCalledTimes(1)
            expect(mainProduct.unpack()).toBe("main")
        })
    })

    describe("Type Safety and Edge Cases", () => {
        it("should handle empty suppliers correctly", () => {
            const market = createMarket()
            const $empty = market.add("empty").product({
                factory: () => "empty"
            })

            const emptyProduct = $empty.assemble({})
            expect(emptyProduct.unpack()).toBe("empty")
        })
    })
})
