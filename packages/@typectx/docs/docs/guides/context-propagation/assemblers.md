---
title: "Assemblers for Context Propagation"
description: "Learn about Assemblers in typectx, a powerful feature for context propagation and creating nested dependency injection containers in TypeScript applications."
keywords:
    - assemblers
    - context propagation
    - dependency injection
    - typescript
    - typectx
    - nested containers
    - reassemble
---

# Assemblers

:::tip
Assemblers are the flagship feature that transform typectx DI containers into Context Containers. You can picture assemblers as a streamlined way to create nested DI containers, dividing monolithic apps into a tree of different sub-contexts.
:::

:::note
Using assemblers requires using optionals most of the time, so please read [optionals docs](optionals) before this one.
:::

Not all products in your supply chain can be assembled at the entry point of the application. Sometimes, a product depends on a resource that is not yet known at the entry point, but only computed later on in a product's factory. In these situations, you need assemblers.

Let's start with a simple example: an `AdminPanel`. An `AdminPanel` can't be built until the current session has been validated as having an "admin" role, which doesn't need to be known when the application starts. You might want to compute it lazily, only if the user requests to see the `AdminPanel`. Here's how to do it with assemblers:

```tsx
type Session = { user: User; now: Date }
type AdminSession = Session & { user: User & { role: "admin" } }

// Session resource can hold any object of type Session
const $$session = market.offer("session").asResource<Session>()

// Values of different types should be given different resources,
// even if in the end they might hold the same value.
const $$adminSession = market
    .offer("admin-session")
    .asResource<AdminSession>()

const $$adminPanel = market.offer("admin-dashboard").asProduct({
    suppliers: [$$adminSession], // Depends on an admin session
    factory: ($) => {
        // Non-admin users already guarded out at this point,
        // no need for a runtime guard here.
        return <div>Admin Panel</div>
    }
})

//PascalCase convention for React component
const $$App = market.offer("app").asProduct({
    suppliers: [$$session],
    // Put in assemblers[] all product suppliers depending
    // on new context (resources) computed in this factory
    assemblers: [$$adminPanel]
    // Pass that new context in optionals so you aren't forced
    // to provide it yet at the entry point
    optionals: [$$adminSession]
    // Factories receive assemblers and
    // optionals suppliers as 2nd argument
    factory: ($, $$) => () => {
        const session = $($$session).unpack()
        const role = session.user.role
        if (role === "admin") {
            //Assemblers are not yet assembled, you need to
            // assemble them with the new context.
            return $$($$adminPanel).assemble(
                index(
                    $$($$adminSession).pack(session as AdminSession)

                    // Or, even better, rebuild the session for full
                    // type-safety without assertions
                    // now that role has been type guarded.

                    // $$adminSession.pack({
                    //     ...session,
                    //     user: {
                    //         ...session.user,
                    //         role
                    //     }
                    // })
                )
            )
        }

        return <h1>User Panel - {session.user.name}</h1>
    }
})

const session = ...//read session
const App = $$app.assemble(index($$session.pack(session))).unpack()
```

> **Analogy with React Context**
>
> If you're familiar with React, you can think of an `Assembler` as being similar to a ContextProvider.
> Assemblers work similarly by allowing you to provide new dependencies that are only available to children
> deeper in the call-stack.

## Why `$$(...)` ?

You might wonder why the 2nd argument of the factory is even needed. In the example, why not call `$$adminPanel.assemble(...)` instead of `$$($$adminPanel).assemble(...)`? The `$$adminPanel` is available via closure, no?

Well, not really. $$(...) provides access to `contextualized` suppliers. It doesn't return the same object as the module-scope supplier. Two main differences:

1. If you `hired` a `mock` at the entry-point, `$$(...)` will return the mock, not the module-scope supplier.
2. `$$(...)` knows about the current `$` supplies. Meaning if you call `$$(...).assemble()`, Typescript will only require you to provide resources that are not already present in the `$` context. If you call assemble on the module-scope supplier, however, you'd need to reprovide resource you already provided at the entry point.

