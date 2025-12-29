import { describe, it, expect, assertType } from "vitest"
import { createMarket, index, type Resource } from "#index"

describe("Optionals Feature", () => {
    describe("Basic Optional Resource Usage", () => {
        it("should allow defining optional resources in product config", () => {
            const market = createMarket()
            const $optional = market.offer("optional").asResource<string>()

            const $product = market.offer("product").asProduct({
                optionals: [$optional],
                factory: ({ optional }) => {
                    assertType<string | undefined>(optional)
                    return optional
                }
            })

            expect($product.optionals).toEqual([$optional])
            expect($product.assemble({}).unpack()).toEqual(undefined)
            expect(
                $product.assemble(index($optional.pack("test"))).unpack()
            ).toEqual("test")
            expect(
                // @ts-expect-error - invalid resource type
                $product.assemble(index($optional.pack(55))).unpack()
            ).toEqual(55)
        })

        it("should work when optional is NOT provided", () => {
            const market = createMarket()
            const $config = market.offer("config").asResource<string>()
            const $optional = market.offer("optional").asResource<number>()

            const $product = market.offer("product").asProduct({
                suppliers: [$config],
                optionals: [$optional],
                factory: ({ config, optional }) => {
                    return {
                        config,
                        hasOptional: optional !== undefined,
                        optionalValue: optional
                    }
                }
            })

            const result = $product
                .assemble(index($config.pack("test")))
                .unpack()

            expect(result).toEqual({
                config: "test",
                hasOptional: false,
                optionalValue: undefined
            })
        })

        it("should support multiple optionals", () => {
            const market = createMarket()
            const $required = market.offer("required").asResource<string>()
            const $opt1 = market.offer("opt1").asResource<number>()
            const $opt2 = market.offer("opt2").asResource<boolean>()
            const $opt3 = market.offer("opt3").asResource<string>()

            const $product = market.offer("product").asProduct({
                suppliers: [$required],
                optionals: [$opt1, $opt2, $opt3],
                factory: ({ required, opt1, opt2, opt3 }) => {
                    return {
                        required,
                        opt1,
                        opt2,
                        opt3
                    }
                }
            })

            // Provide only some optionals
            const result = $product
                .assemble(index($required.pack("test"), $opt2.pack(true)))
                .unpack()

            expect(result).toEqual({
                required: "test",
                opt1: undefined,
                opt2: true,
                opt3: undefined
            })
        })
    })

    describe("Type Safety with Optionals", () => {
        it("should make optional supplies optional in $ type", () => {
            const market = createMarket()
            const $required = market.offer("required").asResource<string>()
            const $optional = market.offer("optional").asResource<number>()

            const $product = market.offer("product").asProduct({
                suppliers: [$required],
                optionals: [$optional],
                factory: ({ required, optional }) => {
                    // Required supplier should be non-optional in $
                    assertType<string>(required)
                    assertType<number | undefined>(optional)
                    return "result"
                }
            })

            // Should not require optional in ToSupply
            $product.assemble(index($required.pack("test"))).unpack()

            // But should allow it
            $product.assemble(index($required.pack("test"), $optional.pack(42)))
        })

        it("should require all required suppliers in ToSupply", () => {
            const market = createMarket()
            const $required = market.offer("required").asResource<string>()
            const $optional = market.offer("optional").asResource<number>()

            const $product = market.offer("product").asProduct({
                suppliers: [$required],
                optionals: [$optional],
                factory: ({ required, optional }) => {
                    assertType<string>(required)
                    assertType<number | undefined>(optional)
                    return "result"
                }
            })

            // @ts-expect-error - missing required supplier
            $product.assemble(index($optional.pack(42))).unpack()

            // Should work without optional
            $product.assemble(index($required.pack("test"))).unpack()
        })
    })

    describe("Resource suppliers in ctx Parameter (Assemblers)", () => {
        it("should just return resource suppliers (noop)", () => {
            const market = createMarket()
            const $resource = market.offer("resource").asResource<string>()
            const $assembler = market.offer("assembler").asProduct({
                factory: () => "assembled"
            })

            const $product = market.offer("product").asProduct({
                assemblers: [$assembler],
                factory: (deps, ctx) => {
                    // Both should be in ctx
                    expect(ctx($resource)).toBe($resource)
                    expect(ctx($assembler).name).toBe($assembler.name)
                }
            })

            $product.assemble({}).unpack()
        })
    })

    describe("Optionals with Nested Dependencies", () => {
        it("should handle optionals in nested product chains", () => {
            const market = createMarket()
            const $optionalConfig = market
                .offer("optionalConfig")
                .asResource<{ apiKey: string }>()
            const $baseConfig = market
                .offer("baseConfig")
                .asResource<{ url: string }>()

            const $api = market.offer("api").asProduct({
                suppliers: [$baseConfig],
                optionals: [$optionalConfig],
                factory: ({ baseConfig, optionalConfig }) => {
                    return {
                        url: baseConfig.url,
                        apiKey: optionalConfig?.apiKey ?? "default-key"
                    }
                }
            })

            const $app = market.offer("app").asProduct({
                suppliers: [$api],
                factory: ({ api }) => {
                    return `Connecting to ${api.url} with ${api.apiKey}`
                }
            })

            // Without optional
            const result1 = $app
                .assemble(
                    index($baseConfig.pack({ url: "https://api.example.com" }))
                )
                .unpack()
            expect(result1).toBe(
                "Connecting to https://api.example.com with default-key"
            )

            // With optional
            const result2 = $app
                .assemble(
                    index(
                        $baseConfig.pack({ url: "https://api.example.com" }),
                        $optionalConfig.pack({ apiKey: "secret-123" })
                    )
                )
                .unpack()
            expect(result2).toBe(
                "Connecting to https://api.example.com with secret-123"
            )
        })

        it("should propagate optionals through transitive dependencies in types", () => {
            const market = createMarket()
            const $optional = market.offer("optional").asResource<string>()

            const $child = market.offer("child").asProduct({
                optionals: [$optional],
                factory: ({ optional }) => {
                    return optional ?? "default"
                }
            })

            const $parent = market.offer("parent").asProduct({
                suppliers: [$child],
                factory: ({ child }) => {
                    return child
                }
            })

            // Should not require optional
            const result1 = $parent.assemble({}).unpack()
            expect(result1).toBe("default")

            // Should accept optional
            const result2 = $parent
                .assemble(index($optional.pack("custom")))
                .unpack()
            expect(result2).toBe("custom")

            // Should accept optional but type-check it if provided
            // @ts-expect-error - invalid optional type
            const result4 = $parent.assemble(index($optional.pack(55))).unpack()
            expect(result4).toBe(55)
        })
    })

    describe("Optionals with Mocks", () => {
        it("should allow mocks to have different optionals", () => {
            const market = createMarket()
            const $required = market.offer("required").asResource<string>()
            const $optional1 = market.offer("optional1").asResource<number>()
            const $optional2 = market.offer("optional2").asResource<number>()

            const $base = market.offer("base").asProduct({
                suppliers: [$required],
                optionals: [$optional1],
                factory: ({ required, optional1 }) => {
                    return {
                        required,
                        value: optional1 ?? 0
                    }
                }
            })

            const $mocked = $base.mock({
                suppliers: [$required],
                optionals: [$optional2],
                factory: ({ required, optional2 }) => {
                    return {
                        required,
                        value: (optional2 ?? 0) * 2
                    }
                }
            })

            const result = $mocked
                .assemble(index($required.pack("test"), $optional2.pack(21)))
                .unpack()

            expect(result).toEqual({
                required: "test",
                value: 42
            })
        })

        it("should handle optionals with hire method", () => {
            const market = createMarket()
            const $config = market.offer("config").asResource<string>()
            const $optional = market.offer("optional").asResource<number>()

            const $dependency = market.offer("dependency").asProduct({
                suppliers: [$config],
                optionals: [$optional],
                factory: ({ optional }) => {
                    const opt = optional
                    return opt ? opt * 2 : 0
                }
            })

            const $main = market.offer("main").asProduct({
                suppliers: [$dependency],
                factory: ({ dependency }) => dependency
            })

            const $mockDep = $dependency.mock({
                factory: () => 100
            })

            const $hired = $main.hire($mockDep)

            const result = $hired.assemble({}).unpack()
            expect(result).toBe(100)
        })
    })

    describe("Optionals with Reassemble", () => {
        it("should allow reassembling with optional when it was initially provided", () => {
            const market = createMarket()
            const $config = market.offer("config").asResource<string>()
            const $optional1 = market.offer("optional1").asResource<number>()
            const $optional2 = market.offer("optional2").asResource<number>()

            const $service = market.offer("service").asProduct({
                suppliers: [$config],
                optionals: [$optional1, $optional2],
                factory: ({ config, optional1, optional2 }) => {
                    return {
                        config: config,
                        ...(optional1 ? { optional1 } : {}),
                        ...(optional2 ? { optional2 } : {})
                    }
                }
            })

            const $main = market.offer("main").asProduct({
                suppliers: [$service],
                factory: ({ service }, ctx) => {
                    const initial = service
                    expect(initial).toEqual({
                        config: "initial"
                    })

                    const reassembled = ctx($service)
                        .assemble(index($optional2.pack(50)))
                        .unpack()
                    expect(reassembled).toEqual({
                        config: "initial",
                        optional2: 50
                    })
                }
            })

            $main.assemble(index($config.pack("initial"))).unpack()
        })

        it("should allow removing optional in reassemble", () => {
            const market = createMarket()

            const $config = market.offer("config").asResource<string>()
            const $optional = market.offer("optional").asResource<number>()

            const $service = market.offer("service").asProduct({
                suppliers: [$config],
                optionals: [$optional],
                factory: ({ config, optional }) => ({
                    config,
                    optional: optional ?? 0
                })
            })

            const $main = market.offer("main").asProduct({
                suppliers: [$service],
                factory: ({ service }, ctx) => {
                    const initial = service
                    expect(initial).toEqual({
                        config: "test",
                        optional: 42
                    })

                    const reassembled = ctx($service)
                        .assemble({ [$optional.name]: undefined })
                        .unpack()
                    expect(reassembled).toEqual({
                        config: "test",
                        optional: 0
                    })
                }
            })

            $main
                .assemble(index($config.pack("test"), $optional.pack(42)))
                .unpack()
        })
    })

    describe("Optionals with .hire() Method", () => {
        it("should handle optionals when using .hire() for batch assembly", () => {
            const market = createMarket()
            const $optional1 = market.offer("optional1").asResource<string>()
            const $optional2 = market.offer("optional2").asResource<string>()

            const $service1 = market.offer("service1").asProduct({
                optionals: [$optional1],
                factory: ({ optional1 }) => {
                    return `S1: ${optional1 ?? "none"}`
                }
            })

            const $service2 = market.offer("service2").asProduct({
                optionals: [$optional2],
                factory: ({ optional2 }) => {
                    return `S2: ${optional2 ?? "none"}`
                }
            })

            const batchProduct = $service1
                .hire($service2)
                .assemble(index($optional1.pack("test")))

            expect(batchProduct.unpack()).toBe("S1: test")
            expect(batchProduct.deps[$service2.name]).toBe("S2: none")
        })
    })

    describe("Edge Cases and Error Handling", () => {
        it("should handle empty optionals array", () => {
            const market = createMarket()
            const $config = market.offer("config").asResource<string>()

            const $product = market.offer("product").asProduct({
                suppliers: [$config],
                optionals: [],
                factory: ({ config }) => config
            })

            const result = $product
                .assemble(index($config.pack("test")))
                .unpack()
            expect(result).toBe("test")
        })

        it("should handle product with only optionals (no required suppliers)", () => {
            const market = createMarket()
            const $optional1 = market.offer("optional1").asResource<string>()
            const $optional2 = market.offer("optional2").asResource<number>()

            const $product = market.offer("product").asProduct({
                optionals: [$optional1, $optional2],
                factory: ({ optional1, optional2 }) => {
                    return {
                        opt1: optional1,
                        opt2: optional2
                    }
                }
            })

            // Should work with no supplies at all
            const result1 = $product.assemble({}).unpack()
            expect(result1).toEqual({
                opt1: undefined,
                opt2: undefined
            })

            // Should work with some optionals
            const result2 = $product
                .assemble(index($optional1.pack("hello")))
                .unpack()
            expect(result2).toEqual({
                opt1: "hello",
                opt2: undefined
            })

            // Should work with all optionals
            const result3 = $product
                .assemble(index($optional1.pack("hello"), $optional2.pack(42)))
                .unpack()
            expect(result3).toEqual({
                opt1: "hello",
                opt2: 42
            })
        })

        it("should handle same resource in both suppliers and optionals gracefully", () => {
            const market = createMarket()
            const $resource = market.offer("resource").asResource<string>()

            const $product = market.offer("product").asProduct({
                suppliers: [$resource],
                optionals: [$resource],
                factory: ({ resource }) => resource
            })

            // @ts-expect-error - Required supplier takes precedence over optional
            const fail = $product.assemble({})
            const result = $product
                .assemble(index($resource.pack("test")))
                .unpack()
            expect(result).toBe("test")
        })

        it("should handle init function with optionals", () => {
            const market = createMarket()
            const $optional = market.offer("optional").asResource<number>()
            let optStore: number | undefined = undefined

            const $product = market.offer("product").asProduct({
                optionals: [$optional],
                factory: ({ optional }) => {
                    return optional ?? 10
                },
                init: (value, { optional }) => {
                    optStore = optional
                }
            })

            const result1 = $product.assemble({}).unpack()
            expect(result1).toBe(10)
            expect(optStore).toEqual(undefined)

            const result2 = $product.assemble(index($optional.pack(5))).unpack()
            expect(result2).toBe(5)
            expect(optStore).toEqual(5)
        })
    })

    describe("Real-World Use Cases", () => {
        it("Feature flag example", () => {
            const market = createMarket()
            const $featureFlag = market
                .offer("featureFlag")
                .asResource<boolean>()

            const $resource = market.offer("resource").asResource<string>()

            const $optionalFeature = market.offer("optionalFeature").asProduct({
                suppliers: [$resource],
                factory: ({ resource }) => {
                    return resource
                }
            })

            const $main = market.offer("main").asProduct({
                optionals: [$featureFlag, $resource],
                assemblers: [$optionalFeature],
                factory: ({ featureFlag, resource }, ctx) => {
                    const enabled = featureFlag

                    if (enabled) {
                        // Assemble the optional feature with the optional context
                        const feature = ctx($optionalFeature)
                            .assemble(index($resource.pack("ctx")))
                            .unpack()
                        return feature
                    }

                    return undefined
                }
            })

            // Without optional context
            const $result1 = $main.assemble(index($featureFlag.pack(true)))
            expect($result1.unpack()).toEqual("ctx")

            // With optional context
            const $result2 = $main.assemble(index())
            expect($result2.unpack()).toEqual(undefined)
        })

        it("should support optional authentication/authorization context", () => {
            const market = createMarket()

            const $publicData = market.offer("publicData").asResource<{
                title: string
            }>()

            const $userAuth = market.offer("userAuth").asResource<{
                userId: string
                token: string
            }>()

            const $api = market.offer("api").asProduct({
                suppliers: [$publicData],
                optionals: [$userAuth],
                factory: ({ publicData, userAuth }) => {
                    const data = publicData
                    const auth = userAuth

                    return {
                        getPublic: () => data.title,
                        getPrivate: () => {
                            if (!auth) {
                                throw new Error("Not authenticated")
                            }
                            return `${data.title} - User: ${auth.userId}`
                        }
                    }
                }
            })

            // Public access
            const $publicApi = $api.assemble(
                index($publicData.pack({ title: "Hello World" }))
            )
            expect($publicApi.unpack().getPublic()).toBe("Hello World")
            expect(() => $publicApi.unpack().getPrivate()).toThrow(
                "Not authenticated"
            )

            // Authenticated access
            const $authApi = $api.assemble(
                index(
                    $publicData.pack({ title: "Hello World" }),
                    $userAuth.pack({ userId: "user123", token: "abc" })
                )
            )
            expect($authApi.unpack().getPublic()).toBe("Hello World")
            expect($authApi.unpack().getPrivate()).toBe(
                "Hello World - User: user123"
            )
        })

        it("should support optional caching/performance optimization context", () => {
            const market = createMarket()

            const $config = market.offer("config").asResource<{
                apiUrl: string
            }>()

            const $cache = market.offer("cache").asResource<Map<string, any>>()

            const $dataService = market.offer("dataService").asProduct({
                suppliers: [$config],
                optionals: [$cache],
                factory: ({ config, cache }) => {
                    return {
                        fetch: (key: string) => {
                            if (cache?.has(key)) {
                                return { data: cache.get(key), cached: true }
                            }
                            const data = `data-from-${config.apiUrl}-${key}`
                            cache?.set(key, data)
                            return { data, cached: false }
                        }
                    }
                }
            })

            // Without cache
            const $service1 = $dataService.assemble(
                index($config.pack({ apiUrl: "api.example.com" }))
            )
            expect($service1.unpack().fetch("user")).toEqual({
                data: "data-from-api.example.com-user",
                cached: false
            })

            // With cache
            const cache = new Map<string, any>()
            const $service2 = $dataService.assemble(
                index(
                    $config.pack({ apiUrl: "api.example.com" }),
                    $cache.pack(cache)
                )
            )
            expect($service2.unpack().fetch("user")).toEqual({
                data: "data-from-api.example.com-user",
                cached: false
            })
            expect($service2.unpack().fetch("user")).toEqual({
                data: "data-from-api.example.com-user",
                cached: true
            })
        })
    })
})
