import type { Supplier, Supply, UnknownProductSupplier } from "#types/public"
import type { MaybeFn, SuppliesRecord } from "#types/records"
import { isPacked, isProductSupplier, isProductSupply, once } from "#utils"
import { assertPlainObject } from "#validation"

export function assemble<THIS extends UnknownProductSupplier>(
    this: THIS,
    supplied: THIS["_toSupply"]
) {
    assertPlainObject("supplied", supplied)

    // Stores the supplies that can be preserved to optimize reassemble
    const preserved: SuppliesRecord = {}

    for (const [name, supply] of Object.entries(this._known)) {
        // Do not preserve supplies from newly hired
        // or newly supplied
        if (this._hired.some((hname) => hname === name) || name in supplied) {
            continue
        }

        // Do not preserve if some of the suppliers's team members
        // depend on newly hired or supplied (unless packed supplies
        // which are preserved if not directly overwritten by supplied)
        if (
            !isPacked(supply) &&
            isProductSupply(supply) &&
            supply.supplier._team.some(
                (t: Supplier) =>
                    t.name in supplied ||
                    this._hired.some((hname) => hname === t.name)
            )
        ) {
            continue
        }

        // Do not preserve if supplied explicitely sets the supply to undefined
        if (name in supplied && supplied[name] === undefined) {
            continue
        }

        preserved[name] = supply
    }

    const definedSupplied: SuppliesRecord = Object.fromEntries(
        Object.entries(supplied).filter(
            (entry): entry is [string, MaybeFn<[], Supply<Supplier>>] =>
                entry[1] !== undefined
        )
    )

    const supplies: SuppliesRecord = { ...preserved, ...definedSupplied }

    for (const sup of this._team) {
        if (!isProductSupplier(sup) || sup.name in supplies) continue
        supplies[sup.name] = once(() => sup._build(supplies))
    }

    return this._build(supplies)
}
