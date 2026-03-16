import type {
    MainSupplier,
    RequestSupplier,
    Supplier,
    Supply,
    UnknownProductSupplier
} from "#types/public"
import type { Deps, Resolved, ToSupply } from "#types/records"
import type { Merge } from "#utils"

export interface BaseSupplier<
    NAME extends string = string,
    CONSTRAINT = unknown
> {
    name: NAME
    pack: <THIS extends Supplier, VALUE extends CONSTRAINT>(
        this: THIS,
        value: VALUE
    ) => Supply<THIS>
    _constraint: CONSTRAINT
}

export type Factory<
    CONSTRAINT,
    SUPPLIERS extends MainSupplier[] = [],
    OPTIONALS extends RequestSupplier[] = []
> = (
    deps: Deps<{
        suppliers: SUPPLIERS
        optionals: OPTIONALS
    }>,
    ctx: Ctx<{
        suppliers: SUPPLIERS
        optionals: OPTIONALS
    }>
) => CONSTRAINT

type Init<
    CONSTRAINT,
    SUPPLIERS extends MainSupplier[] = [],
    OPTIONALS extends RequestSupplier[] = []
> = (
    value: CONSTRAINT,
    deps: Deps<{
        suppliers: SUPPLIERS
        optionals: OPTIONALS
    }>
) => void

export type PartialProductSupplierPlan<
    CONSTRAINT,
    SUPPLIERS extends MainSupplier[] = [],
    OPTIONALS extends RequestSupplier[] = []
> = {
    suppliers?: [...SUPPLIERS]
    optionals?: [...OPTIONALS]
    factory: Factory<CONSTRAINT, SUPPLIERS, OPTIONALS>
    init?: Init<CONSTRAINT, SUPPLIERS, OPTIONALS>
    lazy?: boolean
}

export type ProductSupplierPlan<
    CONSTRAINT,
    SUPPLIERS extends MainSupplier[],
    OPTIONALS extends RequestSupplier[]
> = {
    suppliers: [...SUPPLIERS]
    optionals: [...OPTIONALS]
    factory: Factory<CONSTRAINT, SUPPLIERS, OPTIONALS>
    init: Init<CONSTRAINT, SUPPLIERS, OPTIONALS>
    lazy: boolean
}

export type UnknownProductSupplierPlan = ProductSupplierPlan<
    unknown,
    MainSupplier[],
    RequestSupplier[]
>

/**
 * ctx transforms suppliers into contextualized suppliers that can be assembled again with new request supplies.
 * This enables dynamic dependency injection within a supplier's factory.
 * @typeParam SUPPLIER - The current product supplier providing context
 * @returns A function that takes a supplier and returns it with a contextualized assemble method
 * @public
 */
export type Ctx<
    PLAN extends Pick<UnknownProductSupplierPlan, "optionals" | "suppliers">,
    KNOWN extends Resolved<
        ToSupply<PLAN, Record<never, never>>,
        Record<never, never>
    > = Resolved<ToSupply<PLAN, Record<never, never>>, Record<never, never>>
> = <SUPPLIER extends Supplier>(
    supplier: SUPPLIER & (UnknownProductSupplier | Supplier)
) => SUPPLIER extends UnknownProductSupplier ?
    Merge<
        SUPPLIER,
        {
            _known: KNOWN
            _toSupply: Omit<SUPPLIER["_toSupply"], keyof KNOWN> & Partial<KNOWN>
            _deps: SUPPLIER["_deps"]
        }
    >
:   SUPPLIER & RequestSupplier // simply returns the supplier itself if it's a request supplier (noop)
