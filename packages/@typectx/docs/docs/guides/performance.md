---
title: "Performance Optimization"
description: "Learn about performance in typectx, including its small bundle size, memoization, and eager vs. lazy loading strategies for optimal TypeScript dependency injection."
keywords:
    - performance
    - optimization
    - bundle size
    - lazy loading
    - eager loading
    - memoization
    - typescript
    - dependency injection
    - typectx
---

# Performance

typectx is designed for optimal performance, featuring a minimal bundle size, smart memory management, and powerful preloading strategies.

## Bundle Size & Footprint

- **~5KB minified, ~2KB minzipped**: Hyper-minimalistic bundle size. Most of the package is type definitions.
- **Zero dependencies**: Adds no external runtime dependencies to your project.
- **Tree-shakable and code-splittable architecture**: Helps you create hyper-specialized suppliers: One function or piece of data per supplier.

## Factory Lifecycle & Memoization

**Important**: Your factory function will only ever be called **once per `assemble()` call**. This eliminates the need for traditional DI service lifecycles (transient, scoped, singleton, etc.).

- **Need something called multiple times, or run side-effects?** Return a function from your factory instead of a value

```typescript
// ✅ Good: Factory called once, returns a function for multiple calls
const $createUser = market.add("createUser").product({
    suppliers: [$db],
    factory: ({ db }) => {
        // This setup code runs only once per assemble()
        const cache = new Map()

        // Return a function that can be called multiple times
        return (userId: string) => {
            if (cache.has(userId)) return cache.get(userId)
            const user = db.findUser(userId)
            cache.set(userId, user)
            return user
        }
    }
})

// Usage: createUserService() can be called multiple times
const createUser = $createUser.assemble(index($db.pack(db))).unpack()
const user1 = createUser("123") // Fresh call
const user2 = createUser("123") // Cached result
```

## Factories run in parallel

### Eager loading by default

By default, all products are constructed in parallel and cached as soon as `.assemble()` is called. This is the best strategy for optimal performance in most cases, especially in the presence of async factories.

```typescript
// Both of these services will be constructed immediately and in parallel
const $dbPromise = market.add("dbPromise").product({
    // Async factories are possible
    factory: async () => await db.connect()
})
const $cache = market.add("cache").product({
    factory: () => new Map()
})

const $app = market.add("app").product({
    suppliers: [$db, $cache],
    factory: async ({dbPromise, cache}) => {
        if (cache.get("greeting")) {
            return cache.get("greeting")
        }
        const db = await dbPromise
        const greeting = db.getGreeting()
        cache.set("greeting", greeting)
    }
})

const appSupply = $app.assemble({}) // Starts constructing both $db and $cache at once in parallel
```

### Lazy Loading with `lazy: true`

For expensive services that are only used in certain situations (e.g., an admin panel service or a PDF export tool), you can enable lazy loading by setting `lazy: true`. The product will only be constructed the first time its value is accessed via `unpack()`.

```typescript
const $lazy = market.add("lazy").product({
    suppliers: [$db],
    // Will only be loaded when `deps.lazy` is called in another factory,
    // or when `$lazy.assemble({...}).unpack()` is called directly.
    factory: ({db}) => new ExpensiveService(db).unpack()),
    lazy: true
})
```

## Initialization with `init()`

For products that need to perform side-effects upon creation (like connecting to a database or logging), you can use the `init` function. It runs immediately after the `factory` function returns, and receives the constructed value and the deps as its 2 first arguments

This is useful for pre-warming caches or running setup logic without cluttering your factory.

For example, you can easily implement the preload pattern:

```typescript
const $profile = market.add("profile").product({
    suppliers: [$currentUser]
    factory: () => memo((userId) => db.profiles.get(userId))
    init: (getProfile, {currentUser}) => {
        // Allows to preload the current logged in user's profile.
        // the memoization cache will be prepopulated with the current user's profile if requested later.
        getProfile(currentUser)
    }
})
```
