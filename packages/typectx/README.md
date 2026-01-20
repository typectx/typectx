# typectx

Fully type-inferred Context and DI container for Typescript! Dependency injection (DI) and context propagation without reflect-metadata, decorators, annotations or compiler magic, just simple functions!

## Why typectx?

- ✅ **Scalable architecture** - Promotes SOLID, clean, and code-splittable design patterns.
- ✅ **Fully type-inferred** - Compile-time dependency validation.
- ✅ **Minimal boilerplate** - Trade-off: a bit more runtime boilerplate for much less type boilerplate.
- ✅ **Framework agnostic** - Accommodates all codebases where TypeScript works
- ✅ **No magic** - Just functions and closures, no classes, reflect-metadata, decorators, annotations or compiler magic.
- ✅ **Testing friendly** - Easy mocking and dependency swapping
- ✅ **Performance focused** - Smart memoization, lazy loading, code-splittable architecture.
- ✅ **Stateless** - Dependencies resolved via closures, not global state.
- ✅ **A new DI paradigm** - Don't let your past experiences with DI prevent you from trying this one!
- ✅ **Intuitive, opinionated terminology** - The supply chain metaphor helps DI finally make intuitive sense.

## Installation

```bash
npm install typectx
```

## When to Use typectx

- **Complex TypeScript applications** with deep function call hierarchies
- **Avoiding prop-drilling and waterfalls** in React (works in both Client and Server Components)
    - Full alternative to React Context.
- **Microservices** that need shared context propagation
- **Testing scenarios** requiring easy mocking and dependency swapping
- **A/B testing**, feature flagging and prototyping.
- **Any project** wanting DI without the complexity of traditional containers

## Performance

- **Hyper-minimalistic bundle size**: ~5KB minified, ~2KB minzipped. Most of the package is type definitions.
- **Tree-shakable and code-splittable architecture**: Helps you create hyper-specialized suppliers: One function or piece of data per supplier
- **Memory usage**: Smart memoization prevents duplicate dependency resolution
- **Options to optimize dependency chain waterfalls**: Define suppliers as lazy or eager, call init() to preload some values as soon as possible.

## Quick Example

```ts
import { createMarket, index } from "typectx"

// 1. Create a market
const market = createMarket()

// 2. Define request and product suppliers
const $session = market.add("session").request<{ userId: string }>()
const $todosDb = market.add("todosDb").product({
    suppliers: [],
    factory: () => new Map<string, string[]>() // Simple in-memory DB
})
const $addTodo = market.add("addTodo").product({
    suppliers: [$session, $todosDb],
    factory:
        ({ session, todosDb }) =>
        (todo: string) => {
            const userTodos = todosDb.get(session.userId) || []
            todosDb.set(session.userId, [...userTodos, todo])
            return db.get(session.userId)
        }
})

const session = { userId: "user123" }

// 3. Assemble and use
const addTodo = $addTodo.assemble(index($session.pack(session))).unpack()

console.log(addTodo("Learn typectx")) // ["Learn typectx"]
console.log(addTodo("Build app")) // ["Learn typectx", "Build app"]
```

## Intuitive, opinionated terminology

typectx uses an intuitive supply chain metaphor to make dependency injection easier to understand. You create fully-decoupled, hyper-specialized **suppliers** that exchange **supplies** in a free-market fashion to assemble new, more complex products.

| Term                 | Classical DI Equivalent | Description       |
| -------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| **`createMarket()`** | `createContainer()`     | A namespace/scope for all your suppliers.                     |
| **Supplier**         |  Service                | Provides dependencies to other suppliers. Node in your dependency graph.    |
| **Request Supplier**|  Value Service           | Supplier for a value from the user's request (request params, cookies, etc.)  |
| **Product Supplier** |  Factory Service        | Supplier for a value derived from other product or request suppliers via a factory function                |
| **Supply or Pack**   |         Proxy           | Value wrapper for type-checking and transport across suppliers                                             |
| **Supplies**         | Container / Context     | The collection of resolved dependencies, but still within their supply or pack wrapper.                    |
| **`assemble()`**     | `resolve()`             | Gathers all required request supplies (product supplies are auto-wired) and injects them in product supplier factories.|
| **Deps**             | Values                  | The collection of resolved unpacked dependencies a factory receives                                        |

