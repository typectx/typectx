import type { PartialProductSupplierPlan } from "#types/internal"
import { assertProductSuppliers } from "#validation"
import { assemble } from "#product/assemble"
import { _build } from "#product/build"
import { supplier } from "#index"
import type { Resolved, SupplyDeps, ToSupply } from "#types/records"
import { dedupe, isProductSupplier } from "#utils"
import type {
    ProductSupplier,
    MainSupplier,
    RequestSupplier,
    Supplier
} from "#types/public"

export function main<
    NAME extends string,
    CONSTRAINT,
    SUPPLIERS extends MainSupplier[] = [],
    OPTIONALS extends RequestSupplier[] = []
>(
    name: NAME,
    config: PartialProductSupplierPlan<CONSTRAINT, SUPPLIERS, OPTIONALS>
): Omit<
    ProductSupplier<
        NAME,
        CONSTRAINT,
        OPTIONALS[number]["name"],
        Record<never, never>,
        ToSupply<
            {
                suppliers: SUPPLIERS
                optionals: OPTIONALS
            },
            Record<never, never>
        >,
        []
    >,
    "mock" | "hire" | "_mock" | "_composite"
> {
    assertProductSuppliers(name, [], true)

    const _team = team(name, config.suppliers ?? [], config.optionals ?? [])

    const _toSupply = null as unknown as ToSupply<
        {
            suppliers: SUPPLIERS
            optionals: OPTIONALS
        },
        Record<never, never>
    >
    const _resolved = null as unknown as Resolved<
        typeof _toSupply,
        Record<never, never>
    >
    const _deps = null as unknown as SupplyDeps<
        typeof _toSupply,
        OPTIONALS[number]["name"],
        Record<never, never>
    >

    const s = {
        ...supplier(name).request<CONSTRAINT>(),
        assemble,
        _factory: config.factory,
        _build,
        _suppliers: config.suppliers ?? [],
        _optionals: config.optionals ?? [],
        _team,
        _hired: [] as [],
        _known: {},
        _lazy: config.lazy ?? false,
        _init: config.init,
        _request: false as const,
        _product: true as const,
        _constraint: null as unknown as CONSTRAINT,
        _optionalKeys: null as unknown as OPTIONALS[number]["name"],
        _resolved,
        _toSupply,
        _deps,
        _oldResolved: _resolved,
        _oldToSupply: _toSupply,
        _oldDeps: _deps
    }

    return s
}

export function team(
    name: string,
    suppliers: Supplier[],
    optionals: RequestSupplier[]
) {
    return dedupe(
        [...suppliers, ...optionals]
            .flatMap((supplier) => {
                if (isProductSupplier(supplier)) {
                    return [supplier, ...supplier._team]
                }
                return [supplier]
            })
            .map((s) => {
                if (s.name === name) {
                    throw new Error("Circular dependency detected")
                }
                return s
            })
    )
}
