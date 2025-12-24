import { createMarket, index } from "../src"

const market = createMarket()

// Linear chain: each supplier depends on exactly ONE previous supplier
const $$s1 = market.offer("s1").asProduct({ factory: ($) => 1 })
const $$s2 = market
    .offer("s2")
    .asProduct({ suppliers: [$$s1], factory: ($) => $($$s1).unpack() + 1 })
const $$s3 = market
    .offer("s3")
    .asProduct({ suppliers: [$$s2], factory: ($) => $($$s2).unpack() + 1 })
const $$s4 = market
    .offer("s4")
    .asProduct({ suppliers: [$$s3], factory: ($) => $($$s3).unpack() + 1 })
const $$s5 = market
    .offer("s5")
    .asProduct({ suppliers: [$$s4], factory: ($) => $($$s4).unpack() + 1 })
const $$s6 = market
    .offer("s6")
    .asProduct({ suppliers: [$$s5], factory: ($) => $($$s5).unpack() + 1 })
const $$s7 = market
    .offer("s7")
    .asProduct({ suppliers: [$$s6], factory: ($) => $($$s6).unpack() + 1 })
const $$s8 = market
    .offer("s8")
    .asProduct({ suppliers: [$$s7], factory: ($) => $($$s7).unpack() + 1 })
const $$s9 = market
    .offer("s9")
    .asProduct({ suppliers: [$$s8], factory: ($) => $($$s8).unpack() + 1 })
const $$s10 = market
    .offer("s10")
    .asProduct({ suppliers: [$$s9], factory: ($) => $($$s9).unpack() + 1 })
const $$s11 = market
    .offer("s11")
    .asProduct({ suppliers: [$$s10], factory: ($) => $($$s10).unpack() + 1 })
const $$s12 = market
    .offer("s12")
    .asProduct({ suppliers: [$$s11], factory: ($) => $($$s11).unpack() + 1 })
const $$s13 = market
    .offer("s13")
    .asProduct({ suppliers: [$$s12], factory: ($) => $($$s12).unpack() + 1 })
const $$s14 = market
    .offer("s14")
    .asProduct({ suppliers: [$$s13], factory: ($) => $($$s13).unpack() + 1 })
const $$s15 = market
    .offer("s15")
    .asProduct({ suppliers: [$$s14], factory: ($) => $($$s14).unpack() + 1 })
const $$s16 = market
    .offer("s16")
    .asProduct({ suppliers: [$$s15], factory: ($) => $($$s15).unpack() + 1 })
const $$s17 = market
    .offer("s17")
    .asProduct({ suppliers: [$$s16], factory: ($) => $($$s16).unpack() + 1 })
const $$s18 = market
    .offer("s18")
    .asProduct({ suppliers: [$$s17], factory: ($) => $($$s17).unpack() + 1 })
const $$s19 = market
    .offer("s19")
    .asProduct({ suppliers: [$$s18], factory: ($) => $($$s18).unpack() + 1 })
const $$s20 = market
    .offer("s20")
    .asProduct({ suppliers: [$$s19], factory: ($) => $($$s19).unpack() + 1 })
const $$s21 = market
    .offer("s21")
    .asProduct({ suppliers: [$$s20], factory: ($) => $($$s20).unpack() + 1 })
const $$s22 = market
    .offer("s22")
    .asProduct({ suppliers: [$$s21], factory: ($) => $($$s21).unpack() + 1 })
const $$s23 = market
    .offer("s23")
    .asProduct({ suppliers: [$$s22], factory: ($) => $($$s22).unpack() + 1 })
const $$s24 = market
    .offer("s24")
    .asProduct({ suppliers: [$$s23], factory: ($) => $($$s23).unpack() + 1 })
const $$s25 = market
    .offer("s25")
    .asProduct({ suppliers: [$$s24], factory: ($) => $($$s24).unpack() + 1 })
const $$s26 = market
    .offer("s26")
    .asProduct({ suppliers: [$$s25], factory: ($) => $($$s25).unpack() + 1 })
