---
title: "Basic Usage Guide"
description: "Learn the basic usage of typectx, a type-safe dependency injection library for TypeScript. Understand markets, request suppliers, products, and the assembly process."
keywords:
    - basic usage
    - guide
    - tutorial
    - typescript
    - dependency injection
    - typectx
    - market
    - ctx
    - product
    - assemble
---

# Basic Usage

This guide covers the fundamental concepts of typectx in detail, providing you with everything you need to build applications with context containers.

## Understanding the Supply Chain Metaphor

typectx uses a supply chain metaphor to make context injection intuitive. Instead of abstract containers and providers, you work with:

- **Markets** - Namespaces where suppliers are defined
- **Suppliers** - Entities that provide either request data or products
- **Request data** - Simple data (sessions, request params, etc.) that cannot be derived from other suppliers and provide "context" for other product suppliers.
- **Products** - Complex services built from request data or other product suppliers
- **Assembly** - The process of building products with their dependencies

Think of it like a real supply chain: raw materials (request data and simple products) are transformed by factories into increasingly complex products, all orchestrated in a marketplace.

## Step 1: Creating a Market

Every typectx application starts with a market. A market is a namespace that ensures all your suppliers have unique names and provides the foundation for type-safe dependency resolution.

```typescript
import { createMarket } from "typectx"

const market = createMarket()
```

**Key Points:**

- You typically create one market per application
- Markets prevent name conflicts by maintaining a registry
- The name registry is the only state a market manages
- Markets are lightweight and have minimal overhead

## Step 2: Defining Request suppliers

Request suppliers are the simplest form of suppliers. Just specify the type of the piece of data from the user's request you need to propagate through your code.

### Creating a Request Supplier

```typescript
const $session = market.add("session").request<{
    userId: string
    timestamp: number
}>()
```

The `$` prefix is a convention (not required) to distinguish supplier definitions from actual values.

Names given to market.add("") can **only** contain digits, letters, underscores or `$` signs and cannot start with a digit, just like any Javascript identifier. This way, they can be destructured easily to js variables once injected.

### Packing Request suppliers with Values

Request suppliers are defined separately from their values. At runtime, you "pack" a request supplier with a concrete value:

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

Request suppliers aren't limited to objects. They can hold any TypeScript type:

```typescript
// Simple types
const $apiKey = market.add("apiKey").request<string>()
const $port = market.add("port").request<number>()
const $isProduction = market.add("isProduction").request<boolean>()

// Complex types
const $database = market.add("database").request<Database>()

// Even functions (but usually, you'll use product suppliers in that case)
const $logger = market.add("logger").request<{
    log: (message: string) => void
    error: (error: Error) => void
}>()
```

## Step 3: Defining Products suppliers

Product suppliers are where the real power of typectx shines. Products are factory functions that can depend on other suppliers (both request and other product suppliers) to create services, components, or any complex functionality.

### Basic Product Definition

```typescript
const $userService = market.add("userService").product({
    suppliers: [$config, $database],
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
of the deps object are the names of the supplier passed to market.add() at definition time.

```typescript
suppliers: [$config, $database]
factory: (deps) => {
    // Because we did market.add("config") when defining the $config variable above
    const config = deps.config
    // You can do this, but it produces less boilerplate to just destructure deps directly
    // See previous example just above
    const database = deps.database

    // Return whatever your product produces
    return myService
}
```

### Trivial products

Product suppliers don't need to depend on other suppliers! If you have a value available at module-scope in your code, you can load it in your supply chain with a trivial product supplier:
```typescript
const db = dbConnect(/*...*/)
const $db = market.add("db").product({
    factory: ()=>db
})
```

### Products Depending on Other Products

Products can depend not only on request data, but also on other products, creating a dependency tree:

```typescript
// Depends on a simple piece of request data
const $session = market.add("session").product({
    suppliers: [$token],
    factory: ({ token }) => {
        // Authentication logic
        return { userId: "123", token }
    }
})

// Depends on the session complex product, on the db trivial product, and on the page request data
const $userProfile = market.add("userProfile").product({
    suppliers: [$session, $database, $page],
    factory: ({ session, db, page }) => {
        const user = db.getUser(session.userId)
        if (page === 1) {
            return {
               name: user.name,
               avatar: user.avatar,
               //...
           }
        }

        if (page === 2) {
            return {
               address: user.address,
               email: user.email,
               //...
           }
        }
    }
})
```

## Step 4: The Factory Lifecycle

Understanding how and when factories are called is crucial for effective use of typectx.

### One Factory Call Per Assembly

**Important:** Your factory function is called exactly **once per `assemble()` call**. This eliminates the need to explicitely configure traditional DI service lifecycles (transient, scoped, singleton).

```typescript
const $service = market.add("service").product({
    suppliers: [],
    factory: () => {
        console.log("Factory called!")
        return { value: Math.random() }
    }
})

const $service1 = $service.assemble({})
console.log($service1.unpack()) // Factory called! { value: 0.123 }

const $service2 = $service.assemble({})
console.log($service2.unpack()) // Factory called! { value: 0.456 }

