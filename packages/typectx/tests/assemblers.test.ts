import { describe, it, expect, vi, expectTypeOf } from "vitest"
import { createMarket, type Supply } from "#index"
import { index, sleep } from "#utils"

describe("Assemblers Feature", () => {
    it("should pass assemblers to factory but not auto-assemble them", () => {
        const market = createMarket()
        const factoryMock = vi.fn().mockReturnValue("value")

        const $assembler = market.add("assembler").static({
            factory: factoryMock
        })

        const $main = market.add("main").static({
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
        const $dynamic = market.add("dynamic").dynamic<string>()

        const $assembler1 = market.add("assembler1").static({
            suppliers: [$dynamic],
            factory: ({ dynamic }) => `A1: ${dynamic}`
        })

        const $assembler2 = market.add("assembler2").static({
            suppliers: [$dynamic],
            factory: ({ dynamic }) => `A2: ${dynamic}`
        })

        const $base = market.add("base").static({
            assemblers: [$assembler1],
            factory: (deps, ctx) => {
                return ctx($assembler1)
                    .assemble(index($dynamic.pack("test")))
                    .unpack()
            }
        })

        const $extended = $base.hire($assembler2)

        // @ts-expect-error - hired dynamic supplies must be supplied also
        $extended.assemble({})
        const result = $extended
            .assemble(index($dynamic.pack("unused")))
            .unpack()
        expect(result).toBe("A1: test")
    })

    it("should allow manual assembly of assemblers within factory", () => {
        const market = createMarket()
        const factoryMock = vi.fn().mockReturnValue("value")

        const $assembler = market.add("assembler").static({
            factory: factoryMock
        })

        const $main = market.add("main").static({
            assemblers: [$assembler],
            factory: (deps, ctx) => {
                const assemblerSupply = ctx($assembler).assemble({})
                const value = assemblerSupply.unpack()

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

        const $session = market.add("session").dynamic<{
            userId: string
            role: string
        }>()

        const $adminSession = market.add("adminSession").dynamic<{
            userId: string
            role: "admin"
        }>()

        const $adminFeature = market.add("adminFeature").static({
            //Even if unused, protects this function from being called by non-admins via Typescript
            suppliers: [$adminSession],
            factory: () => "sensitive-admin-data"
        })

        const $userFeature = market.add("userFeature").static({
            factory: () => "regular-user-data"
        })

        const $main = market.add("main").static({
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

        const $failing = market.add("failing").static({
            factory: () => {
                throw new Error("Assembler failed")
                return
            }
        })

        const $main = market.add("main").static({
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

        const $assembler = market.add("assembler").static({
            factory: () => "assembler-value"
        })

        const $main = market.add("main").static({
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

        const $db = market.add("db").dynamic<string>()

        const $repository = market.add("repo").static({
            suppliers: [$db],
            factory: ({ db }) => {
                return "repo-" + db
            }
        })

        const $feature = market.add("feature").static({
            suppliers: [$repository],
            factory: ({ repo }) => {
                return "feature-" + repo
            }
        })

        const $main = market.add("main").static({
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

    it("should properly overwrite dynamic supply in assembler's assemble() method", () => {
        const market = createMarket()
        const $number = market.add("number").dynamic<number>()
        const $doubler = market.add("doubler").static({
            suppliers: [$number],
            factory: ({ number }) => {
                return number * 2
            }
        })

        const $quadrupler = market.add("quadrupler").static({
            suppliers: [$doubler],
            factory: ({ doubler }) => {
                return doubler * 2
            }
        })

        const $main = market.add("main").static({
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

    it("should preserve supplies from previous assemble calls that don't depend on the new supplies", async () => {
        const market = createMarket()
        const $number = market.add("number").dynamic<number>()
        const $dummy = market.add("dummy").static({
            factory: () => "dummy"
        })

        let timesCalled = 0
        const $counter = market.add("counter").static({
            suppliers: [$dummy],
            factory: ({ dummy }) => {
                return timesCalled++
            }
        })

        const $reassembled = market.add("reassembled").static({
            suppliers: [$number, $counter],
            factory: ({ number }) => {
                return number
            }
        })

        const $main = market.add("main").static({
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

    it("Providing undefined supply to reassemble should not preserve the previous supply", () => {
        const market = createMarket()
        const $number = market.add("number").dynamic<number>()
        const $username = market.add("username").static({
            suppliers: [$number],
            factory: ({ number }) => {
                return "John-" + number
            }
        })

        const $greeter = market.add("greeter").static({
            suppliers: [$username],
            factory: ({ username }) => {
                return "Hello, " + username + "!"
            }
        })

        const $main = market.add("main").static({
            suppliers: [$number, $username],
            assemblers: [$greeter],
            factory: (deps, ctx) => {
                const assembled = ctx($greeter).assemble({[$username.name]: undefined}).unpack()
                return assembled
            }
        })

        const result = $main.assemble(index($number.pack(10), $username.pack("Ted-10"))).unpack()
        expect(result).toEqual("Hello, John-10!")
    })

    it("should support mocks with assembler", () => {
        const market = createMarket()
        const factoryMock = vi.fn().mockReturnValue("value")

        const $assembler = market.add("assembler").static({
            factory: factoryMock
        })

        const $base = market.add("base").static({
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

        const $A = market.add("A").static({
            factory: ASpy
        })

        const $B = market.add("B").static({
            factory: BSpy
        })

        const $base = market.add("base").static({
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

        const $originalAssembler = market.add("original").static({
            factory: originalSpy
        })

        const $originalAssemblerMock = $originalAssembler.mock({
            factory: hiredSpy
        })
        const $base = market.add("base").static({
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
        const $base = market.add("base").static({
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

        const $error = market.add("error").static({
            factory: errorSpy
        })

        const $base = market.add("base").static({
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

        const $base = market.add("base").static({
            factory: baseSpy
        })

        const $error = $base.mock({
            factory: errorSpy
        })

        const $main = market.add("main").static({
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

        const $config = market.add("config").dynamic<{ env: string }>()
        const $db = market.add("db").static({
            suppliers: [$config],
            factory: dbSpy
        })
        const $test = market.add("test").static({
            suppliers: [$db],
            factory: testSpy
        })

        const $base = market.add("base").static({
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

        const $original = market.add("duplicate").static({
            factory: originalSpy
        })

        const $override = $original.mock({
            factory: overrideSpy
        })

        const $override2 = $original.mock({
            factory: overrideSpy2
        })

        const $base = market.add("base").static({
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

    describe("Accessing supplies after hire() call in a factory", () => {
        it("supplies of supply built with hire() should contain only the hired suppliers' supplies properly typed", () => {
            const market = createMarket()

            const $assembler1 = market.add("assembler1").static({
                factory: () => "assembler1-value"
            })

            const $assembler2 = market.add("assembler2").static({
                factory: () => "assembler2-value"
            })

            const $main = market.add("main").static({
                assemblers: [$assembler1, $assembler2],
                factory: (deps, ctx) => {
                    const supply = ctx($assembler1)
                        .hire($assembler2)
                        .assemble({})

                    expectTypeOf(supply.supplies.assembler2).not.toEqualTypeOf<any>()
                    expectTypeOf(supply.supplies.assembler2).toExtend<Supply>()
                    expect(supply.supplies.assembler2.unpack()).toBe("assembler2-value")

                    expectTypeOf(supply.deps.assembler2).not.toEqualTypeOf<any>()
                    expectTypeOf(supply.deps.assembler2).toExtend<string>()
                }
            })

            $main.assemble({}).unpack()
        })
    })

    describe("Type-safety of nested ctx().assemble() calls", () => {
        it("should properly type the result of nested ctx().assemble() calls", () => {
            const market = createMarket()

            const $dynamicA = market.add("dynamicA").dynamic<string>()
            const $dynamicB = market.add("dynamicB").dynamic<string>()

            const $productA = market.add("productA").static({
                suppliers: [$dynamicA],
                factory: () => {
                    return "productA-value"
                }
            })

            const $productB = market.add("productB").static({
                suppliers: [$dynamicA, $dynamicB],
                factory: ({ dynamicA, dynamicB }) => {
                    expect(dynamicA).toBe("dynamicA-value")
                    expect(dynamicB).toBe("dynamicB-value")
                    return "productB-value"
                }
            })

            const $main = market.add("main").static({
                suppliers: [$productA],
                assemblers: [$productB],
                factory: (deps, ctx) => {
                    // @ts-expect-error - dynamic supply dynamicB is not supplied
                    ctx($productB).assemble({})
                    // Works, dynamic supply dynamicA doesn't need to be supplied, reused from deps
                    ctx($productB)
                        .assemble(index($dynamicB.pack("dynamicB-value")))
                        .unpack()
                    return "main-value"
                }
            })

            $main.assemble(index($dynamicA.pack("dynamicA-value"))).unpack()
        })

        it("Calling ctx($supplier).assemble() (reassemble) should never require any supplies to be supplied", () => {
            const market = createMarket()

            const $dynamic = market.add("dynamic").dynamic<string>()
            const $product = market.add("product").static({
                suppliers: [$dynamic],
                factory: ({ dynamic }) => {
                    return dynamic
                }
            })

            const $main = market.add("main").static({
                suppliers: [$product],
                factory: (deps, ctx) => {
                    expect(ctx($product).assemble({}).unpack()).toBe(
                        "dynamic-value"
                    )
                }
            })

            $main.assemble(index($dynamic.pack("dynamic-value"))).unpack()
        })

        it("Calling ctx().hire(mock).assemble() should be properly typed", () => {
            const market = createMarket()

            const $dynamic = market.add("dynamic").dynamic<string>()
            const $productA = market.add("productA").static({
                factory: () => "productA-value"
            })

            const $productB = market.add("productB").static({
                suppliers: [$productA],
                factory: ({ productA }) => productA
            })

            const $productAMock = $productA.mock({
                suppliers: [$dynamic],
                factory: () => "productAMock-value",
                lazy: true
            })

            const $main = market.add("main").static({
                assemblers: [$productB, $productAMock],
                factory: (deps, ctx) => {
                    const hired = ctx($productB).hire($productAMock)

                    // @ts-expect-error - dynamic supply is not supplied
                    hired.assemble({}).unpack()
                    expect(
                        hired
                            .assemble(index($dynamic.pack("dynamic-value")))
                            .unpack()
                    ).toBe("productAMock-value")
                }
            })

            $main.assemble({}).unpack()
        })
    })
})
