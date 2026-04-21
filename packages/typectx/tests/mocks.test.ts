import { describe, it, expect, vi, expectTypeOf } from "vitest"
import { index, service } from "#index"
import { sleep, once } from "#utils"
import type {
    CircularDependencyError,
    DuplicateDependencyError
} from "#types/guards"
import type { Supply } from "#types/public"

describe("Mocks Feature", () => {
    describe("Mock Method", () => {
        it("should handle mock with less services", () => {
            const $input = service("input").request<boolean>()

            const $base = service("base").app({
                services: [$input],
                factory: ({ input }) => ({ base: input })
            })

            const $mocked = $base.mock({
                services: [],
                factory: () => ({ base: true, enhanced: true })
            })

            const result = $mocked.assemble({}).unpack()

            expect(result.base).toBe(true)
            expect(result.enhanced).toBe(true)
        })

        it("should not allow mocks in services array", () => {
            const $base = service("mock").app({
                factory: () => "base"
            })

            const $mock = $base.mock({
                services: [],
                factory: () => "mock"
            })

            expect(() => {
                const $next = service("next").app({
                    factory: () => "next",
                    //@ts-expect-error - mock in services array
                    services: [$mock]
                })
            }).toThrow()
        })

        it("should handle warmup setting in mock", async () => {
            const lazyProductSpy = vi.fn().mockReturnValue("lazy")
            const warmProductSpy = vi.fn().mockReturnValue("warm")

            const $lazy = service("lazy").app({
                factory: () => once(lazyProductSpy)
            })

            const $warmMock = $lazy.mock({
                factory: () => once(warmProductSpy),
                warmup: (warmProduct) => warmProduct()
            })

            const $test = service("test").app({
                services: [$lazy],
                factory: ({ lazy }) => lazy
            })

            const $hired = $test.hire($warmMock)

            $hired.assemble({})
            $test.assemble({})

            await sleep(10)

            expect(lazyProductSpy).toHaveBeenCalledTimes(0)
            expect(warmProductSpy).toHaveBeenCalledTimes(1)
        })

        it("should compute precise TOSUPPLY types with mock", () => {
            const $config = service("config").request<string>()
            const $apiKey = service("apiKey").request<string>()

            const $logger = service("logger").app({
                factory: () => "logger"
            })

            // Base service - return compatible type that can be extended
            const $base = service("base").app({
                factory: () => "base"
            })

            // mock with mixed request and app services
            const $mocked = $base.mock({
                services: [$config, $apiKey, $logger],
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
            // - logger should NOT need to be provided (it's an app service)
            const supply = $mocked.assemble(
                index($config.pack("test"), $apiKey.pack("secret-key"))
            )

            const output = supply.unpack()
            expect(output).toBe("proto")
        })

        it("should detect circular dependencies in mocks", () => {
            const $A = service("A").app({
                factory: () => "serviceA"
            })

            const $B = service("B").app({
                services: [$A],
                factory: ({ A }) => "serviceB uses " + A
            })

            // Try to create circular dependency using mock
            // This should be caught by the circular dependency detection
            expect(() => {
                const $mockA = $A.mock({
                    services: [$B], // This creates a potential circle
                    factory: ({ B }) => "mockA uses " + B
                })

                expectTypeOf($mockA).toExtend<CircularDependencyError>()
            }).toThrow("Circular dependency detected")
        })
    })

    describe("Hire Method", () => {
        it("should allow hiring alternative services for testing", () => {
            const $db = service("db").app({
                factory: () => "real-db"
            })

            const $cache = service("cache").app({
                factory: () => "real-cache"
            })

            const $logger = service("logger").app({
                factory: () => "real-logger"
            })

            const $service = service("service").app({
                services: [$db, $cache, $logger],
                factory: ({ db, cache, logger }) => ({
                    db,
                    cache,
                    logger
                })
            })

            // Multiple mock services using mock
            const $mockDb = $db.mock({
                factory: () => "mock-db",
                services: []
            })

            const $mockCache = $cache.mock({
                factory: () => "mock-cache",
                services: []
            })

            const $hired = $service.hire($mockDb, $mockCache)
            const test = $hired.assemble({}).unpack()

            expect(test.db).toBe("mock-db")
            expect(test.cache).toBe("mock-cache")
            expect(test.logger).toBe("real-logger")
        })

        it("should handle hiring unused services", () => {
            const $db = service("db").app({
                factory: () => "db"
            })

            const $main = service("main").app({
                services: [$db],
                factory: ({ db }) => "main-" + db
            })

            const $unused = service("unused").app({
                factory: () => "base-extra"
            })

            const $unusedMock = $unused.mock({
                services: [],
                factory: () => "extra-service"
            })

            const $hired = $main.hire($unusedMock)
            const test = $hired.assemble({}).unpack()

            // The extra service is added to the services list, but not to the result
            expect(test).toEqual("main-db")
        })

        it("should handle empty hire calls gracefully", () => {
            const $main = service("main").app({
                factory: () => "main"
            })

            // Hire with no services - should work fine
            const $hired = $main.hire()
            const test = $hired.assemble({}).unpack()

            expect(test).toBe("main")
        })

        it("should error on duplicate service names in hire", () => {
            const $db = service("db").app({
                factory: () => "db"
            })

            const $main = service("main").app({
                services: [$db],
                factory: ({ db }) => "main-" + db
            })

            const $mockDb1 = $db.mock({
                factory: () => "mock-db-1",
                services: []
            })

            const $mockDb2 = $db.mock({
                factory: () => "mock-db-2",
                services: []
            })

            const $hired = $main.hire($mockDb1, $mockDb2)

            expectTypeOf($hired).toExtend<DuplicateDependencyError>()
        })

        it("should allow assembling multiple services together", () => {
            const $shared = service("shared").request<string>()
            const $unique = service("unique").request<number>()

            const $A = service("A").app({
                services: [$shared],
                factory: ({ shared }) => {
                    return "A-" + shared
                }
            })

            const $B = service("B").app({
                services: [$shared, $unique],
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
            const $db = service("db").request<string>()
            const $cache = service("cache").request<string>()

            const $user = service("user").app({
                services: [$db],
                factory: ({ db }) => {
                    return "user-" + db
                }
            })

            const $session = service("session").app({
                services: [$cache],
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
            const $working = service("working").app({
                factory: () => "working-value"
            })

            const $failing = service("failing").app({
                factory: () => {
                    throw new Error("Service failed")
                    return
                }
            })

            const supply = $working.hire($failing).assemble({})
            expect(supply.unpack()).toBe("working-value")
            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                supply.deps[$failing.name]
            }).toThrow("Service failed")
        })
    })

    describe("Accessing supplies after ctx.hire() call", () => {
        it(".supplies should contain the hired services' supplies properly typed", () => {
            const $service = service("service").app({
                factory: () => "service-value"
            })

            const $contextual = service("contextual").app({
                factory: () => "contextual-value"
            })

            const $main = service("main").app({
                services: [$service],
                factory: (deps, ctx) => {
                    const supply = ctx($service).hire($contextual).assemble({})

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
