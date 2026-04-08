---
title: "Getting Started with typectx"
description: "Learn how to get started with typectx, a modern, type-safe dependency injection and context propagation library for TypeScript. Quick start guide and installation."
keywords:
    - getting started
    - quick start
    - installation
    - setup
    - typescript
    - dependency injection
    - typectx
---

# Getting Started

## Quick Start in 4 Steps

Get up and running with typectx in just a few minutes.

### 1. Installation

```bash
npm install typectx
```

### 2. Import flat APIs

Use the flat service APIs directly.

```typescript
import { service } from "typectx"
```

### 3. Define Services

Services create your app's dependencies. **Request services** hold data from the user's request (request params, cookies, etc.), which cannot be derived from other services, while **App Services** are your application's services, components or features. They are factory functions that depend on request data or other app services. Factories can return anything: simple values, promises or other functions.

Names passed to `service("...")` can **only** contain digits, letters, underscores or `$` signs and cannot start with a digit, just like any Javascript identifier.

```typescript
// A Request service for the user session
const $session = service("session").request<{ userId: string }>()

// An app service that depends on the session
const $userService = service("userService").app({
    services: [$session],
    // Access the session by destructuring the factory's 1st argument.
    // The property name is the service name passed to service("...").
    factory: ({ session }) => {
        return {
            id: session.userId,
            name: "Jane Doe"
        }
    }
})
```

### 4. Assemble at Your Entry Point

At your application's entry point, `assemble` your main service, providing any required request data. The `index()` utility simplifies this process.

```typescript
import { index } from "typectx"

const session = { userId: "user-123" }

// Assemble the user service with a concrete session
const userService = $userService
    .assemble(index($session.pack(session)))
    .unpack()

console.log(userService.id) // "user-123"
```

## Next Steps

- Walk through a **[Basic Example](examples/simple-example)** of a complete application.
- Follow the more in-depth **[Basic Usage](guides/basic-usage)** guide.
- Dive into the **[Design philosophy and semantics](guides/design-philosophy)** of typectx.
