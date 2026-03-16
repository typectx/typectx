import { describe, it, expect, vi, expectTypeOf } from "vitest"
import { supplier } from "#index"
import { index, sleep } from "#utils"
import type { DuplicateDependencyError } from "#types/guards"
import type { Supply } from "#types/public"

describe("Context Propagation", () => {
    it("ctx should return a supplier with same name", () => {
        const factoryMock = vi.fn().mockReturnValue("value")

        const $contextual = supplier("contextual").product({
            factory: factoryMock
        })

        const $main = supplier("main").product({
            factory: (deps, ctx) => {
                // Contextual suppliers are passed but not auto-assembled
                expect(ctx($contextual).name).toBe($contextual.name)
                expect(factoryMock).not.toHaveBeenCalled()

                return "main-result"
            }
        })

        const result = $main.assemble({}).unpack()
        expect(result).toBe("main-result")
        expect(factoryMock).not.toHaveBeenCalled()
    })

    it("should require request supplies for hired contextual suppliers", () => {
        const $input = supplier("input").request<string>()

        const $contextual1 = supplier("contextual1").product({
            suppliers: [$input],
            factory: ({ input }) => `A1: ${input}`
        })

        const $contextual2 = supplier("contextual2").product({
            suppliers: [$input],
            factory: ({ input }) => `A2: ${input}`
        })

        const $base = supplier("base").product({
            factory: (deps, ctx) => {
                return ctx($contextual1)
                    .assemble(index($input.pack("test")))
                    .unpack()
            }
        })

        const $extended = $base.hire($contextual2)

        // @ts-expect-error - hired request supplies must be supplied also
        $extended.assemble({})
        const result = $extended.assemble(index($input.pack("unused"))).unpack()
        expect(result).toBe("A1: test")
    })

    it("should allow manual contextual assembly within factory", () => {
        const factoryMock = vi.fn().mockReturnValue("value")

        const $contextual = supplier("contextual").product({
            factory: factoryMock
        })

        const $main = supplier("main").product({
            factory: (deps, ctx) => {
                const contextualSupply = ctx($contextual).assemble({})
                const value = contextualSupply.unpack()

                expect(factoryMock).toHaveBeenCalledTimes(1)
                expect(value).toBe("value")

                return {
                    main: "main-result",
                    contextual: value
                }
            }
        })

        const result = $main.assemble({}).unpack()
        expect(result).toEqual({
            main: "main-result",
            contextual: "value"
        })
    })

    it("should support conditional assembly based on context (session admin example)", () => {
        const $session = supplier("session").request<{
            userId: string
            role: string
        }>()

        const $adminSession = supplier("adminSession").request<{
            userId: string
            role: "admin"
        }>()

        const $adminFeature = supplier("adminFeature").product({
            //Even if unused, protects this function from being called by non-admins via Typescript
            suppliers: [$adminSession],
            factory: () => "sensitive-admin-data"
        })

        const $userFeature = supplier("userFeature").product({
            factory: () => "regular-user-data"
        })

        const $main = supplier("main").product({
            suppliers: [$session, $userFeature],
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

    it("should handle contextual supplier errors gracefully", () => {
        const $failing = supplier("failing").product({
            factory: () => {
                throw new Error("Context supplier failed")
                return
            }
        })

        const $main = supplier("main").product({
            factory: (deps, ctx) => {
                ctx($failing).assemble({}).unpack()
                return "main"
            }
        })

        expect(() => {
            $main.assemble({}).unpack()
        }).toThrow("Context supplier failed")
    })

    it("should support complex contextual dependency chains", () => {
        const $db = supplier("db").request<string>()

        const $repository = supplier("repo").product({
            suppliers: [$db],
            factory: ({ db }) => {
                return "repo-" + db
            }
        })

        const $feature = supplier("feature").product({
            suppliers: [$repository],
            factory: ({ repo }) => {
                return "feature-" + repo
            }
        })

        const $main = supplier("main").product({
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

    it("should properly overwrite request supply in contextual assemble() calls", () => {
        const $number = supplier("number").request<number>()
        const $doubler = supplier("doubler").product({
            suppliers: [$number],
            factory: ({ number }) => {
                return number * 2
            }
        })

        const $quadrupler = supplier("quadrupler").product({
            suppliers: [$doubler],
            factory: ({ doubler }) => {
                return doubler * 2
            }
        })

        const $main = supplier("main").product({
            suppliers: [$doubler],
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
        const $number = supplier("number").request<number>()
        const $dummy = supplier("dummy").product({
            factory: () => "dummy"
        })

        let timesCalled = 0
        const $counter = supplier("counter").product({
            suppliers: [$dummy],
            factory: ({ dummy }) => {
                return timesCalled++
            }
        })

        const $reassembled = supplier("reassembled").product({
            suppliers: [$number, $counter],
            factory: ({ number }) => {
                return number
            }
        })

        const $main = supplier("main").product({
            suppliers: [$dummy, $counter],
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
        const $number = supplier("number").request<number>()
        const $username = supplier("username").product({
            suppliers: [$number],
            factory: ({ number }) => {
                return "John-" + number
            }
        })

        const $greeter = supplier("greeter").product({
            suppliers: [$username],
            factory: ({ username }) => {
                return "Hello, " + username + "!"
            }
        })

        const $main = supplier("main").product({
            suppliers: [$number, $username],
            factory: (deps, ctx) => {
                const assembled = ctx($greeter)
                    .assemble({ [$username.name]: undefined })
                    .unpack()
                return assembled
            }
        })

        const result = $main
            .assemble(index($number.pack(10), $username.pack("Ted-10")))
            .unpack()
        expect(result).toEqual("Hello, John-10!")
    })

    it("should support mocks with contextual supplier assembly", () => {
        const factoryMock = vi.fn().mockReturnValue("value")

        const $contextual = supplier("contextual").product({
            factory: factoryMock
        })

        const $base = supplier("base").product({
            factory: () => "base-value"
        })

        const $mock = $base.mock({
            factory: (deps, ctx) => {
                expect(ctx($contextual).name).toBe($contextual.name)

                const assembled = ctx($contextual).assemble({})
                const product = assembled.unpack()

                return `base-value-${product}`
            }
        })

        const result = $mock.assemble({}).unpack()
        expect(result).toBe("base-value-value")
        expect(factoryMock).toHaveBeenCalledTimes(1)
    })

    it("should support mocks with multiple contextual suppliers", () => {
        const ASpy = vi.fn().mockReturnValue("A")
        const BSpy = vi.fn().mockReturnValue("B")

        const $A = supplier("A").product({
            factory: ASpy
        })

        const $B = supplier("B").product({
            factory: BSpy
        })

        const $base = supplier("base").product({
            factory: () => "base-value"
        })

        const $mock = $base.mock({
            factory: (deps, ctx) => {
                const contextualA = ctx($A).assemble({}).unpack()
                const contextualB = ctx($B).assemble({}).unpack()

                return `base-value-${contextualA}-${contextualB}`
            }
        })

        const result = $mock.assemble({}).unpack()
        expect(result).toBe("base-value-A-B")
        expect(ASpy).toHaveBeenCalledTimes(1)
        expect(BSpy).toHaveBeenCalledTimes(1)
    })

    it("should support hire() method with contextual replacement", async () => {
        const originalSpy = vi.fn().mockReturnValue("original")
        const hiredSpy = vi.fn().mockReturnValue("hired")

        const $originalAssembler = supplier("original").product({
            factory: originalSpy
        })

        const $originalAssemblerMock = $originalAssembler.mock({
            factory: hiredSpy
        })
        const $base = supplier("base").product({
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
        // Because nothing is preserved between contextual assemble() calls
        // because the value is reached through a contextualized path
        // Just a weird, but normal edge case
        expect(hiredSpy).toHaveBeenCalledTimes(2)
    })

    it("should support empty contextual dependency setup in mocks", () => {
        const $base = supplier("base").product({
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

    it("should handle contextual supplier errors in mocks gracefully", () => {
        const errorSpy = vi.fn().mockImplementation(() => {
            throw new Error("Context supplier error")
        })

        const $error = supplier("error").product({
            factory: errorSpy
        })

        const $base = supplier("base").product({
            factory: () => "base-value"
        })

        const $mock = $base.mock({
            factory: (deps, ctx) => {
                expect(() => {
                    ctx($error).assemble({}).unpack()
                }).toThrow("Context supplier error")
                return "mock-value"
            }
        })

        const result = $mock.assemble({}).unpack()
        expect(result).toBe("mock-value")
    })

    it("should handle contextual supplier errors in hire() method gracefully", () => {
        const baseSpy = vi.fn().mockReturnValue("base")
        const errorSpy = vi.fn().mockImplementation(() => {
            throw new Error("Context supplier error")
        })

        const $base = supplier("base").product({
            factory: baseSpy
        })

        const $error = $base.mock({
            factory: errorSpy
        })

        const $main = supplier("main").product({
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

    it("should support complex contextual dependency chains in mocks", () => {
        const dbSpy = vi.fn().mockReturnValue("db")
        const testSpy = vi.fn().mockReturnValue("test")

        const $config = supplier("config").request<{ env: string }>()
        const $db = supplier("db").product({
            suppliers: [$config],
            factory: dbSpy
        })
        const $test = supplier("test").product({
            suppliers: [$db],
            factory: testSpy
        })

        const $base = supplier("base").product({
            factory: () => "base"
        })

        const $mock = $base.mock({
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

    it("should error on duplicate contextual supplier names in hire()", async () => {
        const originalSpy = vi.fn().mockReturnValue("original")
        const overrideSpy = vi.fn().mockReturnValue("override")
        const overrideSpy2 = vi.fn().mockReturnValue("override2")

        const $original = supplier("duplicate").product({
            factory: originalSpy
        })

        const $override = $original.mock({
            factory: overrideSpy
        })

        const $override2 = $original.mock({
            factory: overrideSpy2
        })

        const $base = supplier("base").product({
            factory: (deps, ctx) => {
                return ctx($original).assemble({}).unpack()
            }
        })

        const $hired = $base.hire($override, $override2)

        expectTypeOf($hired).toExtend<DuplicateDependencyError>()
    })

    describe("Accessing supplies after hire() call in a factory", () => {
        it("supplies of supply built with hire() should contain only the hired suppliers' supplies properly typed", () => {
            const $contextual1 = supplier("contextual1").product({
                factory: () => "contextual1-value"
            })

            const $contextual2 = supplier("contextual2").product({
                factory: () => "contextual2-value"
            })

            const $main = supplier("main").product({
                factory: (deps, ctx) => {
                    const supply = ctx($contextual1)
                        .hire($contextual2)
                        .assemble({})

                    expectTypeOf(
                        supply.supplies.contextual2
                    ).not.toEqualTypeOf<any>()
                    expectTypeOf(supply.supplies.contextual2).toExtend<
                        Supply<any>
                    >()
                    expect(supply.supplies.contextual2.unpack()).toBe(
                        "contextual2-value"
                    )

                    expectTypeOf(
                        supply.deps.contextual2
                    ).not.toEqualTypeOf<any>()
                    expectTypeOf(supply.deps.contextual2).toExtend<string>()
                }
            })

            $main.assemble({}).unpack()
        })
    })

    describe("Type-safety of nested ctx().assemble() calls", () => {
        it("should properly type the result of nested ctx().assemble() calls", () => {
            const $inputA = supplier("inputA").request<string>()
            const $inputB = supplier("inputB").request<string>()

            const $productA = supplier("productA").product({
                suppliers: [$inputA],
                factory: () => {
                    return "productA-value"
                }
            })

            const $productB = supplier("productB").product({
                suppliers: [$inputA, $inputB],
                factory: ({ inputA, inputB }) => {
                    expect(inputA).toBe("inputA-value")
                    expect(inputB).toBe("inputB-value")
                    return "productB-value"
                }
            })

            const $main = supplier("main").product({
                suppliers: [$productA],
                factory: (deps, ctx) => {
                    // @ts-expect-error - input supply inputB is not supplied
                    ctx($productB).assemble({})
                    // Works, input supply inputA doesn't need to be supplied, reused from deps
                    ctx($productB)
                        .assemble(index($inputB.pack("inputB-value")))
                        .unpack()
                    return "main-value"
                }
            })

            $main.assemble(index($inputA.pack("inputA-value"))).unpack()
        })

        it("Calling ctx($supplier).assemble() (reassemble) should never require any supplies to be supplied", () => {
            const $input = supplier("input").request<string>()
            const $product = supplier("product").product({
                suppliers: [$input],
                factory: ({ input }) => {
                    return input
                }
            })

            const $main = supplier("main").product({
                suppliers: [$product],
                factory: (deps, ctx) => {
                    expect(ctx($product).assemble({}).unpack()).toBe(
                        "input-value"
                    )
                }
            })

            $main.assemble(index($input.pack("input-value"))).unpack()
        })

        it("Calling ctx().hire(mock).assemble() should be properly typed", () => {
            const $input = supplier("input").request<string>()
            const $productA = supplier("productA").product({
                factory: () => "productA-value"
            })

            const $productB = supplier("productB").product({
                suppliers: [$productA],
                factory: ({ productA }) => productA
            })

            const $productAMock = $productA.mock({
                suppliers: [$input],
                factory: () => "productAMock-value",
                lazy: true
            })

            const $main = supplier("main").product({
                factory: (deps, ctx) => {
                    const hired = ctx($productB).hire($productAMock)

                    // @ts-expect-error - input supply is not supplied
                    hired.assemble({}).unpack()
                    expect(
                        hired
                            .assemble(index($input.pack("input-value")))
                            .unpack()
                    ).toBe("productAMock-value")
                }
            })

            $main.assemble({}).unpack()
        })
    })
})
