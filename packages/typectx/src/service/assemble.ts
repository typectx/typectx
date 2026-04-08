import type { Service, Supply, UnknownAppService } from "#types/public"
import type { ResolvedRecord, SuppliesRecord } from "#types/records"
import { isPacked, isAppService, isAppSupply, once } from "#utils"
import { assertPlainObject } from "#validation"

export function assemble<THIS extends UnknownAppService>(
    this: THIS,
    supplied: THIS["_toSupply"]
) {
    assertPlainObject("supplied", supplied)

    // Stores the supplies that can be preserved to optimize reassemble
    const preserved: ResolvedRecord<Service> = {}

    for (const [name, supply] of Object.entries(this._known)) {
        // Do not preserve supplies from newly hired
        // or newly supplied
        if (this._hired.some((hname) => hname === name) || name in supplied) {
            continue
        }

        // Do not preserve if some of the services's team members
        // depend on newly hired or supplied (unless packed supplies
        // which are preserved if not directly overwritten by supplied)
        if (
            supply &&
            !isPacked(supply) &&
            isAppSupply(supply) &&
            supply.service._team.some(
                (t: Service) =>
                    t.name in supplied ||
                    this._hired.some((hname) => hname === t.name)
            )
        ) {
            continue
        }

        preserved[name] = supply
    }

    const definedSupplied: ResolvedRecord<Service> = Object.fromEntries(
        Object.entries(supplied).filter(
            (entry): entry is [string, Supply<Service>] =>
                entry[1] !== undefined
        )
    )

    const supplies: SuppliesRecord = { ...preserved, ...definedSupplied }

    for (const service of this._team) {
        if (!isAppService(service) || service.name in supplies) continue
        supplies[service.name] = once(() => service._build(supplies))
    }

    return this._build(supplies)
}
