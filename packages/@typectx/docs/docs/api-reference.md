---
title: "API Reference"
description: "Detailed API reference for typectx. Learn about supplier(name).request(), supplier(name).product(config), and core functions for type-safe dependency injection in TypeScript."
keywords:
    - api
    - reference
    - typectx
    - product
    - product
    - request
    - assemble
    - dependency injection
    - typescript
---

# API Reference

### `supplier(name).request<T>()`

Creates a supplier for a value from the user's request (request params, cookies, etc.) with type T.

```ts
const $session = supplier("session").request<Session>()
```

### `supplier(name).product(config)`

Creates a product supplier.

```ts
const $product = supplier("product").product({
    suppliers: [$supplier1, $supplier2], // Suppliers
    lazy: boolean, // Eager (false) or lazy (true)
    init: (value, deps) => void // Run a function right after construction
    factory: (deps, ctx) => {
        // Factory function
        // deps = dependencies received, can be destructured
        // ctx = Function to contextualize suppliers used in the factory
        return serviceImplementation
    }
})
```

### `$supplier.pack(value)`

Provides a concrete value for a supplier, bypassing the factory in the case of products.

```ts
const requestData = $request.pack(value)
const mockProduct = $product.pack(mockValue) // For testing
```

### `$supplier.assemble(supplies)`

Resolves all dependencies and creates the product.

```ts
const supply = $product.assemble(suppliesObject)
const value = supply.unpack()
```

### `$supplier.mock(options)`

Creates an alternative implementation.

```ts
const $alternative = $originalSupplier.mock({
    suppliers: [$differentDeps],
    factory: (deps, ctx) => {
        /*... alternativeImplementationBody*/
    }
})
```

### `$supplier.hire(...hiredSuppliers)`

Composition root method to wire additional suppliers. Hired suppliers replace originals
with the same name across the entire dependency chain.

```ts
const $modified = $originalSupplier.hire($mockSupplier)
```

You can also hire additional original suppliers to batch-assemble multiple products together. You access these resolved values through the returned supply's `deps`.

```ts
const ASupply = $A.hire($B, $C).assemble({})
// All assembled products will be available in $A's deps (see below)
const A = ASupply.unpack()
const B = ASupply.deps.B
const C = ASupply.deps.C
```

### `supply.deps`

Access resolved dependencies from outside a factory. See example above in `$supplier.hire()` section. TypeScript only exposes dependencies it can prove are present for that assembled supplier context.

### `index(...supplies)`

Utility to convert supply array to indexed object.

```ts
const suppliesObject = index(supply1, supply2, supply3)
// Equivalent to: { [supply1.supplier.name]: supply1, [supply2.supplier.name]: supply2, ... }
```

## Factory Function (`factory`)

The factory function is where your service logic lives. It receives two arguments:

- **`deps`**: An object of dependencies of the form: `{[supplier.name]: value}`
- **`ctx($supplier)`**: A function to access contextualized suppliers in a factory and reassemble them with additional or overridden request data.