## Full features list

☀️ General

- Fully typesafe and type-inferred - Full TypeScript support with compile-time circular dependency detection.
- Fluent and expressive API - Learn in minutes, designed for both developers and AI usage.
- Fully framework-agnostic - Complements both back-end and front-end frameworks.

🔧 Dependency Injection

- Functions only - No classes, decorators, annotations, or compiler magic.
- Declarative, immutable, functionally pure.
- Stateless - Dependencies are resolved via closures, not state. Some memoized state is kept for validation and optimization purposes only.
- Auto-wired - All products are built by the Supply Chain and resolve their dependencies automatically.
- Maximal colocation - All product suppliers are registered right next to the factory that uses them, not at the entry point.

📦 Context Propagation

- Shared context - Assemble the context once at the entry point, access everywhere without prop-drilling.
- Smart memoization - Dependencies injected once per assemble() context for optimal performance.
- Context switching - Override context anywhere in the call stack by using assemblers.
- Context enrichment - Add new context and products deep in the call stack by using assemblers.

⚡ Waterfall Management

- Eager loading - Use lazy: false for immediate background construction of all supplies in parallel in assemble() call (default).
- Lazy loading - Use lazy: true for on-demand call of the product supplier's factory when it's first accessed in another factory.

🧪 Testing and Packing

- You can mock any product using pack(), which will use the provided value directly, bypassing the supplier's factory.
- For more complex mocks which would benefit from a factory, see mock() below.

🚀 Mocking and A/B testing

- Use `mock()` to create alternative implementations of a product supplier, that may depend on different suppliers than the original.
- Mocks' factories must return products of the same type than the original product's factory.
- Define mock suppliers or assemblers to `hire()` at the entry-point of your app
- For example, you can easily hire different versions of a UI component for A/B testing.

## Basic Usage

### 1. Create a Market

All suppliers are created from a `market`, which creates a scope shared by Request and Product Suppliers.
You'll usually create one market per application. Markets register the names of the suppliers so that no name conflicts occur. The name registry is the only state the market manages. Names can **only** contain digits, letters, underscores or `$` signs and cannot start with a digit, just like any Javascript identifier.

```ts
import { createMarket } from "typectx"

const market = createMarket()
```

### 2. Define Request Suppliers

Request suppliers are used to wire the data you get from the user's request, and that cannot be derived from other request or product suppliers, like sessions or request params. You define a `$request` supplier and then `.pack()` it with a value at request time. The value can be anything you want, just specify its type.

```tsx
// I like calling suppliers with $ prefix, but this is up to you.
const $session = market.add("session").request<{
    userId: string
}>()

const session = $session
    .pack({
        userId: "some-user-id"
    })
    .unpack()
```

### 3. Define Product Suppliers

Product suppliers are your application's services, components or features. They are factory functions that can depend on other products or request data. Factories can return anything: simple values, promises or other functions.

Dependencies are accessed via the 1st argument of the factory (deps).

```tsx
const $user = market.add("user").product({
    suppliers: [$session, $db], // Depends on session and db suppliers.
    // properties of the deps object are the names provided to market.add() for $session and $db suppliers.
    factory: ({ session, db }) => {
        return db.getUser(session.userId) // query the db to retrieve the user.
    }
})
```

#### Factory Lifecycle & Memoization

**Important**: Your factory function will only ever be called **once per `assemble()` call**. This eliminates the need for traditional DI service lifecycles (transient, scoped, singleton, etc.).

- **Need something called multiple times, or to run side-effects?** Return a function from your factory instead of a value