In summary, never use suppliers from module-scope closures in factories. Respect the DI spirit! Everything you use in your factory should come from the factory's arguments (`$` or `$$`).

## Reassembling suppliers

Sometimes, you don't need to build a new product from scratch based on new context, like in the `AdminPanel` example. Instead, you may just need to rebuild an _already assembled_ product with a different context. I call this `reassembling`. And you can achieve it simply by calling `$$(...).assemble()` on a `$$supplier` from the suppliers list, not the assemblers list.

Here is a classic problem reassembling solves: how can a user safely send money to another user when the sender does not have access to the receiver's account, without having to bypass the receiver's access control layer? Just impersonate the receiver with `$$($$supplier)`!

```typescript
const $$sendMoney = market.offer("send-money").asProduct({
    suppliers: [$$addWalletEntry, $$session],
    factory: ($) => {
        return (toUserId: string, amount: number) => {
            const addWalletEntry = $($$addWalletEntry).unpack()

            // 1. Runs with the original session's account
            addWalletEntry(-amount)

            // 2. Reassemble the dependency with a new session context
            const addTargetWalletEntry = $$($$$addWalletEntry)
                // You'll never get missing resource errors here from Typescript,
                // since you have already assembled this product at the entry-point,
                // with the resources it required.
                // You are however free to overwrite or add resources as you please
                // in a type-safe way.
                .assemble(index($$session.pack({ userId: toUserId })))
                .unpack()

            // 3. Runs in the receiver's account context, so all security checks can still run.
            addTargetWalletEntry(amount)
        }
    }
})
```

> **Analogy with React Context**
>
> Continuing the React analogy, `.reassemble()` is like calling `<ContextProvider />` a second time on the same
> context with a new value deeper in the call stack.

## Performance: Assembling Multiple Assemblers with `.hire()` and `.$()`

Let's say you have multiple admin-only components to render in React now that you know the user is an admin.

```tsx
const $$App = market.offer("app").asProduct({
    suppliers: [$$session],
    assemblers: [$$adminPanel, $$adminDashboard, $$adminProfile],
    factory: ($, $$) => () => {
        const session = $($$session).unpack()
        const role = session.user.role
        if (role === "admin") {
            const newSupplies = index(
                $$adminSession.pack(session as AdminSession)
            )

            const Panel = $$($$adminPanel).assemble(newSupplies).unpack()
            const Dashboard = $$($$adminDashboard)
                .assemble(newSupplies)
                .unpack()
            const Profile = $$($$adminProfile).assemble(newSupplies).unpack()

            return (
                <>
                    <Panel />
                    <Dashboard />
                    <Profile />
                </>
            )
        }

        return <h1>User Panel - {session.user.name}</h1>
    }
})
```

This is not efficient, as the assemble() context needs to be built three times independently. A better way is to use `hire()`

```tsx
const $$App = market.offer("app").asProduct({
    suppliers: [$$session],
    assemblers: [$$adminPanel, $$adminDashboard, $$adminProfile],
    factory: ($, $$) => () => {
        const session = $($$session).unpack()
        const role = session.user.role
        if (role === "admin") {
            const $Panel = $$($$adminPanel)
                .hire([$$adminDashboard, $$adminProfile])
                .assemble(
                    index(
                        $$adminSession.pack(session as AdminSession)
                        // + Other supplies required by any of the suppliers in the list.
                        // The assemble() call is type-safe and will ensure all necessary
                        // dependencies for all listed assemblers are provided.
                    )
                })

            const Panel = $Panel.unpack()
            // Since they were assembled together, Dashboard and Profile
            // are available in Panel's supplies ($) even
            // if Panel does not need them in their factory.
            // $product.$() is the same as $(), but for usage outside
            // the factory, after the product has been built.
            const Dashboard = $Panel.$($$adminDashboard).unpack()
            const Profile = $Panel.$($$adminProfile).unpack()

            return (
                <>
                    <Panel />
                    <Dashboard />
                    <Profile />
                </>
            )
        }

        return <h1>User Panel - {session.user.name}</h1>
    }
})
```
