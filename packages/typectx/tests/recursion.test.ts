import { describe, it, expectTypeOf, expect } from "vitest"
import { createMarket } from "#index"
import type { Supply, StaticSupplier } from "#types"

describe("Deep Recursion Type Tests", () => {
    it("should handle deep linear dependency chains without type errors", () => {
        const market = createMarket()

        // Linear chain: each supplier depends on exactly ONE previous supplier
        // 51 suppliers proves we're using the 1000 recursion limit, not the 50 limit
        const $s1 = market.add("s1").static({ factory: () => 0 })
        const $s2 = market.add("s2").static({
            suppliers: [$s1],
            factory: () => 0
        })
        const $s3 = market.add("s3").static({
            suppliers: [$s2],
            factory: () => 0
        })
        const $s4 = market.add("s4").static({
            suppliers: [$s3],
            factory: () => 0
        })
        const $s5 = market.add("s5").static({
            suppliers: [$s4],
            factory: () => 0
        })
        const $s6 = market.add("s6").static({
            suppliers: [$s5],
            factory: () => 0
        })
        const $s7 = market.add("s7").static({
            suppliers: [$s6],
            factory: () => 0
        })
        const $s8 = market.add("s8").static({
            suppliers: [$s7],
            factory: () => 0
        })
        const $s9 = market.add("s9").static({
            suppliers: [$s8],
            factory: () => 0
        })
        const $s10 = market.add("s10").static({
            suppliers: [$s9],
            factory: () => 0
        })
        const $s11 = market.add("s11").static({
            suppliers: [$s10],
            factory: () => 0
        })
        const $s12 = market.add("s12").static({
            suppliers: [$s11],
            factory: () => 0
        })
        const $s13 = market.add("s13").static({
            suppliers: [$s12],
            factory: () => 0
        })
        const $s14 = market.add("s14").static({
            suppliers: [$s13],
            factory: () => 0
        })
        const $s15 = market.add("s15").static({
            suppliers: [$s14],
            factory: () => 0
        })
        const $s16 = market.add("s16").static({
            suppliers: [$s15],
            factory: () => 0
        })
        const $s17 = market.add("s17").static({
            suppliers: [$s16],
            factory: () => 0
        })
        const $s18 = market.add("s18").static({
            suppliers: [$s17],
            factory: () => 0
        })
        const $s19 = market.add("s19").static({
            suppliers: [$s18],
            factory: () => 0
        })
        const $s20 = market.add("s20").static({
            suppliers: [$s19],
            factory: () => 0
        })
        const $s21 = market.add("s21").static({
            suppliers: [$s20],
            factory: () => 0
        })
        const $s22 = market.add("s22").static({
            suppliers: [$s21],
            factory: () => 0
        })
        const $s23 = market.add("s23").static({
            suppliers: [$s22],
            factory: () => 0
        })
        const $s24 = market.add("s24").static({
            suppliers: [$s23],
            factory: () => 0
        })
        const $s25 = market.add("s25").static({
            suppliers: [$s24],
            factory: () => 0
        })
        const $s26 = market.add("s26").static({
            suppliers: [$s25],
            factory: () => 0
        })
        const $s27 = market.add("s27").static({
            suppliers: [$s26],
            factory: () => 0
        })
        const $s28 = market.add("s28").static({
            suppliers: [$s27],
            factory: () => 0
        })
        const $s29 = market.add("s29").static({
            suppliers: [$s28],
            factory: () => 0
        })
        const $s30 = market.add("s30").static({
            suppliers: [$s29],
            factory: () => 0
        })
        const $s31 = market.add("s31").static({
            suppliers: [$s30],
            factory: () => 0
        })
        const $s32 = market.add("s32").static({
            suppliers: [$s31],
            factory: () => 0
        })
        const $s33 = market.add("s33").static({
            suppliers: [$s32],
            factory: () => 0
        })
        const $s34 = market.add("s34").static({
            suppliers: [$s33],
            factory: () => 0
        })
        const $s35 = market.add("s35").static({
            suppliers: [$s34],
            factory: () => 0
        })
        const $s36 = market.add("s36").static({
            suppliers: [$s35],
            factory: () => 0
        })
        const $s37 = market.add("s37").static({
            suppliers: [$s36],
            factory: () => 0
        })
        const $s38 = market.add("s38").static({
            suppliers: [$s37],
            factory: () => 0
        })
        const $s39 = market.add("s39").static({
            suppliers: [$s38],
            factory: () => 0
        })
        const $s40 = market.add("s40").static({
            suppliers: [$s39],
            factory: () => 0
        })
        const $s41 = market.add("s41").static({
            suppliers: [$s40],
            factory: () => 0
        })
        const $s42 = market.add("s42").static({
            suppliers: [$s41],
            factory: () => 0
        })
        const $s43 = market.add("s43").static({
            suppliers: [$s42],
            factory: () => 0
        })
        const $s44 = market.add("s44").static({
            suppliers: [$s43],
            factory: () => 0
        })
        const $s45 = market.add("s45").static({
            suppliers: [$s44],
            factory: () => 0
        })
        const $s46 = market.add("s46").static({
            suppliers: [$s45],
            factory: () => 0
        })
        const $s47 = market.add("s47").static({
            suppliers: [$s46],
            factory: () => 0
        })
        const $s48 = market.add("s48").static({
            suppliers: [$s47],
            factory: () => 0
        })
        const $s49 = market.add("s49").static({
            suppliers: [$s48],
            factory: () => 0
        })
        const $s50 = market.add("s50").static({
            suppliers: [$s49],
            factory: () => 0
        })
        const $s51 = market.add("s51").static({
            suppliers: [$s50],
            factory: () => 0
        })

        // Assemble the final product - this should compile without type errors
        // 51 suppliers proves we're using the 1000 recursion limit, not the 50 limit
        const resultProduct = $s51.assemble({})

        // Verify the type is correct
        expectTypeOf(resultProduct).toExtend<Supply<number, StaticSupplier>>()
        expectTypeOf(resultProduct.unpack).toBeFunction()

        // Runtime check to ensure it works
        expect(resultProduct.unpack()).toBe(0)
    })

    it("should handle wide dependency trees (20 suppliers per level). Tested out to 50 layers to check if breadth, not just depth, affects the recursion limit.", () => {
        const market = createMarket()

        // This test checks if the number of suppliers per level affects the recursion limit.
        // Each supplier depends on 20 others, so FilterSuppliers processes 20 elements recursively.
        // If nested FilterSuppliers recursion counts towards the 1000 limit, we'll hit it sooner
        // with wide trees than with deep linear chains.
        //
        // To find the exact limit: Keep adding layers (copy the pattern below) until TypeScript
        // reports a recursion limit error. The number of layers that work tells us the limit.
        // Currently testing with 3 layers. If this compiles, try adding more layers.

        // Create 20 base suppliers with no dependencies
        const $base1 = market.add("base1").static({ factory: () => 1 })
        const $base2 = market.add("base2").static({ factory: () => 2 })
        const $base3 = market.add("base3").static({ factory: () => 3 })
        const $base4 = market.add("base4").static({ factory: () => 4 })
        const $base5 = market.add("base5").static({ factory: () => 5 })
        const $base6 = market.add("base6").static({ factory: () => 6 })
        const $base7 = market.add("base7").static({ factory: () => 7 })
        const $base8 = market.add("base8").static({ factory: () => 8 })
        const $base9 = market.add("base9").static({ factory: () => 9 })
        const $base10 = market.add("base10").static({ factory: () => 10 })
        const $base11 = market.add("base11").static({ factory: () => 11 })
        const $base12 = market.add("base12").static({ factory: () => 12 })
        const $base13 = market.add("base13").static({ factory: () => 13 })
        const $base14 = market.add("base14").static({ factory: () => 14 })
        const $base15 = market.add("base15").static({ factory: () => 15 })
        const $base16 = market.add("base16").static({ factory: () => 16 })
        const $base17 = market.add("base17").static({ factory: () => 17 })
        const $base18 = market.add("base18").static({ factory: () => 18 })
        const $base19 = market.add("base19").static({ factory: () => 19 })
        const $base20 = market.add("base20").static({ factory: () => 20 })

        const baseSuppliers = [
            $base1,
            $base2,
            $base3,
            $base4,
            $base5,
            $base6,
            $base7,
            $base8,
            $base9,
            $base10,
            $base11,
            $base12,
            $base13,
            $base14,
            $base15,
            $base16,
            $base17,
            $base18,
            $base19,
            $base20
        ]

        // Create suppliers that depend on all 20 base suppliers
        // Each supplier depends on 20 others, so FilterSuppliers will process 20 elements
        // This tests if nested FilterSuppliers recursion counts towards the limit
        // Start with a reasonable number of layers and increase until we find the limit

        // Layer 1: depends on base suppliers
        const $l1_1 = market
            .add("l1_1")
            .static({ suppliers: baseSuppliers, factory: () => 101 })
        const $l1_2 = market
            .add("l1_2")
            .static({ suppliers: baseSuppliers, factory: () => 102 })
        const $l1_3 = market
            .add("l1_3")
            .static({ suppliers: baseSuppliers, factory: () => 103 })
        const $l1_4 = market
            .add("l1_4")
            .static({ suppliers: baseSuppliers, factory: () => 104 })
        const $l1_5 = market
            .add("l1_5")
            .static({ suppliers: baseSuppliers, factory: () => 105 })
        const $l1_6 = market
            .add("l1_6")
            .static({ suppliers: baseSuppliers, factory: () => 106 })
        const $l1_7 = market
            .add("l1_7")
            .static({ suppliers: baseSuppliers, factory: () => 107 })
        const $l1_8 = market
            .add("l1_8")
            .static({ suppliers: baseSuppliers, factory: () => 108 })
        const $l1_9 = market
            .add("l1_9")
            .static({ suppliers: baseSuppliers, factory: () => 109 })
        const $l1_10 = market
            .add("l1_10")
            .static({ suppliers: baseSuppliers, factory: () => 110 })
        const $l1_11 = market
            .add("l1_11")
            .static({ suppliers: baseSuppliers, factory: () => 111 })
        const $l1_12 = market
            .add("l1_12")
            .static({ suppliers: baseSuppliers, factory: () => 112 })
        const $l1_13 = market
            .add("l1_13")
            .static({ suppliers: baseSuppliers, factory: () => 113 })
        const $l1_14 = market
            .add("l1_14")
            .static({ suppliers: baseSuppliers, factory: () => 114 })
        const $l1_15 = market
            .add("l1_15")
            .static({ suppliers: baseSuppliers, factory: () => 115 })
        const $l1_16 = market
            .add("l1_16")
            .static({ suppliers: baseSuppliers, factory: () => 116 })
        const $l1_17 = market
            .add("l1_17")
            .static({ suppliers: baseSuppliers, factory: () => 117 })
        const $l1_18 = market
            .add("l1_18")
            .static({ suppliers: baseSuppliers, factory: () => 118 })
        const $l1_19 = market
            .add("l1_19")
            .static({ suppliers: baseSuppliers, factory: () => 119 })
        const $l1_20 = market
            .add("l1_20")
            .static({ suppliers: baseSuppliers, factory: () => 120 })

        const layer1 = [
            $l1_1,
            $l1_2,
            $l1_3,
            $l1_4,
            $l1_5,
            $l1_6,
            $l1_7,
            $l1_8,
            $l1_9,
            $l1_10,
            $l1_11,
            $l1_12,
            $l1_13,
            $l1_14,
            $l1_15,
            $l1_16,
            $l1_17,
            $l1_18,
            $l1_19,
            $l1_20
        ]

        // Layer 2: depends on layer1 suppliers
        const $l2_1 = market
            .add("l2_1")
            .static({ suppliers: layer1, factory: () => 201 })
        const $l2_2 = market
            .add("l2_2")
            .static({ suppliers: layer1, factory: () => 202 })
        const $l2_3 = market
            .add("l2_3")
            .static({ suppliers: layer1, factory: () => 203 })
        const $l2_4 = market
            .add("l2_4")
            .static({ suppliers: layer1, factory: () => 204 })
        const $l2_5 = market
            .add("l2_5")
            .static({ suppliers: layer1, factory: () => 205 })
        const $l2_6 = market
            .add("l2_6")
            .static({ suppliers: layer1, factory: () => 206 })
        const $l2_7 = market
            .add("l2_7")
            .static({ suppliers: layer1, factory: () => 207 })
        const $l2_8 = market
            .add("l2_8")
            .static({ suppliers: layer1, factory: () => 208 })
        const $l2_9 = market
            .add("l2_9")
            .static({ suppliers: layer1, factory: () => 209 })
        const $l2_10 = market
            .add("l2_10")
            .static({ suppliers: layer1, factory: () => 210 })
        const $l2_11 = market
            .add("l2_11")
            .static({ suppliers: layer1, factory: () => 211 })
        const $l2_12 = market
            .add("l2_12")
            .static({ suppliers: layer1, factory: () => 212 })
        const $l2_13 = market
            .add("l2_13")
            .static({ suppliers: layer1, factory: () => 213 })
        const $l2_14 = market
            .add("l2_14")
            .static({ suppliers: layer1, factory: () => 214 })
        const $l2_15 = market
            .add("l2_15")
            .static({ suppliers: layer1, factory: () => 215 })
        const $l2_16 = market
            .add("l2_16")
            .static({ suppliers: layer1, factory: () => 216 })
        const $l2_17 = market
            .add("l2_17")
            .static({ suppliers: layer1, factory: () => 217 })
        const $l2_18 = market
            .add("l2_18")
            .static({ suppliers: layer1, factory: () => 218 })
        const $l2_19 = market
            .add("l2_19")
            .static({ suppliers: layer1, factory: () => 219 })
        const $l2_20 = market
            .add("l2_20")
            .static({ suppliers: layer1, factory: () => 220 })

        const layer2 = [
            $l2_1,
            $l2_2,
            $l2_3,
            $l2_4,
            $l2_5,
            $l2_6,
            $l2_7,
            $l2_8,
            $l2_9,
            $l2_10,
            $l2_11,
            $l2_12,
            $l2_13,
            $l2_14,
            $l2_15,
            $l2_16,
            $l2_17,
            $l2_18,
            $l2_19,
            $l2_20
        ]

        // Layer 3: depends on layer2 suppliers
        const $l3_1 = market
            .add("l3_1")
            .static({ suppliers: layer2, factory: () => 301 })
        const $l3_2 = market
            .add("l3_2")
            .static({ suppliers: layer2, factory: () => 302 })
        const $l3_3 = market
            .add("l3_3")
            .static({ suppliers: layer2, factory: () => 303 })
        const $l3_4 = market
            .add("l3_4")
            .static({ suppliers: layer2, factory: () => 304 })
        const $l3_5 = market
            .add("l3_5")
            .static({ suppliers: layer2, factory: () => 305 })
        const $l3_6 = market
            .add("l3_6")
            .static({ suppliers: layer2, factory: () => 306 })
        const $l3_7 = market
            .add("l3_7")
            .static({ suppliers: layer2, factory: () => 307 })
        const $l3_8 = market
            .add("l3_8")
            .static({ suppliers: layer2, factory: () => 308 })
        const $l3_9 = market
            .add("l3_9")
            .static({ suppliers: layer2, factory: () => 309 })
        const $l3_10 = market
            .add("l3_10")
            .static({ suppliers: layer2, factory: () => 310 })
        const $l3_11 = market
            .add("l3_11")
            .static({ suppliers: layer2, factory: () => 311 })
        const $l3_12 = market
            .add("l3_12")
            .static({ suppliers: layer2, factory: () => 312 })
        const $l3_13 = market
            .add("l3_13")
            .static({ suppliers: layer2, factory: () => 313 })
        const $l3_14 = market
            .add("l3_14")
            .static({ suppliers: layer2, factory: () => 314 })
        const $l3_15 = market
            .add("l3_15")
            .static({ suppliers: layer2, factory: () => 315 })
        const $l3_16 = market
            .add("l3_16")
            .static({ suppliers: layer2, factory: () => 316 })
        const $l3_17 = market
            .add("l3_17")
            .static({ suppliers: layer2, factory: () => 317 })
        const $l3_18 = market
            .add("l3_18")
            .static({ suppliers: layer2, factory: () => 318 })
        const $l3_19 = market
            .add("l3_19")
            .static({ suppliers: layer2, factory: () => 319 })
        const $l3_20 = market
            .add("l3_20")
            .static({ suppliers: layer2, factory: () => 320 })

        const layer3 = [
            $l3_1,
            $l3_2,
            $l3_3,
            $l3_4,
            $l3_5,
            $l3_6,
            $l3_7,
            $l3_8,
            $l3_9,
            $l3_10,
            $l3_11,
            $l3_12,
            $l3_13,
            $l3_14,
            $l3_15,
            $l3_16,
            $l3_17,
            $l3_18,
            $l3_19,
            $l3_20
        ]

        // Layer 4: depends on layer3 suppliers
        const $l4_1 = market
            .add("l4_1")
            .static({ suppliers: layer3, factory: () => 401 })
        const $l4_2 = market
            .add("l4_2")
            .static({ suppliers: layer3, factory: () => 402 })
        const $l4_3 = market
            .add("l4_3")
            .static({ suppliers: layer3, factory: () => 403 })
        const $l4_4 = market
            .add("l4_4")
            .static({ suppliers: layer3, factory: () => 404 })
        const $l4_5 = market
            .add("l4_5")
            .static({ suppliers: layer3, factory: () => 405 })
        const $l4_6 = market
            .add("l4_6")
            .static({ suppliers: layer3, factory: () => 406 })
        const $l4_7 = market
            .add("l4_7")
            .static({ suppliers: layer3, factory: () => 407 })
        const $l4_8 = market
            .add("l4_8")
            .static({ suppliers: layer3, factory: () => 408 })
        const $l4_9 = market
            .add("l4_9")
            .static({ suppliers: layer3, factory: () => 409 })
        const $l4_10 = market
            .add("l4_10")
            .static({ suppliers: layer3, factory: () => 410 })
        const $l4_11 = market
            .add("l4_11")
            .static({ suppliers: layer3, factory: () => 411 })
        const $l4_12 = market
            .add("l4_12")
            .static({ suppliers: layer3, factory: () => 412 })
        const $l4_13 = market
            .add("l4_13")
            .static({ suppliers: layer3, factory: () => 413 })
        const $l4_14 = market
            .add("l4_14")
            .static({ suppliers: layer3, factory: () => 414 })
        const $l4_15 = market
            .add("l4_15")
            .static({ suppliers: layer3, factory: () => 415 })
        const $l4_16 = market
            .add("l4_16")
            .static({ suppliers: layer3, factory: () => 416 })
        const $l4_17 = market
            .add("l4_17")
            .static({ suppliers: layer3, factory: () => 417 })
        const $l4_18 = market
            .add("l4_18")
            .static({ suppliers: layer3, factory: () => 418 })
        const $l4_19 = market
            .add("l4_19")
            .static({ suppliers: layer3, factory: () => 419 })
        const $l4_20 = market
            .add("l4_20")
            .static({ suppliers: layer3, factory: () => 420 })
        const layer4 = [
            $l4_1,
            $l4_2,
            $l4_3,
            $l4_4,
            $l4_5,
            $l4_6,
            $l4_7,
            $l4_8,
            $l4_9,
            $l4_10,
            $l4_11,
            $l4_12,
            $l4_13,
            $l4_14,
            $l4_15,
            $l4_16,
            $l4_17,
            $l4_18,
            $l4_19,
            $l4_20
        ]

        // Layer 5: depends on layer4 suppliers
        const $l5_1 = market
            .add("l5_1")
            .static({ suppliers: layer4, factory: () => 501 })
        const $l5_2 = market
            .add("l5_2")
            .static({ suppliers: layer4, factory: () => 502 })
        const $l5_3 = market
            .add("l5_3")
            .static({ suppliers: layer4, factory: () => 503 })
        const $l5_4 = market
            .add("l5_4")
            .static({ suppliers: layer4, factory: () => 504 })
        const $l5_5 = market
            .add("l5_5")
            .static({ suppliers: layer4, factory: () => 505 })
        const $l5_6 = market
            .add("l5_6")
            .static({ suppliers: layer4, factory: () => 506 })
        const $l5_7 = market
            .add("l5_7")
            .static({ suppliers: layer4, factory: () => 507 })
        const $l5_8 = market
            .add("l5_8")
            .static({ suppliers: layer4, factory: () => 508 })
        const $l5_9 = market
            .add("l5_9")
            .static({ suppliers: layer4, factory: () => 509 })
        const $l5_10 = market
            .add("l5_10")
            .static({ suppliers: layer4, factory: () => 510 })
        const $l5_11 = market
            .add("l5_11")
            .static({ suppliers: layer4, factory: () => 511 })
        const $l5_12 = market
            .add("l5_12")
            .static({ suppliers: layer4, factory: () => 512 })
        const $l5_13 = market
            .add("l5_13")
            .static({ suppliers: layer4, factory: () => 513 })
        const $l5_14 = market
            .add("l5_14")
            .static({ suppliers: layer4, factory: () => 514 })
        const $l5_15 = market
            .add("l5_15")
            .static({ suppliers: layer4, factory: () => 515 })
        const $l5_16 = market
            .add("l5_16")
            .static({ suppliers: layer4, factory: () => 516 })
        const $l5_17 = market
            .add("l5_17")
            .static({ suppliers: layer4, factory: () => 517 })
        const $l5_18 = market
            .add("l5_18")
            .static({ suppliers: layer4, factory: () => 518 })
        const $l5_19 = market
            .add("l5_19")
            .static({ suppliers: layer4, factory: () => 519 })
        const $l5_20 = market
            .add("l5_20")
            .static({ suppliers: layer4, factory: () => 520 })
        const layer5 = [
            $l5_1,
            $l5_2,
            $l5_3,
            $l5_4,
            $l5_5,
            $l5_6,
            $l5_7,
            $l5_8,
            $l5_9,
            $l5_10,
            $l5_11,
            $l5_12,
            $l5_13,
            $l5_14,
            $l5_15,
            $l5_16,
            $l5_17,
            $l5_18,
            $l5_19,
            $l5_20
        ]

        // Layer 6: depends on layer5 suppliers
        const $l6_1 = market
            .add("l6_1")
            .static({ suppliers: layer5, factory: () => 601 })
        const $l6_2 = market
            .add("l6_2")
            .static({ suppliers: layer5, factory: () => 602 })
        const $l6_3 = market
            .add("l6_3")
            .static({ suppliers: layer5, factory: () => 603 })
        const $l6_4 = market
            .add("l6_4")
            .static({ suppliers: layer5, factory: () => 604 })
        const $l6_5 = market
            .add("l6_5")
            .static({ suppliers: layer5, factory: () => 605 })
        const $l6_6 = market
            .add("l6_6")
            .static({ suppliers: layer5, factory: () => 606 })
        const $l6_7 = market
            .add("l6_7")
            .static({ suppliers: layer5, factory: () => 607 })
        const $l6_8 = market
            .add("l6_8")
            .static({ suppliers: layer5, factory: () => 608 })
        const $l6_9 = market
            .add("l6_9")
            .static({ suppliers: layer5, factory: () => 609 })
        const $l6_10 = market
            .add("l6_10")
            .static({ suppliers: layer5, factory: () => 610 })
        const $l6_11 = market
            .add("l6_11")
            .static({ suppliers: layer5, factory: () => 611 })
        const $l6_12 = market
            .add("l6_12")
            .static({ suppliers: layer5, factory: () => 612 })
        const $l6_13 = market
            .add("l6_13")
            .static({ suppliers: layer5, factory: () => 613 })
        const $l6_14 = market
            .add("l6_14")
            .static({ suppliers: layer5, factory: () => 614 })
        const $l6_15 = market
            .add("l6_15")
            .static({ suppliers: layer5, factory: () => 615 })
        const $l6_16 = market
            .add("l6_16")
            .static({ suppliers: layer5, factory: () => 616 })
        const $l6_17 = market
            .add("l6_17")
            .static({ suppliers: layer5, factory: () => 617 })
        const $l6_18 = market
            .add("l6_18")
            .static({ suppliers: layer5, factory: () => 618 })
        const $l6_19 = market
            .add("l6_19")
            .static({ suppliers: layer5, factory: () => 619 })
        const $l6_20 = market
            .add("l6_20")
            .static({ suppliers: layer5, factory: () => 620 })
        const layer6 = [
            $l6_1,
            $l6_2,
            $l6_3,
            $l6_4,
            $l6_5,
            $l6_6,
            $l6_7,
            $l6_8,
            $l6_9,
            $l6_10,
            $l6_11,
            $l6_12,
            $l6_13,
            $l6_14,
            $l6_15,
            $l6_16,
            $l6_17,
            $l6_18,
            $l6_19,
            $l6_20
        ]

        // Layer 7: depends on layer6 suppliers
        const $l7_1 = market
            .add("l7_1")
            .static({ suppliers: layer6, factory: () => 701 })
        const $l7_2 = market
            .add("l7_2")
            .static({ suppliers: layer6, factory: () => 702 })
        const $l7_3 = market
            .add("l7_3")
            .static({ suppliers: layer6, factory: () => 703 })
        const $l7_4 = market
            .add("l7_4")
            .static({ suppliers: layer6, factory: () => 704 })
        const $l7_5 = market
            .add("l7_5")
            .static({ suppliers: layer6, factory: () => 705 })
        const $l7_6 = market
            .add("l7_6")
            .static({ suppliers: layer6, factory: () => 706 })
        const $l7_7 = market
            .add("l7_7")
            .static({ suppliers: layer6, factory: () => 707 })
        const $l7_8 = market
            .add("l7_8")
            .static({ suppliers: layer6, factory: () => 708 })
        const $l7_9 = market
            .add("l7_9")
            .static({ suppliers: layer6, factory: () => 709 })
        const $l7_10 = market
            .add("l7_10")
            .static({ suppliers: layer6, factory: () => 710 })
        const $l7_11 = market
            .add("l7_11")
            .static({ suppliers: layer6, factory: () => 711 })
        const $l7_12 = market
            .add("l7_12")
            .static({ suppliers: layer6, factory: () => 712 })
        const $l7_13 = market
            .add("l7_13")
            .static({ suppliers: layer6, factory: () => 713 })
        const $l7_14 = market
            .add("l7_14")
            .static({ suppliers: layer6, factory: () => 714 })
        const $l7_15 = market
            .add("l7_15")
            .static({ suppliers: layer6, factory: () => 715 })
        const $l7_16 = market
            .add("l7_16")
            .static({ suppliers: layer6, factory: () => 716 })
        const $l7_17 = market
            .add("l7_17")
            .static({ suppliers: layer6, factory: () => 717 })
        const $l7_18 = market
            .add("l7_18")
            .static({ suppliers: layer6, factory: () => 718 })
        const $l7_19 = market
            .add("l7_19")
            .static({ suppliers: layer6, factory: () => 719 })
        const $l7_20 = market
            .add("l7_20")
            .static({ suppliers: layer6, factory: () => 720 })
        const layer7 = [
            $l7_1,
            $l7_2,
            $l7_3,
            $l7_4,
            $l7_5,
            $l7_6,
            $l7_7,
            $l7_8,
            $l7_9,
            $l7_10,
            $l7_11,
            $l7_12,
            $l7_13,
            $l7_14,
            $l7_15,
            $l7_16,
            $l7_17,
            $l7_18,
            $l7_19,
            $l7_20
        ]

        // Layer 8: depends on layer7 suppliers
        const $l8_1 = market
            .add("l8_1")
            .static({ suppliers: layer7, factory: () => 801 })
        const $l8_2 = market
            .add("l8_2")
            .static({ suppliers: layer7, factory: () => 802 })
        const $l8_3 = market
            .add("l8_3")
            .static({ suppliers: layer7, factory: () => 803 })
        const $l8_4 = market
            .add("l8_4")
            .static({ suppliers: layer7, factory: () => 804 })
        const $l8_5 = market
            .add("l8_5")
            .static({ suppliers: layer7, factory: () => 805 })
        const $l8_6 = market
            .add("l8_6")
            .static({ suppliers: layer7, factory: () => 806 })
        const $l8_7 = market
            .add("l8_7")
            .static({ suppliers: layer7, factory: () => 807 })
        const $l8_8 = market
            .add("l8_8")
            .static({ suppliers: layer7, factory: () => 808 })
        const $l8_9 = market
            .add("l8_9")
            .static({ suppliers: layer7, factory: () => 809 })
        const $l8_10 = market
            .add("l8_10")
            .static({ suppliers: layer7, factory: () => 810 })
        const $l8_11 = market
            .add("l8_11")
            .static({ suppliers: layer7, factory: () => 811 })
        const $l8_12 = market
            .add("l8_12")
            .static({ suppliers: layer7, factory: () => 812 })
        const $l8_13 = market
            .add("l8_13")
            .static({ suppliers: layer7, factory: () => 813 })
        const $l8_14 = market
            .add("l8_14")
            .static({ suppliers: layer7, factory: () => 814 })
        const $l8_15 = market
            .add("l8_15")
            .static({ suppliers: layer7, factory: () => 815 })
        const $l8_16 = market
            .add("l8_16")
            .static({ suppliers: layer7, factory: () => 816 })
        const $l8_17 = market
            .add("l8_17")
            .static({ suppliers: layer7, factory: () => 817 })
        const $l8_18 = market
            .add("l8_18")
            .static({ suppliers: layer7, factory: () => 818 })
        const $l8_19 = market
            .add("l8_19")
            .static({ suppliers: layer7, factory: () => 819 })
        const $l8_20 = market
            .add("l8_20")
            .static({ suppliers: layer7, factory: () => 820 })
        const layer8 = [
            $l8_1,
            $l8_2,
            $l8_3,
            $l8_4,
            $l8_5,
            $l8_6,
            $l8_7,
            $l8_8,
            $l8_9,
            $l8_10,
            $l8_11,
            $l8_12,
            $l8_13,
            $l8_14,
            $l8_15,
            $l8_16,
            $l8_17,
            $l8_18,
            $l8_19,
            $l8_20
        ]

        // Layer 9: depends on layer8 suppliers
        const $l9_1 = market
            .add("l9_1")
            .static({ suppliers: layer8, factory: () => 901 })
        const $l9_2 = market
            .add("l9_2")
            .static({ suppliers: layer8, factory: () => 902 })
        const $l9_3 = market
            .add("l9_3")
            .static({ suppliers: layer8, factory: () => 903 })
        const $l9_4 = market
            .add("l9_4")
            .static({ suppliers: layer8, factory: () => 904 })
        const $l9_5 = market
            .add("l9_5")
            .static({ suppliers: layer8, factory: () => 905 })
        const $l9_6 = market
            .add("l9_6")
            .static({ suppliers: layer8, factory: () => 906 })
        const $l9_7 = market
            .add("l9_7")
            .static({ suppliers: layer8, factory: () => 907 })
        const $l9_8 = market
            .add("l9_8")
            .static({ suppliers: layer8, factory: () => 908 })
        const $l9_9 = market
            .add("l9_9")
            .static({ suppliers: layer8, factory: () => 909 })
        const $l9_10 = market
            .add("l9_10")
            .static({ suppliers: layer8, factory: () => 910 })
        const $l9_11 = market
            .add("l9_11")
            .static({ suppliers: layer8, factory: () => 911 })
        const $l9_12 = market
            .add("l9_12")
            .static({ suppliers: layer8, factory: () => 912 })
        const $l9_13 = market
            .add("l9_13")
            .static({ suppliers: layer8, factory: () => 913 })
        const $l9_14 = market
            .add("l9_14")
            .static({ suppliers: layer8, factory: () => 914 })
        const $l9_15 = market
            .add("l9_15")
            .static({ suppliers: layer8, factory: () => 915 })
        const $l9_16 = market
            .add("l9_16")
            .static({ suppliers: layer8, factory: () => 916 })
        const $l9_17 = market
            .add("l9_17")
            .static({ suppliers: layer8, factory: () => 917 })
        const $l9_18 = market
            .add("l9_18")
            .static({ suppliers: layer8, factory: () => 918 })
        const $l9_19 = market
            .add("l9_19")
            .static({ suppliers: layer8, factory: () => 919 })
        const $l9_20 = market
            .add("l9_20")
            .static({ suppliers: layer8, factory: () => 920 })
        const layer9 = [
            $l9_1,
            $l9_2,
            $l9_3,
            $l9_4,
            $l9_5,
            $l9_6,
            $l9_7,
            $l9_8,
            $l9_9,
            $l9_10,
            $l9_11,
            $l9_12,
            $l9_13,
            $l9_14,
            $l9_15,
            $l9_16,
            $l9_17,
            $l9_18,
            $l9_19,
            $l9_20
        ]

        // Layer 10: depends on layer9 suppliers
        const $l10_1 = market
            .add("l10_1")
            .static({ suppliers: layer9, factory: () => 1001 })
        const $l10_2 = market
            .add("l10_2")
            .static({ suppliers: layer9, factory: () => 1002 })
        const $l10_3 = market
            .add("l10_3")
            .static({ suppliers: layer9, factory: () => 1003 })
        const $l10_4 = market
            .add("l10_4")
            .static({ suppliers: layer9, factory: () => 1004 })
        const $l10_5 = market
            .add("l10_5")
            .static({ suppliers: layer9, factory: () => 1005 })
        const $l10_6 = market
            .add("l10_6")
            .static({ suppliers: layer9, factory: () => 1006 })
        const $l10_7 = market
            .add("l10_7")
            .static({ suppliers: layer9, factory: () => 1007 })
        const $l10_8 = market
            .add("l10_8")
            .static({ suppliers: layer9, factory: () => 1008 })
        const $l10_9 = market
            .add("l10_9")
            .static({ suppliers: layer9, factory: () => 1009 })
        const $l10_10 = market
            .add("l10_10")
            .static({ suppliers: layer9, factory: () => 1010 })
        const $l10_11 = market
            .add("l10_11")
            .static({ suppliers: layer9, factory: () => 1011 })
        const $l10_12 = market
            .add("l10_12")
            .static({ suppliers: layer9, factory: () => 1012 })
        const $l10_13 = market
            .add("l10_13")
            .static({ suppliers: layer9, factory: () => 1013 })
        const $l10_14 = market
            .add("l10_14")
            .static({ suppliers: layer9, factory: () => 1014 })
        const $l10_15 = market
            .add("l10_15")
            .static({ suppliers: layer9, factory: () => 1015 })
        const $l10_16 = market
            .add("l10_16")
            .static({ suppliers: layer9, factory: () => 1016 })
        const $l10_17 = market
            .add("l10_17")
            .static({ suppliers: layer9, factory: () => 1017 })
        const $l10_18 = market
            .add("l10_18")
            .static({ suppliers: layer9, factory: () => 1018 })
        const $l10_19 = market
            .add("l10_19")
            .static({ suppliers: layer9, factory: () => 1019 })
        const $l10_20 = market
            .add("l10_20")
            .static({ suppliers: layer9, factory: () => 1020 })
        const layer10 = [
            $l10_1,
            $l10_2,
            $l10_3,
            $l10_4,
            $l10_5,
            $l10_6,
            $l10_7,
            $l10_8,
            $l10_9,
            $l10_10,
            $l10_11,
            $l10_12,
            $l10_13,
            $l10_14,
            $l10_15,
            $l10_16,
            $l10_17,
            $l10_18,
            $l10_19,
            $l10_20
        ]

        // Layer 11: depends on layer10 suppliers
        const $l11_1 = market
            .add("l11_1")
            .static({ suppliers: layer10, factory: () => 1101 })
        const $l11_2 = market
            .add("l11_2")
            .static({ suppliers: layer10, factory: () => 1102 })
        const $l11_3 = market
            .add("l11_3")
            .static({ suppliers: layer10, factory: () => 1103 })
        const $l11_4 = market
            .add("l11_4")
            .static({ suppliers: layer10, factory: () => 1104 })
        const $l11_5 = market
            .add("l11_5")
            .static({ suppliers: layer10, factory: () => 1105 })
        const $l11_6 = market
            .add("l11_6")
            .static({ suppliers: layer10, factory: () => 1106 })
        const $l11_7 = market
            .add("l11_7")
            .static({ suppliers: layer10, factory: () => 1107 })
        const $l11_8 = market
            .add("l11_8")
            .static({ suppliers: layer10, factory: () => 1108 })
        const $l11_9 = market
            .add("l11_9")
            .static({ suppliers: layer10, factory: () => 1109 })
        const $l11_10 = market
            .add("l11_10")
            .static({ suppliers: layer10, factory: () => 1110 })
        const $l11_11 = market
            .add("l11_11")
            .static({ suppliers: layer10, factory: () => 1111 })
        const $l11_12 = market
            .add("l11_12")
            .static({ suppliers: layer10, factory: () => 1112 })
        const $l11_13 = market
            .add("l11_13")
            .static({ suppliers: layer10, factory: () => 1113 })
        const $l11_14 = market
            .add("l11_14")
            .static({ suppliers: layer10, factory: () => 1114 })
        const $l11_15 = market
            .add("l11_15")
            .static({ suppliers: layer10, factory: () => 1115 })
        const $l11_16 = market
            .add("l11_16")
            .static({ suppliers: layer10, factory: () => 1116 })
        const $l11_17 = market
            .add("l11_17")
            .static({ suppliers: layer10, factory: () => 1117 })
        const $l11_18 = market
            .add("l11_18")
            .static({ suppliers: layer10, factory: () => 1118 })
        const $l11_19 = market
            .add("l11_19")
            .static({ suppliers: layer10, factory: () => 1119 })
        const $l11_20 = market
            .add("l11_20")
            .static({ suppliers: layer10, factory: () => 1120 })
        const layer11 = [
            $l11_1,
            $l11_2,
            $l11_3,
            $l11_4,
            $l11_5,
            $l11_6,
            $l11_7,
            $l11_8,
            $l11_9,
            $l11_10,
            $l11_11,
            $l11_12,
            $l11_13,
            $l11_14,
            $l11_15,
            $l11_16,
            $l11_17,
            $l11_18,
            $l11_19,
            $l11_20
        ]

        // Layer 12: depends on layer11 suppliers
        const $l12_1 = market
            .add("l12_1")
            .static({ suppliers: layer11, factory: () => 1201 })
        const $l12_2 = market
            .add("l12_2")
            .static({ suppliers: layer11, factory: () => 1202 })
        const $l12_3 = market
            .add("l12_3")
            .static({ suppliers: layer11, factory: () => 1203 })
        const $l12_4 = market
            .add("l12_4")
            .static({ suppliers: layer11, factory: () => 1204 })
        const $l12_5 = market
            .add("l12_5")
            .static({ suppliers: layer11, factory: () => 1205 })
        const $l12_6 = market
            .add("l12_6")
            .static({ suppliers: layer11, factory: () => 1206 })
        const $l12_7 = market
            .add("l12_7")
            .static({ suppliers: layer11, factory: () => 1207 })
        const $l12_8 = market
            .add("l12_8")
            .static({ suppliers: layer11, factory: () => 1208 })
        const $l12_9 = market
            .add("l12_9")
            .static({ suppliers: layer11, factory: () => 1209 })
        const $l12_10 = market
            .add("l12_10")
            .static({ suppliers: layer11, factory: () => 1210 })
        const $l12_11 = market
            .add("l12_11")
            .static({ suppliers: layer11, factory: () => 1211 })
        const $l12_12 = market
            .add("l12_12")
            .static({ suppliers: layer11, factory: () => 1212 })
        const $l12_13 = market
            .add("l12_13")
            .static({ suppliers: layer11, factory: () => 1213 })
        const $l12_14 = market
            .add("l12_14")
            .static({ suppliers: layer11, factory: () => 1214 })
        const $l12_15 = market
            .add("l12_15")
            .static({ suppliers: layer11, factory: () => 1215 })
        const $l12_16 = market
            .add("l12_16")
            .static({ suppliers: layer11, factory: () => 1216 })
        const $l12_17 = market
            .add("l12_17")
            .static({ suppliers: layer11, factory: () => 1217 })
        const $l12_18 = market
            .add("l12_18")
            .static({ suppliers: layer11, factory: () => 1218 })
        const $l12_19 = market
            .add("l12_19")
            .static({ suppliers: layer11, factory: () => 1219 })
        const $l12_20 = market
            .add("l12_20")
            .static({ suppliers: layer11, factory: () => 1220 })
        const layer12 = [
            $l12_1,
            $l12_2,
            $l12_3,
            $l12_4,
            $l12_5,
            $l12_6,
            $l12_7,
            $l12_8,
            $l12_9,
            $l12_10,
            $l12_11,
            $l12_12,
            $l12_13,
            $l12_14,
            $l12_15,
            $l12_16,
            $l12_17,
            $l12_18,
            $l12_19,
            $l12_20
        ]

        // Layer 13: depends on layer12 suppliers
        const $l13_1 = market
            .add("l13_1")
            .static({ suppliers: layer12, factory: () => 1301 })
        const $l13_2 = market
            .add("l13_2")
            .static({ suppliers: layer12, factory: () => 1302 })
        const $l13_3 = market
            .add("l13_3")
            .static({ suppliers: layer12, factory: () => 1303 })
        const $l13_4 = market
            .add("l13_4")
            .static({ suppliers: layer12, factory: () => 1304 })
        const $l13_5 = market
            .add("l13_5")
            .static({ suppliers: layer12, factory: () => 1305 })
        const $l13_6 = market
            .add("l13_6")
            .static({ suppliers: layer12, factory: () => 1306 })
        const $l13_7 = market
            .add("l13_7")
            .static({ suppliers: layer12, factory: () => 1307 })
        const $l13_8 = market
            .add("l13_8")
            .static({ suppliers: layer12, factory: () => 1308 })
        const $l13_9 = market
            .add("l13_9")
            .static({ suppliers: layer12, factory: () => 1309 })
        const $l13_10 = market
            .add("l13_10")
            .static({ suppliers: layer12, factory: () => 1310 })
        const $l13_11 = market
            .add("l13_11")
            .static({ suppliers: layer12, factory: () => 1311 })
        const $l13_12 = market
            .add("l13_12")
            .static({ suppliers: layer12, factory: () => 1312 })
        const $l13_13 = market
            .add("l13_13")
            .static({ suppliers: layer12, factory: () => 1313 })
        const $l13_14 = market
            .add("l13_14")
            .static({ suppliers: layer12, factory: () => 1314 })
        const $l13_15 = market
            .add("l13_15")
            .static({ suppliers: layer12, factory: () => 1315 })
        const $l13_16 = market
            .add("l13_16")
            .static({ suppliers: layer12, factory: () => 1316 })
        const $l13_17 = market
            .add("l13_17")
            .static({ suppliers: layer12, factory: () => 1317 })
        const $l13_18 = market
            .add("l13_18")
            .static({ suppliers: layer12, factory: () => 1318 })
        const $l13_19 = market
            .add("l13_19")
            .static({ suppliers: layer12, factory: () => 1319 })
        const $l13_20 = market
            .add("l13_20")
            .static({ suppliers: layer12, factory: () => 1320 })
        const layer13 = [
            $l13_1,
            $l13_2,
            $l13_3,
            $l13_4,
            $l13_5,
            $l13_6,
            $l13_7,
            $l13_8,
            $l13_9,
            $l13_10,
            $l13_11,
            $l13_12,
            $l13_13,
            $l13_14,
            $l13_15,
            $l13_16,
            $l13_17,
            $l13_18,
            $l13_19,
            $l13_20
        ]

        // Layer 14: depends on layer13 suppliers
        const $l14_1 = market
            .add("l14_1")
            .static({ suppliers: layer13, factory: () => 1401 })
        const $l14_2 = market
            .add("l14_2")
            .static({ suppliers: layer13, factory: () => 1402 })
        const $l14_3 = market
            .add("l14_3")
            .static({ suppliers: layer13, factory: () => 1403 })
        const $l14_4 = market
            .add("l14_4")
            .static({ suppliers: layer13, factory: () => 1404 })
        const $l14_5 = market
            .add("l14_5")
            .static({ suppliers: layer13, factory: () => 1405 })
        const $l14_6 = market
            .add("l14_6")
            .static({ suppliers: layer13, factory: () => 1406 })
        const $l14_7 = market
            .add("l14_7")
            .static({ suppliers: layer13, factory: () => 1407 })
        const $l14_8 = market
            .add("l14_8")
            .static({ suppliers: layer13, factory: () => 1408 })
        const $l14_9 = market
            .add("l14_9")
            .static({ suppliers: layer13, factory: () => 1409 })
        const $l14_10 = market
            .add("l14_10")
            .static({ suppliers: layer13, factory: () => 1410 })
        const $l14_11 = market
            .add("l14_11")
            .static({ suppliers: layer13, factory: () => 1411 })
        const $l14_12 = market
            .add("l14_12")
            .static({ suppliers: layer13, factory: () => 1412 })
        const $l14_13 = market
            .add("l14_13")
            .static({ suppliers: layer13, factory: () => 1413 })
        const $l14_14 = market
            .add("l14_14")
            .static({ suppliers: layer13, factory: () => 1414 })
        const $l14_15 = market
            .add("l14_15")
            .static({ suppliers: layer13, factory: () => 1415 })
        const $l14_16 = market
            .add("l14_16")
            .static({ suppliers: layer13, factory: () => 1416 })
        const $l14_17 = market
            .add("l14_17")
            .static({ suppliers: layer13, factory: () => 1417 })
        const $l14_18 = market
            .add("l14_18")
            .static({ suppliers: layer13, factory: () => 1418 })
        const $l14_19 = market
            .add("l14_19")
            .static({ suppliers: layer13, factory: () => 1419 })
        const $l14_20 = market
            .add("l14_20")
            .static({ suppliers: layer13, factory: () => 1420 })
        const layer14 = [
            $l14_1,
            $l14_2,
            $l14_3,
            $l14_4,
            $l14_5,
            $l14_6,
            $l14_7,
            $l14_8,
            $l14_9,
            $l14_10,
            $l14_11,
            $l14_12,
            $l14_13,
            $l14_14,
            $l14_15,
            $l14_16,
            $l14_17,
            $l14_18,
            $l14_19,
            $l14_20
        ]

        // Layer 15: depends on layer14 suppliers
        const $l15_1 = market
            .add("l15_1")
            .static({ suppliers: layer14, factory: () => 1501 })
        const $l15_2 = market
            .add("l15_2")
            .static({ suppliers: layer14, factory: () => 1502 })
        const $l15_3 = market
            .add("l15_3")
            .static({ suppliers: layer14, factory: () => 1503 })
        const $l15_4 = market
            .add("l15_4")
            .static({ suppliers: layer14, factory: () => 1504 })
        const $l15_5 = market
            .add("l15_5")
            .static({ suppliers: layer14, factory: () => 1505 })
        const $l15_6 = market
            .add("l15_6")
            .static({ suppliers: layer14, factory: () => 1506 })
        const $l15_7 = market
            .add("l15_7")
            .static({ suppliers: layer14, factory: () => 1507 })
        const $l15_8 = market
            .add("l15_8")
            .static({ suppliers: layer14, factory: () => 1508 })
        const $l15_9 = market
            .add("l15_9")
            .static({ suppliers: layer14, factory: () => 1509 })
        const $l15_10 = market
            .add("l15_10")
            .static({ suppliers: layer14, factory: () => 1510 })
        const $l15_11 = market
            .add("l15_11")
            .static({ suppliers: layer14, factory: () => 1511 })
        const $l15_12 = market
            .add("l15_12")
            .static({ suppliers: layer14, factory: () => 1512 })
        const $l15_13 = market
            .add("l15_13")
            .static({ suppliers: layer14, factory: () => 1513 })
        const $l15_14 = market
            .add("l15_14")
            .static({ suppliers: layer14, factory: () => 1514 })
        const $l15_15 = market
            .add("l15_15")
            .static({ suppliers: layer14, factory: () => 1515 })
        const $l15_16 = market
            .add("l15_16")
            .static({ suppliers: layer14, factory: () => 1516 })
        const $l15_17 = market
            .add("l15_17")
            .static({ suppliers: layer14, factory: () => 1517 })
        const $l15_18 = market
            .add("l15_18")
            .static({ suppliers: layer14, factory: () => 1518 })
        const $l15_19 = market
            .add("l15_19")
            .static({ suppliers: layer14, factory: () => 1519 })
        const $l15_20 = market
            .add("l15_20")
            .static({ suppliers: layer14, factory: () => 1520 })
        const layer15 = [
            $l15_1,
            $l15_2,
            $l15_3,
            $l15_4,
            $l15_5,
            $l15_6,
            $l15_7,
            $l15_8,
            $l15_9,
            $l15_10,
            $l15_11,
            $l15_12,
            $l15_13,
            $l15_14,
            $l15_15,
            $l15_16,
            $l15_17,
            $l15_18,
            $l15_19,
            $l15_20
        ]

        // Layer 16: depends on layer15 suppliers
        const $l16_1 = market
            .add("l16_1")
            .static({ suppliers: layer15, factory: () => 1601 })
        const $l16_2 = market
            .add("l16_2")
            .static({ suppliers: layer15, factory: () => 1602 })
        const $l16_3 = market
            .add("l16_3")
            .static({ suppliers: layer15, factory: () => 1603 })
        const $l16_4 = market
            .add("l16_4")
            .static({ suppliers: layer15, factory: () => 1604 })
        const $l16_5 = market
            .add("l16_5")
            .static({ suppliers: layer15, factory: () => 1605 })
        const $l16_6 = market
            .add("l16_6")
            .static({ suppliers: layer15, factory: () => 1606 })
        const $l16_7 = market
            .add("l16_7")
            .static({ suppliers: layer15, factory: () => 1607 })
        const $l16_8 = market
            .add("l16_8")
            .static({ suppliers: layer15, factory: () => 1608 })
        const $l16_9 = market
            .add("l16_9")
            .static({ suppliers: layer15, factory: () => 1609 })
        const $l16_10 = market
            .add("l16_10")
            .static({ suppliers: layer15, factory: () => 1610 })
        const $l16_11 = market
            .add("l16_11")
            .static({ suppliers: layer15, factory: () => 1611 })
        const $l16_12 = market
            .add("l16_12")
            .static({ suppliers: layer15, factory: () => 1612 })
        const $l16_13 = market
            .add("l16_13")
            .static({ suppliers: layer15, factory: () => 1613 })
        const $l16_14 = market
            .add("l16_14")
            .static({ suppliers: layer15, factory: () => 1614 })
        const $l16_15 = market
            .add("l16_15")
            .static({ suppliers: layer15, factory: () => 1615 })
        const $l16_16 = market
            .add("l16_16")
            .static({ suppliers: layer15, factory: () => 1616 })
        const $l16_17 = market
            .add("l16_17")
            .static({ suppliers: layer15, factory: () => 1617 })
        const $l16_18 = market
            .add("l16_18")
            .static({ suppliers: layer15, factory: () => 1618 })
        const $l16_19 = market
            .add("l16_19")
            .static({ suppliers: layer15, factory: () => 1619 })
        const $l16_20 = market
            .add("l16_20")
            .static({ suppliers: layer15, factory: () => 1620 })
        const layer16 = [
            $l16_1,
            $l16_2,
            $l16_3,
            $l16_4,
            $l16_5,
            $l16_6,
            $l16_7,
            $l16_8,
            $l16_9,
            $l16_10,
            $l16_11,
            $l16_12,
            $l16_13,
            $l16_14,
            $l16_15,
            $l16_16,
            $l16_17,
            $l16_18,
            $l16_19,
            $l16_20
        ]

        // Layer 17: depends on layer16 suppliers
        const $l17_1 = market
            .add("l17_1")
            .static({ suppliers: layer16, factory: () => 1701 })
        const $l17_2 = market
            .add("l17_2")
            .static({ suppliers: layer16, factory: () => 1702 })
        const $l17_3 = market
            .add("l17_3")
            .static({ suppliers: layer16, factory: () => 1703 })
        const $l17_4 = market
            .add("l17_4")
            .static({ suppliers: layer16, factory: () => 1704 })
        const $l17_5 = market
            .add("l17_5")
            .static({ suppliers: layer16, factory: () => 1705 })
        const $l17_6 = market
            .add("l17_6")
            .static({ suppliers: layer16, factory: () => 1706 })
        const $l17_7 = market
            .add("l17_7")
            .static({ suppliers: layer16, factory: () => 1707 })
        const $l17_8 = market
            .add("l17_8")
            .static({ suppliers: layer16, factory: () => 1708 })
        const $l17_9 = market
            .add("l17_9")
            .static({ suppliers: layer16, factory: () => 1709 })
        const $l17_10 = market
            .add("l17_10")
            .static({ suppliers: layer16, factory: () => 1710 })
        const $l17_11 = market
            .add("l17_11")
            .static({ suppliers: layer16, factory: () => 1711 })
        const $l17_12 = market
            .add("l17_12")
            .static({ suppliers: layer16, factory: () => 1712 })
        const $l17_13 = market
            .add("l17_13")
            .static({ suppliers: layer16, factory: () => 1713 })
        const $l17_14 = market
            .add("l17_14")
            .static({ suppliers: layer16, factory: () => 1714 })
        const $l17_15 = market
            .add("l17_15")
            .static({ suppliers: layer16, factory: () => 1715 })
        const $l17_16 = market
            .add("l17_16")
            .static({ suppliers: layer16, factory: () => 1716 })
        const $l17_17 = market
            .add("l17_17")
            .static({ suppliers: layer16, factory: () => 1717 })
        const $l17_18 = market
            .add("l17_18")
            .static({ suppliers: layer16, factory: () => 1718 })
        const $l17_19 = market
            .add("l17_19")
            .static({ suppliers: layer16, factory: () => 1719 })
        const $l17_20 = market
            .add("l17_20")
            .static({ suppliers: layer16, factory: () => 1720 })
        const layer17 = [
            $l17_1,
            $l17_2,
            $l17_3,
            $l17_4,
            $l17_5,
            $l17_6,
            $l17_7,
            $l17_8,
            $l17_9,
            $l17_10,
            $l17_11,
            $l17_12,
            $l17_13,
            $l17_14,
            $l17_15,
            $l17_16,
            $l17_17,
            $l17_18,
            $l17_19,
            $l17_20
        ]

        // Layer 18: depends on layer17 suppliers
        const $l18_1 = market
            .add("l18_1")
            .static({ suppliers: layer17, factory: () => 1801 })
        const $l18_2 = market
            .add("l18_2")
            .static({ suppliers: layer17, factory: () => 1802 })
        const $l18_3 = market
            .add("l18_3")
            .static({ suppliers: layer17, factory: () => 1803 })
        const $l18_4 = market
            .add("l18_4")
            .static({ suppliers: layer17, factory: () => 1804 })
        const $l18_5 = market
            .add("l18_5")
            .static({ suppliers: layer17, factory: () => 1805 })
        const $l18_6 = market
            .add("l18_6")
            .static({ suppliers: layer17, factory: () => 1806 })
        const $l18_7 = market
            .add("l18_7")
            .static({ suppliers: layer17, factory: () => 1807 })
        const $l18_8 = market
            .add("l18_8")
            .static({ suppliers: layer17, factory: () => 1808 })
        const $l18_9 = market
            .add("l18_9")
            .static({ suppliers: layer17, factory: () => 1809 })
        const $l18_10 = market
            .add("l18_10")
            .static({ suppliers: layer17, factory: () => 1810 })
        const $l18_11 = market
            .add("l18_11")
            .static({ suppliers: layer17, factory: () => 1811 })
        const $l18_12 = market
            .add("l18_12")
            .static({ suppliers: layer17, factory: () => 1812 })
        const $l18_13 = market
            .add("l18_13")
            .static({ suppliers: layer17, factory: () => 1813 })
        const $l18_14 = market
            .add("l18_14")
            .static({ suppliers: layer17, factory: () => 1814 })
        const $l18_15 = market
            .add("l18_15")
            .static({ suppliers: layer17, factory: () => 1815 })
        const $l18_16 = market
            .add("l18_16")
            .static({ suppliers: layer17, factory: () => 1816 })
        const $l18_17 = market
            .add("l18_17")
            .static({ suppliers: layer17, factory: () => 1817 })
        const $l18_18 = market
            .add("l18_18")
            .static({ suppliers: layer17, factory: () => 1818 })
        const $l18_19 = market
            .add("l18_19")
            .static({ suppliers: layer17, factory: () => 1819 })
        const $l18_20 = market
            .add("l18_20")
            .static({ suppliers: layer17, factory: () => 1820 })
        const layer18 = [
            $l18_1,
            $l18_2,
            $l18_3,
            $l18_4,
            $l18_5,
            $l18_6,
            $l18_7,
            $l18_8,
            $l18_9,
            $l18_10,
            $l18_11,
            $l18_12,
            $l18_13,
            $l18_14,
            $l18_15,
            $l18_16,
            $l18_17,
            $l18_18,
            $l18_19,
            $l18_20
        ]

        // Layer 19: depends on layer18 suppliers
        const $l19_1 = market
            .add("l19_1")
            .static({ suppliers: layer18, factory: () => 1901 })
        const $l19_2 = market
            .add("l19_2")
            .static({ suppliers: layer18, factory: () => 1902 })
        const $l19_3 = market
            .add("l19_3")
            .static({ suppliers: layer18, factory: () => 1903 })
        const $l19_4 = market
            .add("l19_4")
            .static({ suppliers: layer18, factory: () => 1904 })
        const $l19_5 = market
            .add("l19_5")
            .static({ suppliers: layer18, factory: () => 1905 })
        const $l19_6 = market
            .add("l19_6")
            .static({ suppliers: layer18, factory: () => 1906 })
        const $l19_7 = market
            .add("l19_7")
            .static({ suppliers: layer18, factory: () => 1907 })
        const $l19_8 = market
            .add("l19_8")
            .static({ suppliers: layer18, factory: () => 1908 })
        const $l19_9 = market
            .add("l19_9")
            .static({ suppliers: layer18, factory: () => 1909 })
        const $l19_10 = market
            .add("l19_10")
            .static({ suppliers: layer18, factory: () => 1910 })
        const $l19_11 = market
            .add("l19_11")
            .static({ suppliers: layer18, factory: () => 1911 })
        const $l19_12 = market
            .add("l19_12")
            .static({ suppliers: layer18, factory: () => 1912 })
        const $l19_13 = market
            .add("l19_13")
            .static({ suppliers: layer18, factory: () => 1913 })
        const $l19_14 = market
            .add("l19_14")
            .static({ suppliers: layer18, factory: () => 1914 })
        const $l19_15 = market
            .add("l19_15")
            .static({ suppliers: layer18, factory: () => 1915 })
        const $l19_16 = market
            .add("l19_16")
            .static({ suppliers: layer18, factory: () => 1916 })
        const $l19_17 = market
            .add("l19_17")
            .static({ suppliers: layer18, factory: () => 1917 })
        const $l19_18 = market
            .add("l19_18")
            .static({ suppliers: layer18, factory: () => 1918 })
        const $l19_19 = market
            .add("l19_19")
            .static({ suppliers: layer18, factory: () => 1919 })
        const $l19_20 = market
            .add("l19_20")
            .static({ suppliers: layer18, factory: () => 1920 })
        const layer19 = [
            $l19_1,
            $l19_2,
            $l19_3,
            $l19_4,
            $l19_5,
            $l19_6,
            $l19_7,
            $l19_8,
            $l19_9,
            $l19_10,
            $l19_11,
            $l19_12,
            $l19_13,
            $l19_14,
            $l19_15,
            $l19_16,
            $l19_17,
            $l19_18,
            $l19_19,
            $l19_20
        ]

        // Layer 20: depends on layer19 suppliers
        const $l20_1 = market
            .add("l20_1")
            .static({ suppliers: layer19, factory: () => 2001 })
        const $l20_2 = market
            .add("l20_2")
            .static({ suppliers: layer19, factory: () => 2002 })
        const $l20_3 = market
            .add("l20_3")
            .static({ suppliers: layer19, factory: () => 2003 })
        const $l20_4 = market
            .add("l20_4")
            .static({ suppliers: layer19, factory: () => 2004 })
        const $l20_5 = market
            .add("l20_5")
            .static({ suppliers: layer19, factory: () => 2005 })
        const $l20_6 = market
            .add("l20_6")
            .static({ suppliers: layer19, factory: () => 2006 })
        const $l20_7 = market
            .add("l20_7")
            .static({ suppliers: layer19, factory: () => 2007 })
        const $l20_8 = market
            .add("l20_8")
            .static({ suppliers: layer19, factory: () => 2008 })
        const $l20_9 = market
            .add("l20_9")
            .static({ suppliers: layer19, factory: () => 2009 })
        const $l20_10 = market
            .add("l20_10")
            .static({ suppliers: layer19, factory: () => 2010 })
        const $l20_11 = market
            .add("l20_11")
            .static({ suppliers: layer19, factory: () => 2011 })
        const $l20_12 = market
            .add("l20_12")
            .static({ suppliers: layer19, factory: () => 2012 })
        const $l20_13 = market
            .add("l20_13")
            .static({ suppliers: layer19, factory: () => 2013 })
        const $l20_14 = market
            .add("l20_14")
            .static({ suppliers: layer19, factory: () => 2014 })
        const $l20_15 = market
            .add("l20_15")
            .static({ suppliers: layer19, factory: () => 2015 })
        const $l20_16 = market
            .add("l20_16")
            .static({ suppliers: layer19, factory: () => 2016 })
        const $l20_17 = market
            .add("l20_17")
            .static({ suppliers: layer19, factory: () => 2017 })
        const $l20_18 = market
            .add("l20_18")
            .static({ suppliers: layer19, factory: () => 2018 })
        const $l20_19 = market
            .add("l20_19")
            .static({ suppliers: layer19, factory: () => 2019 })
        const $l20_20 = market
            .add("l20_20")
            .static({ suppliers: layer19, factory: () => 2020 })
        const layer20 = [
            $l20_1,
            $l20_2,
            $l20_3,
            $l20_4,
            $l20_5,
            $l20_6,
            $l20_7,
            $l20_8,
            $l20_9,
            $l20_10,
            $l20_11,
            $l20_12,
            $l20_13,
            $l20_14,
            $l20_15,
            $l20_16,
            $l20_17,
            $l20_18,
            $l20_19,
            $l20_20
        ]
        // Layer 21: depends on layer20 suppliers
        const $l21_1 = market
            .add("l21_1")
            .static({ suppliers: layer20, factory: () => 2101 })
        const $l21_2 = market
            .add("l21_2")
            .static({ suppliers: layer20, factory: () => 2102 })
        const $l21_3 = market
            .add("l21_3")
            .static({ suppliers: layer20, factory: () => 2103 })
        const $l21_4 = market
            .add("l21_4")
            .static({ suppliers: layer20, factory: () => 2104 })
        const $l21_5 = market
            .add("l21_5")
            .static({ suppliers: layer20, factory: () => 2105 })
        const $l21_6 = market
            .add("l21_6")
            .static({ suppliers: layer20, factory: () => 2106 })
        const $l21_7 = market
            .add("l21_7")
            .static({ suppliers: layer20, factory: () => 2107 })
        const $l21_8 = market
            .add("l21_8")
            .static({ suppliers: layer20, factory: () => 2108 })
        const $l21_9 = market
            .add("l21_9")
            .static({ suppliers: layer20, factory: () => 2109 })
        const $l21_10 = market
            .add("l21_10")
            .static({ suppliers: layer20, factory: () => 2110 })
        const $l21_11 = market
            .add("l21_11")
            .static({ suppliers: layer20, factory: () => 2111 })
        const $l21_12 = market
            .add("l21_12")
            .static({ suppliers: layer20, factory: () => 2112 })
        const $l21_13 = market
            .add("l21_13")
            .static({ suppliers: layer20, factory: () => 2113 })
        const $l21_14 = market
            .add("l21_14")
            .static({ suppliers: layer20, factory: () => 2114 })
        const $l21_15 = market
            .add("l21_15")
            .static({ suppliers: layer20, factory: () => 2115 })
        const $l21_16 = market
            .add("l21_16")
            .static({ suppliers: layer20, factory: () => 2116 })
        const $l21_17 = market
            .add("l21_17")
            .static({ suppliers: layer20, factory: () => 2117 })
        const $l21_18 = market
            .add("l21_18")
            .static({ suppliers: layer20, factory: () => 2118 })
        const $l21_19 = market
            .add("l21_19")
            .static({ suppliers: layer20, factory: () => 2119 })
        const $l21_20 = market
            .add("l21_20")
            .static({ suppliers: layer20, factory: () => 2120 })
        const layer21 = [
            $l21_1,
            $l21_2,
            $l21_3,
            $l21_4,
            $l21_5,
            $l21_6,
            $l21_7,
            $l21_8,
            $l21_9,
            $l21_10,
            $l21_11,
            $l21_12,
            $l21_13,
            $l21_14,
            $l21_15,
            $l21_16,
            $l21_17,
            $l21_18,
            $l21_19,
            $l21_20
        ]

        // Layer 22: depends on layer21 suppliers
        const $l22_1 = market
            .add("l22_1")
            .static({ suppliers: layer21, factory: () => 2201 })
        const $l22_2 = market
            .add("l22_2")
            .static({ suppliers: layer21, factory: () => 2202 })
        const $l22_3 = market
            .add("l22_3")
            .static({ suppliers: layer21, factory: () => 2203 })
        const $l22_4 = market
            .add("l22_4")
            .static({ suppliers: layer21, factory: () => 2204 })
        const $l22_5 = market
            .add("l22_5")
            .static({ suppliers: layer21, factory: () => 2205 })
        const $l22_6 = market
            .add("l22_6")
            .static({ suppliers: layer21, factory: () => 2206 })
        const $l22_7 = market
            .add("l22_7")
            .static({ suppliers: layer21, factory: () => 2207 })
        const $l22_8 = market
            .add("l22_8")
            .static({ suppliers: layer21, factory: () => 2208 })
        const $l22_9 = market
            .add("l22_9")
            .static({ suppliers: layer21, factory: () => 2209 })
        const $l22_10 = market
            .add("l22_10")
            .static({ suppliers: layer21, factory: () => 2210 })
        const $l22_11 = market
            .add("l22_11")
            .static({ suppliers: layer21, factory: () => 2211 })
        const $l22_12 = market
            .add("l22_12")
            .static({ suppliers: layer21, factory: () => 2212 })
        const $l22_13 = market
            .add("l22_13")
            .static({ suppliers: layer21, factory: () => 2213 })
        const $l22_14 = market
            .add("l22_14")
            .static({ suppliers: layer21, factory: () => 2214 })
        const $l22_15 = market
            .add("l22_15")
            .static({ suppliers: layer21, factory: () => 2215 })
        const $l22_16 = market
            .add("l22_16")
            .static({ suppliers: layer21, factory: () => 2216 })
        const $l22_17 = market
            .add("l22_17")
            .static({ suppliers: layer21, factory: () => 2217 })
        const $l22_18 = market
            .add("l22_18")
            .static({ suppliers: layer21, factory: () => 2218 })
        const $l22_19 = market
            .add("l22_19")
            .static({ suppliers: layer21, factory: () => 2219 })
        const $l22_20 = market
            .add("l22_20")
            .static({ suppliers: layer21, factory: () => 2220 })
        const layer22 = [
            $l22_1,
            $l22_2,
            $l22_3,
            $l22_4,
            $l22_5,
            $l22_6,
            $l22_7,
            $l22_8,
            $l22_9,
            $l22_10,
            $l22_11,
            $l22_12,
            $l22_13,
            $l22_14,
            $l22_15,
            $l22_16,
            $l22_17,
            $l22_18,
            $l22_19,
            $l22_20
        ]

        // Layer 23: depends on layer22 suppliers
        const $l23_1 = market
            .add("l23_1")
            .static({ suppliers: layer22, factory: () => 2301 })
        const $l23_2 = market
            .add("l23_2")
            .static({ suppliers: layer22, factory: () => 2302 })
        const $l23_3 = market
            .add("l23_3")
            .static({ suppliers: layer22, factory: () => 2303 })
        const $l23_4 = market
            .add("l23_4")
            .static({ suppliers: layer22, factory: () => 2304 })
        const $l23_5 = market
            .add("l23_5")
            .static({ suppliers: layer22, factory: () => 2305 })
        const $l23_6 = market
            .add("l23_6")
            .static({ suppliers: layer22, factory: () => 2306 })
        const $l23_7 = market
            .add("l23_7")
            .static({ suppliers: layer22, factory: () => 2307 })
        const $l23_8 = market
            .add("l23_8")
            .static({ suppliers: layer22, factory: () => 2308 })
        const $l23_9 = market
            .add("l23_9")
            .static({ suppliers: layer22, factory: () => 2309 })
        const $l23_10 = market
            .add("l23_10")
            .static({ suppliers: layer22, factory: () => 2310 })
        const $l23_11 = market
            .add("l23_11")
            .static({ suppliers: layer22, factory: () => 2311 })
        const $l23_12 = market
            .add("l23_12")
            .static({ suppliers: layer22, factory: () => 2312 })
        const $l23_13 = market
            .add("l23_13")
            .static({ suppliers: layer22, factory: () => 2313 })
        const $l23_14 = market
            .add("l23_14")
            .static({ suppliers: layer22, factory: () => 2314 })
        const $l23_15 = market
            .add("l23_15")
            .static({ suppliers: layer22, factory: () => 2315 })
        const $l23_16 = market
            .add("l23_16")
            .static({ suppliers: layer22, factory: () => 2316 })
        const $l23_17 = market
            .add("l23_17")
            .static({ suppliers: layer22, factory: () => 2317 })
        const $l23_18 = market
            .add("l23_18")
            .static({ suppliers: layer22, factory: () => 2318 })
        const $l23_19 = market
            .add("l23_19")
            .static({ suppliers: layer22, factory: () => 2319 })
        const $l23_20 = market
            .add("l23_20")
            .static({ suppliers: layer22, factory: () => 2320 })
        const layer23 = [
            $l23_1,
            $l23_2,
            $l23_3,
            $l23_4,
            $l23_5,
            $l23_6,
            $l23_7,
            $l23_8,
            $l23_9,
            $l23_10,
            $l23_11,
            $l23_12,
            $l23_13,
            $l23_14,
            $l23_15,
            $l23_16,
            $l23_17,
            $l23_18,
            $l23_19,
            $l23_20
        ]

        // Layer 24: depends on layer23 suppliers
        const $l24_1 = market
            .add("l24_1")
            .static({ suppliers: layer23, factory: () => 2401 })
        const $l24_2 = market
            .add("l24_2")
            .static({ suppliers: layer23, factory: () => 2402 })
        const $l24_3 = market
            .add("l24_3")
            .static({ suppliers: layer23, factory: () => 2403 })
        const $l24_4 = market
            .add("l24_4")
            .static({ suppliers: layer23, factory: () => 2404 })
        const $l24_5 = market
            .add("l24_5")
            .static({ suppliers: layer23, factory: () => 2405 })
        const $l24_6 = market
            .add("l24_6")
            .static({ suppliers: layer23, factory: () => 2406 })
        const $l24_7 = market
            .add("l24_7")
            .static({ suppliers: layer23, factory: () => 2407 })
        const $l24_8 = market
            .add("l24_8")
            .static({ suppliers: layer23, factory: () => 2408 })
        const $l24_9 = market
            .add("l24_9")
            .static({ suppliers: layer23, factory: () => 2409 })
        const $l24_10 = market
            .add("l24_10")
            .static({ suppliers: layer23, factory: () => 2410 })
        const $l24_11 = market
            .add("l24_11")
            .static({ suppliers: layer23, factory: () => 2411 })
        const $l24_12 = market
            .add("l24_12")
            .static({ suppliers: layer23, factory: () => 2412 })
        const $l24_13 = market
            .add("l24_13")
            .static({ suppliers: layer23, factory: () => 2413 })
        const $l24_14 = market
            .add("l24_14")
            .static({ suppliers: layer23, factory: () => 2414 })
        const $l24_15 = market
            .add("l24_15")
            .static({ suppliers: layer23, factory: () => 2415 })
        const $l24_16 = market
            .add("l24_16")
            .static({ suppliers: layer23, factory: () => 2416 })
        const $l24_17 = market
            .add("l24_17")
            .static({ suppliers: layer23, factory: () => 2417 })
        const $l24_18 = market
            .add("l24_18")
            .static({ suppliers: layer23, factory: () => 2418 })
        const $l24_19 = market
            .add("l24_19")
            .static({ suppliers: layer23, factory: () => 2419 })
        const $l24_20 = market
            .add("l24_20")
            .static({ suppliers: layer23, factory: () => 2420 })
        const layer24 = [
            $l24_1,
            $l24_2,
            $l24_3,
            $l24_4,
            $l24_5,
            $l24_6,
            $l24_7,
            $l24_8,
            $l24_9,
            $l24_10,
            $l24_11,
            $l24_12,
            $l24_13,
            $l24_14,
            $l24_15,
            $l24_16,
            $l24_17,
            $l24_18,
            $l24_19,
            $l24_20
        ]

        // Layer 25: depends on layer24 suppliers
        const $l25_1 = market
            .add("l25_1")
            .static({ suppliers: layer24, factory: () => 2501 })
        const $l25_2 = market
            .add("l25_2")
            .static({ suppliers: layer24, factory: () => 2502 })
        const $l25_3 = market
            .add("l25_3")
            .static({ suppliers: layer24, factory: () => 2503 })
        const $l25_4 = market
            .add("l25_4")
            .static({ suppliers: layer24, factory: () => 2504 })
        const $l25_5 = market
            .add("l25_5")
            .static({ suppliers: layer24, factory: () => 2505 })
        const $l25_6 = market
            .add("l25_6")
            .static({ suppliers: layer24, factory: () => 2506 })
        const $l25_7 = market
            .add("l25_7")
            .static({ suppliers: layer24, factory: () => 2507 })
        const $l25_8 = market
            .add("l25_8")
            .static({ suppliers: layer24, factory: () => 2508 })
        const $l25_9 = market
            .add("l25_9")
            .static({ suppliers: layer24, factory: () => 2509 })
        const $l25_10 = market
            .add("l25_10")
            .static({ suppliers: layer24, factory: () => 2510 })
        const $l25_11 = market
            .add("l25_11")
            .static({ suppliers: layer24, factory: () => 2511 })
        const $l25_12 = market
            .add("l25_12")
            .static({ suppliers: layer24, factory: () => 2512 })
        const $l25_13 = market
            .add("l25_13")
            .static({ suppliers: layer24, factory: () => 2513 })
        const $l25_14 = market
            .add("l25_14")
            .static({ suppliers: layer24, factory: () => 2514 })
        const $l25_15 = market
            .add("l25_15")
            .static({ suppliers: layer24, factory: () => 2515 })
        const $l25_16 = market
            .add("l25_16")
            .static({ suppliers: layer24, factory: () => 2516 })
        const $l25_17 = market
            .add("l25_17")
            .static({ suppliers: layer24, factory: () => 2517 })
        const $l25_18 = market
            .add("l25_18")
            .static({ suppliers: layer24, factory: () => 2518 })
        const $l25_19 = market
            .add("l25_19")
            .static({ suppliers: layer24, factory: () => 2519 })
        const $l25_20 = market
            .add("l25_20")
            .static({ suppliers: layer24, factory: () => 2520 })
        const layer25 = [
            $l25_1,
            $l25_2,
            $l25_3,
            $l25_4,
            $l25_5,
            $l25_6,
            $l25_7,
            $l25_8,
            $l25_9,
            $l25_10,
            $l25_11,
            $l25_12,
            $l25_13,
            $l25_14,
            $l25_15,
            $l25_16,
            $l25_17,
            $l25_18,
            $l25_19,
            $l25_20
        ]

        // Layer 26: depends on layer25 suppliers
        const $l26_1 = market
            .add("l26_1")
            .static({ suppliers: layer25, factory: () => 2601 })
        const $l26_2 = market
            .add("l26_2")
            .static({ suppliers: layer25, factory: () => 2602 })
        const $l26_3 = market
            .add("l26_3")
            .static({ suppliers: layer25, factory: () => 2603 })
        const $l26_4 = market
            .add("l26_4")
            .static({ suppliers: layer25, factory: () => 2604 })
        const $l26_5 = market
            .add("l26_5")
            .static({ suppliers: layer25, factory: () => 2605 })
        const $l26_6 = market
            .add("l26_6")
            .static({ suppliers: layer25, factory: () => 2606 })
        const $l26_7 = market
            .add("l26_7")
            .static({ suppliers: layer25, factory: () => 2607 })
        const $l26_8 = market
            .add("l26_8")
            .static({ suppliers: layer25, factory: () => 2608 })
        const $l26_9 = market
            .add("l26_9")
            .static({ suppliers: layer25, factory: () => 2609 })
        const $l26_10 = market
            .add("l26_10")
            .static({ suppliers: layer25, factory: () => 2610 })
        const $l26_11 = market
            .add("l26_11")
            .static({ suppliers: layer25, factory: () => 2611 })
        const $l26_12 = market
            .add("l26_12")
            .static({ suppliers: layer25, factory: () => 2612 })
        const $l26_13 = market
            .add("l26_13")
            .static({ suppliers: layer25, factory: () => 2613 })
        const $l26_14 = market
            .add("l26_14")
            .static({ suppliers: layer25, factory: () => 2614 })
        const $l26_15 = market
            .add("l26_15")
            .static({ suppliers: layer25, factory: () => 2615 })
        const $l26_16 = market
            .add("l26_16")
            .static({ suppliers: layer25, factory: () => 2616 })
        const $l26_17 = market
            .add("l26_17")
            .static({ suppliers: layer25, factory: () => 2617 })
        const $l26_18 = market
            .add("l26_18")
            .static({ suppliers: layer25, factory: () => 2618 })
        const $l26_19 = market
            .add("l26_19")
            .static({ suppliers: layer25, factory: () => 2619 })
        const $l26_20 = market
            .add("l26_20")
            .static({ suppliers: layer25, factory: () => 2620 })
        const layer26 = [
            $l26_1,
            $l26_2,
            $l26_3,
            $l26_4,
            $l26_5,
            $l26_6,
            $l26_7,
            $l26_8,
            $l26_9,
            $l26_10,
            $l26_11,
            $l26_12,
            $l26_13,
            $l26_14,
            $l26_15,
            $l26_16,
            $l26_17,
            $l26_18,
            $l26_19,
            $l26_20
        ]

        // Layer 27: depends on layer26 suppliers
        const $l27_1 = market
            .add("l27_1")
            .static({ suppliers: layer26, factory: () => 2701 })
        const $l27_2 = market
            .add("l27_2")
            .static({ suppliers: layer26, factory: () => 2702 })
        const $l27_3 = market
            .add("l27_3")
            .static({ suppliers: layer26, factory: () => 2703 })
        const $l27_4 = market
            .add("l27_4")
            .static({ suppliers: layer26, factory: () => 2704 })
        const $l27_5 = market
            .add("l27_5")
            .static({ suppliers: layer26, factory: () => 2705 })
        const $l27_6 = market
            .add("l27_6")
            .static({ suppliers: layer26, factory: () => 2706 })
        const $l27_7 = market
            .add("l27_7")
            .static({ suppliers: layer26, factory: () => 2707 })
        const $l27_8 = market
            .add("l27_8")
            .static({ suppliers: layer26, factory: () => 2708 })
        const $l27_9 = market
            .add("l27_9")
            .static({ suppliers: layer26, factory: () => 2709 })
        const $l27_10 = market
            .add("l27_10")
            .static({ suppliers: layer26, factory: () => 2710 })
        const $l27_11 = market
            .add("l27_11")
            .static({ suppliers: layer26, factory: () => 2711 })
        const $l27_12 = market
            .add("l27_12")
            .static({ suppliers: layer26, factory: () => 2712 })
        const $l27_13 = market
            .add("l27_13")
            .static({ suppliers: layer26, factory: () => 2713 })
        const $l27_14 = market
            .add("l27_14")
            .static({ suppliers: layer26, factory: () => 2714 })
        const $l27_15 = market
            .add("l27_15")
            .static({ suppliers: layer26, factory: () => 2715 })
        const $l27_16 = market
            .add("l27_16")
            .static({ suppliers: layer26, factory: () => 2716 })
        const $l27_17 = market
            .add("l27_17")
            .static({ suppliers: layer26, factory: () => 2717 })
        const $l27_18 = market
            .add("l27_18")
            .static({ suppliers: layer26, factory: () => 2718 })
        const $l27_19 = market
            .add("l27_19")
            .static({ suppliers: layer26, factory: () => 2719 })
        const $l27_20 = market
            .add("l27_20")
            .static({ suppliers: layer26, factory: () => 2720 })
        const layer27 = [
            $l27_1,
            $l27_2,
            $l27_3,
            $l27_4,
            $l27_5,
            $l27_6,
            $l27_7,
            $l27_8,
            $l27_9,
            $l27_10,
            $l27_11,
            $l27_12,
            $l27_13,
            $l27_14,
            $l27_15,
            $l27_16,
            $l27_17,
            $l27_18,
            $l27_19,
            $l27_20
        ]

        // Layer 28: depends on layer27 suppliers
        const $l28_1 = market
            .add("l28_1")
            .static({ suppliers: layer27, factory: () => 2801 })
        const $l28_2 = market
            .add("l28_2")
            .static({ suppliers: layer27, factory: () => 2802 })
        const $l28_3 = market
            .add("l28_3")
            .static({ suppliers: layer27, factory: () => 2803 })
        const $l28_4 = market
            .add("l28_4")
            .static({ suppliers: layer27, factory: () => 2804 })
        const $l28_5 = market
            .add("l28_5")
            .static({ suppliers: layer27, factory: () => 2805 })
        const $l28_6 = market
            .add("l28_6")
            .static({ suppliers: layer27, factory: () => 2806 })
        const $l28_7 = market
            .add("l28_7")
            .static({ suppliers: layer27, factory: () => 2807 })
        const $l28_8 = market
            .add("l28_8")
            .static({ suppliers: layer27, factory: () => 2808 })
        const $l28_9 = market
            .add("l28_9")
            .static({ suppliers: layer27, factory: () => 2809 })
        const $l28_10 = market
            .add("l28_10")
            .static({ suppliers: layer27, factory: () => 2810 })
        const $l28_11 = market
            .add("l28_11")
            .static({ suppliers: layer27, factory: () => 2811 })
        const $l28_12 = market
            .add("l28_12")
            .static({ suppliers: layer27, factory: () => 2812 })
        const $l28_13 = market
            .add("l28_13")
            .static({ suppliers: layer27, factory: () => 2813 })
        const $l28_14 = market
            .add("l28_14")
            .static({ suppliers: layer27, factory: () => 2814 })
        const $l28_15 = market
            .add("l28_15")
            .static({ suppliers: layer27, factory: () => 2815 })
        const $l28_16 = market
            .add("l28_16")
            .static({ suppliers: layer27, factory: () => 2816 })
        const $l28_17 = market
            .add("l28_17")
            .static({ suppliers: layer27, factory: () => 2817 })
        const $l28_18 = market
            .add("l28_18")
            .static({ suppliers: layer27, factory: () => 2818 })
        const $l28_19 = market
            .add("l28_19")
            .static({ suppliers: layer27, factory: () => 2819 })
        const $l28_20 = market
            .add("l28_20")
            .static({ suppliers: layer27, factory: () => 2820 })
        const layer28 = [
            $l28_1,
            $l28_2,
            $l28_3,
            $l28_4,
            $l28_5,
            $l28_6,
            $l28_7,
            $l28_8,
            $l28_9,
            $l28_10,
            $l28_11,
            $l28_12,
            $l28_13,
            $l28_14,
            $l28_15,
            $l28_16,
            $l28_17,
            $l28_18,
            $l28_19,
            $l28_20
        ]

        // Layer 29: depends on layer28 suppliers
        const $l29_1 = market
            .add("l29_1")
            .static({ suppliers: layer28, factory: () => 2901 })
        const $l29_2 = market
            .add("l29_2")
            .static({ suppliers: layer28, factory: () => 2902 })
        const $l29_3 = market
            .add("l29_3")
            .static({ suppliers: layer28, factory: () => 2903 })
        const $l29_4 = market
            .add("l29_4")
            .static({ suppliers: layer28, factory: () => 2904 })
        const $l29_5 = market
            .add("l29_5")
            .static({ suppliers: layer28, factory: () => 2905 })
        const $l29_6 = market
            .add("l29_6")
            .static({ suppliers: layer28, factory: () => 2906 })
        const $l29_7 = market
            .add("l29_7")
            .static({ suppliers: layer28, factory: () => 2907 })
        const $l29_8 = market
            .add("l29_8")
            .static({ suppliers: layer28, factory: () => 2908 })
        const $l29_9 = market
            .add("l29_9")
            .static({ suppliers: layer28, factory: () => 2909 })
        const $l29_10 = market
            .add("l29_10")
            .static({ suppliers: layer28, factory: () => 2910 })
        const $l29_11 = market
            .add("l29_11")
            .static({ suppliers: layer28, factory: () => 2911 })
        const $l29_12 = market
            .add("l29_12")
            .static({ suppliers: layer28, factory: () => 2912 })
        const $l29_13 = market
            .add("l29_13")
            .static({ suppliers: layer28, factory: () => 2913 })
        const $l29_14 = market
            .add("l29_14")
            .static({ suppliers: layer28, factory: () => 2914 })
        const $l29_15 = market
            .add("l29_15")
            .static({ suppliers: layer28, factory: () => 2915 })
        const $l29_16 = market
            .add("l29_16")
            .static({ suppliers: layer28, factory: () => 2916 })
        const $l29_17 = market
            .add("l29_17")
            .static({ suppliers: layer28, factory: () => 2917 })
        const $l29_18 = market
            .add("l29_18")
            .static({ suppliers: layer28, factory: () => 2918 })
        const $l29_19 = market
            .add("l29_19")
            .static({ suppliers: layer28, factory: () => 2919 })
        const $l29_20 = market
            .add("l29_20")
            .static({ suppliers: layer28, factory: () => 2920 })
        const layer29 = [
            $l29_1,
            $l29_2,
            $l29_3,
            $l29_4,
            $l29_5,
            $l29_6,
            $l29_7,
            $l29_8,
            $l29_9,
            $l29_10,
            $l29_11,
            $l29_12,
            $l29_13,
            $l29_14,
            $l29_15,
            $l29_16,
            $l29_17,
            $l29_18,
            $l29_19,
            $l29_20
        ]

        // Layer 30: depends on layer29 suppliers
        const $l30_1 = market
            .add("l30_1")
            .static({ suppliers: layer29, factory: () => 3001 })
        const $l30_2 = market
            .add("l30_2")
            .static({ suppliers: layer29, factory: () => 3002 })
        const $l30_3 = market
            .add("l30_3")
            .static({ suppliers: layer29, factory: () => 3003 })
        const $l30_4 = market
            .add("l30_4")
            .static({ suppliers: layer29, factory: () => 3004 })
        const $l30_5 = market
            .add("l30_5")
            .static({ suppliers: layer29, factory: () => 3005 })
        const $l30_6 = market
            .add("l30_6")
            .static({ suppliers: layer29, factory: () => 3006 })
        const $l30_7 = market
            .add("l30_7")
            .static({ suppliers: layer29, factory: () => 3007 })
        const $l30_8 = market
            .add("l30_8")
            .static({ suppliers: layer29, factory: () => 3008 })
        const $l30_9 = market
            .add("l30_9")
            .static({ suppliers: layer29, factory: () => 3009 })
        const $l30_10 = market
            .add("l30_10")
            .static({ suppliers: layer29, factory: () => 3010 })
        const $l30_11 = market
            .add("l30_11")
            .static({ suppliers: layer29, factory: () => 3011 })
        const $l30_12 = market
            .add("l30_12")
            .static({ suppliers: layer29, factory: () => 3012 })
        const $l30_13 = market
            .add("l30_13")
            .static({ suppliers: layer29, factory: () => 3013 })
        const $l30_14 = market
            .add("l30_14")
            .static({ suppliers: layer29, factory: () => 3014 })
        const $l30_15 = market
            .add("l30_15")
            .static({ suppliers: layer29, factory: () => 3015 })
        const $l30_16 = market
            .add("l30_16")
            .static({ suppliers: layer29, factory: () => 3016 })
        const $l30_17 = market
            .add("l30_17")
            .static({ suppliers: layer29, factory: () => 3017 })
        const $l30_18 = market
            .add("l30_18")
            .static({ suppliers: layer29, factory: () => 3018 })
        const $l30_19 = market
            .add("l30_19")
            .static({ suppliers: layer29, factory: () => 3019 })
        const $l30_20 = market
            .add("l30_20")
            .static({ suppliers: layer29, factory: () => 3020 })
        const layer30 = [
            $l30_1,
            $l30_2,
            $l30_3,
            $l30_4,
            $l30_5,
            $l30_6,
            $l30_7,
            $l30_8,
            $l30_9,
            $l30_10,
            $l30_11,
            $l30_12,
            $l30_13,
            $l30_14,
            $l30_15,
            $l30_16,
            $l30_17,
            $l30_18,
            $l30_19,
            $l30_20
        ]

        // Layer 31: depends on layer30 suppliers
        const $l31_1 = market
            .add("l31_1")
            .static({ suppliers: layer30, factory: () => 3101 })
        const $l31_2 = market
            .add("l31_2")
            .static({ suppliers: layer30, factory: () => 3102 })
        const $l31_3 = market
            .add("l31_3")
            .static({ suppliers: layer30, factory: () => 3103 })
        const $l31_4 = market
            .add("l31_4")
            .static({ suppliers: layer30, factory: () => 3104 })
        const $l31_5 = market
            .add("l31_5")
            .static({ suppliers: layer30, factory: () => 3105 })
        const $l31_6 = market
            .add("l31_6")
            .static({ suppliers: layer30, factory: () => 3106 })
        const $l31_7 = market
            .add("l31_7")
            .static({ suppliers: layer30, factory: () => 3107 })
        const $l31_8 = market
            .add("l31_8")
            .static({ suppliers: layer30, factory: () => 3108 })
        const $l31_9 = market
            .add("l31_9")
            .static({ suppliers: layer30, factory: () => 3109 })
        const $l31_10 = market
            .add("l31_10")
            .static({ suppliers: layer30, factory: () => 3110 })
        const $l31_11 = market
            .add("l31_11")
            .static({ suppliers: layer30, factory: () => 3111 })
        const $l31_12 = market
            .add("l31_12")
            .static({ suppliers: layer30, factory: () => 3112 })
        const $l31_13 = market
            .add("l31_13")
            .static({ suppliers: layer30, factory: () => 3113 })
        const $l31_14 = market
            .add("l31_14")
            .static({ suppliers: layer30, factory: () => 3114 })
        const $l31_15 = market
            .add("l31_15")
            .static({ suppliers: layer30, factory: () => 3115 })
        const $l31_16 = market
            .add("l31_16")
            .static({ suppliers: layer30, factory: () => 3116 })
        const $l31_17 = market
            .add("l31_17")
            .static({ suppliers: layer30, factory: () => 3117 })
        const $l31_18 = market
            .add("l31_18")
            .static({ suppliers: layer30, factory: () => 3118 })
        const $l31_19 = market
            .add("l31_19")
            .static({ suppliers: layer30, factory: () => 3119 })
        const $l31_20 = market
            .add("l31_20")
            .static({ suppliers: layer30, factory: () => 3120 })
        const layer31 = [
            $l31_1,
            $l31_2,
            $l31_3,
            $l31_4,
            $l31_5,
            $l31_6,
            $l31_7,
            $l31_8,
            $l31_9,
            $l31_10,
            $l31_11,
            $l31_12,
            $l31_13,
            $l31_14,
            $l31_15,
            $l31_16,
            $l31_17,
            $l31_18,
            $l31_19,
            $l31_20
        ]

        // Layer 32: depends on layer31 suppliers
        const $l32_1 = market
            .add("l32_1")
            .static({ suppliers: layer31, factory: () => 3201 })
        const $l32_2 = market
            .add("l32_2")
            .static({ suppliers: layer31, factory: () => 3202 })
        const $l32_3 = market
            .add("l32_3")
            .static({ suppliers: layer31, factory: () => 3203 })
        const $l32_4 = market
            .add("l32_4")
            .static({ suppliers: layer31, factory: () => 3204 })
        const $l32_5 = market
            .add("l32_5")
            .static({ suppliers: layer31, factory: () => 3205 })
        const $l32_6 = market
            .add("l32_6")
            .static({ suppliers: layer31, factory: () => 3206 })
        const $l32_7 = market
            .add("l32_7")
            .static({ suppliers: layer31, factory: () => 3207 })
        const $l32_8 = market
            .add("l32_8")
            .static({ suppliers: layer31, factory: () => 3208 })
        const $l32_9 = market
            .add("l32_9")
            .static({ suppliers: layer31, factory: () => 3209 })
        const $l32_10 = market
            .add("l32_10")
            .static({ suppliers: layer31, factory: () => 3210 })
        const $l32_11 = market
            .add("l32_11")
            .static({ suppliers: layer31, factory: () => 3211 })
        const $l32_12 = market
            .add("l32_12")
            .static({ suppliers: layer31, factory: () => 3212 })
        const $l32_13 = market
            .add("l32_13")
            .static({ suppliers: layer31, factory: () => 3213 })
        const $l32_14 = market
            .add("l32_14")
            .static({ suppliers: layer31, factory: () => 3214 })
        const $l32_15 = market
            .add("l32_15")
            .static({ suppliers: layer31, factory: () => 3215 })
        const $l32_16 = market
            .add("l32_16")
            .static({ suppliers: layer31, factory: () => 3216 })
        const $l32_17 = market
            .add("l32_17")
            .static({ suppliers: layer31, factory: () => 3217 })
        const $l32_18 = market
            .add("l32_18")
            .static({ suppliers: layer31, factory: () => 3218 })
        const $l32_19 = market
            .add("l32_19")
            .static({ suppliers: layer31, factory: () => 3219 })
        const $l32_20 = market
            .add("l32_20")
            .static({ suppliers: layer31, factory: () => 3220 })
        const layer32 = [
            $l32_1,
            $l32_2,
            $l32_3,
            $l32_4,
            $l32_5,
            $l32_6,
            $l32_7,
            $l32_8,
            $l32_9,
            $l32_10,
            $l32_11,
            $l32_12,
            $l32_13,
            $l32_14,
            $l32_15,
            $l32_16,
            $l32_17,
            $l32_18,
            $l32_19,
            $l32_20
        ]

        // Layer 33: depends on layer32 suppliers
        const $l33_1 = market
            .add("l33_1")
            .static({ suppliers: layer32, factory: () => 3301 })
        const $l33_2 = market
            .add("l33_2")
            .static({ suppliers: layer32, factory: () => 3302 })
        const $l33_3 = market
            .add("l33_3")
            .static({ suppliers: layer32, factory: () => 3303 })
        const $l33_4 = market
            .add("l33_4")
            .static({ suppliers: layer32, factory: () => 3304 })
        const $l33_5 = market
            .add("l33_5")
            .static({ suppliers: layer32, factory: () => 3305 })
        const $l33_6 = market
            .add("l33_6")
            .static({ suppliers: layer32, factory: () => 3306 })
        const $l33_7 = market
            .add("l33_7")
            .static({ suppliers: layer32, factory: () => 3307 })
        const $l33_8 = market
            .add("l33_8")
            .static({ suppliers: layer32, factory: () => 3308 })
        const $l33_9 = market
            .add("l33_9")
            .static({ suppliers: layer32, factory: () => 3309 })
        const $l33_10 = market
            .add("l33_10")
            .static({ suppliers: layer32, factory: () => 3310 })
        const $l33_11 = market
            .add("l33_11")
            .static({ suppliers: layer32, factory: () => 3311 })
        const $l33_12 = market
            .add("l33_12")
            .static({ suppliers: layer32, factory: () => 3312 })
        const $l33_13 = market
            .add("l33_13")
            .static({ suppliers: layer32, factory: () => 3313 })
        const $l33_14 = market
            .add("l33_14")
            .static({ suppliers: layer32, factory: () => 3314 })
        const $l33_15 = market
            .add("l33_15")
            .static({ suppliers: layer32, factory: () => 3315 })
        const $l33_16 = market
            .add("l33_16")
            .static({ suppliers: layer32, factory: () => 3316 })
        const $l33_17 = market
            .add("l33_17")
            .static({ suppliers: layer32, factory: () => 3317 })
        const $l33_18 = market
            .add("l33_18")
            .static({ suppliers: layer32, factory: () => 3318 })
        const $l33_19 = market
            .add("l33_19")
            .static({ suppliers: layer32, factory: () => 3319 })
        const $l33_20 = market
            .add("l33_20")
            .static({ suppliers: layer32, factory: () => 3320 })
        const layer33 = [
            $l33_1,
            $l33_2,
            $l33_3,
            $l33_4,
            $l33_5,
            $l33_6,
            $l33_7,
            $l33_8,
            $l33_9,
            $l33_10,
            $l33_11,
            $l33_12,
            $l33_13,
            $l33_14,
            $l33_15,
            $l33_16,
            $l33_17,
            $l33_18,
            $l33_19,
            $l33_20
        ]

        // Layer 34: depends on layer33 suppliers
        const $l34_1 = market
            .add("l34_1")
            .static({ suppliers: layer33, factory: () => 3401 })
        const $l34_2 = market
            .add("l34_2")
            .static({ suppliers: layer33, factory: () => 3402 })
        const $l34_3 = market
            .add("l34_3")
            .static({ suppliers: layer33, factory: () => 3403 })
        const $l34_4 = market
            .add("l34_4")
            .static({ suppliers: layer33, factory: () => 3404 })
        const $l34_5 = market
            .add("l34_5")
            .static({ suppliers: layer33, factory: () => 3405 })
        const $l34_6 = market
            .add("l34_6")
            .static({ suppliers: layer33, factory: () => 3406 })
        const $l34_7 = market
            .add("l34_7")
            .static({ suppliers: layer33, factory: () => 3407 })
        const $l34_8 = market
            .add("l34_8")
            .static({ suppliers: layer33, factory: () => 3408 })
        const $l34_9 = market
            .add("l34_9")
            .static({ suppliers: layer33, factory: () => 3409 })
        const $l34_10 = market
            .add("l34_10")
            .static({ suppliers: layer33, factory: () => 3410 })
        const $l34_11 = market
            .add("l34_11")
            .static({ suppliers: layer33, factory: () => 3411 })
        const $l34_12 = market
            .add("l34_12")
            .static({ suppliers: layer33, factory: () => 3412 })
        const $l34_13 = market
            .add("l34_13")
            .static({ suppliers: layer33, factory: () => 3413 })
        const $l34_14 = market
            .add("l34_14")
            .static({ suppliers: layer33, factory: () => 3414 })
        const $l34_15 = market
            .add("l34_15")
            .static({ suppliers: layer33, factory: () => 3415 })
        const $l34_16 = market
            .add("l34_16")
            .static({ suppliers: layer33, factory: () => 3416 })
        const $l34_17 = market
            .add("l34_17")
            .static({ suppliers: layer33, factory: () => 3417 })
        const $l34_18 = market
            .add("l34_18")
            .static({ suppliers: layer33, factory: () => 3418 })
        const $l34_19 = market
            .add("l34_19")
            .static({ suppliers: layer33, factory: () => 3419 })
        const $l34_20 = market
            .add("l34_20")
            .static({ suppliers: layer33, factory: () => 3420 })
        const layer34 = [
            $l34_1,
            $l34_2,
            $l34_3,
            $l34_4,
            $l34_5,
            $l34_6,
            $l34_7,
            $l34_8,
            $l34_9,
            $l34_10,
            $l34_11,
            $l34_12,
            $l34_13,
            $l34_14,
            $l34_15,
            $l34_16,
            $l34_17,
            $l34_18,
            $l34_19,
            $l34_20
        ]

        // Layer 35: depends on layer34 suppliers
        const $l35_1 = market
            .add("l35_1")
            .static({ suppliers: layer34, factory: () => 3501 })
        const $l35_2 = market
            .add("l35_2")
            .static({ suppliers: layer34, factory: () => 3502 })
        const $l35_3 = market
            .add("l35_3")
            .static({ suppliers: layer34, factory: () => 3503 })
        const $l35_4 = market
            .add("l35_4")
            .static({ suppliers: layer34, factory: () => 3504 })
        const $l35_5 = market
            .add("l35_5")
            .static({ suppliers: layer34, factory: () => 3505 })
        const $l35_6 = market
            .add("l35_6")
            .static({ suppliers: layer34, factory: () => 3506 })
        const $l35_7 = market
            .add("l35_7")
            .static({ suppliers: layer34, factory: () => 3507 })
        const $l35_8 = market
            .add("l35_8")
            .static({ suppliers: layer34, factory: () => 3508 })
        const $l35_9 = market
            .add("l35_9")
            .static({ suppliers: layer34, factory: () => 3509 })
        const $l35_10 = market
            .add("l35_10")
            .static({ suppliers: layer34, factory: () => 3510 })
        const $l35_11 = market
            .add("l35_11")
            .static({ suppliers: layer34, factory: () => 3511 })
        const $l35_12 = market
            .add("l35_12")
            .static({ suppliers: layer34, factory: () => 3512 })
        const $l35_13 = market
            .add("l35_13")
            .static({ suppliers: layer34, factory: () => 3513 })
        const $l35_14 = market
            .add("l35_14")
            .static({ suppliers: layer34, factory: () => 3514 })
        const $l35_15 = market
            .add("l35_15")
            .static({ suppliers: layer34, factory: () => 3515 })
        const $l35_16 = market
            .add("l35_16")
            .static({ suppliers: layer34, factory: () => 3516 })
        const $l35_17 = market
            .add("l35_17")
            .static({ suppliers: layer34, factory: () => 3517 })
        const $l35_18 = market
            .add("l35_18")
            .static({ suppliers: layer34, factory: () => 3518 })
        const $l35_19 = market
            .add("l35_19")
            .static({ suppliers: layer34, factory: () => 3519 })
        const $l35_20 = market
            .add("l35_20")
            .static({ suppliers: layer34, factory: () => 3520 })
        const layer35 = [
            $l35_1,
            $l35_2,
            $l35_3,
            $l35_4,
            $l35_5,
            $l35_6,
            $l35_7,
            $l35_8,
            $l35_9,
            $l35_10,
            $l35_11,
            $l35_12,
            $l35_13,
            $l35_14,
            $l35_15,
            $l35_16,
            $l35_17,
            $l35_18,
            $l35_19,
            $l35_20
        ]

        // Layer 36: depends on layer35 suppliers
        const $l36_1 = market
            .add("l36_1")
            .static({ suppliers: layer35, factory: () => 3601 })
        const $l36_2 = market
            .add("l36_2")
            .static({ suppliers: layer35, factory: () => 3602 })
        const $l36_3 = market
            .add("l36_3")
            .static({ suppliers: layer35, factory: () => 3603 })
        const $l36_4 = market
            .add("l36_4")
            .static({ suppliers: layer35, factory: () => 3604 })
        const $l36_5 = market
            .add("l36_5")
            .static({ suppliers: layer35, factory: () => 3605 })
        const $l36_6 = market
            .add("l36_6")
            .static({ suppliers: layer35, factory: () => 3606 })
        const $l36_7 = market
            .add("l36_7")
            .static({ suppliers: layer35, factory: () => 3607 })
        const $l36_8 = market
            .add("l36_8")
            .static({ suppliers: layer35, factory: () => 3608 })
        const $l36_9 = market
            .add("l36_9")
            .static({ suppliers: layer35, factory: () => 3609 })
        const $l36_10 = market
            .add("l36_10")
            .static({ suppliers: layer35, factory: () => 3610 })
        const $l36_11 = market
            .add("l36_11")
            .static({ suppliers: layer35, factory: () => 3611 })
        const $l36_12 = market
            .add("l36_12")
            .static({ suppliers: layer35, factory: () => 3612 })
        const $l36_13 = market
            .add("l36_13")
            .static({ suppliers: layer35, factory: () => 3613 })
        const $l36_14 = market
            .add("l36_14")
            .static({ suppliers: layer35, factory: () => 3614 })
        const $l36_15 = market
            .add("l36_15")
            .static({ suppliers: layer35, factory: () => 3615 })
        const $l36_16 = market
            .add("l36_16")
            .static({ suppliers: layer35, factory: () => 3616 })
        const $l36_17 = market
            .add("l36_17")
            .static({ suppliers: layer35, factory: () => 3617 })
        const $l36_18 = market
            .add("l36_18")
            .static({ suppliers: layer35, factory: () => 3618 })
        const $l36_19 = market
            .add("l36_19")
            .static({ suppliers: layer35, factory: () => 3619 })
        const $l36_20 = market
            .add("l36_20")
            .static({ suppliers: layer35, factory: () => 3620 })
        const layer36 = [
            $l36_1,
            $l36_2,
            $l36_3,
            $l36_4,
            $l36_5,
            $l36_6,
            $l36_7,
            $l36_8,
            $l36_9,
            $l36_10,
            $l36_11,
            $l36_12,
            $l36_13,
            $l36_14,
            $l36_15,
            $l36_16,
            $l36_17,
            $l36_18,
            $l36_19,
            $l36_20
        ]

        // Layer 37: depends on layer36 suppliers
        const $l37_1 = market
            .add("l37_1")
            .static({ suppliers: layer36, factory: () => 3701 })
        const $l37_2 = market
            .add("l37_2")
            .static({ suppliers: layer36, factory: () => 3702 })
        const $l37_3 = market
            .add("l37_3")
            .static({ suppliers: layer36, factory: () => 3703 })
        const $l37_4 = market
            .add("l37_4")
            .static({ suppliers: layer36, factory: () => 3704 })
        const $l37_5 = market
            .add("l37_5")
            .static({ suppliers: layer36, factory: () => 3705 })
        const $l37_6 = market
            .add("l37_6")
            .static({ suppliers: layer36, factory: () => 3706 })
        const $l37_7 = market
            .add("l37_7")
            .static({ suppliers: layer36, factory: () => 3707 })
        const $l37_8 = market
            .add("l37_8")
            .static({ suppliers: layer36, factory: () => 3708 })
        const $l37_9 = market
            .add("l37_9")
            .static({ suppliers: layer36, factory: () => 3709 })
        const $l37_10 = market
            .add("l37_10")
            .static({ suppliers: layer36, factory: () => 3710 })
        const $l37_11 = market
            .add("l37_11")
            .static({ suppliers: layer36, factory: () => 3711 })
        const $l37_12 = market
            .add("l37_12")
            .static({ suppliers: layer36, factory: () => 3712 })
        const $l37_13 = market
            .add("l37_13")
            .static({ suppliers: layer36, factory: () => 3713 })
        const $l37_14 = market
            .add("l37_14")
            .static({ suppliers: layer36, factory: () => 3714 })
        const $l37_15 = market
            .add("l37_15")
            .static({ suppliers: layer36, factory: () => 3715 })
        const $l37_16 = market
            .add("l37_16")
            .static({ suppliers: layer36, factory: () => 3716 })
        const $l37_17 = market
            .add("l37_17")
            .static({ suppliers: layer36, factory: () => 3717 })
        const $l37_18 = market
            .add("l37_18")
            .static({ suppliers: layer36, factory: () => 3718 })
        const $l37_19 = market
            .add("l37_19")
            .static({ suppliers: layer36, factory: () => 3719 })
        const $l37_20 = market
            .add("l37_20")
            .static({ suppliers: layer36, factory: () => 3720 })
        const layer37 = [
            $l37_1,
            $l37_2,
            $l37_3,
            $l37_4,
            $l37_5,
            $l37_6,
            $l37_7,
            $l37_8,
            $l37_9,
            $l37_10,
            $l37_11,
            $l37_12,
            $l37_13,
            $l37_14,
            $l37_15,
            $l37_16,
            $l37_17,
            $l37_18,
            $l37_19,
            $l37_20
        ]

        // Layer 38: depends on layer37 suppliers
        const $l38_1 = market
            .add("l38_1")
            .static({ suppliers: layer37, factory: () => 3801 })
        const $l38_2 = market
            .add("l38_2")
            .static({ suppliers: layer37, factory: () => 3802 })
        const $l38_3 = market
            .add("l38_3")
            .static({ suppliers: layer37, factory: () => 3803 })
        const $l38_4 = market
            .add("l38_4")
            .static({ suppliers: layer37, factory: () => 3804 })
        const $l38_5 = market
            .add("l38_5")
            .static({ suppliers: layer37, factory: () => 3805 })
        const $l38_6 = market
            .add("l38_6")
            .static({ suppliers: layer37, factory: () => 3806 })
        const $l38_7 = market
            .add("l38_7")
            .static({ suppliers: layer37, factory: () => 3807 })
        const $l38_8 = market
            .add("l38_8")
            .static({ suppliers: layer37, factory: () => 3808 })
        const $l38_9 = market
            .add("l38_9")
            .static({ suppliers: layer37, factory: () => 3809 })
        const $l38_10 = market
            .add("l38_10")
            .static({ suppliers: layer37, factory: () => 3810 })
        const $l38_11 = market
            .add("l38_11")
            .static({ suppliers: layer37, factory: () => 3811 })
        const $l38_12 = market
            .add("l38_12")
            .static({ suppliers: layer37, factory: () => 3812 })
        const $l38_13 = market
            .add("l38_13")
            .static({ suppliers: layer37, factory: () => 3813 })
        const $l38_14 = market
            .add("l38_14")
            .static({ suppliers: layer37, factory: () => 3814 })
        const $l38_15 = market
            .add("l38_15")
            .static({ suppliers: layer37, factory: () => 3815 })
        const $l38_16 = market
            .add("l38_16")
            .static({ suppliers: layer37, factory: () => 3816 })
        const $l38_17 = market
            .add("l38_17")
            .static({ suppliers: layer37, factory: () => 3817 })
        const $l38_18 = market
            .add("l38_18")
            .static({ suppliers: layer37, factory: () => 3818 })
        const $l38_19 = market
            .add("l38_19")
            .static({ suppliers: layer37, factory: () => 3819 })
        const $l38_20 = market
            .add("l38_20")
            .static({ suppliers: layer37, factory: () => 3820 })
        const layer38 = [
            $l38_1,
            $l38_2,
            $l38_3,
            $l38_4,
            $l38_5,
            $l38_6,
            $l38_7,
            $l38_8,
            $l38_9,
            $l38_10,
            $l38_11,
            $l38_12,
            $l38_13,
            $l38_14,
            $l38_15,
            $l38_16,
            $l38_17,
            $l38_18,
            $l38_19,
            $l38_20
        ]

        // Layer 39: depends on layer38 suppliers
        const $l39_1 = market
            .add("l39_1")
            .static({ suppliers: layer38, factory: () => 3901 })
        const $l39_2 = market
            .add("l39_2")
            .static({ suppliers: layer38, factory: () => 3902 })
        const $l39_3 = market
            .add("l39_3")
            .static({ suppliers: layer38, factory: () => 3903 })
        const $l39_4 = market
            .add("l39_4")
            .static({ suppliers: layer38, factory: () => 3904 })
        const $l39_5 = market
            .add("l39_5")
            .static({ suppliers: layer38, factory: () => 3905 })
        const $l39_6 = market
            .add("l39_6")
            .static({ suppliers: layer38, factory: () => 3906 })
        const $l39_7 = market
            .add("l39_7")
            .static({ suppliers: layer38, factory: () => 3907 })
        const $l39_8 = market
            .add("l39_8")
            .static({ suppliers: layer38, factory: () => 3908 })
        const $l39_9 = market
            .add("l39_9")
            .static({ suppliers: layer38, factory: () => 3909 })
        const $l39_10 = market
            .add("l39_10")
            .static({ suppliers: layer38, factory: () => 3910 })
        const $l39_11 = market
            .add("l39_11")
            .static({ suppliers: layer38, factory: () => 3911 })
        const $l39_12 = market
            .add("l39_12")
            .static({ suppliers: layer38, factory: () => 3912 })
        const $l39_13 = market
            .add("l39_13")
            .static({ suppliers: layer38, factory: () => 3913 })
        const $l39_14 = market
            .add("l39_14")
            .static({ suppliers: layer38, factory: () => 3914 })
        const $l39_15 = market
            .add("l39_15")
            .static({ suppliers: layer38, factory: () => 3915 })
        const $l39_16 = market
            .add("l39_16")
            .static({ suppliers: layer38, factory: () => 3916 })
        const $l39_17 = market
            .add("l39_17")
            .static({ suppliers: layer38, factory: () => 3917 })
        const $l39_18 = market
            .add("l39_18")
            .static({ suppliers: layer38, factory: () => 3918 })
        const $l39_19 = market
            .add("l39_19")
            .static({ suppliers: layer38, factory: () => 3919 })
        const $l39_20 = market
            .add("l39_20")
            .static({ suppliers: layer38, factory: () => 3920 })
        const layer39 = [
            $l39_1,
            $l39_2,
            $l39_3,
            $l39_4,
            $l39_5,
            $l39_6,
            $l39_7,
            $l39_8,
            $l39_9,
            $l39_10,
            $l39_11,
            $l39_12,
            $l39_13,
            $l39_14,
            $l39_15,
            $l39_16,
            $l39_17,
            $l39_18,
            $l39_19,
            $l39_20
        ]

        // Layer 40: depends on layer39 suppliers
        const $l40_1 = market
            .add("l40_1")
            .static({ suppliers: layer39, factory: () => 4001 })
        const $l40_2 = market
            .add("l40_2")
            .static({ suppliers: layer39, factory: () => 4002 })
        const $l40_3 = market
            .add("l40_3")
            .static({ suppliers: layer39, factory: () => 4003 })
        const $l40_4 = market
            .add("l40_4")
            .static({ suppliers: layer39, factory: () => 4004 })
        const $l40_5 = market
            .add("l40_5")
            .static({ suppliers: layer39, factory: () => 4005 })
        const $l40_6 = market
            .add("l40_6")
            .static({ suppliers: layer39, factory: () => 4006 })
        const $l40_7 = market
            .add("l40_7")
            .static({ suppliers: layer39, factory: () => 4007 })
        const $l40_8 = market
            .add("l40_8")
            .static({ suppliers: layer39, factory: () => 4008 })
        const $l40_9 = market
            .add("l40_9")
            .static({ suppliers: layer39, factory: () => 4009 })
        const $l40_10 = market
            .add("l40_10")
            .static({ suppliers: layer39, factory: () => 4010 })
        const $l40_11 = market
            .add("l40_11")
            .static({ suppliers: layer39, factory: () => 4011 })
        const $l40_12 = market
            .add("l40_12")
            .static({ suppliers: layer39, factory: () => 4012 })
        const $l40_13 = market
            .add("l40_13")
            .static({ suppliers: layer39, factory: () => 4013 })
        const $l40_14 = market
            .add("l40_14")
            .static({ suppliers: layer39, factory: () => 4014 })
        const $l40_15 = market
            .add("l40_15")
            .static({ suppliers: layer39, factory: () => 4015 })
        const $l40_16 = market
            .add("l40_16")
            .static({ suppliers: layer39, factory: () => 4016 })
        const $l40_17 = market
            .add("l40_17")
            .static({ suppliers: layer39, factory: () => 4017 })
        const $l40_18 = market
            .add("l40_18")
            .static({ suppliers: layer39, factory: () => 4018 })
        const $l40_19 = market
            .add("l40_19")
            .static({ suppliers: layer39, factory: () => 4019 })
        const $l40_20 = market
            .add("l40_20")
            .static({ suppliers: layer39, factory: () => 4020 })
        const layer40 = [
            $l40_1,
            $l40_2,
            $l40_3,
            $l40_4,
            $l40_5,
            $l40_6,
            $l40_7,
            $l40_8,
            $l40_9,
            $l40_10,
            $l40_11,
            $l40_12,
            $l40_13,
            $l40_14,
            $l40_15,
            $l40_16,
            $l40_17,
            $l40_18,
            $l40_19,
            $l40_20
        ]

        // Layer 41: depends on layer40 suppliers
        const $l41_1 = market
            .add("l41_1")
            .static({ suppliers: layer40, factory: () => 4101 })
        const $l41_2 = market
            .add("l41_2")
            .static({ suppliers: layer40, factory: () => 4102 })
        const $l41_3 = market
            .add("l41_3")
            .static({ suppliers: layer40, factory: () => 4103 })
        const $l41_4 = market
            .add("l41_4")
            .static({ suppliers: layer40, factory: () => 4104 })
        const $l41_5 = market
            .add("l41_5")
            .static({ suppliers: layer40, factory: () => 4105 })
        const $l41_6 = market
            .add("l41_6")
            .static({ suppliers: layer40, factory: () => 4106 })
        const $l41_7 = market
            .add("l41_7")
            .static({ suppliers: layer40, factory: () => 4107 })
        const $l41_8 = market
            .add("l41_8")
            .static({ suppliers: layer40, factory: () => 4108 })
        const $l41_9 = market
            .add("l41_9")
            .static({ suppliers: layer40, factory: () => 4109 })
        const $l41_10 = market
            .add("l41_10")
            .static({ suppliers: layer40, factory: () => 4110 })
        const $l41_11 = market
            .add("l41_11")
            .static({ suppliers: layer40, factory: () => 4111 })
        const $l41_12 = market
            .add("l41_12")
            .static({ suppliers: layer40, factory: () => 4112 })
        const $l41_13 = market
            .add("l41_13")
            .static({ suppliers: layer40, factory: () => 4113 })
        const $l41_14 = market
            .add("l41_14")
            .static({ suppliers: layer40, factory: () => 4114 })
        const $l41_15 = market
            .add("l41_15")
            .static({ suppliers: layer40, factory: () => 4115 })
        const $l41_16 = market
            .add("l41_16")
            .static({ suppliers: layer40, factory: () => 4116 })
        const $l41_17 = market
            .add("l41_17")
            .static({ suppliers: layer40, factory: () => 4117 })
        const $l41_18 = market
            .add("l41_18")
            .static({ suppliers: layer40, factory: () => 4118 })
        const $l41_19 = market
            .add("l41_19")
            .static({ suppliers: layer40, factory: () => 4119 })
        const $l41_20 = market
            .add("l41_20")
            .static({ suppliers: layer40, factory: () => 4120 })
        const layer41 = [
            $l41_1,
            $l41_2,
            $l41_3,
            $l41_4,
            $l41_5,
            $l41_6,
            $l41_7,
            $l41_8,
            $l41_9,
            $l41_10,
            $l41_11,
            $l41_12,
            $l41_13,
            $l41_14,
            $l41_15,
            $l41_16,
            $l41_17,
            $l41_18,
            $l41_19,
            $l41_20
        ]

        // Layer 42: depends on layer41 suppliers
        const $l42_1 = market
            .add("l42_1")
            .static({ suppliers: layer41, factory: () => 4201 })
        const $l42_2 = market
            .add("l42_2")
            .static({ suppliers: layer41, factory: () => 4202 })
        const $l42_3 = market
            .add("l42_3")
            .static({ suppliers: layer41, factory: () => 4203 })
        const $l42_4 = market
            .add("l42_4")
            .static({ suppliers: layer41, factory: () => 4204 })
        const $l42_5 = market
            .add("l42_5")
            .static({ suppliers: layer41, factory: () => 4205 })
        const $l42_6 = market
            .add("l42_6")
            .static({ suppliers: layer41, factory: () => 4206 })
        const $l42_7 = market
            .add("l42_7")
            .static({ suppliers: layer41, factory: () => 4207 })
        const $l42_8 = market
            .add("l42_8")
            .static({ suppliers: layer41, factory: () => 4208 })
        const $l42_9 = market
            .add("l42_9")
            .static({ suppliers: layer41, factory: () => 4209 })
        const $l42_10 = market
            .add("l42_10")
            .static({ suppliers: layer41, factory: () => 4210 })
        const $l42_11 = market
            .add("l42_11")
            .static({ suppliers: layer41, factory: () => 4211 })
        const $l42_12 = market
            .add("l42_12")
            .static({ suppliers: layer41, factory: () => 4212 })
        const $l42_13 = market
            .add("l42_13")
            .static({ suppliers: layer41, factory: () => 4213 })
        const $l42_14 = market
            .add("l42_14")
            .static({ suppliers: layer41, factory: () => 4214 })
        const $l42_15 = market
            .add("l42_15")
            .static({ suppliers: layer41, factory: () => 4215 })
        const $l42_16 = market
            .add("l42_16")
            .static({ suppliers: layer41, factory: () => 4216 })
        const $l42_17 = market
            .add("l42_17")
            .static({ suppliers: layer41, factory: () => 4217 })
        const $l42_18 = market
            .add("l42_18")
            .static({ suppliers: layer41, factory: () => 4218 })
        const $l42_19 = market
            .add("l42_19")
            .static({ suppliers: layer41, factory: () => 4219 })
        const $l42_20 = market
            .add("l42_20")
            .static({ suppliers: layer41, factory: () => 4220 })
        const layer42 = [
            $l42_1,
            $l42_2,
            $l42_3,
            $l42_4,
            $l42_5,
            $l42_6,
            $l42_7,
            $l42_8,
            $l42_9,
            $l42_10,
            $l42_11,
            $l42_12,
            $l42_13,
            $l42_14,
            $l42_15,
            $l42_16,
            $l42_17,
            $l42_18,
            $l42_19,
            $l42_20
        ]

        // Layer 43: depends on layer42 suppliers
        const $l43_1 = market
            .add("l43_1")
            .static({ suppliers: layer42, factory: () => 4301 })
        const $l43_2 = market
            .add("l43_2")
            .static({ suppliers: layer42, factory: () => 4302 })
        const $l43_3 = market
            .add("l43_3")
            .static({ suppliers: layer42, factory: () => 4303 })
        const $l43_4 = market
            .add("l43_4")
            .static({ suppliers: layer42, factory: () => 4304 })
        const $l43_5 = market
            .add("l43_5")
            .static({ suppliers: layer42, factory: () => 4305 })
        const $l43_6 = market
            .add("l43_6")
            .static({ suppliers: layer42, factory: () => 4306 })
        const $l43_7 = market
            .add("l43_7")
            .static({ suppliers: layer42, factory: () => 4307 })
        const $l43_8 = market
            .add("l43_8")
            .static({ suppliers: layer42, factory: () => 4308 })
        const $l43_9 = market
            .add("l43_9")
            .static({ suppliers: layer42, factory: () => 4309 })
        const $l43_10 = market
            .add("l43_10")
            .static({ suppliers: layer42, factory: () => 4310 })
        const $l43_11 = market
            .add("l43_11")
            .static({ suppliers: layer42, factory: () => 4311 })
        const $l43_12 = market
            .add("l43_12")
            .static({ suppliers: layer42, factory: () => 4312 })
        const $l43_13 = market
            .add("l43_13")
            .static({ suppliers: layer42, factory: () => 4313 })
        const $l43_14 = market
            .add("l43_14")
            .static({ suppliers: layer42, factory: () => 4314 })
        const $l43_15 = market
            .add("l43_15")
            .static({ suppliers: layer42, factory: () => 4315 })
        const $l43_16 = market
            .add("l43_16")
            .static({ suppliers: layer42, factory: () => 4316 })
        const $l43_17 = market
            .add("l43_17")
            .static({ suppliers: layer42, factory: () => 4317 })
        const $l43_18 = market
            .add("l43_18")
            .static({ suppliers: layer42, factory: () => 4318 })
        const $l43_19 = market
            .add("l43_19")
            .static({ suppliers: layer42, factory: () => 4319 })
        const $l43_20 = market
            .add("l43_20")
            .static({ suppliers: layer42, factory: () => 4320 })
        const layer43 = [
            $l43_1,
            $l43_2,
            $l43_3,
            $l43_4,
            $l43_5,
            $l43_6,
            $l43_7,
            $l43_8,
            $l43_9,
            $l43_10,
            $l43_11,
            $l43_12,
            $l43_13,
            $l43_14,
            $l43_15,
            $l43_16,
            $l43_17,
            $l43_18,
            $l43_19,
            $l43_20
        ]

        // Layer 44: depends on layer43 suppliers
        const $l44_1 = market
            .add("l44_1")
            .static({ suppliers: layer43, factory: () => 4401 })
        const $l44_2 = market
            .add("l44_2")
            .static({ suppliers: layer43, factory: () => 4402 })
        const $l44_3 = market
            .add("l44_3")
            .static({ suppliers: layer43, factory: () => 4403 })
        const $l44_4 = market
            .add("l44_4")
            .static({ suppliers: layer43, factory: () => 4404 })
        const $l44_5 = market
            .add("l44_5")
            .static({ suppliers: layer43, factory: () => 4405 })
        const $l44_6 = market
            .add("l44_6")
            .static({ suppliers: layer43, factory: () => 4406 })
        const $l44_7 = market
            .add("l44_7")
            .static({ suppliers: layer43, factory: () => 4407 })
        const $l44_8 = market
            .add("l44_8")
            .static({ suppliers: layer43, factory: () => 4408 })
        const $l44_9 = market
            .add("l44_9")
            .static({ suppliers: layer43, factory: () => 4409 })
        const $l44_10 = market
            .add("l44_10")
            .static({ suppliers: layer43, factory: () => 4410 })
        const $l44_11 = market
            .add("l44_11")
            .static({ suppliers: layer43, factory: () => 4411 })
        const $l44_12 = market
            .add("l44_12")
            .static({ suppliers: layer43, factory: () => 4412 })
        const $l44_13 = market
            .add("l44_13")
            .static({ suppliers: layer43, factory: () => 4413 })
        const $l44_14 = market
            .add("l44_14")
            .static({ suppliers: layer43, factory: () => 4414 })
        const $l44_15 = market
            .add("l44_15")
            .static({ suppliers: layer43, factory: () => 4415 })
        const $l44_16 = market
            .add("l44_16")
            .static({ suppliers: layer43, factory: () => 4416 })
        const $l44_17 = market
            .add("l44_17")
            .static({ suppliers: layer43, factory: () => 4417 })
        const $l44_18 = market
            .add("l44_18")
            .static({ suppliers: layer43, factory: () => 4418 })
        const $l44_19 = market
            .add("l44_19")
            .static({ suppliers: layer43, factory: () => 4419 })
        const $l44_20 = market
            .add("l44_20")
            .static({ suppliers: layer43, factory: () => 4420 })
        const layer44 = [
            $l44_1,
            $l44_2,
            $l44_3,
            $l44_4,
            $l44_5,
            $l44_6,
            $l44_7,
            $l44_8,
            $l44_9,
            $l44_10,
            $l44_11,
            $l44_12,
            $l44_13,
            $l44_14,
            $l44_15,
            $l44_16,
            $l44_17,
            $l44_18,
            $l44_19,
            $l44_20
        ]

        // Layer 45: depends on layer44 suppliers
        const $l45_1 = market
            .add("l45_1")
            .static({ suppliers: layer44, factory: () => 4501 })
        const $l45_2 = market
            .add("l45_2")
            .static({ suppliers: layer44, factory: () => 4502 })
        const $l45_3 = market
            .add("l45_3")
            .static({ suppliers: layer44, factory: () => 4503 })
        const $l45_4 = market
            .add("l45_4")
            .static({ suppliers: layer44, factory: () => 4504 })
        const $l45_5 = market
            .add("l45_5")
            .static({ suppliers: layer44, factory: () => 4505 })
        const $l45_6 = market
            .add("l45_6")
            .static({ suppliers: layer44, factory: () => 4506 })
        const $l45_7 = market
            .add("l45_7")
            .static({ suppliers: layer44, factory: () => 4507 })
        const $l45_8 = market
            .add("l45_8")
            .static({ suppliers: layer44, factory: () => 4508 })
        const $l45_9 = market
            .add("l45_9")
            .static({ suppliers: layer44, factory: () => 4509 })
        const $l45_10 = market
            .add("l45_10")
            .static({ suppliers: layer44, factory: () => 4510 })
        const $l45_11 = market
            .add("l45_11")
            .static({ suppliers: layer44, factory: () => 4511 })
        const $l45_12 = market
            .add("l45_12")
            .static({ suppliers: layer44, factory: () => 4512 })
        const $l45_13 = market
            .add("l45_13")
            .static({ suppliers: layer44, factory: () => 4513 })
        const $l45_14 = market
            .add("l45_14")
            .static({ suppliers: layer44, factory: () => 4514 })
        const $l45_15 = market
            .add("l45_15")
            .static({ suppliers: layer44, factory: () => 4515 })
        const $l45_16 = market
            .add("l45_16")
            .static({ suppliers: layer44, factory: () => 4516 })
        const $l45_17 = market
            .add("l45_17")
            .static({ suppliers: layer44, factory: () => 4517 })
        const $l45_18 = market
            .add("l45_18")
            .static({ suppliers: layer44, factory: () => 4518 })
        const $l45_19 = market
            .add("l45_19")
            .static({ suppliers: layer44, factory: () => 4519 })
        const $l45_20 = market
            .add("l45_20")
            .static({ suppliers: layer44, factory: () => 4520 })
        const layer45 = [
            $l45_1,
            $l45_2,
            $l45_3,
            $l45_4,
            $l45_5,
            $l45_6,
            $l45_7,
            $l45_8,
            $l45_9,
            $l45_10,
            $l45_11,
            $l45_12,
            $l45_13,
            $l45_14,
            $l45_15,
            $l45_16,
            $l45_17,
            $l45_18,
            $l45_19,
            $l45_20
        ]

        // Layer 46: depends on layer45 suppliers
        const $l46_1 = market
            .add("l46_1")
            .static({ suppliers: layer45, factory: () => 4601 })
        const $l46_2 = market
            .add("l46_2")
            .static({ suppliers: layer45, factory: () => 4602 })
        const $l46_3 = market
            .add("l46_3")
            .static({ suppliers: layer45, factory: () => 4603 })
        const $l46_4 = market
            .add("l46_4")
            .static({ suppliers: layer45, factory: () => 4604 })
        const $l46_5 = market
            .add("l46_5")
            .static({ suppliers: layer45, factory: () => 4605 })
        const $l46_6 = market
            .add("l46_6")
            .static({ suppliers: layer45, factory: () => 4606 })
        const $l46_7 = market
            .add("l46_7")
            .static({ suppliers: layer45, factory: () => 4607 })
        const $l46_8 = market
            .add("l46_8")
            .static({ suppliers: layer45, factory: () => 4608 })
        const $l46_9 = market
            .add("l46_9")
            .static({ suppliers: layer45, factory: () => 4609 })
        const $l46_10 = market
            .add("l46_10")
            .static({ suppliers: layer45, factory: () => 4610 })
        const $l46_11 = market
            .add("l46_11")
            .static({ suppliers: layer45, factory: () => 4611 })
        const $l46_12 = market
            .add("l46_12")
            .static({ suppliers: layer45, factory: () => 4612 })
        const $l46_13 = market
            .add("l46_13")
            .static({ suppliers: layer45, factory: () => 4613 })
        const $l46_14 = market
            .add("l46_14")
            .static({ suppliers: layer45, factory: () => 4614 })
        const $l46_15 = market
            .add("l46_15")
            .static({ suppliers: layer45, factory: () => 4615 })
        const $l46_16 = market
            .add("l46_16")
            .static({ suppliers: layer45, factory: () => 4616 })
        const $l46_17 = market
            .add("l46_17")
            .static({ suppliers: layer45, factory: () => 4617 })
        const $l46_18 = market
            .add("l46_18")
            .static({ suppliers: layer45, factory: () => 4618 })
        const $l46_19 = market
            .add("l46_19")
            .static({ suppliers: layer45, factory: () => 4619 })
        const $l46_20 = market
            .add("l46_20")
            .static({ suppliers: layer45, factory: () => 4620 })
        const layer46 = [
            $l46_1,
            $l46_2,
            $l46_3,
            $l46_4,
            $l46_5,
            $l46_6,
            $l46_7,
            $l46_8,
            $l46_9,
            $l46_10,
            $l46_11,
            $l46_12,
            $l46_13,
            $l46_14,
            $l46_15,
            $l46_16,
            $l46_17,
            $l46_18,
            $l46_19,
            $l46_20
        ]

        // Layer 47: depends on layer46 suppliers
        const $l47_1 = market
            .add("l47_1")
            .static({ suppliers: layer46, factory: () => 4701 })
        const $l47_2 = market
            .add("l47_2")
            .static({ suppliers: layer46, factory: () => 4702 })
        const $l47_3 = market
            .add("l47_3")
            .static({ suppliers: layer46, factory: () => 4703 })
        const $l47_4 = market
            .add("l47_4")
            .static({ suppliers: layer46, factory: () => 4704 })
        const $l47_5 = market
            .add("l47_5")
            .static({ suppliers: layer46, factory: () => 4705 })
        const $l47_6 = market
            .add("l47_6")
            .static({ suppliers: layer46, factory: () => 4706 })
        const $l47_7 = market
            .add("l47_7")
            .static({ suppliers: layer46, factory: () => 4707 })
        const $l47_8 = market
            .add("l47_8")
            .static({ suppliers: layer46, factory: () => 4708 })
        const $l47_9 = market
            .add("l47_9")
            .static({ suppliers: layer46, factory: () => 4709 })
        const $l47_10 = market
            .add("l47_10")
            .static({ suppliers: layer46, factory: () => 4710 })
        const $l47_11 = market
            .add("l47_11")
            .static({ suppliers: layer46, factory: () => 4711 })
        const $l47_12 = market
            .add("l47_12")
            .static({ suppliers: layer46, factory: () => 4712 })
        const $l47_13 = market
            .add("l47_13")
            .static({ suppliers: layer46, factory: () => 4713 })
        const $l47_14 = market
            .add("l47_14")
            .static({ suppliers: layer46, factory: () => 4714 })
        const $l47_15 = market
            .add("l47_15")
            .static({ suppliers: layer46, factory: () => 4715 })
        const $l47_16 = market
            .add("l47_16")
            .static({ suppliers: layer46, factory: () => 4716 })
        const $l47_17 = market
            .add("l47_17")
            .static({ suppliers: layer46, factory: () => 4717 })
        const $l47_18 = market
            .add("l47_18")
            .static({ suppliers: layer46, factory: () => 4718 })
        const $l47_19 = market
            .add("l47_19")
            .static({ suppliers: layer46, factory: () => 4719 })
        const $l47_20 = market
            .add("l47_20")
            .static({ suppliers: layer46, factory: () => 4720 })
        const layer47 = [
            $l47_1,
            $l47_2,
            $l47_3,
            $l47_4,
            $l47_5,
            $l47_6,
            $l47_7,
            $l47_8,
            $l47_9,
            $l47_10,
            $l47_11,
            $l47_12,
            $l47_13,
            $l47_14,
            $l47_15,
            $l47_16,
            $l47_17,
            $l47_18,
            $l47_19,
            $l47_20
        ]

        // Layer 48: depends on layer47 suppliers
        const $l48_1 = market
            .add("l48_1")
            .static({ suppliers: layer47, factory: () => 4801 })
        const $l48_2 = market
            .add("l48_2")
            .static({ suppliers: layer47, factory: () => 4802 })
        const $l48_3 = market
            .add("l48_3")
            .static({ suppliers: layer47, factory: () => 4803 })
        const $l48_4 = market
            .add("l48_4")
            .static({ suppliers: layer47, factory: () => 4804 })
        const $l48_5 = market
            .add("l48_5")
            .static({ suppliers: layer47, factory: () => 4805 })
        const $l48_6 = market
            .add("l48_6")
            .static({ suppliers: layer47, factory: () => 4806 })
        const $l48_7 = market
            .add("l48_7")
            .static({ suppliers: layer47, factory: () => 4807 })
        const $l48_8 = market
            .add("l48_8")
            .static({ suppliers: layer47, factory: () => 4808 })
        const $l48_9 = market
            .add("l48_9")
            .static({ suppliers: layer47, factory: () => 4809 })
        const $l48_10 = market
            .add("l48_10")
            .static({ suppliers: layer47, factory: () => 4810 })
        const $l48_11 = market
            .add("l48_11")
            .static({ suppliers: layer47, factory: () => 4811 })
        const $l48_12 = market
            .add("l48_12")
            .static({ suppliers: layer47, factory: () => 4812 })
        const $l48_13 = market
            .add("l48_13")
            .static({ suppliers: layer47, factory: () => 4813 })
        const $l48_14 = market
            .add("l48_14")
            .static({ suppliers: layer47, factory: () => 4814 })
        const $l48_15 = market
            .add("l48_15")
            .static({ suppliers: layer47, factory: () => 4815 })
        const $l48_16 = market
            .add("l48_16")
            .static({ suppliers: layer47, factory: () => 4816 })
        const $l48_17 = market
            .add("l48_17")
            .static({ suppliers: layer47, factory: () => 4817 })
        const $l48_18 = market
            .add("l48_18")
            .static({ suppliers: layer47, factory: () => 4818 })
        const $l48_19 = market
            .add("l48_19")
            .static({ suppliers: layer47, factory: () => 4819 })
        const $l48_20 = market
            .add("l48_20")
            .static({ suppliers: layer47, factory: () => 4820 })
        const layer48 = [
            $l48_1,
            $l48_2,
            $l48_3,
            $l48_4,
            $l48_5,
            $l48_6,
            $l48_7,
            $l48_8,
            $l48_9,
            $l48_10,
            $l48_11,
            $l48_12,
            $l48_13,
            $l48_14,
            $l48_15,
            $l48_16,
            $l48_17,
            $l48_18,
            $l48_19,
            $l48_20
        ]

        // Layer 49: depends on layer48 suppliers
        const $l49_1 = market
            .add("l49_1")
            .static({ suppliers: layer48, factory: () => 4901 })
        const $l49_2 = market
            .add("l49_2")
            .static({ suppliers: layer48, factory: () => 4902 })
        const $l49_3 = market
            .add("l49_3")
            .static({ suppliers: layer48, factory: () => 4903 })
        const $l49_4 = market
            .add("l49_4")
            .static({ suppliers: layer48, factory: () => 4904 })
        const $l49_5 = market
            .add("l49_5")
            .static({ suppliers: layer48, factory: () => 4905 })
        const $l49_6 = market
            .add("l49_6")
            .static({ suppliers: layer48, factory: () => 4906 })
        const $l49_7 = market
            .add("l49_7")
            .static({ suppliers: layer48, factory: () => 4907 })
        const $l49_8 = market
            .add("l49_8")
            .static({ suppliers: layer48, factory: () => 4908 })
        const $l49_9 = market
            .add("l49_9")
            .static({ suppliers: layer48, factory: () => 4909 })
        const $l49_10 = market
            .add("l49_10")
            .static({ suppliers: layer48, factory: () => 4910 })
        const $l49_11 = market
            .add("l49_11")
            .static({ suppliers: layer48, factory: () => 4911 })
        const $l49_12 = market
            .add("l49_12")
            .static({ suppliers: layer48, factory: () => 4912 })
        const $l49_13 = market
            .add("l49_13")
            .static({ suppliers: layer48, factory: () => 4913 })
        const $l49_14 = market
            .add("l49_14")
            .static({ suppliers: layer48, factory: () => 4914 })
        const $l49_15 = market
            .add("l49_15")
            .static({ suppliers: layer48, factory: () => 4915 })
        const $l49_16 = market
            .add("l49_16")
            .static({ suppliers: layer48, factory: () => 4916 })
        const $l49_17 = market
            .add("l49_17")
            .static({ suppliers: layer48, factory: () => 4917 })
        const $l49_18 = market
            .add("l49_18")
            .static({ suppliers: layer48, factory: () => 4918 })
        const $l49_19 = market
            .add("l49_19")
            .static({ suppliers: layer48, factory: () => 4919 })
        const $l49_20 = market
            .add("l49_20")
            .static({ suppliers: layer48, factory: () => 4920 })
        const layer49 = [
            $l49_1,
            $l49_2,
            $l49_3,
            $l49_4,
            $l49_5,
            $l49_6,
            $l49_7,
            $l49_8,
            $l49_9,
            $l49_10,
            $l49_11,
            $l49_12,
            $l49_13,
            $l49_14,
            $l49_15,
            $l49_16,
            $l49_17,
            $l49_18,
            $l49_19,
            $l49_20
        ]

        // Layer 50: depends on layer49 suppliers
        const $l50_1 = market
            .add("l50_1")
            .static({ suppliers: layer49, factory: () => 5001 })
        const $l50_2 = market
            .add("l50_2")
            .static({ suppliers: layer49, factory: () => 5002 })
        const $l50_3 = market
            .add("l50_3")
            .static({ suppliers: layer49, factory: () => 5003 })
        const $l50_4 = market
            .add("l50_4")
            .static({ suppliers: layer49, factory: () => 5004 })
        const $l50_5 = market
            .add("l50_5")
            .static({ suppliers: layer49, factory: () => 5005 })
        const $l50_6 = market
            .add("l50_6")
            .static({ suppliers: layer49, factory: () => 5006 })
        const $l50_7 = market
            .add("l50_7")
            .static({ suppliers: layer49, factory: () => 5007 })
        const $l50_8 = market
            .add("l50_8")
            .static({ suppliers: layer49, factory: () => 5008 })
        const $l50_9 = market
            .add("l50_9")
            .static({ suppliers: layer49, factory: () => 5009 })
        const $l50_10 = market
            .add("l50_10")
            .static({ suppliers: layer49, factory: () => 5010 })
        const $l50_11 = market
            .add("l50_11")
            .static({ suppliers: layer49, factory: () => 5011 })
        const $l50_12 = market
            .add("l50_12")
            .static({ suppliers: layer49, factory: () => 5012 })
        const $l50_13 = market
            .add("l50_13")
            .static({ suppliers: layer49, factory: () => 5013 })
        const $l50_14 = market
            .add("l50_14")
            .static({ suppliers: layer49, factory: () => 5014 })
        const $l50_15 = market
            .add("l50_15")
            .static({ suppliers: layer49, factory: () => 5015 })
        const $l50_16 = market
            .add("l50_16")
            .static({ suppliers: layer49, factory: () => 5016 })
        const $l50_17 = market
            .add("l50_17")
            .static({ suppliers: layer49, factory: () => 5017 })
        const $l50_18 = market
            .add("l50_18")
            .static({ suppliers: layer49, factory: () => 5018 })
        const $l50_19 = market
            .add("l50_19")
            .static({ suppliers: layer49, factory: () => 5019 })
        const $l50_20 = market
            .add("l50_20")
            .static({ suppliers: layer49, factory: () => 5020 })
        const layer50 = [
            $l50_1,
            $l50_2,
            $l50_3,
            $l50_4,
            $l50_5,
            $l50_6,
            $l50_7,
            $l50_8,
            $l50_9,
            $l50_10,
            $l50_11,
            $l50_12,
            $l50_13,
            $l50_14,
            $l50_15,
            $l50_16,
            $l50_17,
            $l50_18,
            $l50_19,
            $l50_20
        ]

        // Layer 51: depends on layer50 suppliers
        const $l51_1 = market
            .add("l51_1")
            .static({ suppliers: layer50, factory: () => 5101 })
        const $l51_2 = market
            .add("l51_2")
            .static({ suppliers: layer50, factory: () => 5102 })
        const $l51_3 = market
            .add("l51_3")
            .static({ suppliers: layer50, factory: () => 5103 })
        const $l51_4 = market
            .add("l51_4")
            .static({ suppliers: layer50, factory: () => 5104 })
        const $l51_5 = market
            .add("l51_5")
            .static({ suppliers: layer50, factory: () => 5105 })
        const $l51_6 = market
            .add("l51_6")
            .static({ suppliers: layer50, factory: () => 5106 })
        const $l51_7 = market
            .add("l51_7")
            .static({ suppliers: layer50, factory: () => 5107 })
        const $l51_8 = market
            .add("l51_8")
            .static({ suppliers: layer50, factory: () => 5108 })
        const $l51_9 = market
            .add("l51_9")
            .static({ suppliers: layer50, factory: () => 5109 })
        const $l51_10 = market
            .add("l51_10")
            .static({ suppliers: layer50, factory: () => 5110 })
        const $l51_11 = market
            .add("l51_11")
            .static({ suppliers: layer50, factory: () => 5111 })
        const $l51_12 = market
            .add("l51_12")
            .static({ suppliers: layer50, factory: () => 5112 })
        const $l51_13 = market
            .add("l51_13")
            .static({ suppliers: layer50, factory: () => 5113 })
        const $l51_14 = market
            .add("l51_14")
            .static({ suppliers: layer50, factory: () => 5114 })
        const $l51_15 = market
            .add("l51_15")
            .static({ suppliers: layer50, factory: () => 5115 })
        const $l51_16 = market
            .add("l51_16")
            .static({ suppliers: layer50, factory: () => 5116 })
        const $l51_17 = market
            .add("l51_17")
            .static({ suppliers: layer50, factory: () => 5117 })
        const $l51_18 = market
            .add("l51_18")
            .static({ suppliers: layer50, factory: () => 5118 })
        const $l51_19 = market
            .add("l51_19")
            .static({ suppliers: layer50, factory: () => 5119 })
        const $l51_20 = market
            .add("l51_20")
            .static({ suppliers: layer50, factory: () => 5120 })
        const layer51 = [
            $l51_1,
            $l51_2,
            $l51_3,
            $l51_4,
            $l51_5,
            $l51_6,
            $l51_7,
            $l51_8,
            $l51_9,
            $l51_10,
            $l51_11,
            $l51_12,
            $l51_13,
            $l51_14,
            $l51_15,
            $l51_16,
            $l51_17,
            $l51_18,
            $l51_19,
            $l51_20
        ]

        // Layer 52: depends on layer51 suppliers
        const $l52_1 = market
            .add("l52_1")
            .static({ suppliers: layer51, factory: () => 5201 })

        // Try to assemble a product from layer52
        // If this compiles, we've successfully processed:
        // - 52 layers of depth (52 TransitiveSuppliers recursive calls)
        // - Each layer has 20 suppliers
        // - Each FilterSuppliers call processes 20 elements recursively
        // This tests if nested FilterSuppliers recursion counts towards the 1000 limit
        // If this fails, reduce the number of layers until it compiles to find the exact limit
        const resultProduct = $l52_1.assemble({})

        // Verify the type is correct
        expectTypeOf(resultProduct).toExtend<Supply<number, StaticSupplier>>()
        expectTypeOf(resultProduct.unpack).toBeFunction()

        // Runtime check to ensure it works
        expect(resultProduct.unpack()).toBe(5201)
    }, 10000)
})