```ts
// ✅ Good: Factory called once, returns a function for multiple calls or side-effects
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

const createUser = $createUser.assemble(index($db.pack(db))).unpack()
// Usage: createUser() can be called multiple times
const user1 = createUser("123") // Fresh call
const user2 = createUser("123") // Cached result
```

#### Lazy vs Eager Loading

By default, all products are constructed on `assemble()` call immediately in the background and in parallel, no matter how deep in the supply chain. This means no waterfalls happen. You can disable this for specific products with `lazy: true`.

```ts
// Eager loading - constructed immediately when assemble() is called
const $eagerService = market.add("eagerService").product({
    suppliers: [$db],
    factory: ({ db }) => buildExpensiveService(db)
    lazy: false // default
})

// Lazy loading - constructed only when accessed
const $lazyService = market.add("lazyService").product({
    suppliers: [$db],
    factory: ({db}) => buildExpensiveService(db),
    lazy: true // Loaded when first accessed via deps
})
```

### 4. Define Your Application

Your Application is just a product like the other ones. It's the main, most complex product at the top of the supply chain.

```tsx
const $app = market.add("app").product({
    suppliers: [$user], // Depends on User product
    // Destructure the user value.
    // Its type will be automatically inferred from $user's factory's inferred return type.
    factory: ({ user }) => {
        return <h1>Hello, {user.name}! </h1>
    }
})
```

### 5. Assemble at Entry Point

At your application's entry point, you `assemble` your main $app, providing just the request data (not the products) requested recursively by the $app's suppliers chain. Typescript will tell you if any request data is missing.

```tsx

const req = //...Get the current http request

// Assemble the App, providing the Session and Db resources.
// Bad but working syntax for demonstration purposes only. See index() below for syntactic sugar.
const app = $app.assemble({
    [$session.name]: $session.pack({
        userId: req.userId
    }),
    [$params.name]: params.pack(req.params)
}).unpack()

// Return or render app...
```

The flow of the assemble call is as follows: request data is obtained, which is provided to `$request` suppliers using pack(). Then those request data are supplied to `$app`'s suppliers recursively, which assemble their own product, and pass them up along the supply chain until they reach `$app`, which assembles the final `app` product. All this work happens in the background, no matter the complexity of your application.

To simplify the assemble() call, you should use the index() utility, which just transforms an array like
`...[req1, product1]` into an indexed object like
`{[req1.name]: req1, [product1.name]: product1}`. I unfortunately did not find a way to merge index() with assemble() without losing assemble's type-safety, because typescript doesn't have an unordered tuple type.

```tsx
import { index } from "typectx"

const app = $app.assemble(
    index(
        $session.pack({
            userId: req.userId
        }),
        $db.pack(db)
    )
).unpack()
```

## Optionals

Sometimes a product can work with or without certain dependencies. For these cases, use the `optionals` parameter alongside `suppliers`. Optional values may be `undefined` at runtime, and TypeScript will enforce proper undefined checks. You can also use optionals if a piece of request data is not yet known at the entry point of the application, so you don't want Typescript to enforce it being supplied in the assemble() call.

