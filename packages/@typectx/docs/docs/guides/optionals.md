---
title: "Optional Dependencies"
description: "Learn how to use optional dependencies in typectx. Handle resources that may not always be present, such as feature flags or authentication contexts, with type safety."
keywords:
    - optionals
    - optional dependencies
    - dependency injection
    - typescript
    - typectx
    - feature flags
    - authentication
---

# Optionals

Optionals are resource suppliers that a product _may_ depend on, but doesn't _require_ to function. When you declare a resource supplier in the `optionals` array instead of the `suppliers` array, you're telling typectx that:

1. The product can be assembled without providing this resource
2. The resource will be `undefined` if not provided
3. TypeScript will enforce proper undefined checks when accessing the optional

This is particularly useful for feature flags, authentication contexts, caching layers, or any dependency that might not always be present.

## Basic Usage

Here's a simple example of using an optional resource:

```typescript
import { createMarket, index } from "typectx"

const market = createMarket()

// Define an optional configuration resource
const $apiKey = market.offer("apiKey").asResource<string>()

// Use it as an optional dependency
const $apiClient = market.offer("apiClient").asProduct({
    optionals: [$apiKey],
    // apiKey will be typed string | undefined
    factory: ({ apiKey }) => {
        const apiKey = $($$apiKey)?.unpack()

        return {
            makeRequest: async (endpoint: string) => {
                const headers: Record<string, string> = {
                    "Content-Type": "application/json"
                }

                // Use the API key if it's provided
                if (apiKey) {
                    headers["Authorization"] = `Bearer ${apiKey}`
                }

                return fetch(endpoint, { headers })
            }
        }
    }
})

// Assemble without the optional - works fine!
const client = $apiClient.assemble({}).unpack()

// Or provide it when available
const authenticatedClient = $apiClient
    .assemble(index($$apiKey.pack("secret-api-key-123")))
    .unpack()
```

## Use case: Optional Authentication

Create services that work differently for authenticated vs. anonymous users:

```typescript
const market = createMarket()

const $userAuth = market.offer("userAuth").asResource<{
    userId: string
    token: string
}>()

const $api = market.offer("api").asProduct({
    optionals: [$userAuth],
    factory: ({ userAuth }) => {
        return {
            getPublicData: () => fetch("/api/public"),
            getPrivateData: () => {
                if (!auth) {
                    throw new Error("Authentication required")
                }
                return fetch("/api/private", {
                    headers: { Authorization: `Bearer ${auth.token}` }
                })
            }
        }
    }
})

// Public access
const publicApi = $api.assemble({}).unpack()

// Authenticated access
const authApi = $api
    .assemble(index($userAuth.pack({ userId: "123", token: "xyz" })))
    .unpack()
```
