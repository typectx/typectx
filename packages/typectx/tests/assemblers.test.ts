import { describe, it, expect, vi, expectTypeOf } from "vitest"
import { createMarket, Product } from "#index"
import { index, sleep } from "#utils"

describe("Assemblers Feature", () => {
    it("should pass assemblers to factory but not auto-assemble them", () => {
        const market = createMarket()
        const factoryMock = vi.fn().mockReturnValue("value")

        const $assembler = market.offer("assembler").asProduct({
            factory: factoryMock
        })

        const $main = market.offer("main").asProduct({
            assemblers: [$assembler],
            factory: (deps, ctx) => {
                // Assemblers are passed but not auto-assembled
                expect(ctx($assembler).name).toBe($assembler.name)
                expect(factoryMock).not.toHaveBeenCalled()

                return "main-result"
            }
        })

        const result = $main.assemble({}).unpack()
        expect(result).toBe("main-result")
        expect(factoryMock).not.toHaveBeenCalled()
    })

    it("should force hired assemblers to be pre-supplied", () => {
        const market = createMarket()
        const $resource = market.offer("resource").asResource<string>()

        const $assembler1 = market.offer("assembler1").asProduct({
            suppliers: [$resource],
            factory: ({ resource }) => `A1: ${resource}`
        })

        const $assembler2 = market.offer("assembler2").asProduct({
            suppliers: [$resource],
            factory: ({ resource }) => `A2: ${resource}`
        })

        const $base = market.offer("base").asProduct({
            assemblers: [$assembler1],
            factory: (deps, ctx) => {
                return ctx($assembler1)
                    .assemble(index($resource.pack("test")))
                    .unpack()
            }
        })

        const $extended = $base.hire($assembler2)

        // @ts-expect-error - hired resources must be supplied also
        $extended.assemble({})
        const result = $extended
            .assemble(index($resource.pack("unused")))
            .unpack()
        expect(result).toBe("A1: test")
    })

    it("should allow manual assembly of assemblers within factory", () => {
        const market = createMarket()
        const factoryMock = vi.fn().mockReturnValue("value")

        const $assembler = market.offer("assembler").asProduct({
            factory: factoryMock
        })

        const $main = market.offer("main").asProduct({
            assemblers: [$assembler],
            factory: (deps, ctx) => {
                const assemblerProduct = ctx($assembler).assemble({})
                const value = assemblerProduct.unpack()

                expect(factoryMock).toHaveBeenCalledTimes(1)
                expect(value).toBe("value")

                return {
                    main: "main-result",
                    assembler: value
                }
            }
        })

        const result = $main.assemble({}).unpack()
        expect(result).toEqual({
            main: "main-result",
            assembler: "value"
        })
    })

    it("should support conditional assembly based on context (session admin example)", () => {
        const market = createMarket()

        const $session = market.offer("session").asResource<{
            userId: string
            role: string
        }>()

        const $adminSession = market.offer("admin-session").asResource<{
            userId: string
            role: "admin"
        }>()

        const $adminFeature = market.offer("adminFeature").asProduct({
            //Even if unused, protects this function from being called by non-admins via Typescript
            suppliers: [$adminSession],
            factory: () => "sensitive-admin-data"
        })

        const $userFeature = market.offer("userFeature").asProduct({
            factory: () => "regular-user-data"
        })

        const $main = market.offer("main").asProduct({
            suppliers: [$session, $userFeature],
            assemblers: [$adminFeature],
            factory: ({ session, userFeature }, ctx) => {
                const role = session.role

                if (role === "admin") {
                    const adminFeature = ctx($adminFeature).assemble(
                        index($adminSession.pack({ ...session, role }))
                    )

                    return {
                        user: session.userId,
                        feature: adminFeature.unpack()
                    }
                } else {
                    return {
                        user: session.userId,
                        feature: userFeature
                    }
                }
            }
        })

        const adminSession = $session.pack({
            userId: "admin123",
            role: "admin"
        })
        const adminResult = $main.assemble(index(adminSession)).unpack()

        expect(adminResult).toEqual({
            user: "admin123",
            feature: "sensitive-admin-data"
        })

        const userSession = $session.pack({
            userId: "user456",
            role: "user"
        })
        const userResult = $main.assemble(index(userSession)).unpack()

        expect(userResult).toEqual({
            user: "user456",
            feature: "regular-user-data"
        })
    })

    it("should handle assembler errors gracefully", () => {
        const market = createMarket()

        const $failing = market.offer("failing").asProduct({
            factory: () => {
                throw new Error("Assembler failed")
                return
            }
        })

        const $main = market.offer("main").asProduct({
            assemblers: [$failing],
            factory: (deps, ctx) => {
                ctx($failing).assemble({}).unpack()
                return "main"
            }
        })

        expect(() => {
            $main.assemble({}).unpack()
        }).toThrow("Assembler failed")
    })

    it("should support assembler in mock() method", () => {
        const market = createMarket()

        const $assembler = market.offer("assembler").asProduct({
            factory: () => "assembler-value"
        })

        const $main = market.offer("main").asProduct({
            factory: () => "main-value"
        })

        const $mock = $main.mock({
            assemblers: [$assembler],
            factory: () => {
                return "mock-value"
            }
        })

        expect($mock.assemblers).toHaveLength(1)
    })

    it("should support complex assembler dependency chains", () => {
        const market = createMarket()

        const $db = market.offer("db").asResource<string>()

        const $repository = market.offer("repo").asProduct({
            suppliers: [$db],
            factory: ({ db }) => {
                return "repo-" + db
            }
        })

        const $feature = market.offer("feature").asProduct({
            suppliers: [$repository],
            factory: ({ repo }) => {
                return "feature-" + repo
            }
        })

        const $main = market.offer("main").asProduct({
            assemblers: [$feature],
            factory: (deps, ctx) => {
                const feature = ctx($feature)
                    .assemble(
                        index($db.pack("postgresql://localhost:5432/mydb"))
                    )
                    .unpack()

                return "main-" + feature
            }
        })

        const result = $main.assemble({}).unpack()
        expect(result).toEqual(
            "main-feature-repo-postgresql://localhost:5432/mydb"
        )
    })

    it("should properly overwrite resource in assembler's assemble() method", () => {
        const market = createMarket()
        const $number = market.offer("number").asResource<number>()
        const $doubler = market.offer("doubler").asProduct({
            suppliers: [$number],
            factory: ({ number }) => {
                return number * 2
            }
        })

        const $quadrupler = market.offer("quadrupler").asProduct({
            suppliers: [$doubler],
            factory: ({ doubler }) => {
                return doubler * 2
            }
        })

        const $main = market.offer("main").asProduct({
            suppliers: [$doubler],
            assemblers: [$quadrupler],
            factory: (deps, ctx) => {
                const assembled = ctx($quadrupler)
                    .assemble(index($number.pack(5)))
                    .unpack()
                return assembled
            }
        })

        const result = $main.assemble(index($number.pack(10))).unpack()
        expect(result).toEqual(20)
    })

    it("should preserve products from previous assemble calls that don't depend on the new supplies", async () => {
        const market = createMarket()
        const $number = market.offer("number").asResource<number>()
        const $dummy = market.offer("dummy").asProduct({
            factory: () => "dummy"
        })

        let timesCalled = 0
        const $counter = market.offer("counter").asProduct({
            suppliers: [$dummy],
            factory: ({ dummy }) => {
                return timesCalled++
            }
        })

        const $reassembled = market.offer("reassembled").asProduct({
            suppliers: [$number, $counter],
            factory: ({ number }) => {
                return number
            }
        })

        const $main = market.offer("main").asProduct({
            suppliers: [$dummy, $counter, $reassembled],
            assemblers: [$reassembled],
            factory: (deps, ctx) => {
                const reassembled = ctx($reassembled)
                    .assemble(index($number.pack(10)))
                    .unpack()
                const counter = ctx($counter).assemble({}).unpack()
                return counter
            }
        })

        $main.assemble(index($number.pack(20))).unpack()
        expect(timesCalled).toEqual(1)
    })

    it("should support mocks with assembler", () => {
        const market = createMarket()
        const factoryMock = vi.fn().mockReturnValue("value")

        const $assembler = market.offer("assembler").asProduct({
            factory: factoryMock
        })

        const $base = market.offer("base").asProduct({
            factory: () => "base-value"
        })

        const $mock = $base.mock({
            factory: (deps, ctx) => {
                expect(ctx($assembler).name).toBe($assembler.name)

                const assembled = ctx($assembler).assemble({})
                const value = assembled.unpack()

                return `base-value-${value}`
            },
            assemblers: [$assembler]
        })

        const result = $mock.assemble({}).unpack()
        expect(result).toBe("base-value-value")
        expect(factoryMock).toHaveBeenCalledTimes(1)
    })

    it("should support mocks with multiple assemblers", () => {
        const market = createMarket()
        const ASpy = vi.fn().mockReturnValue("A")
        const BSpy = vi.fn().mockReturnValue("B")

        const $A = market.offer("A").asProduct({
            factory: ASpy
        })

        const $B = market.offer("B").asProduct({
            factory: BSpy
        })

        const $base = market.offer("base").asProduct({
            factory: () => "base-value"
        })

        const $mock = $base.mock({
            assemblers: [$A, $B],
            factory: (deps, ctx) => {
                const assembler1 = ctx($A).assemble({}).unpack()
                const assembler2 = ctx($B).assemble({}).unpack()

                return `base-value-${assembler1}-${assembler2}`
            }
        })

        const result = $mock.assemble({}).unpack()
        expect(result).toBe("base-value-A-B")
        expect(ASpy).toHaveBeenCalledTimes(1)
        expect(BSpy).toHaveBeenCalledTimes(1)
    })

    it("should support hire() method with assembler replacing original ones", async () => {
        const market = createMarket()
        const originalSpy = vi.fn().mockReturnValue("original")
        const hiredSpy = vi.fn().mockReturnValue("hired")

        const $originalAssembler = market.offer("original").asProduct({
            factory: originalSpy
        })

        const $originalAssemblerMock = $originalAssembler.mock({
            factory: hiredSpy
        })
        const $base = market.offer("base").asProduct({
            assemblers: [$originalAssembler],
            factory: (deps, ctx) => {
                return ctx($originalAssembler).assemble({}).unpack()
            }
        })

        const $hired = $base.hire($originalAssemblerMock)

        const result = $hired.assemble({}).unpack()

        await sleep(10)

        expect(result).toBe("hired")
        expect(originalSpy).toHaveBeenCalledTimes(0)
        // Eager loading, called on both assemble() calls
        // Because nothing is preserved between assembler calls
        // Because passed via assemblers, not suppliers
        // Just a weird, but normal edge case
        expect(hiredSpy).toHaveBeenCalledTimes(2)
    })

    it("should support empty assembler in mocks", () => {
        const market = createMarket()
        const $base = market.offer("base").asProduct({
            factory: () => "base-value"
        })

        const $mock = $base.mock({
            factory: () => {
                return "mock-value"
            }
        })

        const result = $mock.assemble({}).unpack()
        expect(result).toBe("mock-value")
    })

    it("should handle assembler errors in mocks gracefully", () => {
        const market = createMarket()
        const errorSpy = vi.fn().mockImplementation(() => {
            throw new Error("Assembler error")
        })

        const $error = market.offer("error").asProduct({
            factory: errorSpy
        })

        const $base = market.offer("base").asProduct({
            factory: () => "base-value"
        })

        const $mock = $base.mock({
            factory: (deps, ctx) => {
                expect(() => {
                    ctx($error).assemble({}).unpack()
                }).toThrow("Assembler error")
                return "mock-value"
            },
            assemblers: [$error]
        })

        const result = $mock.assemble({}).unpack()
        expect(result).toBe("mock-value")
    })

    it("should handle assembler errors in hire() method gracefully", () => {
        const market = createMarket()
        const baseSpy = vi.fn().mockReturnValue("base")
        const errorSpy = vi.fn().mockImplementation(() => {
            throw new Error("Assembler error")
        })

        const $base = market.offer("base").asProduct({
            factory: baseSpy
        })

        const $error = $base.mock({
            factory: errorSpy
        })

        const $main = market.offer("main").asProduct({
            assemblers: [$base],
            factory: (deps, ctx) => {
                expect(() => {
                    ctx($base).assemble({}).unpack()
                }).toThrow()
                return "main"
            }
        })

        const $hired = $main.hire($error)

        const result = $hired.assemble({}).unpack()
        expect(result).toBe("main")
    })

    it("should support complex assembler dependency chains in mocks", () => {
        const market = createMarket()
        const dbSpy = vi.fn().mockReturnValue("db")
        const testSpy = vi.fn().mockReturnValue("test")

        const $config = market.offer("config").asResource<{ env: string }>()
        const $db = market.offer("db").asProduct({
            suppliers: [$config],
            factory: dbSpy
        })
        const $test = market.offer("test").asProduct({
            suppliers: [$db],
            factory: testSpy
        })

        const $base = market.offer("base").asProduct({
            factory: () => "base"
        })

        const $mock = $base.mock({
            assemblers: [$test],
            factory: (deps, ctx) => {
                const test = ctx($test)
                    .assemble(index($config.pack({ env: "test" })))
                    .unpack()

                return `base-${test}`
            }
        })

        const result = $mock.assemble({}).unpack()
        expect(result).toBe("base-test")
    })

    it("should handle duplicate assembler names in hire() method by overriding", async () => {
        const market = createMarket()
        const originalSpy = vi.fn().mockReturnValue("original")
        const overrideSpy = vi.fn().mockReturnValue("override")
        const overrideSpy2 = vi.fn().mockReturnValue("override2")

        const $original = market.offer("duplicate").asProduct({
            factory: originalSpy
        })

        const $override = $original.mock({
            factory: overrideSpy
        })

        const $override2 = $original.mock({
            factory: overrideSpy2
        })

        const $base = market.offer("base").asProduct({
            assemblers: [$original],
            factory: (deps, ctx) => {
                return ctx($original).assemble({}).unpack()
            }
        })

        const $hired = $base.hire($override, $override2)

        const result = $hired.assemble({}).unpack()
        await sleep(10)
        expect(result).toBe("override2")
        expect(originalSpy).toHaveBeenCalledTimes(0)
        expect(overrideSpy).toHaveBeenCalledTimes(0)
        expect(overrideSpy2).toHaveBeenCalledTimes(2)
    })

    describe("Accessing $ supplies after hire() call in a factory", () => {
        it("$ supplies of product built with hire() should contain only the hired suppliers products properly typed", () => {
            const market = createMarket()

            const $assembler1 = market.offer("assembler1").asProduct({
                factory: () => "assembler1-value"
            })

            const $assembler2 = market.offer("assembler2").asProduct({
                factory: () => "assembler2-value"
            })

            const $main = market.offer("main").asProduct({
                assemblers: [$assembler1, $assembler2],
                factory: (deps, ctx) => {
                    const product = ctx($assembler1)
                        .hire($assembler2)
                        .assemble({})
                        .unpack()

                    const assembler2Product = ctx($assembler2).assemble({})
                    expectTypeOf(assembler2Product).toExtend<Product>()
                    expect(assembler2Product.unpack()).toBe("assembler2-value")
                }
            })

            $main.assemble({}).unpack()
        })
    })

    describe("Type-safety of nested $$().assemble() calls", () => {
        it("should properly type the result of nested $$().assemble() calls", () => {
            const market = createMarket()

            const $resourceA = market.offer("resourceA").asResource<string>()
            const $resourceB = market.offer("resourceB").asResource<string>()

            const $productA = market.offer("productA").asProduct({
                suppliers: [$resourceA],
                factory: () => {
                    return "productA-value"
                }
            })

            const $productB = market.offer("productB").asProduct({
                suppliers: [$resourceA, $resourceB],
                factory: ({ resourceA, resourceB }) => {
                    expect(resourceA).toBe("resourceA-value")
                    expect(resourceB).toBe("resourceB-value")
                    return "productB-value"
                }
            })

            const $main = market.offer("main").asProduct({
                suppliers: [$productA],
                assemblers: [$productB],
                factory: (deps, ctx) => {
                    // @ts-expect-error - resourceB is not supplied
                    ctx($productB).assemble({})
                    // Works, resource A doesn't need to be supplied, reused from $
                    ctx($productB)
                        .assemble(index($resourceB.pack("resourceB-value")))
                        .unpack()
                    return "main-value"
                }
            })

            $main.assemble(index($resourceA.pack("resourceA-value"))).unpack()
        })

        it("Calling $$($$supplier).assemble() (reassemble) should never require any supplies to be supplied", () => {
            const market = createMarket()

            const $resource = market.offer("resource").asResource<string>()
            const $product = market.offer("product").asProduct({
                suppliers: [$resource],
                factory: ({ resource }) => {
                    return resource
                }
            })

            const $main = market.offer("main").asProduct({
                suppliers: [$product],
                factory: (deps, ctx) => {
                    expect(ctx($product).assemble({}).unpack()).toBe(
                        "resource-value"
                    )
                }
            })

            $main.assemble(index($resource.pack("resource-value"))).unpack()
        })

        it("Calling $$().hire(mock).assemble() should be properly typed", () => {
            const market = createMarket()

            const $resource = market.offer("resource").asResource<string>()
            const $productA = market.offer("productA").asProduct({
                factory: () => "productA-value"
            })

            const $productC = market.offer("productC").asProduct({
                suppliers: [$productA],
                factory: ({ productA }) => productA
            })

            const $productAMock = $productA.mock({
                suppliers: [$resource],
                factory: () => "productAMock-value",
                lazy: true
            })

            const $main = market.offer("main").asProduct({
                assemblers: [$productC, $productAMock],
                factory: (deps, ctx) => {
                    const hired = ctx($productC).hire($productAMock)

                    // @ts-expect-error - resource is not supplied
                    hired.assemble({}).unpack()
                    expect(
                        hired
                            .assemble(index($resource.pack("resource-value")))
                            .unpack()
                    ).toBe("productAMock-value")
                }
            })

            $main.assemble({}).unpack()
        })
    })
})