[Learn more about optionals →](https://typectx.github.io/typectx/docs/guides/optionals)

## Assemblers

Assemblers are typectx's flagship feature — they transform DI containers into Context Containers. Think of assemblers as a streamlined way to create nested DI containers, dividing monolithic apps into a tree of different sub-contexts. Perfect for when products depend on values computed deeper in your call stack, or when you need to reassemble dependencies with new context (like impersonating users for secure operations).

[Learn more about assemblers →](https://typectx.github.io/typectx/docs/guides/assemblers)

## Testing and Packing

### 1. Mocking in tests with `.pack()`

You usually use `pack()` to provide request data to `assemble()`, but you can also use `pack()` on products. This allows to provide a value for that product directly, bypassing its factory. Perfect to override a product's implementation with a mock for testing.

```tsx
const $profile = market.add("profile").product({
    suppliers: [$user],
    factory: ({ user }) => {
        return <h1>Profile of {user.name}</h1>
    }
})

const $user = market.add("user").product({
    suppliers: [$db, $session],
    factory: ({db,session}) => {
        return db.findUserById(session.userId)
    }
})

//Test the profile
const profile = $profile.assemble(
    index(
        //$user's factory will not be called, but...
        $user.pack({ name: "John Doe" })
         //assemble still requires a valid value for db and session when using pack(),
         // since $db and $session are in the supply chain...
        $db.pack(undefined),
        // if you can't pass undefined, or some mock for them,
        // prefer using `.mock()` and `.hire()` instead.
        $session.pack(undefined),
    )
).unpack()

// profile === <h1>Profile of John Doe</h1>
```

### 2. `.mock()` and `.hire()` alternative implementations

For more complete alternative implementations, with complex dependency needs, you can use `.mock()` and `.hire()` instead of `.pack()` to access the whole power of your supply chain. The same example as above could be:

```tsx
const $profile = market.add("profile").product({
    suppliers: [$user],
    factory: ({ user }) => {
        return <h1>Profile of user.name}</h1>
    }
})

const $user = market.add("user").product({
    suppliers: [$db, $session],
    factory: ({db, session}) => {
        return db.findUserById(session.userId)
    }
})

const $userMock = $user.mock({
    suppliers: [],
    factory: () => "John Doe"
})

//You no longer need to pass some value for $db and $session, since $userMock removes them from the supply chain.
const profile = $profile.hire($userMock).assemble()

profile === <h1>Profile of John Doe</h1>
```

`.mock()` and `.hire()` can be used for testing, but also to swap implementations at runtime for sandboxing or A/B testing.

## Design Philosophy: The Problem with Traditional DI

DI containers have always felt abstract, technical, almost magical in how they work. Like a black box, you often have to dig into the source code of a third-party library to understand how data flows in your own application. It feels like you lose control of your own data when you use one, and your entire app becomes dependent on the container to even work. typectx aims to make DI cool again! The pattern has real power, even if current implementations on the open-source market hide that power under a lot of complexity.

DI was complex to achieve in pure OOP world because of the absence of first-class functions. But in more functional languages, DI should be easier, since DI itself is a functional pattern. However, TypeScript DI frameworks currently available seem to have been built by imitating how they were built in OOP languages...

The problem DI was solving in OOP still exists in a more functional world. In OOP, DI helped inject data and services freely within deeply nested class hierarchies and architectures. With only functions though, DI achieves a similar purpose: inject data and services freely in deeply nested function calls. Deeply nested function calls naturally emerge when trying to decouple and implement SOLID principles in medium to highly complex applications. Without DI, you cannot achieve maximal decoupling. Even if in principle you can reuse a function elsewhere, the function is still bound in some way to the particular call stack in which it finds itself, simply by the fact that it can only be called from a parent function that has access to all the data and dependencies it needs.

typectx's Context containers can do everything DI containers do, and more! It also achieves it in a more elegant, simpler, and easier-to-reason-about manner.

## How it Works Under the Hood

Injection happens statelessly via a memoized, recursive, self-referential, lazy object. Here is a simplified example:

```typescript
const supplies = {
    // request data is provided directly
    reqA,
    reqB,

    // Products are wrapped in a function to be lazily evaluated and memoized.
    // The supplies object is passed to assemble, creating a recursive structure.
    productA: once(() => productA.supplier.assemble(supplies)),
    productB: once(() => productB.supplier.assemble(supplies))
    // ...
}
```

The `assemble()` call builds the above supplies object, each product now ready to be injected and built right away if eager, or on-demand if lazy.

This functional approach allows typescript to follow the types across the entirety of the dependency chain, which it cannot do for traditional stateful containers.

## API reference

See [the docs](https://typectx.github.io/typectx/docs/api-reference) for the full API reference!

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## License

MIT

---
