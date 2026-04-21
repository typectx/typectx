---
title: "Basic Usage Guide"
description: "Learn the basic usage of typectx, a type-safe dependency injection library for TypeScript. Understand request services, app services, and the assembly process."
keywords:
    - basic usage
    - guide
    - tutorial
    - typescript
    - dependency injection
    - typectx
    - request
    - ctx
    - app
    - product
    - assemble
---

# Basic Usage

This guide covers the fundamental concepts of typectx in detail, providing you with everything you need to build applications with context containers.

## Understanding the Supply Chain Metaphor

typectx uses a supply chain metaphor to make context injection intuitive. Instead of abstract containers and providers, you work with:

- **Services** - Entities that provide either request data or factory-built products for other services.
- **Request data (inputs)** - Simple data (sessions, request params, etc.) that cannot be derived from other services and provide "context" for other app services.
- **Products** - Complex values built from request data or other products using an app service's factory
- **Assembly** - The process of building products with their dependencies

Think of it like a real supply chain: raw materials (request data and simple products) are transformed by factories into increasingly complex products.

## Step 1: Import flat APIs

Every typectx application starts by declaring services directly with `service(name).request()` and `service(name).app(config)`.

```typescript
import { service } from "typectx"
```

## Step 2: Defining Request services

Request services are the simplest form of services. Just specify the type of the piece of data from the user's request you need to propagate through your code.

### Creating a Request Service

```typescript
const $session = service("session").request<{
    userId: string
    timestamp: number
}>()
```

The `$` prefix is a convention (not required) to distinguish service definitions from actual values.

Names passed to `service("...")` can **only** contain digits, letters, underscores or `$` signs and cannot start with a digit, just like any Javascript identifier.

### Packing Request services with Values

Request services are defined separately from their values. At request time, you "pack" a request service with a concrete value:

```typescript
const configSupply = $config.pack({
    apiUrl: "https://api.example.com",
    timeout: 5000
})
```

### Unpacking Request Values

To access the value inside a request supply:

```typescript
const config = configSupply.unpack()
console.log(config.apiUrl) // "https://api.example.com"
```

### Request Supplies Can Hold Any Type

Request services aren't limited to objects. They can hold any TypeScript type:

```typescript
// Simple types
const $apiKey = service("apiKey").request<string>()
const $port = service("port").request<number>()
const $isProduction = service("isProduction").request<boolean>()

// Complex types
const $database = service("database").request<Database>()

// Even functions (but usually, you'll use app services in that case)
const $logger = service("logger").request<{
    log: (message: string) => void
    error: (error: Error) => void
}>()
```

## Step 3: Defining App services

App services are where the real power of typectx shines. App services define factory functions that can depend on other services (both request and other app services) to create values, products, components, or any complex functionality.

### Basic App Service Definition

```typescript
const $userService = service("userService").app({
    services: [$config, $database],
    factory: ({ config, database }) => {
        return {
            getUser: (id: string) => {
                return db.query(`${config.apiUrl}/users/${id}`)
            }
        }
    }
})
```

### Understanding the Factory Function

The factory function receives a special `deps` argument that provides access to all declared dependencies via destructuring. The properties
of the deps object are the names passed to `service("...")` at definition time.

```typescript
services: [$config, $database]
factory: (deps) => {
    // Because we did service("config") when defining the $config variable above
    const config = deps.config
    // You can do this, but it produces less boilerplate to just destructure deps directly
    // See previous example just above
    const database = deps.database

    // Return whatever your product produces
    return myService
}
```

### Trivial app services

App services don't need to depend on other services! If you have a value available at module-scope in your code, you can load it in your supply chain with a trivial app service:

```typescript
const db = dbConnect(/*...*/)
const $db = service("db").app({
    factory: () => db
})
```

### App services Depending on Other Services

App services can depend not only on request data, but also on other app services, creating a dependency tree:

```typescript
// Depends on a simple piece of request data
const $session = service("session").app({
    services: [$token],
    factory: ({ token }) => {
        // Authentication logic
        return { userId: "123", token }
    }
})

// Depends on the "session" complex product, on the "db" trivial product, and on the "page" request data
const $userProfile = service("userProfile").app({
    services: [$session, $database, $page],
    factory: ({ session, db, page }) => {
        const user = db.getUser(session.userId)
        if (page === 1) {
            return {
                name: user.name,
                avatar: user.avatar
                //...
            }
        }

        if (page === 2) {
            return {
                address: user.address,
                email: user.email
                //...
            }
        }
    }
})
```

## Step 4: The Factory Lifecycle

