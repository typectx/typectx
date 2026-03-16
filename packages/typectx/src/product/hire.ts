import { team } from "#product/main"
import type { ProductSupplierGuard } from "#types/guards"
import type { ProductSupplier } from "#types/public"
import type { Supply, UnknownProductSupplier } from "#types/public"
import type { SupplyDeps } from "#types/records"
import type { MergeStringTuples } from "#types/utils"
import type { Merge } from "#utils"
import { assertProductSuppliers } from "#validation"

/**
 * Hires additional suppliers into the dependency chain of this product supplier.
 * This allows replacing or adding suppliers composition-root style for testing,
 * mocking, or batch assembly. Hired suppliers override suppliers with matching
 * names in the transitive dependency tree.
 *
 * @param hiredSuppliers - Product suppliers to hire (replace/add to the team)
 * @returns A new product supplier with the hired suppliers merged into the team
 * @public
 */
export function Hire() {
    return function hire<
        THIS extends Omit<UnknownProductSupplier, "_hired" | "_composite"> & {
            _hired: string[]
            _composite: boolean
        },
        HIRED extends UnknownProductSupplier[] = []
    >(
        this: THIS,
        ...hired: [...HIRED]
    ): ProductSupplierGuard<
        ProductSupplier<
            THIS["name"],
            THIS["_constraint"],
            THIS["_known"],
            Merge<
                {
                    [SUPPLIER in HIRED[number] as SUPPLIER["name"]]: Supply<SUPPLIER>
                },
                Merge<
                    Omit<
                        THIS["_resolved"],
                        keyof HIRED[number]["_oldResolved"]
                    >,
                    HIRED[number]["_resolved"]
                >
            >,
            Merge<
                {
                    [SUPPLIER in HIRED[number] as SUPPLIER["name"]]?: Supply<SUPPLIER>
                },
                Merge<
                    Omit<
                        THIS["_toSupply"],
                        keyof HIRED[number]["_oldToSupply"]
                    >,
                    HIRED[number]["_toSupply"]
                >
            >,
            MergeStringTuples<
                THIS["_hired"],
                {
                    [K in keyof HIRED]: HIRED[K]["name"]
                }
            >,
            false,
            true
        >,
        HIRED
    > {
        assertProductSuppliers(this.name, hired, true)
        const mergedSuppliers = [
            ...this._suppliers.filter(
                (oldSupplier) =>
                    !hired.some(
                        (newSupplier) => newSupplier.name === oldSupplier.name
                    )
            ),
            ...hired
        ]

        const mergedHired = [
            ...this._hired.filter(
                (oldName) =>
                    !hired.some((newSupplier) => newSupplier.name === oldName)
            ),
            ...hired.map((newSupplier) => newSupplier.name)
        ] as MergeStringTuples<
            THIS["_hired"],
            {
                [K in keyof HIRED]: HIRED[K]["name"]
            }
        >

        const _resolved = null as unknown as Merge<
            {
                [SUPPLIER in HIRED[number] as SUPPLIER["name"]]: Supply<SUPPLIER>
            },
            Merge<
                Omit<THIS["_resolved"], keyof HIRED[number]["_oldResolved"]>,
                HIRED[number]["_resolved"]
            >
        >
        const _toSupply = null as unknown as Merge<
            {
                [SUPPLIER in HIRED[number] as SUPPLIER["name"]]?: Supply<SUPPLIER>
            },
            Merge<
                Omit<THIS["_toSupply"], keyof HIRED[number]["_oldToSupply"]>,
                HIRED[number]["_toSupply"]
            >
        >
        const _deps = null as unknown as SupplyDeps<typeof _resolved>

        return {
            ...this,
            _suppliers: mergedSuppliers,
            _hired: mergedHired,
            _team: team(this.name, mergedSuppliers, this._optionals),
            _resolved,
            _toSupply,
            _deps,
            _oldResolved: _resolved,
            _oldToSupply: _toSupply,
            _oldDeps: _deps,
            _mock: false as const,
            _composite: true as const
        } satisfies ProductSupplier<
            THIS["name"],
            THIS["_constraint"],
            THIS["_known"],
            Merge<
                {
                    [SUPPLIER in HIRED[number] as SUPPLIER["name"]]: Supply<SUPPLIER>
                },
                Merge<
                    Omit<
                        THIS["_resolved"],
                        keyof HIRED[number]["_oldResolved"]
                    >,
                    HIRED[number]["_resolved"]
                >
            >,
            Merge<
                {
                    [SUPPLIER in HIRED[number] as SUPPLIER["name"]]?: Supply<SUPPLIER>
                },
                Merge<
                    Omit<
                        THIS["_toSupply"],
                        keyof HIRED[number]["_oldToSupply"]
                    >,
                    HIRED[number]["_toSupply"]
                >
            >,
            MergeStringTuples<
                THIS["_hired"],
                {
                    [K in keyof HIRED]: HIRED[K]["name"]
                }
            >,
            false,
            true
        > as any
    }
}
