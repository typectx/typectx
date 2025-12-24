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
const $$d11 = market2.offer("d11").asProduct({
    suppliers: [$$d9, $$d10],
    factory: ($) => $($$d9).unpack() + $($$d10).unpack() + 1
})
const $$d12 = market2.offer("d12").asProduct({
    suppliers: [$$d10, $$d11],
    factory: ($) => $($$d10).unpack() + $($$d11).unpack() + 1
})
const $$d13 = market2.offer("d13").asProduct({
    suppliers: [$$d11, $$d12],
    factory: ($) => $($$d11).unpack() + $($$d12).unpack() + 1
})
const $$d14 = market2.offer("d14").asProduct({
    suppliers: [$$d12, $$d13],
    factory: ($) => $($$d12).unpack() + $($$d13).unpack() + 1
})
const $$d15 = market2.offer("d15").asProduct({
    suppliers: [$$d13, $$d14],
    factory: ($) => $($$d13).unpack() + $($$d14).unpack() + 1
})
const $$d16 = market2.offer("d16").asProduct({
    suppliers: [$$d14, $$d15],
    factory: ($) => $($$d14).unpack() + $($$d15).unpack() + 1
})
const $$d17 = market2.offer("d17").asProduct({
    suppliers: [$$d15, $$d16],
    factory: ($) => $($$d15).unpack() + $($$d16).unpack() + 1
})
const $$d18 = market2.offer("d18").asProduct({
    suppliers: [$$d16, $$d17],
    factory: ($) => $($$d16).unpack() + $($$d17).unpack() + 1
})
const $$d19 = market2.offer("d19").asProduct({
    suppliers: [$$d17, $$d18],
    factory: ($) => $($$d17).unpack() + $($$d18).unpack() + 1
})
const $$d20 = market2.offer("d20").asProduct({
    suppliers: [$$d18, $$d19],
    factory: ($) => $($$d18).unpack() + $($$d19).unpack() + 1
})
const $$d21 = market2.offer("d21").asProduct({
    suppliers: [$$d19, $$d20],
    factory: ($) => $($$d19).unpack() + $($$d20).unpack() + 1
})
const $$d22 = market2.offer("d22").asProduct({
    suppliers: [$$d20, $$d21],
    factory: ($) => $($$d20).unpack() + $($$d21).unpack() + 1
})
const $$d23 = market2.offer("d23").asProduct({
    suppliers: [$$d21, $$d22],
    factory: ($) => $($$d21).unpack() + $($$d22).unpack() + 1
})
const $$d24 = market2.offer("d24").asProduct({
    suppliers: [$$d22, $$d23],
    factory: ($) => $($$d22).unpack() + $($$d23).unpack() + 1
})
const $$d25 = market2.offer("d25").asProduct({
    suppliers: [$$d23, $$d24],
    factory: ($) => $($$d23).unpack() + $($$d24).unpack() + 1
})
const $$d26 = market2.offer("d26").asProduct({
    suppliers: [$$d24, $$d25],
    factory: ($) => $($$d24).unpack() + $($$d25).unpack() + 1
})
const $$d27 = market2.offer("d27").asProduct({
    suppliers: [$$d25, $$d26],
    factory: ($) => $($$d25).unpack() + $($$d26).unpack() + 1
})
const $$d28 = market2.offer("d28").asProduct({
    suppliers: [$$d26, $$d27],
    factory: ($) => $($$d26).unpack() + $($$d27).unpack() + 1
})
const $$d29 = market2.offer("d29").asProduct({
    suppliers: [$$d27, $$d28],
    factory: ($) => $($$d27).unpack() + $($$d28).unpack() + 1
})
const $$d30 = market2.offer("d30").asProduct({
    suppliers: [$$d28, $$d29],
    factory: ($) => $($$d28).unpack() + $($$d29).unpack() + 1
})

// Test the 2-dependency chain up to d30
const result = $$d30.assemble({})

// If we get here without type error, the depth is OK
console.log("Result 2-deps d30:", result.unpack())