Understanding how and when factories are called is crucial for effective use of typectx.

### Service Preparation Happens Up Front

When you declare an app service with `service(name).app(...)`, typectx prepares its dependency graph immediately.

That preparation step validates the graph and builds a reusable assembly blueprint, but it does **not** execute your `factory` or `init` yet. Those only run later, when that service instance is actually needed in an `assemble()` call.

### One Factory Call Per Constructed Instance

**Important:** Your factory function is called at most **once per constructed service instance**.

typectx manages those instances automatically:

- Request-free app services can be preserved across multiple assemblies.
- Request-bound app services are rebuilt when their request data changes.
- Nested `ctx(...).assemble(...)` calls preserve unaffected services and only rebuild invalidated branches.

This removes the need to manually configure transient/scoped/singleton lifecycles.

```typescript
const $service = service("service").app({
    services: [],
    factory: () => {
        console.log("Factory called!")
        return { value: Math.random() }
    }
})

const service1Supply = $service.assemble({})
console.log(service1Supply.unpack()) // Factory called! { value: 0.123 }

const service2Supply = $service.assemble({})
console.log(service2Supply.unpack()) // { value: 0.123 } (same instance can be preserved)

// Within the same assembly:
const value1 = service1Supply.unpack() // { value: 0.123 }
const value2 = service1Supply.unpack() // { value: 0.123 } (same instance, no new call)
```

If `$service` depended on request data, the factory would rebuild whenever that request-dependent part of the context changes.

### Returning Functions for Multiple Calls

If you need something that can be called multiple times or needs to run side-effects, return a function from your factory:

```typescript
const $userRepository = service("userRepository").app({
    services: [$db],
    factory: ({ db }) => {
        // Setup code runs once
        const cache = new Map()
        console.log("Repository initialized")

        // Return a function that can be called many times
        return {
            getUser: (id: string) => {
                if (cache.has(id)) {
                    console.log(`Cache hit for ${id}`)
                    return cache.get(id)
                }

                console.log(`Fetching user ${id}`)
                const user = db.findUser(id)
                cache.set(id, user)
                return user
            }
        }
    }
})

// Later in your code:
const repo = $userRepository.assemble(index($db.pack(db))).unpack()

repo.getUser("123") // Repository initialized, Fetching user 123
repo.getUser("456") // Fetching user 456
repo.getUser("123") // Cache hit for 123
```

### Factories Can Return Anything

Factories can return any TypeScript value, even Promises, so nothing special is required to handle async code.

```typescript
// Return objects
const $api = service("api").product({
    factory: () => ({ get: () => {}, post: () => {} })
})

// Return functions
const $handler = service("handler").product({
    factory: () => (request: Request) => new Response()
})

// Return promises
const $asyncData = service("asyncData").product({
    factory: async () => {
        const data = await fetch("...")
        return data.json()
    }
})

// Return React components
const $Header = service("Header").product({
    factory: () => () => <header>My App</header>
})
```

## Step 5: Assembly at the Entry Point

Assembly is where everything comes together. At your application's entry point, you assemble your main product by providing the required request data.

### Basic Assembly

```typescript
const main = $main
    .assemble({
        [$locale.name]: $locale.pack("en"),
        [$session.name]: $session.pack({ userId: "user-123" })
    })
    .unpack()
```

This syntax works, but it's verbose. That's why typectx provides the `index()` utility.

### Using the `index()` Helper

The `index()` function simplifies assembly by converting an array of packed supplies into the object format `assemble()` expects:

```typescript
import { index } from "typectx"

const app = $app
    .assemble(index($locale.pack("en"), $session.pack({ userId: "user-123" })))
    .unpack()
```

The `index()` function automatically maps each supply to its service name.

### Type Safety in Assembly

TypeScript will enforce that you provide all required request data:

```typescript
const $service = service("service").app({
    services: [$locale, $session],
    factory: () => ({
        /* ... */
    })
})

// ❌ Type error: Missing required request data
$service.assemble({})

// ❌ Type error: Missing $session
$service.assemble(index($locale.pack("en")))

// ✅ All required resources provided
$service.assemble(
    index($locale.pack("en"), $session.pack({ userId: "user-123" }))
)
```

### You Only Supply Request Data

Notice that you only provide request data during assembly, not factory products. Products are automatically "auto-wired" - they assemble themselves by recursively resolving their dependencies.

