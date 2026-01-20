---
title: "API Reference"
description: "Detailed API reference for typectx. Learn about createMarket, add().request(), add().product(), and other core functions for type-safe dependency injection in TypeScript."
keywords:
    - api
    - reference
    - typectx
    - createMarket
    - product
    - request
    - assemble
    - dependency injection
    - typescript
---

# API Reference

## API Reference

### `createMarket()`

Creates a new dependency injection scope.

```ts
const market = createMarket()
```

### `market.add("name")`

Creates a new supplier with the given name. The name must be a valid Javascript identifier, e.g. it must only contain digits, letters, `$` or `_`, and cannot start with a digit.

```ts
const $supplier = market.add("name")
```

### `add().request<T>()`

Creates a supplier for a value from the user's request (request params, cookies, etc.) with type T.

```ts
const $session = market.add("session").request<Session>()
```

### `add().product(options)`

Creates a product supplier.

```ts
const $product = market.add("product").product({
    suppliers: [$supplier1, $supplier2], // Suppliers
    assemblers: [$assembler1, $assembler2], // Assemblers
    lazy: boolean, // Eager (false) or lazy (true)
    init: (value, deps) => void // Run a function right after construction
    factory: (deps, ctx) => {
        // Factory function
        // deps = dependencies received, can be destructured
        // ctx = Function to contextualize suppliers and assemblers used in the factory
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

`Composition root` method to wire additionnal suppliers. Mocks will replace originals
with the same name across the entire dependency chain.

```ts
const $modified = $originalSupplier.hire($mockSupplier)
```

You can also pass originals to hiredSuppliers to batch assemble multiple products together. You access other products via `product.deps.otherSupplier`

```ts
const ASupply = $A.hire($B, $C).assemble({})
// All assembled products will be available in $A's deps (see below)
const A = ASupply.unpack()
const B = ASupply.deps.B
const C = ASupply.deps.C
```

### `product.deps`

Access a product dependencies, but from outside a factory. See example above in `$supplier.hire()` section. Typescript only displays supplies it is sure the product has, which is often `unknown` in factories since the supplier from which the product has been created may have been swapped with a mock with unknown supplies. But hired suppliers will always be available in supplies to enable batch assemble as seen in `$supplier.hire()` section.

### `index(...supplies)`

Utility to convert supply array to indexed object.

```ts
const suppliesObject = index(supply1, supply2, supply3)
// Equivalent to: { [supply1.supplier.name]: supply1, [supply2.supplier.name]: supply2, ... }
```

## Factory Function (`factory`)

The factory function is where your service logic lives. It receives two arguments:

- **`deps`**: An object of dependencies of the form: `{[supplier.name]: value}`
- **`ctx(Supplier or Assembler)`**: A function to safely access contextualized suppliers or assemblers in a factory.
