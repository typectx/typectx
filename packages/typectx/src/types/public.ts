import type { ProductSupplierGuard } from "#types/guards"
import type {
    BaseSupplier,
    Ctx,
    PartialProductSupplierPlan
} from "#types/internal"
import type {
    Resolved,
    ResolvedRecord,
    SuppliesRecord,
    SupplyDeps,
    ToSupply
} from "#types/records"
import type { MergeStringTuples } from "#types/utils"
import type { Merge } from "#utils"

export interface RequestSupplier<
    NAME extends string = string,
    CONSTRAINT = unknown
> extends BaseSupplier<NAME, CONSTRAINT> {
    _constraint: CONSTRAINT
    _request: true
    _mock: false
}

export interface ProductSupplier<
    NAME extends string,
    CONSTRAINT,
    OPTIONAL_KEYS extends string,
    KNOWN extends ResolvedRecord<Supplier>,
    TO_SUPPLY extends Partial<ResolvedRecord<Supplier>>,
    HIRED extends string[],
    MOCK extends boolean = boolean,
    COMPOSITE extends boolean = boolean
> extends BaseSupplier<NAME, CONSTRAINT> {
    /** Assembles the supplier by providing request values and auto-wiring product dependencies */
    assemble: <THIS extends UnknownProductSupplier>(
        this: THIS,
        toSupply: THIS["_toSupply"]
    ) => Supply<THIS>
    mock: <
        THIS extends UnknownProductSupplier & {
            name: NAME
            _constraint: CONSTRAINT
            _mock: false
        },
        CONSTRAINT2 extends THIS["_constraint"],
        SUPPLIERS2 extends MainSupplier[] = [],
        OPTIONALS2 extends RequestSupplier[] = []
    >(
        this: THIS,
        config: PartialProductSupplierPlan<CONSTRAINT2, SUPPLIERS2, OPTIONALS2>
    ) => ProductSupplierGuard<
        Mock<THIS, CONSTRAINT2, SUPPLIERS2, OPTIONALS2>,
        [...SUPPLIERS2, ...OPTIONALS2]
    >
    hire: <
        THIS extends UnknownProductSupplier & {
            _composite: boolean
        },
        HIRED extends UnknownProductSupplier[] = []
    >(
        this: THIS,
        ...hired: [...HIRED]
    ) => ProductSupplierGuard<
        ProductSupplier<
            THIS["name"],
            THIS["_constraint"],
            THIS["_optionalKeys"],
            THIS["_known"],
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
    >
    _product: true
    _request: false
    _constraint: CONSTRAINT
    _optionalKeys: OPTIONAL_KEYS
    _known: KNOWN
    _toSupply: TO_SUPPLY
    _resolved: Resolved<TO_SUPPLY, KNOWN>
    _deps: SupplyDeps<TO_SUPPLY, OPTIONAL_KEYS, KNOWN>
    _oldResolved: Resolved<TO_SUPPLY, KNOWN>
    _oldToSupply: TO_SUPPLY
    _oldDeps: SupplyDeps<TO_SUPPLY, OPTIONAL_KEYS, KNOWN>
    /** Array of suppliers this supplier depends on */
    _suppliers: MainSupplier[]
    /** Array of optional request suppliers this supplier may depend on */
    _optionals: RequestSupplier[]
    _team: Supplier[]
    _hired: HIRED
    /** Factory function that creates the product from its dependencies */
    _factory: (deps: any, ctx: Ctx<any, any>) => any
    /** Optional initialization function called after factory */
    _init?: (value: any, deps: any) => void
    _build: <THIS extends UnknownProductSupplier>(
        this: THIS,
        supplies: SuppliesRecord
    ) => Supply<THIS>
    /** Whether this supplier should be lazily evaluated */
    _lazy?: boolean
    _mock: MOCK
    _composite: COMPOSITE
}

export type Supplier = UnknownProductSupplier | RequestSupplier
export type MainSupplier = Supplier & {
    _mock: false
}

export type UnknownProductSupplier = ProductSupplier<
    string,
    unknown,
    string,
    ResolvedRecord<any>,
    Partial<ResolvedRecord<any>>,
    string[],
    boolean
>

export type Mock<
    SUPPLIER extends UnknownProductSupplier,
    CONSTRAINT2 extends SUPPLIER["_constraint"],
    SUPPLIERS2 extends MainSupplier[] = [],
    OPTIONALS2 extends RequestSupplier[] = []
> = Omit<
    ProductSupplier<
        SUPPLIER["name"],
        CONSTRAINT2,
        OPTIONALS2[number]["name"],
        Record<never, never>,
        ToSupply<
            {
                suppliers: SUPPLIERS2
                optionals: OPTIONALS2
            },
            Record<never, never>
        >,
        [],
        true
    >,
    "_mock" | "_composite" | "_oldResolved" | "_oldToSupply" | "_oldDeps"
> & {
    _mock: true
    _composite: false
    _oldResolved: SUPPLIER["_resolved"]
    _oldToSupply: SUPPLIER["_toSupply"]
    _oldDeps: SUPPLIER["_deps"]
}

/**
 * Represents a supply - The result of assembling a supplier
 * with all its product and request dependencies, which can easily be passed
 * to other suppliers.
 *
 * @typeParam NAME - The unique identifier name for this supply
 * @typeParam VALUE - The type of value this supply holds
 * @public
 */
export type ProductSupply<SUPPLIER extends UnknownProductSupplier> = {
    name: SUPPLIER["name"]
    unpack: () => SUPPLIER["_constraint"]
    deps: SUPPLIER["_deps"]
    supplies: SUPPLIER["_resolved"]
    supplier: SUPPLIER
    _ctx: Ctx<any>
    _packed: boolean
}

export type RequestSupply<SUPPLIER extends RequestSupplier> = {
    name: SUPPLIER["name"]
    unpack: () => SUPPLIER["_constraint"]
    supplier: SUPPLIER
    _packed: boolean
}

export type Supply<SUPPLIER extends Supplier> =
    SUPPLIER extends RequestSupplier ? RequestSupply<SUPPLIER>
    :   ProductSupply<Extract<SUPPLIER, UnknownProductSupplier>>
