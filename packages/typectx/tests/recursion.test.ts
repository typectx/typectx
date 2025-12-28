import { describe, it, expectTypeOf, expect } from "vitest"
import { createMarket } from "#index"
import type { Product, ProductSupplier } from "#types"

describe("Deep Recursion Type Tests", () => {
    it("should handle deep linear dependency chains without type errors", () => {
        const market = createMarket()

        // Linear chain: each supplier depends on exactly ONE previous supplier
        // 51 suppliers proves we're using the 1000 recursion limit, not the 50 limit
        const $s1 = market.offer("s1").asProduct({ factory: () => 0 })
        const $s2 = market.offer("s2").asProduct({
            suppliers: [$s1],
            factory: () => 0
        })
        const $s3 = market.offer("s3").asProduct({
            suppliers: [$s2],
            factory: () => 0
        })
        const $s4 = market.offer("s4").asProduct({
            suppliers: [$s3],
            factory: () => 0
        })
        const $s5 = market.offer("s5").asProduct({
            suppliers: [$s4],
            factory: () => 0
        })
        const $s6 = market.offer("s6").asProduct({
            suppliers: [$s5],
            factory: () => 0
        })
        const $s7 = market.offer("s7").asProduct({
            suppliers: [$s6],
            factory: () => 0
        })
        const $s8 = market.offer("s8").asProduct({
            suppliers: [$s7],
            factory: () => 0
        })
        const $s9 = market.offer("s9").asProduct({
            suppliers: [$s8],
            factory: () => 0
        })
        const $s10 = market.offer("s10").asProduct({
            suppliers: [$s9],
            factory: () => 0
        })
        const $s11 = market.offer("s11").asProduct({
            suppliers: [$s10],
            factory: () => 0
        })
        const $s12 = market.offer("s12").asProduct({
            suppliers: [$s11],
            factory: () => 0
        })
        const $s13 = market.offer("s13").asProduct({
            suppliers: [$s12],
            factory: () => 0
        })
        const $s14 = market.offer("s14").asProduct({
            suppliers: [$s13],
            factory: () => 0
        })
        const $s15 = market.offer("s15").asProduct({
            suppliers: [$s14],
            factory: () => 0
        })
        const $s16 = market.offer("s16").asProduct({
            suppliers: [$s15],
            factory: () => 0
        })
        const $s17 = market.offer("s17").asProduct({
            suppliers: [$s16],
            factory: () => 0
        })
        const $s18 = market.offer("s18").asProduct({
            suppliers: [$s17],
            factory: () => 0
        })
        const $s19 = market.offer("s19").asProduct({
            suppliers: [$s18],
            factory: () => 0
        })
        const $s20 = market.offer("s20").asProduct({
            suppliers: [$s19],
            factory: () => 0
        })
        const $s21 = market.offer("s21").asProduct({
            suppliers: [$s20],
            factory: () => 0
        })
        const $s22 = market.offer("s22").asProduct({
            suppliers: [$s21],
            factory: () => 0
        })
        const $s23 = market.offer("s23").asProduct({
            suppliers: [$s22],
            factory: () => 0
        })
        const $s24 = market.offer("s24").asProduct({
            suppliers: [$s23],
            factory: () => 0
        })
        const $s25 = market.offer("s25").asProduct({
            suppliers: [$s24],
            factory: () => 0
        })
        const $s26 = market.offer("s26").asProduct({
            suppliers: [$s25],
            factory: () => 0
        })
        const $s27 = market.offer("s27").asProduct({
            suppliers: [$s26],
            factory: () => 0
        })
        const $s28 = market.offer("s28").asProduct({
            suppliers: [$s27],
            factory: () => 0
        })
        const $s29 = market.offer("s29").asProduct({
            suppliers: [$s28],
            factory: () => 0
        })
        const $s30 = market.offer("s30").asProduct({
            suppliers: [$s29],
            factory: () => 0
        })
        const $s31 = market.offer("s31").asProduct({
            suppliers: [$s30],
            factory: () => 0
        })
        const $s32 = market.offer("s32").asProduct({
            suppliers: [$s31],
            factory: () => 0
        })
        const $s33 = market.offer("s33").asProduct({
            suppliers: [$s32],
            factory: () => 0
        })
        const $s34 = market.offer("s34").asProduct({
            suppliers: [$s33],
            factory: () => 0
        })
        const $s35 = market.offer("s35").asProduct({
            suppliers: [$s34],
            factory: () => 0
        })
        const $s36 = market.offer("s36").asProduct({
            suppliers: [$s35],
            factory: () => 0
        })
        const $s37 = market.offer("s37").asProduct({
            suppliers: [$s36],
            factory: () => 0
        })
        const $s38 = market.offer("s38").asProduct({
            suppliers: [$s37],
            factory: () => 0
        })
        const $s39 = market.offer("s39").asProduct({
            suppliers: [$s38],
            factory: () => 0
        })
        const $s40 = market.offer("s40").asProduct({
            suppliers: [$s39],
            factory: () => 0
        })
        const $s41 = market.offer("s41").asProduct({
            suppliers: [$s40],
            factory: () => 0
        })
        const $s42 = market.offer("s42").asProduct({
            suppliers: [$s41],
            factory: () => 0
        })
        const $s43 = market.offer("s43").asProduct({
            suppliers: [$s42],
            factory: () => 0
        })
        const $s44 = market.offer("s44").asProduct({
            suppliers: [$s43],
            factory: () => 0
        })
        const $s45 = market.offer("s45").asProduct({
            suppliers: [$s44],
            factory: () => 0
        })
        const $s46 = market.offer("s46").asProduct({
            suppliers: [$s45],
            factory: () => 0
        })
        const $s47 = market.offer("s47").asProduct({
            suppliers: [$s46],
            factory: () => 0
        })
        const $s48 = market.offer("s48").asProduct({
            suppliers: [$s47],
            factory: () => 0
        })
        const $s49 = market.offer("s49").asProduct({
            suppliers: [$s48],
            factory: () => 0
        })
        const $s50 = market.offer("s50").asProduct({
            suppliers: [$s49],
            factory: () => 0
        })
        const $s51 = market.offer("s51").asProduct({
            suppliers: [$s50],
            factory: () => 0
        })

        // Assemble the final product - this should compile without type errors
        // 51 suppliers proves we're using the 1000 recursion limit, not the 50 limit
        const resultProduct = $s51.assemble({})

        // Verify the type is correct
        expectTypeOf(resultProduct).toExtend<Product<number, ProductSupplier>>()
        expectTypeOf(resultProduct.unpack).toBeFunction()

        // Runtime check to ensure it works
        expect(resultProduct.unpack()).toBe(0)
    })
})
