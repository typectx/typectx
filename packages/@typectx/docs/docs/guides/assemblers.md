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

Not all products in your supply chain can be assembled at the entry point of the application. Sometimes, a product depends on a resource that is not yet known at the entry point, but only computed later on in a product's factory. In these situations, you need assemblers.

Let's start with a simple example: an `AdminPanel`. An `AdminPanel` can't be built until the current session has been validated as having an "admin" role, which doesn't need to be known when the application starts. You might want to compute it lazily, only if the user requests to see the `AdminPanel`. Here's how to do it with assemblers:

```tsx
type Session = { user: User; now: Date }
type AdminSession = Session & { user: User & { role: "admin" } }

// Session resource can hold any object of type Session
const $session = market.offer("session").asResource<Session>()

// Values of different types should be given different resources,
// even if in the end they might hold the same value.
const $adminSession = market
    .offer("adminSession")
    .asResource<AdminSession>()

const $adminPanel = market.offer("adminDashboard").asProduct({
    suppliers: [$adminSession], // Depends on an admin session
    factory: ({ adminSession }) => {
        // Non-admin users already guarded out at this point,
        // no need for a runtime guard here.
        return <div>Admin Panel</div>
    }
})

//PascalCase convention for React component
const $App = market.offer("App").asProduct({
    suppliers: [$session],
    // Put in assemblers[] all product suppliers depending
    // on new context (resources) computed in this factory
    assemblers: [$adminPanel]
    // Factories receive a ctx() function allowing to access
    // contextualized versions of suppliers or assemblers
    factory: ({ session }, ctx) => () => {
        const role = session.user.role
        if (role === "admin") {
            //Assemblers are not yet assembled, you need to
            // assemble them with the new context.
            return ctx($adminPanel).assemble(
                index(
                    //No need to call ctx() or resource suppliers.
                    // You can, but it'll just be a no-op
                    $adminSession.pack(session as AdminSession)

                    // Or, even better than a type assertion, rebuild the session for full
                    // type-safety now that role has been type guarded.

                    // ctx($adminSession).pack({
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
const App = $App.assemble(index($session.pack(session))).unpack()
```

> **Analogy with React Context**
>
> If you're familiar with React, you can think of an `Assembler` as being similar to a ContextProvider.
> Assemblers work similarly by allowing you to provide new dependencies that are only available to children
> deeper in the call-stack.

## Why `ctx(...)` ?

You might wonder why the 2nd argument of the factory is even needed. In the example, why not call `$adminPanel.assemble(...)` instead of `ctx($adminPanel).assemble(...)`? The `$adminPanel` is available via closure, no?

Well, not really. ctx(...) provides access to `contextualized` product suppliers. It doesn't return the same object as the module-scope supplier. Two main differences:

1. If you `hired` a `mock` at the entry-point, `ctx(...)` will return the mock, not the module-scope supplier.
2. `ctx(...)` knows about the current dependencies. Meaning if you call `ctx(...).assemble()`, Typescript will only require you to provide resources that are not already present in the 1st argument (deps) of the factory. If you call assemble on the module-scope supplier, however, you'd need to reprovide resource you already provided at the entry point.

However, using ctx($resourceSupplier) works, but does nothing, it's a no-op.

In summary, never use product suppliers from module-scope closures in factories. Respect the DI spirit! Product suppliers you use in your factory should come from the factory's arguments (deps or ctx).

## Reassembling suppliers

Sometimes, you don't need to build a new product from scratch based on new context, like in the `AdminPanel` example. Instead, you may just need to rebuild an _already assembled_ product with a different context. I call this `reassembling`. And you can achieve it simply by calling `ctx(...).assemble()` on a `$supplier` from the suppliers list, not the assemblers list.

Here is a classic problem reassembling solves: how can a user safely send money to another user when the sender does not have access to the receiver's account, without having to bypass the receiver's access control layer? Just impersonate the receiver with `ctx($supplier)`!

```typescript
const $sendMoney = market.offer("sendMoney").asProduct({
    suppliers: [$addWalletEntry, $session],
    factory: ({ addWalletEntry, session }) => {
        return (toUserId: string, amount: number) => {
            // 1. Runs with the original session's account
            addWalletEntry(-amount)

            // 2. Reassemble the dependency with a new session context
            const addTargetWalletEntry = ctx($addWalletEntry)
                // You'll never get missing resource errors here from Typescript,
                // since you have already assembled this product at the entry-point,
                // with the resources it required.
                // You are however free to overwrite or add resources as you please
                // in a type-safe way.
                .assemble(index($session.pack({ userId: toUserId })))
                .unpack()

            // 3. Runs in the receiver's account context, so all security checks can still run.
            addTargetWalletEntry(amount)
        }
    }
})
```

> **Analogy with React Context**
>
> Continuing the React analogy, `ctx($assembler).assemble()` is like calling `<ContextProvider />` a second time
> on the same context with a new value deeper in the call stack.

## Performance: Assembling Multiple Assemblers with `.hire()` and `.deps`

Let's say you have multiple admin-only components to render in React (server components) now that you know the user is an admin.

```tsx
const $App = market.offer("App").asProduct({
    suppliers: [$session],
    assemblers: [$adminPanel, $adminDashboard, $adminProfile],
    factory:
        ({ session }, ctx) =>
        () => {
            const role = session.user.role
            if (role === "admin") {
                const newSupplies = index(
                    $adminSession.pack(session as AdminSession)
                )

                const Panel = ctx($adminPanel).assemble(newSupplies).unpack()
                const Dashboard = ctx($adminDashboard)
                    .assemble(newSupplies)
                    .unpack()
                const Profile = ctx($adminProfile)
                    .assemble(newSupplies)
                    .unpack()

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
const $App = market.offer("App").asProduct({
    suppliers: [$session],
    assemblers: [$adminPanel, $adminDashboard, $adminProfile],
    factory: ({session}, ctx) => () => {
        const role = session.user.role
        if (role === "admin") {
            const PanelProduct = ctx($adminPanel)
                //No need to wrap suppliers in ctx here, since the hire method itself is contextualized
                //But it won't break if you do.
                .hire([$adminDashboard, $adminProfile])
                .assemble(
                    index(
                        $adminSession.pack(session as AdminSession)
                        // + Other supplies required by any of the suppliers in the list.
                        // The assemble() call is type-safe and will ensure all necessary
                        // dependencies for all listed assemblers are provided.
                    )
                })

            const Panel = PanelProduct.unpack()
            // Since they were assembled together, Dashboard and Profile
            // are available in Panel's dependencies even
            // if Panel does not need them in their factory.
            const Dashboard = PanelProduct.deps.adminDashboard
            const Profile = PanelProduct.deps.adminProfile

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
