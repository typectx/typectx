---
title: "How I discovered TypeArch"
description: This is my first post on Docusaurus.
slug: how-i-discovered-typearch
authors:
    - name: Felix Dube
      title: Creator of TypeArch
      url: https://github.com/someone635
      socials:
          github: someone635
tags: []
image: https://i.imgur.com/mErPwqL.png
hide_table_of_contents: false
---

<!-- truncate -->

If you've ever built a TS application, you've surely faced this problem. To ensure type-safety across your functions, you need to give type-hints to your function arguments. Typescript is smart enough to infer the return type of your function based on those type-hinted arguments. But what happens when the output of one function becomes the input of another? Even if the return type is inferred, for type-safety, you need to explicitely type the next function's arguments. But what if the return type of your first function is unwieldly complex? You could just bite the bullet and define your return types explicitely. Or, most probably, you've found the following trick to preserve inference:

function(a: ReturnType<typeof A>, b: ReturnType<typeof B>)

This is nice, but it can put a lot of strain on the Typescript compiler, and slow down your editor. But the solution is just to define intermediate types to give pit stops to the Typescript inference process:

type A = ReturnType<typeof A>

So far so good. That's what I used to build a complex React application, with deeply nested components, and I loved the full type safety and inference I got from this trick. But that made me dependent on Typescript's type inference. And then catastrophe struck.

# Forced to rediscover DI

I knew my React app would benefit greatly from SSR, but I was postponing the refactoring it would require. But then Server Components got released, and I couldn't wait to try them out! So I started refactoring, but soon realized I was using React Context a lot, and React Context is not supported in Server Components. What the React team suggests in that situation is to either use DI, or to simply prop-drill, that prop-drilling isn't so bad after all...

I didn't want to prop-drill at first, knowing my app had deeply nested components which sometimes would require me to prop-drill 7 or 8 layers deep. But I looked at existing type-safe DI containers for Typescript, and realized if I switched to DI, I would have to explicitely type the container, which in turn would force me to type all my functions that until then I simply let Typescript infer. The prop-drilling refactoring was easier, so I went for that. I rewrote my ServerComponents to take in a ctx prop like so:

const ServerComponent = ({ctx: Ctx, ...props: Props}) => return "some jsx"

I also refactored my backend server code (like data fetching functions) to use the ctx object instead of individual args. Which, having just looked at DI containers, made me think to use the ctx prop as a way to inject function dependencies so that I could easily unit test my components and backend functions later. I thought since I'm manually wiring my dependencies via prop-drilling instead of using a DI container for auto-wiring, I can still preserve the full type inference on which I depend. Or so I thought...

So after a week or two of refactoring, all that was left was to build the ctx object that all my functions would receive. This is what my code looked like, over-simplified:

const fnA = (ctx: Ctx) => "A"
const fnB = (ctx: Ctx) => "B"
...other fns...
const ctx = {
user: someUser,
other_data: some_other_data,
fnA,
fnB
}

type Ctx = typeof ctx

... Then I can call any function like const res = fnA(ctx)

But Typescript didn't like this, it threw the error:

'ctx' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.(7022)

I had no idea what the source of the error was. Keep in mind I had maybe 30 to 40 functions in that ctx object, and I know Typescript can throw this error for a lot of reasons like an invalid recursive type somewhere, or a missed circular dependency. So I initially thought I just had a small error to find somewhere in my codebase that would resolve the issue. So I searched, I searched, I simplified my code again and again to try to isolate the problem, but the error kept showing up whatever I tried. Then, I posited that I had just reached the limits of Typescript inference, so I tried to simplify my code even more, and maybe give TS some explicit type hints here and there. But to no avail... I had something fundamentally wrong...

The problem: even if the runtime of the code above works just fine, Typescript cannot infer the types. Because to know the type of ctx, TS needs to know the type of fnA and fnB, but to know the type of fnA and B, it needs to know the type of ctx...

So I had just done an entire refactoring form React Context to props-drilling in order to preserve my app's full type inference, just to find out I couldn't preserve my app's full type inference... I would have to type everything explicitely no matter what...

But I felt so close, I had the intuition I could preserve full type-inference, and I couldn't resign myself to spend two weeks exclusively writing type definitions, so I kept trying different refactoring ideas, to no avail. It would be shameful to reveal how much time I spent refactoring all my functions just to find out I still had circular types in the end... But everytime I refactored all my functions, my codebase got much simpler, so all that time wasn't just lost. In retrospect, the solution seems very obvious...

You see, I was using Typescript inference a lot, but I wasn't too sure about how it really worked under the hood. To be fair, Typescript docs don't talk about the gnitty-gritty details of inference that much. The way it is explained in the docs almost feels non-deterministic... Typescript just tries to "guess" the types, and if it fails, it errors, or uses default values. Ok... but I would like to know a bit more about what algorithm it uses to "guess" :P So for errors like the above, I just try stuff until it works. After a lot of failed attempts, I tried this simple thing:

