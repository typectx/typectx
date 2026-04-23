import { describe, it, expect, vi, expectTypeOf } from "vitest"
import { service } from "#index"
import { index, sleep } from "#utils"
import type { DuplicateDependencyError } from "#types/guards"
import type { Supply } from "#types/public"

describe("Context Propagation", () => {
    it("ctx should return a service with same name", () => {
        const factoryMock = vi.fn().mockReturnValue("value")

        const $contextual = service("contextual").app({
            factory: factoryMock
        })

        const $main = service("main").app({
            factory: (deps, ctx) => {
                // Contextual services are passed but not auto-assembled
                expect(ctx($contextual).name).toBe($contextual.name)
                expect(factoryMock).not.toHaveBeenCalled()

                return "main-result"
            }
        })

        const result = $main.assemble({}).unpack()
        expect(result).toBe("main-result")
        expect(factoryMock).not.toHaveBeenCalled()
    })

    it("should require request supplies for hired contextual services", () => {
        const $input = service("input").request<string>()

        const $contextual1 = service("contextual1").app({
            services: [$input],
            factory: ({ input }) => `A1: ${input}`
        })

        const $contextual2 = service("contextual2").app({
            services: [$input],
            factory: ({ input }) => `A2: ${input}`
        })

        const $base = service("base").app({
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

        const $contextual = service("contextual").app({
            factory: factoryMock
        })

        const $main = service("main").app({
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
        const $session = service("session").request<{
            userId: string
            role: string
        }>()

        const $adminSession = service("adminSession").request<{
            userId: string
            role: "admin"
        }>()

        const $adminFeature = service("adminFeature").app({
            //Even if unused, protects this function from being called by non-admins via Typescript
            services: [$adminSession],
            factory: () => "sensitive-admin-data"
        })

        const $userFeature = service("userFeature").app({
            factory: () => "regular-user-data"
        })

        const $main = service("main").app({
            services: [$session, $userFeature],
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

    it("should handle contextual service errors gracefully", () => {
        const $failing = service("failing").app({
            factory: () => {
                throw new Error("Context service failed")
                return
            }
        })

        const $main = service("main").app({
            factory: (deps, ctx) => {
                ctx($failing).assemble({}).unpack()
                return "main"
            }
        })

        expect(() => {
            $main.assemble({}).unpack()
        }).toThrow("Context service failed")
    })

    it("should support complex contextual dependency chains", () => {
        const $db = service("db").request<string>()

        const $repository = service("repo").app({
            services: [$db],
            factory: ({ db }) => {
                return "repo-" + db
            }
        })

        const $feature = service("feature").app({
            services: [$repository],
            factory: ({ repo }) => {
                return "feature-" + repo
            }
        })

        const $main = service("main").app({
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
        const $number = service("number").request<number>()
        const $doubler = service("doubler").app({
            services: [$number],
            factory: ({ number }) => {
                return number * 2
            }
        })

        const $quadrupler = service("quadrupler").app({
            services: [$doubler],
            factory: ({ doubler }) => {
                return doubler * 2
            }
        })

        const $main = service("main").app({
            services: [$doubler],
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
        const $number = service("number").request<number>()
        const $dummy = service("dummy").app({
            factory: () => "dummy"
        })

        let timesCalled = 0
        const $counter = service("counter").app({
            services: [$dummy],
            factory: ({ dummy }) => {
                return timesCalled++
            }
        })

        const $reassembled = service("reassembled").app({
            services: [$number, $counter],
            factory: ({ number }) => {
                return number
            }
        })

        const $main = service("main").app({
            services: [$dummy, $counter],
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
        const $number = service("number").request<number>()
        const $username = service("username").app({
            services: [$number],
            factory: ({ number }) => {
                return "John-" + number
            }
        })

        const $greeter = service("greeter").app({
            services: [$username],
            factory: ({ username }) => {
                return "Hello, " + username + "!"
            }
        })

        const $main = service("main").app({
            services: [$number, $username],
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

    it("should support mocks with contextual service assembly", () => {
        const factoryMock = vi.fn().mockReturnValue("product")

        const $contextual = service("contextual").app({
            factory: factoryMock
        })

        const $base = service("base").app({
            factory: () => "base-value"
        })

        const $mock = $base.mock({
            factory: (deps, ctx) => {
                expect(ctx($contextual).name).toBe($contextual.name)

                const assembled = ctx($contextual).assemble({})
                const product = assembled.unpack()

                return `mock-${product}`
            }
        })

        const result = $mock.assemble({}).unpack()
        expect(result).toBe("mock-product")
        expect(factoryMock).toHaveBeenCalledTimes(1)
    })

    it("should support mocks with multiple contextual services", () => {
        const ASpy = vi.fn().mockReturnValue("A")
        const BSpy = vi.fn().mockReturnValue("B")

        const $A = service("A").app({
            factory: ASpy
        })

        const $B = service("B").app({
            factory: BSpy
        })

        const $base = service("base").app({
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
        const mockSpy = vi.fn().mockReturnValue("mocked")

        const $original = service("original").app({
            factory: originalSpy
        })

        const $mock = $original.mock({
            factory: mockSpy
        })
        const $base = service("base").app({
            factory: (deps, ctx) => {
                return ctx($original).assemble({}).unpack()
            }
        })

        const result = $base.hire($mock).assemble({}).unpack()

        await sleep(10)

        expect(result).toBe("mocked")
        expect(originalSpy).toHaveBeenCalledTimes(0)
        expect(mockSpy).toHaveBeenCalledTimes(2)
    })

    it("should support empty contextual dependency setup in mocks", () => {
        const $base = service("base").app({
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

    it("should handle contextual service errors in mocks gracefully", () => {
        const errorSpy = vi.fn().mockImplementation(() => {
            throw new Error("Context service error")
        })

        const $error = service("error").app({
            factory: errorSpy
        })

        const $base = service("base").app({
            factory: () => "base-value"
        })

        const $mock = $base.mock({
            factory: (deps, ctx) => {
                expect(() => {
                    ctx($error).assemble({}).unpack()
                }).toThrow("Context service error")
                return "mock-value"
            }
        })

        const result = $mock.assemble({}).unpack()
        expect(result).toBe("mock-value")
    })

    it("should handle contextual service errors in hire() method gracefully", () => {
        const baseSpy = vi.fn().mockReturnValue("base")
        const errorSpy = vi.fn().mockImplementation(() => {
            throw new Error("Context service error")
        })

        const $base = service("base").app({
            factory: baseSpy
        })

        const $error = $base.mock({
            factory: errorSpy
        })

        const $main = service("main").app({
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

        const $config = service("config").request<{ env: string }>()
        const $db = service("db").app({
            services: [$config],
            factory: dbSpy
        })
        const $test = service("test").app({
            services: [$db],
            factory: testSpy
        })

        const $base = service("base").app({
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

    it("should error on duplicate contextual service names in hire()", async () => {
        const originalSpy = vi.fn().mockReturnValue("original")
        const overrideSpy = vi.fn().mockReturnValue("override")
        const overrideSpy2 = vi.fn().mockReturnValue("override2")

        const $original = service("duplicate").app({
            factory: originalSpy
        })

        const $override = $original.mock({
            factory: overrideSpy
        })

        const $override2 = $original.mock({
            factory: overrideSpy2
        })

        const $base = service("base").app({
            factory: (deps, ctx) => {
                return ctx($original).assemble({}).unpack()
            }
        })

        const $hired = $base.hire($override, $override2)

        expectTypeOf($hired).toExtend<DuplicateDependencyError>()
    })

    describe("Accessing supplies after hire() call in a factory", () => {
        it("supplies of supply built with hire() should contain only the hired services' supplies properly typed", () => {
            const $contextual1 = service("contextual1").app({
                factory: () => "contextual1-value"
            })

            const $contextual2 = service("contextual2").app({
                factory: () => "contextual2-value"
            })

            const $main = service("main").app({
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
            const $inputA = service("inputA").request<string>()
            const $inputB = service("inputB").request<string>()

            const $A = service("A").app({
                services: [$inputA],
                factory: () => {
                    return "A-value"
                }
            })

            const $B = service("B").app({
                services: [$inputA, $inputB],
                factory: ({ inputA, inputB }) => {
                    expect(inputA).toBe("inputA-value")
                    expect(inputB).toBe("inputB-value")
                    return "B-value"
                }
            })

            const $main = service("main").app({
                services: [$A],
                factory: (deps, ctx) => {
                    // @ts-expect-error - input supply inputB is not supplied
                    ctx($B).assemble({})
                    // Works, input supply inputA doesn't need to be supplied, reused from deps
                    ctx($B)
                        .assemble(index($inputB.pack("inputB-value")))
                        .unpack()
                    return "main-value"
                }
            })

            $main.assemble(index($inputA.pack("inputA-value"))).unpack()
        })

        it("Calling ctx($service).assemble() (reassemble) should never require any supplies to be supplied", () => {
            const $input = service("input").request<string>()
            const $product = service("product").app({
                services: [$input],
                factory: ({ input }) => {
                    return input
                }
            })

            const $main = service("main").app({
                services: [$product],
                factory: (deps, ctx) => {
                    expect(ctx($product).assemble({}).unpack()).toBe(
                        "input-value"
                    )
                }
            })

            $main.assemble(index($input.pack("input-value"))).unpack()
        })

        it("Calling ctx().hire(mock).assemble() should be properly typed", () => {
            const $input = service("input").request<string>()
            const $A = service("A").app({
                factory: () => "A-value"
            })

            const $B = service("B").app({
                services: [$A],
                factory: ({ A }) => A
            })

            const $AMock = $A.mock({
                services: [$input],
                factory: () => "AMock-value"
            })

            const $main = service("main").app({
                factory: (deps, ctx) => {
                    const hired = ctx($B).hire($AMock)

                    expect(() => {
                        // @ts-expect-error - input supply is not supplied
                        hired.assemble({}).unpack()
                    }).toThrow()
                    expect(
                        hired
                            .assemble(index($input.pack("input-value")))
                            .unpack()
                    ).toBe("AMock-value")
                }
            })

            $main.assemble({}).unpack()
        })
    })
})