const $$s27 = market
    .offer("s27")
    .asProduct({ suppliers: [$$s26], factory: ($) => $($$s26).unpack() + 1 })
const $$s28 = market
    .offer("s28")
    .asProduct({ suppliers: [$$s27], factory: ($) => $($$s27).unpack() + 1 })
const $$s29 = market
    .offer("s29")
    .asProduct({ suppliers: [$$s28], factory: ($) => $($$s28).unpack() + 1 })
const $$s30 = market
    .offer("s30")
    .asProduct({ suppliers: [$$s29], factory: ($) => $($$s29).unpack() + 1 })
const $$s31 = market
    .offer("s31")
    .asProduct({ suppliers: [$$s30], factory: ($) => $($$s30).unpack() + 1 })
const $$s32 = market
    .offer("s32")
    .asProduct({ suppliers: [$$s31], factory: ($) => $($$s31).unpack() + 1 })
const $$s33 = market
    .offer("s33")
    .asProduct({ suppliers: [$$s32], factory: ($) => $($$s32).unpack() + 1 })
const $$s34 = market
    .offer("s34")
    .asProduct({ suppliers: [$$s33], factory: ($) => $($$s33).unpack() + 1 })
const $$s35 = market
    .offer("s35")
    .asProduct({ suppliers: [$$s34], factory: ($) => $($$s34).unpack() + 1 })
const $$s36 = market
    .offer("s36")
    .asProduct({ suppliers: [$$s35], factory: ($) => $($$s35).unpack() + 1 })
const $$s37 = market
    .offer("s37")
    .asProduct({ suppliers: [$$s36], factory: ($) => $($$s36).unpack() + 1 })
const $$s38 = market
    .offer("s38")
    .asProduct({ suppliers: [$$s37], factory: ($) => $($$s37).unpack() + 1 })
const $$s39 = market
    .offer("s39")
    .asProduct({ suppliers: [$$s38], factory: ($) => $($$s38).unpack() + 1 })
const $$s40 = market
    .offer("s40")
    .asProduct({ suppliers: [$$s39], factory: ($) => $($$s39).unpack() + 1 })
const $$s41 = market
    .offer("s41")
    .asProduct({ suppliers: [$$s40], factory: ($) => $($$s40).unpack() + 1 })
const $$s42 = market
    .offer("s42")
    .asProduct({ suppliers: [$$s41], factory: ($) => $($$s41).unpack() + 1 })
const $$s43 = market
    .offer("s43")
    .asProduct({ suppliers: [$$s42], factory: ($) => $($$s42).unpack() + 1 })
const $$s44 = market
    .offer("s44")
    .asProduct({ suppliers: [$$s43], factory: ($) => $($$s43).unpack() + 1 })
const $$s45 = market
    .offer("s45")
    .asProduct({ suppliers: [$$s44], factory: ($) => $($$s44).unpack() + 1 })
const $$s46 = market
    .offer("s46")
    .asProduct({ suppliers: [$$s45], factory: ($) => $($$s45).unpack() + 1 })
const $$s47 = market
    .offer("s47")
    .asProduct({ suppliers: [$$s46], factory: ($) => $($$s46).unpack() + 1 })
const $$s48 = market
    .offer("s48")
    .asProduct({ suppliers: [$$s47], factory: ($) => $($$s47).unpack() + 1 })
const $$s49 = market
    .offer("s49")
    .asProduct({ suppliers: [$$s48], factory: ($) => $($$s48).unpack() + 1 })
const $$s50 = market
    .offer("s50")
    .asProduct({ suppliers: [$$s49], factory: ($) => $($$s49).unpack() + 1 })
const $$s51 = market
    .offer("s51")
    .asProduct({ suppliers: [$$s50], factory: ($) => $($$s50).unpack() + 1 })
const $$s52 = market
    .offer("s52")
    .asProduct({ suppliers: [$$s51], factory: ($) => $($$s51).unpack() + 1 })
const $$s53 = market
    .offer("s53")
    .asProduct({ suppliers: [$$s52], factory: ($) => $($$s52).unpack() + 1 })
