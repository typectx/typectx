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

## The mental model

We often picture an application as receiving one request, and producing one response in return. But complex apps can be seen differently. For example, a list of posts on a social media feed can be modeled as receiving one request per post (with the postId as request data), and producing a different response (with the post content) for every post request. Each post thus behaves like a sub-application within a parent application.

This architecture is what React Context achieves. Each Post component can run as a sub-application in its own context, and `use` the postId context to determine what to display to the user for that post. This avoids having to "prop-drill" the postId to every post subcomponent that needs it, since it is available globally in the Context.

Assemblers in typectx achieve something similar, but within a full DI paradigm.

```tsx
const $session = market.add("session").request<Session>()
const $postId = market.add("postId").request<string>()

const $db = connectDb(/*...*/))

const $Post = market.add("Post").product({
    suppliers: [$db, $postId, $session],
    factory: async ({db, postId, session}) => {
        const post = await db.getPost(postid)
        return (<div>
            <h1>{post.title}</h1>
            <p>{post.body}</p>
            <p>Thanks for reading, {session.name}!</p>
        </div>)
    }
})

const $Feed = market.add("Feed").product({
    suppliers: [$db, $session],
    // Put in assemblers[] all product suppliers depending
    // on new context data computed in this factory
    assemblers: [$Post],
    // Factories receive a ctx() function allowing to access
    // contextualized versions of suppliers or assemblers
    factory: ({db}, ctx) => {
        const postIds = db.getPostIds()

        <h1>Good morning, {session.name}!</h1>
        for (postId of postIds) {
            // Assemblers are not yet assembled, you need to assemble them with 
            // 1. The old Feed context by wrapping the assembler with ctx()
            //          |-> Here, this will propagate the session value, since session is a supplier of Feed.
            // 2. the new context (postId) computed in this factory
            const Post = ctx($Post).assemble(index($postId.pack(postId))).unpack() // Typescript doesn't complain session is missing, because propagated via ctx().
            return <Post />
        }
    }
})

const $App = market.add("App").product({
    suppliers: [$Feed],
    factory: ({Feed}) => {
        return <Feed /> // The app is just the feed for now
    }
})

const App = $app.assemble(
    // Typescript doesn't complain here that postId is missing, because it is not in the `suppliers` chain!
    // The chain is $App -> $Feed -> ($db, $session), it misses $Post as it is listed as an assembler, not a supplier.
    // Thus it also misses $postId.
    index($session.pack({userId: "some-user", timestamp: new Date()}))
).unpack()
return <App />
```


> **Analogy with React Context**
>
> If you're familiar with React, you can think of an `Assembler` as being similar to a ContextProvider.
> Assemblers work similarly by allowing you to provide new dependencies that are only available to children
> deeper in the call-stack.

## Why `ctx(...)` ?

You might wonder why the 2nd argument of the factory is even needed. In the example, why not call `$Post.assemble(...)` instead of `ctx($Post).assemble(...)`? The `$Post` is available via closure, no?

Well, not really. ctx(...) provides access to `contextualized` product suppliers. It doesn't return the same object as the module-scope supplier. Two main differences:

1. If you `hired` a `mock` at the entry-point, `ctx(...)` will return the mock, not the module-scope supplier.
2. `ctx(...)` knows about the current dependencies. Meaning if you call `ctx(...).assemble()`, Typescript will only require you to provide request data that have not already been provided higher in the call stack. If you call assemble on the module-scope supplier, however, you'd need to reprovide request data you already provided at the entry point.

ctx() can only wrap $productSuppliers. Using ctx($requestSupplier) works, but does nothing, it's a no-op that just returns $requestSupplier.

In summary, never use product suppliers from module-scope closures in factories. Respect the DI spirit! Product suppliers you use in your factory should come from the factory's arguments (deps or ctx).

## Reassembling suppliers

Sometimes, you don't need to build a new product from scratch based on new context, like in the `Feed` example. Instead, you may just need to rebuild an _already assembled_ product with a different context. I call this `reassembling`. And you can achieve it simply by calling `ctx(...).assemble()` on a `$supplier` from the suppliers list, not the assemblers list.

Here is a classic problem reassembling solves: how can a user safely send money to another user when the sender does not have access to the receiver's account, without having to bypass the receiver's access control layer? Just impersonate the receiver with `ctx($supplier)`!

```typescript
const $sendMoney = market.add("sendMoney").product({
    suppliers: [$addWalletEntry, $session],
    factory: ({ addWalletEntry, session }) => {
        return (toUserId: string, amount: number) => {
            // 1. Runs with the original session's account
            addWalletEntry(-amount)

            // 2. Reassemble the dependency with a new session context
            const addTargetWalletEntry = ctx($addWalletEntry)
                // You'll never get missing data errors here from Typescript,
                // since you have already assembled this product at the entry-point,
                // with the request data it required.
                // You are however free to overwrite or add request data as you please
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
> Continuing the React analogy, `ctx($supplier).assemble()` is like calling `<ContextProvider />` a second time
> on the same context with a new value deeper in the call stack.

## Performance: Assembling Multiple Assemblers with `.hire()` and `.deps`

Let's say you have multiple components to assemble in the Feed once you know the postId:

```tsx
const $Feed = market.add("Feed").product({
    suppliers: [$db, $session],
    assemblers: [$PostAISummary, $Post, $PostTopComments],
    factory: ({db}, ctx) => {
        const postIds = db.getPostIds()

        <h1>Good morning, {session.name}!</h1>

        for (postId of postIds) {
            const newSupplies = index($postId.pack(postId))
            const PostAISummary = ctx($PostAISummary).assemble(newSupplies).unpack() 
            const Post = ctx($Post).assemble(newSupplies).unpack() 
            const PostTopComments = ctx($PostTopComments).assemble(newSupplies).unpack()

            return <div>
                <PostAISummary/>
                <Post />
                <PostTopComments/>
            </div>
        }
    }
})
```

This is not efficient, as the assemble() context needs to be built three times independently. A better way is to use `hire()`

```tsx
const $Feed = market.add("Feed").product({
    suppliers: [$db, $session],
    assemblers: [$PostAISummary, $Post, $PostTopComments],
    factory: ({db}, ctx) => {
        const postIds = db.getPostIds()

        <h1>Good morning, {session.name}!</h1>

        for (postId of postIds) {
            const PostSupply = ctx($Post)
                //No need to wrap suppliers in ctx here, since the hire method itself is contextualized
                //But it won't break if you do.
                .hire($PostAISummary, $PostTopComments)
                .assemble(index(
                    $postId.pack(postId)
                    // + Other supplies required by any of the suppliers in the hired list.
                    // The assemble() call is type-safe and will ensure all necessary
                    // dependencies for all listed assemblers are provided.
                )).unpack()

            const Post = PostSupply.unpack()
            // Since they were assembled together, PostAISummary and PostTopComments
            // are available in Post's dependencies even
            // if Post does not need them in their factory.
            const PostAISummary = PostSupply.deps.PostAISummary
            const PostTopComments = PostSupply.deps.PostTopComments

            return <div>
                <PostAISummary/>
                <Post />
                <PostTopComments/>
            </div>
        }
    }
})
```
