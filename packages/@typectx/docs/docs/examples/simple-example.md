---
title: "Simple Example"
description: "View a simple example of a todo app built with typectx, demonstrating basic concepts like markets, request suppliers, products, and assembly for dependency injection."
keywords:
    - example
    - simple example
    - todo app
    - typescript
    - dependency injection
    - typectx
---

# Simple example

Dummy todo app built with typectx.

```typescript
import { index, supplier } from "typectx"

// 1. Define request and product suppliers
const $session = supplier("session").request<{ userId: string }>()
const $todosDb = supplier("todosDb").product({
    factory: () => new Map<string, string[]>() // Simple in-memory DB
})
const $addTodo = supplier("addTodo").product({
    suppliers: [$session, $todosDb],
    factory:
        ({ session, todosDb }) =>
        (todo: string) => {
            const userTodos = todosDb.get(session.userId) || []
            todosDb.set(session.userId, [...userTodos, todo])
            return db.get(session.userId)
        }
})

/*Here, we define two types of suppliers:

-   `$session`: A **Request** supplier that will hold the current user's session data.
-   `$todosDb`: A **Product** supplier that provides an in-memory `Map` to act as a database. It has no dependencies.
-   `$addTodo`: A **Product** supplier that creates our main `addTodo` function. It depends on both the `$session` and `$todosDb`. */

const session = { userId: "user123" }

// 3. Assemble and use
const addTodo = $addTodo
    // We only need to provide resource dependencies to assemble(). Products are auto-wired
    .assemble(index($session.pack(session)))
    .unpack()

console.log(addTodo("Learn typectx")) // ["Learn typectx"]
console.log(addTodo("Build app")) // ["Learn typectx", "Build app"]
```
