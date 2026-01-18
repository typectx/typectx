import { describe, it, expect, vi, expectTypeOf } from "vitest"
import { CircularDependencyError, createMarket, index, type Supply } from "#index"
import { sleep, once } from "#utils"

describe("Mocks Feature", () => {
    describe("Mock Method", () => {
        it("should handle mock with less suppliers", () => {
            const market = createMarket()

            const $resource = market.add("resource").type<boolean>()

            const $base = market.add("base").product({
                suppliers: [$resource],
                factory: ({ resource }) => ({ base: resource })
            })

            const $mocked = $base.mock({
                suppliers: [],
                factory: () => ({ base: true, enhanced: true }),
            })

            const result = $mocked.assemble({}).unpack()

            expect(result.base).toBe(true)
            expect(result.enhanced).toBe(true)
        })

        it("should not allow mocks in suppliers array", () => {
            const market = createMarket()

            const $base = market.add("mock").product({
                factory: () => "base"
            })

            const $mock = $base.mock({
                suppliers: [],
                factory: () => "mock"
            })

            expect(() => {
                const $next = market.add("next").product({
                    factory: () => "next",
                    //@ts-expect-error - mock in suppliers array
                    suppliers: [$mock]
                })
            }).toThrow()
        })

        it("should handle init setting in mock", async () => {
            const market = createMarket()
            const baseSpy = vi.fn().mockReturnValue("base")
            const initedSpy = vi.fn().mockReturnValue("inited")

            const $base = market.add("base").product({
                factory: () => baseSpy
            })

            const $mocked = $base.mock({
                factory: () => once(initedSpy),
                init: (value) => value()
            })

            const $test = market.add("test").product({
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
            const market = createMarket()

            const $config = market.add("config").type<string>()
            const $apiKey = market.add("apiKey").type<string>()

            const $logger = market.add("logger").product({
                factory: () => "logger"
            })

            // Base service - return compatible type that can be extended
            const $base = market.add("base").product({
                factory: () => "base"
            })

            // mock with mixed resource and product suppliers
            const $mocked = $base.mock({
                suppliers: [$config, $apiKey, $logger],
                factory: () => "proto"
            })

            $mocked.assemble(
                //@ts-expect-error - missing $apiKeyResource
                index($config.pack("test"))
            )

            $mocked.assemble(
                //@ts-expect-error - missing $configResource
                index($apiKey.pack("secret-key"))
            )

            // The type system should now know exactly what needs to be supplied:
            // - config and apiKey (resources must be provided)
            // - logger should NOT need to be provided (it's a product supplier)
            const $result = $mocked.assemble(
                index($config.pack("test"), $apiKey.pack("secret-key"))
            )

            const output = $result.unpack()
            expect(output).toBe("proto")
        })

        it("should detect circular dependencies in mocks", () => {
            const market = createMarket()

            const $A = market.add("A").product({
                factory: () => "serviceA"
            })

            const $B = market.add("B").product({
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

            expect(() => {
                const $mockA = $A.mock({
                    assemblers: [$B], // This creates a potential circle
                    factory: () => "mockA"
                })

                expectTypeOf($mockA).toExtend<CircularDependencyError>()
            }).toThrow("Circular dependency detected")
        })
    })

    describe("Hire Method", () => {
        it("should allow trying alternative suppliers for testing", () => {
            const market = createMarket()

            const $db = market.add("db").product({
                factory: () => "real-db"
            })

            const $cache = market.add("cache").product({
                factory: () => "real-cache"
            })

            const $logger = market.add("logger").product({
                factory: () => "real-logger"
            })

            const $service = market.add("service").product({
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

        it("should handle trying unused suppliers", () => {
            const market = createMarket()

            const $db = market.add("db").product({
                factory: () => "db"
            })

            const $main = market.add("main").product({
                suppliers: [$db],
                factory: ({ db }) => "main-" + db
            })

            const $unused = market.add("unused").product({
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
            const market = createMarket()

            const $main = market.add("main").product({
                factory: () => "main"
            })

            // Hire with no suppliers - should work fine
            const $hired = $main.hire()
            const test = $hired.assemble({}).unpack()

            expect(test).toBe("main")
        })

        it("should handle duplicate supplier names in hire (last one wins)", () => {
            const market = createMarket()

            const $db = market.add("db").product({
                factory: () => "db"
            })

            const $main = market.add("main").product({
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
            expect($hired.hired.map((s) => s.name)).toEqual([
                $mockDb1.name,
                $mockDb2.name
            ])
            const result = $hired.assemble({}).unpack()
            expect(result).toEqual("main-mock-db-2")
        })

        it("should allow assembling multiple suppliers together", () => {
            const market = createMarket()

            const $shared = market.add("shared").type<string>()
            const $unique = market.add("unique").type<number>()

            const $A = market.add("A").product({
                suppliers: [$shared],
                factory: ({ shared }) => {
                    return "A-" + shared
                }
            })

            const $B = market.add("B").product({
                suppliers: [$shared, $unique],
                factory: ({ shared, unique }) => {
                    return "B-" + shared + "-" + unique
                }
            })

            const resultProduct = $A
                .hire($B)
                .assemble(index($shared.pack("shared-data"), $unique.pack(123)))

            expect(resultProduct.unpack()).toEqual("A-shared-data")
            const BResult = resultProduct.deps[$B.name]
            expect(BResult).toEqual("B-shared-data-123")
        })

        it("should type check that all required resources are provided", () => {
            const market = createMarket()

            const $db = market.add("db").type<string>()
            const $cache = market.add("cache").type<string>()

            const $user = market.add("user").product({
                suppliers: [$db],
                factory: ({ db }) => {
                    return "user-" + db
                }
            })

            const $session = market.add("session").product({
                suppliers: [$cache],
                factory: ({ cache }) => {
                    return "session-" + cache
                }
            })

            const $combined = $user.hire($session)

            const db = $db.pack("postgresql://localhost:5432/db")
            const cache = $cache.pack("redis://localhost:6379")

            // @ts-expect-error - cache is missing
            const combinedProduct = $combined.assemble(index(db))

            const resultProduct = $combined.assemble(index(db, cache))

            expect(resultProduct.unpack()).toEqual(
                "user-postgresql://localhost:5432/db"
            )

            const sessionResult = resultProduct.deps[$session.name]
            expect(sessionResult).toEqual("session-redis://localhost:6379")
        })

        it("should handle errors in hire() method gracefully", () => {
            const market = createMarket()

            const $working = market.add("working").product({
                factory: () => "working-value"
            })

            const $failing = market.add("failing").product({
                factory: () => {
                    throw new Error("Supplier failed")
                    return
                }
            })

            const resultProduct = $working.hire($failing).assemble({})
            expect(resultProduct.unpack()).toBe("working-value")
            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                resultProduct.deps[$failing.name]
            }).toThrow("Supplier failed")
        })
    })

    describe("Accessing $ supplies after ctx.hire() call", () => {
        it("$ supplies of product built with reassemble with Hire parameters should contain only the hired suppliers products properly typed", () => {
            const market = createMarket()

            const $supplier = market.add("supplier").product({
                factory: () => "supplier-value"
            })

            const $assembler = market.add("assembler").product({
                factory: () => "assembler-value"
            })

            const $main = market.add("main").product({
                suppliers: [$supplier],
                assemblers: [$assembler],
                factory: ({ supplier }) => {
                    const supplierProduct = $supplier
                        .hire($assembler)
                        .assemble({})

                    const assemblerProduct =
                        supplierProduct.deps[$assembler.name]
                    expectTypeOf(assemblerProduct).toExtend<Supply>()
                    expect(assemblerProduct.unpack()).toBe("assembler-value")
                }
            })

            $main.assemble({})
        })
    })
})