const ctx = {
user: someUser,
other_data: some_other_data,
()=>fnA,
()=>fnB
}

And the error went away... Sure, that changed my ctx object's API, meaning I would have to refactor all my functions again :P But at least, I had access to everything I needed in my ctx object in a fully type-inferred way.

The reason it works is because the new lambda function's scope forces Typescript inference to "stop and ponder", in a way, which breaks up the circular type definitions.

Now, when I first created my ctx object, I naively really wanted to do this:

const ctx = {
user: someUser,
other_data: some_other_data,
fnA(ctx),
fnB(ctx)
}

That way, I wouldn't have to prop-drill the ctx object anymore! But for sure, both JS and TS complain here that ctx is not yet defined... So I was sure, when I tried the following, that it wouldn't work either:

const ctx = {
user: someUser,
other_data: some_other_data,
()=>fnA(ctx),
()=>fnB(ctx)
}

But to my biggest surprise, it worked! But why? ctx is not yet defined, I'm not even done assigning it to the variable!!! But JS is clever enough, even if the assignment is not complete, the variable exists in memory, and its reference can be passed via closure to the lambda functions' scope, and at the point the lambda will be called, the ctx var will be fully assigned. So it worked, I could remove the ctx prop-drilling everywhere!

Wait... I can remove prop-drilling? This means I have implemented DI? And then it clicked. My weird, lazy, self-referential context object looks similar to awilix's Proxy object, which awilix uses for its dependency injection system. Awilix was the typescript DI framework I liked the most and felt was the most intuitive of the bunch, so I have to thank the creator for the inspiration here, as without the comparison here, i don't think it would have clicked in me that this was DI.

But yes, it is a DI container! A naked, frameworkless DI container in its purest form. And, sorry for being emotional here, but I find it beautiful in its simplicity. Maybe I'm just dumb, maybe people who use DI know it's based on this pattern, but I was just using DI without really knowing how it worked under the hood, and I hated how "magical" it felt. But now, I can just look at the pattern above, and I just understand intuitively how it works.

Looking at the main Typescript DI frameworks on the market, like awilix, inversify, tssyringe, typed-inject, typeDI, etc, I don't think this pattern is common knowledge however. Because most of them need to introduce a complex construct to achieve auto-wiring in their DI system: Proxy objects, decorators, annotations, reflect-metadata, compiler parsing of function arguments, etc. And these complex constructs, except maybe decorators, don't play nicely with Typescript's inference system.

But my ctx object is auto-wired out of the box. I can just add data and services to it, and they are automatically injected in all the other services of the object, no matter in which order they are defined.

# Mimicking React Context

---

So instead, I looked at existing DI containers for typescript, but none really satisfied. First, I disliked the complex constructs (classes, decorators, annotations, reflect-metadata, Proxy objects, compilation steps, etc...) introduced by those containers to achieve a feature I didn't really care about: auto-wiring. I didn't mind assembling by myself the ctx object at the entry-point of my app, it was still a big win compared to props-drilling. But most importantly, the constructs introduced by those containers destroyed the full type inference my app relied upon! To achieve type-safety, I would need to type the container explicitely, but the container contains all my functions, so I would be forced to type all my functions explicitely, which I had avoided since then via type inference. And since my app had A LOT of functions, that would require weeks of refactoring...

So I decided to prop-drill,

I told myself: why can't I just use a higher-order function to "inject" a context object in my Server Components, something like:

const Component = (ctx: Ctx) => (props: Props) => return ...some jsx

I soon discovered this was the intuition behind DI, so I explored existing type-safe typescript DI containers. But none really satisfied me. First, I disliked the complex constructs (classes, decorators, annotations, reflect-metadata, Proxy objects, compilation steps, etc...) introduced by those containers to achieve a feature I didn't really care about: auto-wiring. I didn't mind assembling by myself the ctx object at the entry-point of my app, it was still a big win compared to props-drilling. But most importantly, the constructs introduced by those containers destroyed the full type inference my app relied upon! To achieve type-safety, I would need to type the container explicitely, but the container contains all my functions, so I would be forced to type all my functions explicitely, which I had avoided since then via type inference. And since my app had A LOT of functions, that would require weeks of refactoring...

So I embrassed "Poor Man's DI", refactored my functions to take in a ctx object, which took a while, and then tried to manually wire the ctx container at the entry point of my app, something like:

const ctx = {
A:
}

Which led to an unexpected Typescript error:

ctx implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.

The free market has decoupled society, to great results. And now, it can also decouple your typescript application!