// But within the same assembly:
const service3Supply = $service.assemble({})
const value1 = service3Supply.unpack() // Factory called! { value: 0.789 }
const value2 = service3Supply.unpack() // { value: 0.789 } (same instance, no new call)
```

### Returning Functions for Multiple Calls

If you need something that can be called multiple times or needs to run side-effects, return a function from your factory:

```typescript
const $userRepository = market.offer("userRepository").asProduct({
    suppliers: [$db],
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

### Products Can Return Anything

Factories can return any TypeScript value, even Promises, so nothing special is required to handle async code.

```typescript
// Return objects
const $api = market.add("api").product({
    factory: () => ({ get: () => {}, post: () => {} })
})

// Return functions
const $handler = market.add("handler").product({
    factory: () => (request: Request) => new Response()
})

// Return promises
const $asyncData = market.add("asyncData").product({
    factory: async () => {
        const data = await fetch("...")
        return data.json()
    }
})

// Return React components
const $Header = market.add("Header").product({
    factory: () => () => <header>My App</header>
})
```

## Step 5: Assembly at the Entry Point

Assembly is where everything comes together. At your application's entry point, you assemble your main product by providing the required request data. 

### Basic Assembly

```typescript
const app = $app
    .assemble({
        [$locale.name]: $locale.pack("en"),
        [$session.name]: $session.pack({ userId: "user-123" })
    })
    .unpack()
```

This syntax works, but it's verbose. That's why typectx provides the `index()` utility.

### Using the `index()` Helper

The `index()` function simplifies assembly by converting an array of packed resources into the object format `assemble()` expects:

```typescript
import { index } from "typectx"

const app = $app
    .assemble(index($locale.pack("en"), $session.pack({ userId: "user-123" })))
    .unpack()
```

The `index()` function automatically maps each resource to its supplier name.

### Type Safety in Assembly

TypeScript will enforce that you provide all required request data:

```typescript
const $service = market.add("service").product({
    suppliers: [$locale, $session],
    factory: () => ({
        /* ... */
    })
})

// ❌ Type error: Missing required request data
$service.assemble({})

// ❌ Type error: Missing $session
$service.assemble(index($locale.pack("en")))

// ✅ All required resources provided
$service.assemble(index($locale.pack("en"), $session.pack({userId: "user-123"})))
```

### You Only Supply Request Data

Notice that you only provide request data during assembly, not products. Products are automatically "auto-wired" - they assemble themselves by recursively resolving their dependencies.

```typescript
const $session = market.add("session").request<Session>()

const $db = market.add("db").product({factory: () => dbConnect(/*...*/)})

const $userService = market.add("userService").product({
    suppliers: [$db, $session],
    factory: ({ db, session }) => ({
        /* ... */
    })
})

const $app = market.add("app").product({
    suppliers: [$userService],
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

## Performance: Eager vs Lazy Loading

By default, typectx eagerly constructs all products in the background and in parallel when you call `assemble()`. This eliminates waterfall loading issues common in traditional DI systems.

### Eager Loading (Default)

```typescript
const $eagerService = market.add("eagerService").product({
    suppliers: [$db],
    factory: ({ db }) => {
        console.log("Eager service factory called")
        return buildService(db)
    }
    // lazy: false is the default
})

const appSupply = $app.assemble(index($database.pack(db)))
// "Eager service factory called" - happens immediately without .unpack()
```

### Lazy Loading

For expensive products that might not always be needed, use lazy loading:

```typescript
const $expensiveService = market.add("expensiveService").product({
    suppliers: [$db],
    factory: ({ db }) => {
        console.log("Expensive service factory called")
        return buildExpensiveService(db)
    },
    lazy: true // Only construct when first accessed
})

const $app = market.add("app").product({
    suppliers: [$expensiveService],
    factory: (deps) => {
        // Factory not called yet

        return (useExpensive: boolean) => {
            if (useExpensive) {
                // NOW the factory is called
                // deps is an object of js getters, so accessing the
                // expensiveService prop is what triggers the factory.
                // Thus if you need lazy loading, do not destructure deps
                // in the factory args!
                return deps.expensiveService.doWork()
            }
            return "Skipped expensive work"
        }
    }
})
```

**When to use lazy loading:**

- The product is expensive to construct
- The product might not be needed in every execution path
- You want to defer initialization until actual use

**When to use eager loading (default):**

- The product will likely be needed
- You want to parallelize construction

## Practical Example: Building a Blog API

Let's put everything together with a realistic example:

```typescript
import { createMarket, index } from "typectx"

// 1. Create the market
const market = createMarket()

// 2. Define request suppliers
const $req = market.add("req").request<Request>()
const $config = market.add("config").request<{
    postsPerPage: number
    cacheEnabled: boolean
}>()
const $user = market.add("user").request<{
    id: string
    role: "admin" | "user"
}>()

// 3. Define products (services)
const $db = market.add("db").product({factory: () => dbConnect(/*...*/)})
const $postsRepository = market.add("postsRepository").product({
    suppliers: [$db],
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

const $authorizationService = market.add("authorizationService").product({
    suppliers: [$user],
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

const $postsService = market.add("postsService").product({
    suppliers: [$postsRepository, $authorizationService, $config],
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
const $apiHandler = market.add("apiHandler").product({
    suppliers: [$postsService, $req],
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
        .assemble(index($req.pack(request), $user.pack(user), $config.pack(config)))
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

- **[Testing and Mocking](testing)** - Learn how to test your products with mocks
- **[Performance Optimization](performance)** - Advanced lazy loading and initialization strategies
- **[Design Philosophy](design-philosophy)** - Understanding the principles behind typectx

For more advanced context propagation patterns:

- **[Optionals](optionals)** - Handle dependencies that may or may not be present
- **[Assemblers](assemblers)** - For Just-in-time product assembly.
