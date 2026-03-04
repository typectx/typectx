import type {
    UnknownProductSupplier,
    ToSupply,
    SuppliesRecord,
    Supply,
    MaybeFn
} from "#types"
import { isProductSupplier, once } from "#utils"
import { assertPlainObject } from "#validation"

export function assemble<
    THIS extends UnknownProductSupplier,
    TO_SUPPLY extends ToSupply<THIS> = ToSupply<THIS>
>(this: THIS, supplied: TO_SUPPLY) {
    assertPlainObject("supplied", supplied)
    const effectiveSupplied = {
        ...this.known,
        ...supplied
    } as TO_SUPPLY & Partial<THIS["known"]>

    const supplies: SuppliesRecord = Object.fromEntries(
        Object.entries(effectiveSupplied).filter(
            (entry): entry is [string, MaybeFn<[], Supply>] =>
                entry[1] !== undefined
        )
    )

    for (const sup of this.team()) {
        if (!isProductSupplier(sup) || sup.name in effectiveSupplied) continue
        supplies[sup.name] = once(() => sup._build(supplies))
    }

    return this._build(supplies)
}
