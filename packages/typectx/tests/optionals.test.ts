import { describe, it, expect, assertType } from "vitest"
import { index, service } from "#index"

describe("Optionals Feature", () => {
    describe("Basic Optional Usage", () => {
        it("should allow defining optional request services in app service config", () => {
            const $optional = service("optional").request<string>()

            const $product = service("product").app({
                optionals: [$optional],
                factory: ({ optional }) => {
                    assertType<string | undefined>(optional)
                    return optional
                }
            })

            expect($product._optionals).toEqual([$optional])
            expect($product.assemble({}).unpack()).toEqual(undefined)
            expect(
                $product.assemble(index($optional.pack("test"))).unpack()
            ).toEqual("test")
            expect(
                // @ts-expect-error - invalid type
                $product.assemble(index($optional.pack(55))).unpack()
            ).toEqual(55)
        })

        it("should work when optional is NOT provided", () => {
            const $config = service("config").request<string>()
            const $optional = service("optional").request<number>()

            const $product = service("product").app({
                services: [$config],
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
            const $required = service("required").request<string>()
            const $opt1 = service("opt1").request<number>()
            const $opt2 = service("opt2").request<boolean>()
            const $opt3 = service("opt3").request<string>()

            const $product = service("product").app({
                services: [$required],
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
        it("should make optional supplies nullable in deps type", () => {
            const $required = service("required").request<string>()
            const $optional = service("optional").request<number>()

            const $product = service("product").app({
                services: [$required],
                optionals: [$optional],
                factory: ({ required, optional }) => {
                    // Required service should be non-nullable in deps type
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

        it("should require all required services in ToSupply", () => {
            const $required = service("required").request<string>()
            const $optional = service("optional").request<number>()

            const $product = service("product").app({
                services: [$required],
                optionals: [$optional],
                factory: ({ required, optional }) => {
                    assertType<string>(required)
                    assertType<number | undefined>(optional)
                    return "result"
                }
            })

            // @ts-expect-error - missing required service
            $product.assemble(index($optional.pack(42))).unpack()

            // Should work without optional
            $product.assemble(index($required.pack("test"))).unpack()
        })
    })

    describe("Request service in ctx wrapper", () => {
        it("should just return request service (noop)", () => {
            const $input = service("input").request<string>()
            const $contextual = service("contextual").app({
                factory: () => "assembled"
            })

            const $product = service("product").app({
                optionals: [$input],
                factory: (deps, ctx) => {
                    // Both should be in ctx
                    expect(ctx($input)).toBe($input)
                    expect(ctx($contextual).name).toBe($contextual.name)
                }
            })

            $product.assemble({}).unpack()
        })
    })

    describe("Optionals with Nested Dependencies", () => {
        it("should handle optionals in nested app service chains", () => {
            const $optionalConfig = service("optionalConfig").request<{
                apiKey: string
            }>()
            const $baseConfig = service("baseConfig").request<{
                url: string
            }>()

            const $api = service("api").app({
                services: [$baseConfig],
                optionals: [$optionalConfig],
                factory: ({ baseConfig, optionalConfig }) => {
                    return {
                        url: baseConfig.url,
                        apiKey: optionalConfig?.apiKey ?? "default-key"
                    }
                }
            })

            const $app = service("app").app({
                services: [$api],
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
            const $optional = service("optional").request<string>()

            const $child = service("child").app({
                optionals: [$optional],
                factory: ({ optional }) => {
                    return optional ?? "default"
                }
            })

            const $parent = service("parent").app({
                services: [$child],
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
            const $required = service("required").request<string>()
            const $optional1 = service("optional1").request<number>()
            const $optional2 = service("optional2").request<number>()

            const $base = service("base").app({
                services: [$required],
                optionals: [$optional1],
                factory: ({ required, optional1 }) => {
                    return {
                        required,
                        value: optional1 ?? 0
                    }
                }
            })

            const $mocked = $base.mock({
                services: [$required],
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
            const $config = service("config").request<string>()
            const $optional = service("optional").request<number>()

            const $dependency = service("dependency").app({
                services: [$config],
                optionals: [$optional],
                factory: ({ optional }) => {
                    const opt = optional
                    return opt ? opt * 2 : 0
                }
            })

            const $main = service("main").app({
                services: [$dependency],
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
            const $config = service("config").request<string>()
            const $optional1 = service("optional1").request<number>()
            const $optional2 = service("optional2").request<number>()

            const $service = service("service").app({
                services: [$config],
                optionals: [$optional1, $optional2],
                factory: ({ config, optional1, optional2 }) => {
                    return {
                        config: config,
                        ...(optional1 ? { optional1 } : {}),
                        ...(optional2 ? { optional2 } : {})
                    }
                }
            })

            const $main = service("main").app({
                services: [$service],
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
            const $config = service("config").request<string>()
            const $optional = service("optional").request<number>()

            const $service = service("service").app({
                services: [$config],
                optionals: [$optional],
                factory: ({ config, optional }) => ({
                    config,
                    optional: optional ?? 0
                })
            })

            const $main = service("main").app({
                services: [$service],
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
            const $optional1 = service("optional1").request<string>()
            const $optional2 = service("optional2").request<string>()

            const $service1 = service("service1").app({
                optionals: [$optional1],
                factory: ({ optional1 }) => {
                    return `S1: ${optional1 ?? "none"}`
                }
            })

            const $service2 = service("service2").app({
                optionals: [$optional2],
                factory: ({ optional2 }) => {
                    return `S2: ${optional2 ?? "none"}`
                }
            })

            const batchSupply = $service1
                .hire($service2)
                .assemble(index($optional1.pack("test")))

            expect(batchSupply.unpack()).toBe("S1: test")
            expect(batchSupply.deps[$service2.name]).toBe("S2: none")
        })
    })

    describe("Edge Cases and Error Handling", () => {
        it("should handle empty optionals array", () => {
            const $config = service("config").request<string>()

            const $product = service("product").app({
                services: [$config],
                optionals: [],
                factory: ({ config }) => config
            })

            const result = $product
                .assemble(index($config.pack("test")))
                .unpack()
            expect(result).toBe("test")
        })

        it("should handle app service with only optionals (no required services)", () => {
            const $optional1 = service("optional1").request<string>()
            const $optional2 = service("optional2").request<number>()

            const $product = service("product").app({
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

        it("should handle warmup function with optionals", () => {
            const $optional = service("optional").request<number>()
            let optStore: number | undefined = undefined

            const $product = service("product").app({
                optionals: [$optional],
                factory: ({ optional }) => {
                    return optional ?? 10
                },
                warmup: (product, { optional }) => {
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
            const $featureFlag = service("featureFlag").request<boolean>()

            const $session = service("session").request<string>()

            const $optionalFeature = service("optionalFeature").app({
                services: [$session],
                factory: ({ session }) => {
                    return session
                }
            })

            const $main = service("main").app({
                optionals: [$featureFlag],
                factory: ({ featureFlag }, ctx) => {
                    const enabled = featureFlag

                    if (enabled) {
                        // Assemble the optional feature with the optional context
                        const feature = ctx($optionalFeature)
                            .assemble(index($session.pack("userA")))
                            .unpack()
                        return feature
                    }

                    return undefined
                }
            })

            // Without optional context
            const $result1 = $main.assemble(index($featureFlag.pack(true)))
            expect($result1.unpack()).toEqual("userA")

            // With optional context
            const $result2 = $main.assemble(index())
            expect($result2.unpack()).toEqual(undefined)
        })

        it("should support optional authentication/authorization context", () => {
            const $publicData = service("publicData").request<{
                title: string
            }>()

            const $userAuth = service("userAuth").request<{
                userId: string
                token: string
            }>()

            const $api = service("api").app({
                services: [$publicData],
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
            const $config = service("config").request<{
                apiUrl: string
            }>()

            const $cache = service("cache").request<Map<string, unknown>>()

            const $dataService = service("dataService").app({
                services: [$config],
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
            const cache = new Map<string, unknown>()
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
