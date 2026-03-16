import { describe, it, expect, vi, expectTypeOf } from "vitest"
import { index, supplier } from "#index"
import { sleep, once } from "#utils"
import type {
    CircularDependencyError,
    DuplicateDependencyError
} from "#types/guards"
import type { Supply } from "#types/public"

describe("Mocks Feature", () => {
    describe("Mock Method", () => {
        it("should handle mock with less suppliers", () => {
            const $input = supplier("input").request<boolean>()

            const $base = supplier("base").product({
                suppliers: [$input],
                factory: ({ input }) => ({ base: input })
            })

            const $mocked = $base.mock({
                suppliers: [],
                factory: () => ({ base: true, enhanced: true })
            })

            const result = $mocked.assemble({}).unpack()

            expect(result.base).toBe(true)
            expect(result.enhanced).toBe(true)
        })

        it("should not allow mocks in suppliers array", () => {
            const $base = supplier("mock").product({
                factory: () => "base"
            })

            const $mock = $base.mock({
                suppliers: [],
                factory: () => "mock"
            })

            expect(() => {
                const $next = supplier("next").product({
                    factory: () => "next",
                    //@ts-expect-error - mock in suppliers array
                    suppliers: [$mock]
                })
            }).toThrow()
        })

        it("should handle init setting in mock", async () => {
            const baseSpy = vi.fn().mockReturnValue("base")
            const initedSpy = vi.fn().mockReturnValue("inited")

            const $base = supplier("base").product({
                factory: () => baseSpy
            })

            const $mocked = $base.mock({
                factory: () => once(initedSpy),
                init: (product) => product()
            })

            const $test = supplier("test").product({
                suppliers: [$base],
                factory: ({ base }) => base
            })

            const $hired = $test.hire($mocked)

            $hired.assemble({})
            $test.assemble({})

            await sleep(10)

            expect(baseSpy).toHaveBeenCalledTimes(0)
            expect(initedSpy).toHaveBeenCalledTimes(1)
        })

        it("should compute precise TOSUPPLY types with mock", () => {
            const $config = supplier("config").request<string>()
            const $apiKey = supplier("apiKey").request<string>()

            const $logger = supplier("logger").product({
                factory: () => "logger"
            })

            // Base service - return compatible type that can be extended
            const $base = supplier("base").product({
                factory: () => "base"
            })

            // mock with mixed request and product suppliers
            const $mocked = $base.mock({
                suppliers: [$config, $apiKey, $logger],
                factory: () => "proto"
            })

            $mocked.assemble(
                //@ts-expect-error - missing $apiKey type supply
                index($config.pack("test"))
            )

            $mocked.assemble(
                //@ts-expect-error - missing $config type supply
                index($apiKey.pack("secret-key"))
            )

            // The type system should now know exactly what needs to be supplied:
            // - config and apiKey (request supplies must be provided)
            // - logger should NOT need to be provided (it's a product supplier)
            const supply = $mocked.assemble(
                index($config.pack("test"), $apiKey.pack("secret-key"))
            )

            const output = supply.unpack()
            expect(output).toBe("proto")
        })

        it("should detect circular dependencies in mocks", () => {
            const $A = supplier("A").product({
                factory: () => "serviceA"
            })

            const $B = supplier("B").product({
                suppliers: [$A],
                factory: ({ A }) => "serviceB uses " + A
            })

            // Try to create circular dependency using mock
            // This should be caught by the circular dependency detection
            expect(() => {
                const $mockA = $A.mock({
                    suppliers: [$B], // This creates a potential circle
                    factory: ({ B }) => "mockA uses " + B
                })

                expectTypeOf($mockA).toExtend<CircularDependencyError>()
            }).toThrow("Circular dependency detected")
        })
    })

    describe("Hire Method", () => {
        it("should allow hiring alternative suppliers for testing", () => {
            const $db = supplier("db").product({
                factory: () => "real-db"
            })

            const $cache = supplier("cache").product({
                factory: () => "real-cache"
            })

            const $logger = supplier("logger").product({
                factory: () => "real-logger"
            })

            const $service = supplier("service").product({
                suppliers: [$db, $cache, $logger],
                factory: ({ db, cache, logger }) => ({
                    db,
                    cache,
                    logger
                })
            })

            // Multiple mock suppliers using mock
            const $mockDb = $db.mock({
                factory: () => "mock-db",
                suppliers: []
            })

            const $mockCache = $cache.mock({
                factory: () => "mock-cache",
                suppliers: []
            })

            const $hired = $service.hire($mockDb, $mockCache)
            const test = $hired.assemble({}).unpack()

            expect(test.db).toBe("mock-db")
            expect(test.cache).toBe("mock-cache")
            expect(test.logger).toBe("real-logger")
        })

        it("should handle hiring unused suppliers", () => {
            const $db = supplier("db").product({
                factory: () => "db"
            })

            const $main = supplier("main").product({
                suppliers: [$db],
                factory: ({ db }) => "main-" + db
            })

            const $unused = supplier("unused").product({
                factory: () => "base-extra"
            })

            const $unusedMock = $unused.mock({
                suppliers: [],
                factory: () => "extra-service"
            })

            const $hired = $main.hire($unusedMock)
            const test = $hired.assemble({}).unpack()

            // The extra supplier is added to the suppliers list, but not to the result
            expect(test).toEqual("main-db")
        })

        it("should handle empty hire calls gracefully", () => {
            const $main = supplier("main").product({
                factory: () => "main"
            })

            // Hire with no suppliers - should work fine
            const $hired = $main.hire()
            const test = $hired.assemble({}).unpack()

            expect(test).toBe("main")
        })

        it("should error on duplicate supplier names in hire", () => {
            const $db = supplier("db").product({
                factory: () => "db"
            })

            const $main = supplier("main").product({
                suppliers: [$db],
                factory: ({ db }) => "main-" + db
            })

            const $mockDb1 = $db.mock({
                factory: () => "mock-db-1",
                suppliers: []
            })

            const $mockDb2 = $db.mock({
                factory: () => "mock-db-2",
                suppliers: []
            })

            const $hired = $main.hire($mockDb1, $mockDb2)

            expectTypeOf($hired).toExtend<DuplicateDependencyError>()
        })

        it("should allow assembling multiple suppliers together", () => {
            const $shared = supplier("shared").request<string>()
            const $unique = supplier("unique").request<number>()

            const $A = supplier("A").product({
                suppliers: [$shared],
                factory: ({ shared }) => {
                    return "A-" + shared
                }
            })

            const $B = supplier("B").product({
                suppliers: [$shared, $unique],
                factory: ({ shared, unique }) => {
                    return "B-" + shared + "-" + unique
                }
            })

            const supply = $A
                .hire($B)
                .assemble(index($shared.pack("shared-data"), $unique.pack(123)))

            expect(supply.unpack()).toEqual("A-shared-data")
            const BResult = supply.deps[$B.name]
            expect(BResult).toEqual("B-shared-data-123")
        })

        it("should type check that all required request supplies are provided", () => {
            const $db = supplier("db").request<string>()
            const $cache = supplier("cache").request<string>()

            const $user = supplier("user").product({
                suppliers: [$db],
                factory: ({ db }) => {
                    return "user-" + db
                }
            })

            const $session = supplier("session").product({
                suppliers: [$cache],
                factory: ({ cache }) => {
                    return "session-" + cache
                }
            })

            const $combined = $user.hire($session)

            const db = $db.pack("postgresql://localhost:5432/db")
            const cache = $cache.pack("redis://localhost:6379")

            // @ts-expect-error - cache is missing
            const errorSupply = $combined.assemble(index(db))

            const combinedSupply = $combined.assemble(index(db, cache))

            expect(combinedSupply.unpack()).toEqual(
                "user-postgresql://localhost:5432/db"
            )

            const sessionResult = combinedSupply.deps[$session.name]
            expect(sessionResult).toEqual("session-redis://localhost:6379")
        })

        it("should handle errors in hire() method gracefully", () => {
            const $working = supplier("working").product({
                factory: () => "working-value"
            })

            const $failing = supplier("failing").product({
                factory: () => {
                    throw new Error("Supplier failed")
                    return
                }
            })

            const supply = $working.hire($failing).assemble({})
            expect(supply.unpack()).toBe("working-value")
            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                supply.deps[$failing.name]
            }).toThrow("Supplier failed")
        })
    })

    describe("Accessing supplies after ctx.hire() call", () => {
        it("supplies of supply built with reassemble with Hire parameters should contain only the hired suppliers' supplies properly typed", () => {
            const $supplier = supplier("supplier").product({
                factory: () => "supplier-value"
            })

            const $contextual = supplier("contextual").product({
                factory: () => "contextual-value"
            })

            const $main = supplier("main").product({
                suppliers: [$supplier],
                factory: ({ supplier }, ctx) => {
                    const supply = ctx($supplier).hire($contextual).assemble({})

                    const contextualSupply = supply.supplies[$contextual.name]
                    expectTypeOf(contextualSupply).not.toEqualTypeOf<any>()
                    expectTypeOf(contextualSupply).toExtend<Supply<any>>()
                    expect(contextualSupply.unpack()).toBe("contextual-value")
                }
            })

            $main.assemble({})
        })
    })
})