```typescript
const $session = service("session").request<Session>()

const $db = service("db").app({ factory: () => dbConnect(/*...*/) })

const $userService = service("userService").app({
    services: [$db, $session],
    factory: ({ db, session }) => ({
        /* ... */
    })
})

const $app = service("app").app({
    services: [$userService],
    factory: ({ userService }) => {
        return {
            /* ... */
        }
    }
})

// You only provide the $session
// $db and $userService are autowired automatically
const app = $app
    .assemble(index($db.pack(database), $session.pack(session)))
    .unpack()
```

## Performance: Eager, lazy, and warmed factories

See **[Performance Optimization](performance)** for examples of patterns to follow to create eager, lazy or warmed-up factories, useful to optimize your app's performance and avoid slowdowns due to waterfall loading..

## Practical Example: Building a Blog API

Let's put everything together with a realistic example:

```typescript
import { index, service } from "typectx"

// 2. Define request services
const $req = service("req").request<Request>()
const $config = service("config").request<{
    postsPerPage: number
    cacheEnabled: boolean
}>()
const $user = service("user").request<{
    id: string
    role: "admin" | "user"
}>()

// 3. Define app services
const $db = service("db").app({ factory: () => dbConnect(/*...*/) })
const $postsRepository = service("postsRepository").app({
    services: [$db],
    factory: ({ db }) => {
        return {
            findById: (id: string) => db.posts.findOne({ id }),
            findAll: (page: number, limit: number) =>
                db.posts
                    .find()
                    .skip(page * limit)
                    .limit(limit),
            create: (post: Post) => db.posts.insert(post),
            update: (id: string, post: Partial<Post>) =>
                db.posts.update({ id }, post),
            delete: (id: string) => db.posts.delete({ id })
        }
    }
})

const $authorizationService = service("authorizationService").app({
    services: [$user],
    factory: ({ user }) => {
        return {
            canCreate: () => user.role === "admin",
            canEdit: (post: Post) =>
                user.role === "admin" || post.authorId === user.id,
            canDelete: (post: Post) =>
                user.role === "admin" || post.authorId === user.id
        }
    }
})

const $postsService = service("postsService").app({
    services: [$postsRepository, $authorizationService, $config],
    factory: ({
        postsRepository: repo,
        authorizationService: auth,
        config
    }) => {
        return {
            getPosts: async (page: number = 0) => {
                return repo.findAll(page, config.postsPerPage)
            },

            getPost: async (id: string) => {
                return repo.findById(id)
            },

            createPost: async (post: Post) => {
                if (!auth.canCreate()) {
                    throw new Error("Unauthorized")
                }
                return repo.create(post)
            },

            updatePost: async (id: string, updates: Partial<Post>) => {
                const post = await repo.findById(id)
                if (!auth.canEdit(post)) {
                    throw new Error("Unauthorized")
                }
                return repo.update(id, updates)
            },

            deletePost: async (id: string) => {
                const post = await repo.findById(id)
                if (!auth.canDelete(post)) {
                    throw new Error("Unauthorized")
                }
                return repo.delete(id)
            }
        }
    }
})

// 4. Define the API handler
const $apiHandler = service("apiHandler").app({
    services: [$postsService, $req],
    factory: async ({ postsService: posts, req }) => {
        const url = new URL(req.url)
        const path = url.pathname

        if (path.startsWith("/posts")) {
            if (req.method === "GET") {
                const page = parseInt(url.searchParams.get("page") || "0")
                const data = await posts.getPosts(page)
                return Response.json(data)
            }

            if (req.method === "POST") {
                const post = await request.json()
                const created = await posts.createPost(post)
                return Response.json(created, { status: 201 })
            }
        }

        return new Response("Not Found", { status: 404 })
    }
})

// 5. Assembly at request time
export async function handleRequest(request: Request) {
    const user = await authenticateRequest(request)
    const config = {
        postsPerPage: 10,
        cacheEnabled: true
    }

    const response = await $apiHandler
        .assemble(
            index($req.pack(request), $user.pack(user), $config.pack(config))
        )
        .unpack()

    return response
}
```

Notice how:

- Each service has clear, single responsibilities
- Dependencies are explicit and type-safe
- Authorization logic is separated from data access
- The handler doesn't need to know about the db or config
- Different requests can have different users without any global state

## Next Steps

Now that you understand the basics, explore these advanced features:

- **[Testing and Mocking](testing)** - Learn how to test your app services with mocks
- **[Performance Optimization](performance)** - Eager, lazy, and warmed-up factory patterns
- **[Design Philosophy](design-philosophy)** - Understanding the principles behind typectx

For more advanced patterns:

- **[Optionals](optionals)** - Handle dependencies that may or may not be present
- **[Context Propagation](context-propagation)** - For just-in-time nested assembly with `ctx(...).assemble(...)`.
