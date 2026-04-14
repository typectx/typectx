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

typectx is designed for optimal performance, featuring a minimal bundle size, upfront service preparation, automatic lifecycle management, and eager/lazy execution controls.

## Bundle Size & Footprint

- **~5KB minified, ~2KB minzipped**: Hyper-minimalistic bundle size. Most of the package is type definitions.
- **Zero dependencies**: Adds no external runtime dependencies to your project.
- **Tree-shakable and code-splittable architecture**: Helps you create hyper-specialized services: One function or piece of data per service.

## Factory Lifecycle & Memoization

**Important**: Your factory function will be called a maximum of **one time per `assemble()` call**. If the service do not depend on request data, its factory will ever run once at server boot time and be cached for the remainder of the server's up time.

- **Need something called multiple times, or run side-effects?** Return a function from your factory instead of a value

```typescript
// ✅ Good: Factory called once, returns a function for multiple calls
const $createUser = service("createUser").app({
    services: [$db],
    factory: ({ db }) => {
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

### Automatic lifecycle management

Services that do not not depend on request data are cached across requests. Otherwise, they are rebuilt on every request, or on nested request data changes.

In other words:

- Request-free app services behave like long-lived cached singletons.
- App services with request dependencies behave like transient per-request scoped values.
- Nested `ctx(...).assemble(...)` calls only rebuild the services that the new request data invalidates.

```typescript
const $session = service("session").request<{ userId: string }>()

const $db = service("db").app({
    factory: () => connectDb()
})

const $currentUser = service("currentUser").app({
    services: [$db, $session],
    factory: ({ db, session }) => db.findUser(session.userId)
})

const $dashboard = service("dashboard").app({
    services: [$db, $currentUser],
    factory: ({ db, currentUser }) => {
        return {
            user: currentUser,
            notifications: db.getNotifications(currentUser.id)
        }
    }
})

export async function handleRequest(req: Request) {
    const session = await readSession(req)

    return $dashboard.assemble(index($session.pack(session))).unpack()
}

// On each request, only the request-scoped branch is rebuilt:
// - `db` can be preserved because it is request-free.
// - `currentUser` is rebuilt because it depends on `session`.
// - `dashboard` is rebuilt because it depends on `currentUser`.
```

### Eager loading by default

By default, all products are constructed in parallel and cached as soon as `.assemble()` is called. This is the best strategy for optimal performance in most cases, especially in the presence of async factories.

```typescript
// Both of these services will be constructed immediately and in parallel
const $dbPromise = service("dbPromise").app({
    // Async factories are possible
    factory: async () => await db.connect()
})
const $cache = service("cache").app({
    factory: () => new Map()
})

const $app = service("app").app({
    services: [$dbPromise, $cache],
    factory: async ({ dbPromise, cache }) => {
        if (cache.get("greeting")) {
            return cache.get("greeting")
        }
        const db = await dbPromise
        const greeting = db.getGreeting()
        cache.set("greeting", greeting)
        return greeting
    }
})

const appSupply = $app.assemble({}) // Starts constructing both dbPromise and cache in parallel
```

### Lazy Loading with `lazy: true`

For expensive services that are only used in certain situations (e.g., an admin panel service or a PDF export tool), you can enable lazy loading by setting `lazy: true`. The product will only be constructed the first time its value is accessed via `unpack()`.

```typescript
const $lazy = service("lazy").app({
    services: [$db],
    // Will only be loaded when `deps.lazy` is called in another factory,
    // or when `$lazy.assemble({...}).unpack()` is called directly.
    factory: ({ db }) => new ExpensiveService(db),
    lazy: true
})
```

## Initialization with `init()`

For products that need to perform side-effects upon creation (like connecting to a database or logging), you can use `init`. It runs immediately after the `factory` function returns, and receives the constructed product and deps as arguments.

This is useful for pre-warming caches or running setup logic without cluttering your factory.

For example, you can eagerly warm a memoized function:

```typescript
const $profile = service("profile").app({
    services: [$currentUser],
    factory: () => memo((userId) => db.profiles.get(userId)),
    init: (getProfile, { currentUser }) => {
        // Pre-warm the current user's profile in the memoization cache.
        getProfile(currentUser)
    }
})
```
