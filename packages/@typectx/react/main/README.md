# @typectx/react

An adapter to use `typectx` with React client components. This library provides hooks to integrate `typectx`'s dependency injection into React applications, offering efficient updates and referential integrity.

The purpose of this library is mainly as a proof-of-concept that dependency injection can be integrated with React. It does not aim to become as stable as React Context yet, but can achieve all that React Context does as efficiently as it does.

## Features

- **Dependency Injection for React**: Define components as `typectx` products and inject dependencies (resources or other components).
- **Referential Integrity**: Components assembled via `useAssembleComponent` maintain referential equality across re-renders, preventing unnecessary React tree updates.
- **Efficient Updates**: Uses `useSyncExternalStore` and an internal event store to propagate updates only to components that actually depend on changed resources, similar to how React Context works.

## Installation

```bash
npm install typectx @typectx/react
```

## API

### `useInit$`

Initializes a connection between a React component or hook with @typectx/react's internal store. Components registered will receive updated supplies when a parent component calls the useAssembleComponent hook. Think of this hook as equivalent to useContext, but giving you access to the whole $ object.

```typescript
function MyComponentFactory(init$, $$) {
    return function MyComponent() {
        // Initialize the scope
        const $ = useInit$(init$);

        // Access dependencies
        const myResource = $(resourceSupplier).unpack();

        return <div>{myResource}</div>;
    }
}
```

### `useAssembleComponent` (alias `useAssembleHook`)

Assembles a child component (or hook) with specific resources. This hook ensures that the assembled component reference (and all its transitive component or hook dependencies) remains stable, even if the supplied resources change (updates are handled internally via the store). So React always renders the same component, but the $ state of that component updates in a reactive way, preserving all React's optimizations, and preserving other pieces of state, across rerenders.

```typescript
const AssembledChild = useAssembleComponent(
    // The supplier to assemble
    $$($$ChildComponent).hire($$Dependency),
    // The resources to supply
    index(
        resourceSupplier.pack(value)
    )
);

const Child = AssembledChild.unpack();
return <Child />;
```

## Usage Example

### 1. Define Resources (Context)

Define your resources using `market.offer().asResource()`.

```typescript
// context.ts
import { market } from "typectx"

export const ctx = {
    $$theme: market.offer("theme").asResource<"light" | "dark">(),
    $$user: market.offer("user").asResource<{ name: string } | null>()
}
```

### 2. Define Components

Define your components as products using `market.offer().asProduct()`.

```typescript
// components.ts
import { market, index } from "typectx";
import { useInit$, useAssembleComponent } from "@typectx/react";
import { ctx } from "./context";

// A child component that consumes 'theme'
export const $$Button = market.offer("Button").asProduct({
    suppliers: [ctx.$$theme],
    // Name the function component so you can understand your component tree in React DevTools
    factory: (init$) => function Button({ children }) {
        const $ = useInit$(init$);
        const theme = $(ctx.$$theme).unpack();

        return (
            <button style={{ background: theme === 'dark' ? '#333' : '#fff' }}>
                {children}
            </button>
        );
    }
});

// A parent component that manages state and assembles the child
export const $$App = market.offer("App").asProduct({
    optionals: [ctx.$$theme]
    assemblers: [$$Button],
    factory: (init$, $$) => function App() {
        const $ = useInit$(init$);

        // Assemble the Button component with the current theme
        const $Button = useAssembleComponent(
            $$($$Button),
            index(
                $$(ctx.$$theme).pack("dark") // Supplying 'dark' theme
            )
        );

        const Button = $Button.unpack();

        return (
            <div>
                <h1>My App</h1>
                <Button>Click me</Button>
            </div>
        );
    }
});
```

### 3. Root Render

Assemble the root component and render it.

```typescript
// main.tsx
import { createRoot } from "react-dom/client";
import { index } from "typectx";
import { $$App } from "./components";

const root = createRoot(document.getElementById("root"));

// Assemble the root App
const App = $$App.assemble(index(/* root dependencies if any */)).unpack();

root.render(<App />);
```

## How it Works

1.  **Store & Subscription**: The library maintains a `WeakMap`-based store that links their initial state object (`init$`) to their current state ($). `useInit$`subscribes the React component to this store using`useSyncExternalStore`.

2.  **Stable Assembly**: `useAssembleComponent` creates the component only once to preserve its referential stability. When supplied resources change, it checks if the assembled component or its transitive component dependencies depend directly on the changed resources. The rerendering listeners of only those components get triggered.

# Usage tips

- **Rules of Hooks** - Don't call hooks in the factory's function body! If you call hooks, like useInit$() or useAssembleComponent() either in a component or custom hooks, be sure to call it in a function **returned** by the factory, like so:

```tsx
{
    factory: ($, $$) => () => {
        // useXYZ() or $($$useXYZ).unpack()() if hook part of supplies
    }
}
```

- **React Context alternative** - All you can achieve with React Context can be achieved using @typectx/react's API:
    - `createContext()` → equivalent to defining a new resource with `asResource()`
    - `useContext()` → equivalent to useInit$() then accessing a supply with `$(someContextResourceSupplier).unpack()`
    - `<Provider >` → equivalent to useAssemble() with a new value for the supplied resources.

    For a full showcase of this, head over to the [example](https://typectx.github.io/typectx/examples/react-client), which displays complex context propagation in a deeply nested component tree. See [Assemblers](https://typectx.github.io/typectx/docs/guides/assemblers) for full documentation.

- **Preload pattern** - All factories are eagerly prerun in parallel by default, so preloading is very easy. To preload data, look at file src/api.ts in the demo to see how data prefetching has been achieved with react-query to avoid waterfall loading. The following example shows how to use the preload pattern with @typectx/react.

```tsx
market.offer("Component").asProduct({
    factory: ($, $$) =>
        React.memo((props) => {
            // return jsx
        }),
    // Init is always called right after the factory, no matter if lazy is true or false
    init: (Component, $) => {
        <Component props={propSetToPreload1} />
        <Component props={propSetToPreload2} />
        <Component props={propSetToPreload3} />
    }
    lazy: false // false is the default, so can be omitted
})
```

To see how to preload data with Tanstack Query and @typectx/react, head over to the [example's](https://typectx.github.io/typectx/examples/react-client) api.ts file

- **eslint/rules-of-hooks** - You can return anything from the factory, even hooks. If you create hooks as products, you'd call them like $(useXYZ).unpack()() which ESLint can't detect for the rules-of-hooks rule. You could store the hook in a temporary variable instead:

```tsx
{
    factory: ($, $$) => () => {
        const useXYZ = $(useXYZ).unpack()
        useXYZ() // ESLint rules-of-hooks should work
    }
}
```

- **eslint-plugin-react-hooks/stable-components** - If you use the React official eslint plugin, you may receive complaints from the stable-components rule. useAssembleComponent() returns a component dynamically within another component, which the React Compiler flags as dangerous because every render, the component might have a different Object.is identity, which React uses to optimize renders and associate state. But useAssembleComponent() preserves the referential stability of the returned component across renders, so you can safely ignore this error.
