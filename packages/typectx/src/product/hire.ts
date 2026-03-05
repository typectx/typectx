import { main } from "#product/main"
import type {
    MergeSuppliers,
    ProductSupplier,
    SupplierGraphGuard,
    UnknownProductSupplier
} from "#types"

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
export function Hire<HIRED extends UnknownProductSupplier[]>() {
    return function hire<
        THIS extends UnknownProductSupplier & {
            hired: [...HIRED]
            _composite: boolean
        },
        HIRED2 extends UnknownProductSupplier[]
    >(
        this: THIS,
        ...hired: [...HIRED2]
    ): SupplierGraphGuard<
        ProductSupplier<
            THIS["name"],
            THIS["_constraint"],
            THIS["suppliers"],
            THIS["optionals"],
            THIS["assemblers"],
            MergeSuppliers<THIS["hired"], HIRED2>,
            Record<never, unknown>,
            false,
            true
        >
    > {
        const mergedHired = [
            ...this.hired.filter(
                (oldSupplier) =>
                    !hired.some(
                        (newSupplier) => newSupplier.name === oldSupplier.name
                    )
            ),
            ...hired
        ] as MergeSuppliers<THIS["hired"], HIRED2>

        const h = main<
            THIS["name"],
            THIS["_constraint"],
            THIS["suppliers"],
            THIS["optionals"],
            THIS["assemblers"],
            typeof mergedHired
        >(this.name, {
            ...this,
            hired: mergedHired,
            factory: this._factory
        })

        return {
            ...this,
            ...h,
            known: this.known,
            _composite: true as const,
            _mock: false as const
        } satisfies ProductSupplier<
            THIS["name"],
            THIS["_constraint"],
            THIS["suppliers"],
            THIS["optionals"],
            THIS["assemblers"],
            MergeSuppliers<THIS["hired"], HIRED2>,
            THIS["known"],
            false,
            true
        > as any
    }
}