const $$s54 = market
    .offer("s54")
    .asProduct({ suppliers: [$$s53], factory: ($) => $($$s53).unpack() + 1 })
const $$s55 = market
    .offer("s55")
    .asProduct({ suppliers: [$$s54], factory: ($) => $($$s54).unpack() + 1 })
const $$s56 = market
    .offer("s56")
    .asProduct({ suppliers: [$$s55], factory: ($) => $($$s55).unpack() + 1 })
const $$s57 = market
    .offer("s57")
    .asProduct({ suppliers: [$$s56], factory: ($) => $($$s56).unpack() + 1 })
const $$s58 = market
    .offer("s58")
    .asProduct({ suppliers: [$$s57], factory: ($) => $($$s57).unpack() + 1 })
const $$s59 = market
    .offer("s59")
    .asProduct({ suppliers: [$$s58], factory: ($) => $($$s58).unpack() + 1 })
const $$s60 = market
    .offer("s60")
    .asProduct({ suppliers: [$$s59], factory: ($) => $($$s59).unpack() + 1 })
const $$s61 = market
    .offer("s61")
    .asProduct({ suppliers: [$$s60], factory: ($) => $($$s60).unpack() + 1 })
const $$s62 = market
    .offer("s62")
    .asProduct({ suppliers: [$$s61], factory: ($) => $($$s61).unpack() + 1 })
const $$s63 = market
    .offer("s63")
    .asProduct({ suppliers: [$$s62], factory: ($) => $($$s62).unpack() + 1 })
const $$s64 = market
    .offer("s64")
    .asProduct({ suppliers: [$$s63], factory: ($) => $($$s63).unpack() + 1 })
const $$s65 = market
    .offer("s65")
    .asProduct({ suppliers: [$$s64], factory: ($) => $($$s64).unpack() + 1 })
const $$s66 = market
    .offer("s66")
    .asProduct({ suppliers: [$$s65], factory: ($) => $($$s65).unpack() + 1 })
const $$s67 = market
    .offer("s67")
    .asProduct({ suppliers: [$$s66], factory: ($) => $($$s66).unpack() + 1 })
const $$s68 = market
    .offer("s68")
    .asProduct({ suppliers: [$$s67], factory: ($) => $($$s67).unpack() + 1 })
const $$s69 = market
    .offer("s69")
    .asProduct({ suppliers: [$$s68], factory: ($) => $($$s68).unpack() + 1 })
const $$s70 = market
    .offer("s70")
    .asProduct({ suppliers: [$$s69], factory: ($) => $($$s69).unpack() + 1 })
const $$s71 = market
    .offer("s71")
    .asProduct({ suppliers: [$$s70], factory: ($) => $($$s70).unpack() + 1 })
const $$s72 = market
    .offer("s72")
    .asProduct({ suppliers: [$$s71], factory: ($) => $($$s71).unpack() + 1 })
const $$s73 = market
    .offer("s73")
    .asProduct({ suppliers: [$$s72], factory: ($) => $($$s72).unpack() + 1 })
const $$s74 = market
    .offer("s74")
    .asProduct({ suppliers: [$$s73], factory: ($) => $($$s73).unpack() + 1 })
const $$s75 = market
    .offer("s75")
    .asProduct({ suppliers: [$$s74], factory: ($) => $($$s74).unpack() + 1 })
const $$s76 = market
    .offer("s76")
    .asProduct({ suppliers: [$$s75], factory: ($) => $($$s75).unpack() + 1 })
const $$s77 = market
    .offer("s77")
    .asProduct({ suppliers: [$$s76], factory: ($) => $($$s76).unpack() + 1 })
const $$s78 = market
    .offer("s78")
    .asProduct({ suppliers: [$$s77], factory: ($) => $($$s77).unpack() + 1 })
const $$s79 = market
    .offer("s79")
    .asProduct({ suppliers: [$$s78], factory: ($) => $($$s78).unpack() + 1 })
const $$s80 = market
    .offer("s80")
    .asProduct({ suppliers: [$$s79], factory: ($) => $($$s79).unpack() + 1 })

const result = $$s48.assemble({})
