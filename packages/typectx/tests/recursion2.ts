import { createMarket } from "#index"

// ============================================
// 2-dependency chain: each supplier depends on TWO previous suppliers
// ============================================
const market2 = createMarket()

const $$d1 = market2.offer("d1").asProduct({ factory: ($) => 1 })
const $$d2 = market2.offer("d2").asProduct({
    suppliers: [$$d1],
    factory: ($) => $($$d1).unpack() + 1
})
const $$d3 = market2.offer("d3").asProduct({
    suppliers: [$$d1, $$d2],
    factory: ($) => $($$d1).unpack() + $($$d2).unpack() + 1
})
const $$d4 = market2.offer("d4").asProduct({
    suppliers: [$$d2, $$d3],
    factory: ($) => $($$d2).unpack() + $($$d3).unpack() + 1
})
const $$d5 = market2.offer("d5").asProduct({
    suppliers: [$$d3, $$d4],
    factory: ($) => $($$d3).unpack() + $($$d4).unpack() + 1
})
const $$d6 = market2.offer("d6").asProduct({
    suppliers: [$$d4, $$d5],
    factory: ($) => $($$d4).unpack() + $($$d5).unpack() + 1
})
const $$d7 = market2.offer("d7").asProduct({
    suppliers: [$$d5, $$d6],
    factory: ($) => $($$d5).unpack() + $($$d6).unpack() + 1
})

const $$d8 = market2.offer("d8").asProduct({
    suppliers: [$$d6, $$d7],
    factory: ($) => $($$d6).unpack() + $($$d7).unpack() + 1
})
const $$d9 = market2.offer("d9").asProduct({
    suppliers: [$$d7, $$d8],
    factory: ($) => $($$d7).unpack() + $($$d8).unpack() + 1
})

const $$d10 = market2.offer("d10").asProduct({
    suppliers: [$$d8, $$d9],
    factory: ($) => $($$d8).unpack() + $($$d9).unpack() + 1
})

// Test the 2-dependency chain
// When tested incrementally (d7, then d8, then d9), d8 and d9 work!
// But d8 alone fails - TypeScript benefits from incremental type checking
const result = $$d7.assemble({})
const result2 = $$d8.assemble({})
const result3 = $$d9.assemble({})
const result4 = $$d10.assemble({}) // This fails even incrementally

// If we get here without type error, the depth is OK
console.log(
    "Result 2-deps:",
    result.unpack(),
    result2.unpack(),
    result3.unpack()
)
