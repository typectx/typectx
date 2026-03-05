import { describe, it, expect, vi, beforeEach } from "vitest"
import { supplier } from "#index"
import { index, once, sleep } from "#utils"

describe("typectx", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("Request suppliers", () => {
        it("should add a request supplier and pack it", () => {
            const $input = supplier("input").request<string>()

            const pack = $input.pack("test-value")

            expect(pack.unpack()).toBe("test-value")
            expect(pack.supplier.name).toBe("input")
            expect($input.name).toBe("input")
            expect($input._request).toBe(true)
        })

        it("should allow creating suppliers with the same name independently", () => {
            const $a = supplier("duplicate").request<string>()
            const $b = supplier("duplicate").request<string>()

            expect($a.name).toBe("duplicate")
            expect($b.name).toBe("duplicate")
        })

        it("should handle different types correctly", () => {
            const $string = supplier("string").request<string>()
            const $number = supplier("number").request<number>()
            const $object = supplier("object").request<{
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
        it("should add a product supplier with no suppliers (resource)", () => {
            const $resource = supplier("resource").product({
                factory: () => "resource"
            })

            expect($resource.assemble({}).unpack()).toBe("resource")
            expect($resource.name).toBe("resource")
            expect($resource._product).toBe(true)
        })

        it("should add a product supplier with suppliers", () => {
            const $A = supplier("A").product({
                factory: () => "A"
            })

            const $B = supplier("B").product({
                factory: () => "B"
            })

            const $test = supplier("test").product({
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
            const $A = supplier("A").product({
                factory: () => "A"
            })

            const $B = supplier("B").product({
                factory: () => "B"
            })

            const $main = supplier("main").product({
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
            const $resource = supplier("resource").product({
                factory: () => "resource"
            })

            const $main = supplier("main").product({
                suppliers: [$resource],
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
            const $config = supplier("config").request<string>()
            const $name = supplier("name").request<string>()
            const $count = supplier("count").request<number>()

            const $test = supplier("test").product({
                suppliers: [$config, $name, $count],
                factory: ({ config, name, count }) => {
                    return {
                        config,
                        name,
                        count
                    }
                }
            })

            const $main = supplier("main").product({
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
            const $resource = supplier("resource").product({
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
            const $spy = supplier("spy").product({
                factory: factorySpy
            })

            const $test = supplier("test").product({
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
            const $A = supplier("A").product({
                factory: factory1Spy
            })

            const $B = supplier("B").product({
                suppliers: [$A],
                factory: ({ A }) => {
                    return "B"
                }
            })

            const $test = supplier("test").product({
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
            // A will be reassembled
            const $A = supplier("A").product({
                factory: () => Date.now()
            })

            // B will be reassembled when A reassembles
            const $B = supplier("B").product({
                suppliers: [$A],
                factory: () => Date.now()
            })

            // C - doesn't depend on anything, so it will not be reassembled
            const $C = supplier("C").product({
                factory: () => Date.now()
            })

            // D will be reassembled when B reassembles
            const $D = supplier("D").product({
                suppliers: [$B],
                factory: () => Date.now()
            })

            const $E = supplier("E").product({
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

            const $main = supplier("main").product({
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
    describe("Eager init (prerun) behavior", () => {
        it("should init eager product suppliers, not lazy ones ", async () => {
            const initedValueSpy = vi
                .fn<() => "inited">()
                .mockReturnValue("inited")
            const normalValueSpy = vi.fn().mockReturnValue("normal")
            const lazyValueSpy = vi.fn().mockReturnValue("lazy")

            const $inited = supplier("inited").product({
                factory: () => initedValueSpy,
                init: (product) => product()
            })

            const $normal = supplier("normal").product({
                factory: () => normalValueSpy
            })

            const $lazy = supplier("lazy").product({
                factory: () => lazyValueSpy,
                init: (product) => product(),
                lazy: true
            })

            const $main = supplier("main").product({
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
            const errorValueSpy = vi.fn().mockImplementation(() => {
                throw new Error()
            })

            const $error = supplier("error").product({
                factory: () => once(errorValueSpy),
                init: (product) => product()
            })

            const $main = supplier("main").product({
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

        it("should still throw error when accessing a failed inited supplier's product", async () => {
            const errorValueSpy = vi.fn().mockImplementation(() => {
                throw new Error()
            })

            const $error = supplier("error").product({
                factory: () => once(errorValueSpy),
                init: (product) => product()
            })

            const $main = supplier("main").product({
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
            const ASpy = vi.fn().mockReturnValue("A")
            const BSpy = vi.fn().mockReturnValue("B")

            const $A = supplier("A").product({
                factory: () => once(ASpy),
                init: (product) => product()
            })

            const $B = supplier("B").product({
                factory: () => once(BSpy)
            })

            const $main = supplier("main").product({
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
            const $eager = supplier("eager").product({
                factory: eagerSpy,
                lazy: false // explicitly non-lazy
            })

            const $main = supplier("main").product({
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
            const $lazy = supplier("lazy").product({
                factory: lazySpy,
                lazy: true
            })

            const $main = supplier("main").product({
                suppliers: [$lazy],
                factory: () => "main"
            })

            // Factory should NOT be called during assemble
            $main.assemble({})

            expect(lazySpy).toHaveBeenCalledTimes(0)
        })

        it("should run lazy supplier factory only when first accessed", () => {
            const lazySpy = vi.fn().mockReturnValue("lazy")
            const $lazy = supplier("lazy").product({
                factory: lazySpy,
                lazy: true
            })

            const $main = supplier("main").product({
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
            const $lazy = supplier("lazy").product({
                factory: lazySpy,
                lazy: true
            })

            const $main = supplier("main").product({
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
            const $original = supplier("original").product({
                factory: originalSpy,
                lazy: true
            })

            const $mock = $original.mock({
                factory: mockSpy,
                lazy: true
            })

            const $main = supplier("main").product({
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
            const $default = supplier("default").product({
                factory: eagerSpy
                // lazy not specified, should default to false
            })

            const $main = supplier("main").product({
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
            const $lazy = supplier("lazy").product({
                factory: factorySpy,
                init: initSpy,
                lazy: true
            })

            const $main = supplier("main").product({
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
            const $eager = supplier("eager").product({
                factory: factorySpy,
                init: initSpy,
                lazy: false
            })

            const $main = supplier("main").product({
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
            const $empty = supplier("empty").product({
                factory: () => "empty"
            })

            const emptySupply = $empty.assemble({})
            expect(emptySupply.unpack()).toBe("empty")
        })
    })
})
