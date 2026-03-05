export interface BaseSupplier<
    NAME extends string = string,
    CONSTRAINT = unknown
> {
    name: NAME
    suppliers: MainSupplier[]
    optionals: RequestSupplier[]
    assemblers: UnknownProductSupplier[]
    hired: UnknownProductSupplier[]
    pack: <THIS extends Supplier, VALUE extends CONSTRAINT>(
        this: THIS,
        value: VALUE
    ) => Supply<THIS>
    _constraint: CONSTRAINT
}

export interface RequestSupplier<
    NAME extends string = string,
    CONSTRAINT = unknown
> extends BaseSupplier<NAME, CONSTRAINT> {
    suppliers: []
    optionals: []
    assemblers: []
    hired: []
    _constraint: CONSTRAINT
    _request: true
    _mock: false
}

export type Factory<
    NAME extends string,
    CONSTRAINT,
    SUPPLIERS extends MainSupplier[] = [],
    OPTIONALS extends RequestSupplier[] = [],
    ASSEMBLERS extends UnknownProductSupplier[] = []
> = (
    deps: Deps<{
        suppliers: SUPPLIERS
        optionals: OPTIONALS
        hired: []
    }>,
    ctx: Ctx<
        ProductSupplier<NAME, unknown, SUPPLIERS, OPTIONALS, ASSEMBLERS, []>
    >
) => CONSTRAINT

type Init<
    CONSTRAINT,
    SUPPLIERS extends MainSupplier[] = [],
    OPTIONALS extends RequestSupplier[] = [],
    HIRED extends UnknownProductSupplier[] = []
> = (
    value: CONSTRAINT,
    deps: Deps<{
        suppliers: SUPPLIERS
        optionals: OPTIONALS
        hired: HIRED
    }>
) => void

export type ProductConfig<
    NAME extends string,
    CONSTRAINT,
    SUPPLIERS extends MainSupplier[] = [],
    OPTIONALS extends RequestSupplier[] = [],
    ASSEMBLERS extends UnknownProductSupplier[] = [],
    HIRED extends UnknownProductSupplier[] = [],
    INIT extends Init<CONSTRAINT, SUPPLIERS, OPTIONALS, HIRED> = Init<
        CONSTRAINT,
        SUPPLIERS,
        OPTIONALS,
        HIRED
    >
> = {
    suppliers?: [...SUPPLIERS]
    optionals?: [...OPTIONALS]
    assemblers?: [...ASSEMBLERS]
    hired?: [...HIRED]
    factory: Factory<NAME, CONSTRAINT, SUPPLIERS, OPTIONALS, ASSEMBLERS>
    init?: INIT
    lazy?: boolean
}

export interface ProductSupplier<
    NAME extends string,
    CONSTRAINT,
    SUPPLIERS extends MainSupplier[],
    OPTIONALS extends RequestSupplier[],
    ASSEMBLERS extends UnknownProductSupplier[],
    HIRED extends UnknownProductSupplier[] = [],
    KNOWN extends Record<string, unknown> = Record<never, unknown>,
    MOCK extends boolean = boolean,
    COMPOSITE extends boolean = boolean
> extends BaseSupplier<NAME, CONSTRAINT> {
    /** Array of suppliers this supplier depends on */
    suppliers: SUPPLIERS
    /** Array of optional request suppliers this supplier may depend on */
    optionals: OPTIONALS
    /** Array of assemblers (lazy unassembled suppliers) */
    assemblers: ASSEMBLERS
    hired: HIRED
    known: KNOWN
    team: <THIS extends UnknownProductSupplier>(
        this: THIS
    ) => UnknownProductSupplier extends THIS ? Supplier[]
    :   [
            ...THIS["optionals"],
            ...TransitiveSuppliers<
                MergeSuppliers<THIS["suppliers"], THIS["hired"]>
            >
        ]

    /** Assembles the supplier by providing request values and auto-wiring product dependencies */
    assemble: <
        THIS extends UnknownProductSupplier,
        TO_SUPPLY extends ToSupply<THIS> = ToSupply<THIS>
    >(
        this: THIS,
        supplied: TO_SUPPLY
    ) => Supply<THIS>
    /** Optional initialization function called after factory */
    init?: <THIS extends UnknownProductSupplier & { _constraint: CONSTRAINT }>(
        this: THIS,
        value: THIS["_constraint"],
        deps: Deps<THIS>
    ) => void
    /** Whether this supplier should be lazily evaluated */
    lazy?: boolean
    mock: <
        THIS extends UnknownProductSupplier & {
            name: NAME
            _constraint: CONSTRAINT
        },
        CONSTRAINT2 extends THIS["_constraint"],
        SUPPLIERS2 extends MainSupplier[] = [],
        OPTIONALS2 extends RequestSupplier[] = [],
        ASSEMBLERS2 extends UnknownProductSupplier[] = []
    >(
        this: THIS,
        config: ProductConfig<
            THIS["name"],
            CONSTRAINT2,
            SUPPLIERS2,
            OPTIONALS2,
            ASSEMBLERS2
        >
    ) => SupplierGraphGuard<
        ProductSupplier<
            THIS["name"],
            CONSTRAINT2,
            SUPPLIERS2,
            OPTIONALS2,
            ASSEMBLERS2,
            [],
            THIS["known"],
            true
        >
    >
    hire: <
        THIS extends UnknownProductSupplier & {
            hired: HIRED
            _composite: boolean
        },
        HIRED2 extends UnknownProductSupplier[]
    >(
        this: THIS,
        ...hired: [...HIRED2]
    ) => SupplierGraphGuard<
        ProductSupplier<
            THIS["name"],
            THIS["_constraint"],
            THIS["suppliers"],
            THIS["optionals"],
            THIS["assemblers"],
            MergeSuppliers<THIS["hired"], HIRED2>,
            THIS["known"],
            false,
            true
        >
    >
    _product: true
    _request: false
    _constraint: CONSTRAINT
    /** Factory function that creates the product from its dependencies */
    _factory: Factory<NAME, CONSTRAINT, SUPPLIERS, OPTIONALS, ASSEMBLERS>
    _build: <THIS extends UnknownProductSupplier>(
        this: THIS,
        supplies: SuppliesRecord
    ) => Supply<THIS>
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
    MainSupplier[],
    RequestSupplier[],
    UnknownProductSupplier[],
    UnknownProductSupplier[]
>

/**
 * Represents a supply - The result of assembling a supplier
 * with all its product and request dependencies, which can easily be passed
 * to other suppliers.
 *
 * @typeParam NAME - The unique identifier name for this supply
 * @typeParam VALUE - The type of value this supply holds
 * @public
 */
export type Supply<SUPPLIER extends Supplier = Supplier> = {
    /** Unpacks and returns the current value of this supply */
    unpack: () => SUPPLIER["_constraint"]
    deps: SUPPLIER extends UnknownProductSupplier ? Deps<SUPPLIER> : never
    supplies: SUPPLIER extends UnknownProductSupplier ? Resolved<SUPPLIER>
    :   never
    supplier: SUPPLIER
    _ctx: SUPPLIER extends UnknownProductSupplier ? Ctx<SUPPLIER> : never
    _packed: boolean
}

export type MaybeFn<A extends any[], R> = R | ((...args: A) => R)

/**
 * A generic map of supplies
 * @public
 */
export type SuppliesRecord<SUPPLIER extends Supplier = Supplier> = Record<
    string,
    MaybeFn<[], Supply<SUPPLIER>>
>

/**
 * A generic map of resolved supplies
 * @public
 */
export type ResolvedRecord<SUPPLIER extends Supplier = Supplier> = Record<
    string,
    Supply<SUPPLIER>
>

/**
 * A generic map of supplies or undefined. Undefined used to force a supply not to be preserved across reassembly.
 * @public
 */
export type SuppliesOrUndefinedRecord<
    SUPPLIER extends UnknownProductSupplier = UnknownProductSupplier
> = Record<string, MaybeFn<[], Supply<SUPPLIER>> | undefined>

type AllRequiredSuppliers<
    SUPPLIER extends Pick<UnknownProductSupplier, "suppliers" | "hired">
> = TransitiveSuppliers<
    MergeSuppliers<SUPPLIER["suppliers"], SUPPLIER["hired"]>
>

type AllRequiredRequestSuppliers<
    SUPPLIER extends Pick<UnknownProductSupplier, "suppliers" | "hired">
> = ExcludeSuppliersType<AllRequiredSuppliers<SUPPLIER>, UnknownProductSupplier>

type AllRequiredProductSuppliers<
    SUPPLIER extends Pick<UnknownProductSupplier, "suppliers" | "hired">
> = ExcludeSuppliersType<AllRequiredSuppliers<SUPPLIER>, RequestSupplier>

/**
 * Recursively collects all optional suppliers from a supplier array.
 * This type walks through the dependency tree and accumulates all optional request
 * supplies required by product suppliers in the tree.
 *
 * @typeParam SUPPLIERS - The array of suppliers to collect optionals from
 * @returns A flattened array of all optional request suppliers
 * @internal
 */
export type Optionals<
    SUPPLIERS extends Supplier[],
    ACC extends Supplier[] = []
> =
    any[] extends SUPPLIERS ? Supplier[]
    : SUPPLIERS extends (
        [infer FIRST extends Supplier, ...infer REST extends Supplier[]]
    ) ?
        Optionals<REST, [...ACC, ...FIRST["optionals"]]>
    :   ACC

export type AllOptionalSuppliers<
    SUPPLIER extends Pick<
        UnknownProductSupplier,
        "optionals" | "suppliers" | "hired"
    >
> = [
    ...SUPPLIER["optionals"],
    ...Optionals<AllRequiredProductSuppliers<SUPPLIER>>,
    ...AllRequiredProductSuppliers<SUPPLIER>
]

/**
 * Converts an array of suppliers and optionals into a corresponding supply map.
 *
 * @typeParam SUPPLIERS - Array of suppliers to convert into a supply map
 * @typeParam OPTIONALS - Array of optional suppliers to convert into a supply map
 * @returns A map where keys are supplier names and values are their assembled supplies
 * @public
 */
export type Supplies<PARENT_SUPPLIER extends UnknownProductSupplier> = {
    [SUPPLIER in AllRequiredRequestSuppliers<PARENT_SUPPLIER>[number] as SUPPLIER["name"]]: MaybeFn<
        [],
        Supply<SUPPLIER>
    >
} & {
    [OPTIONAL in AllOptionalSuppliers<PARENT_SUPPLIER>[number] as OPTIONAL["name"]]?: MaybeFn<
        [],
        Supply<OPTIONAL>
    >
}

export type ToSupply<PARENT_SUPPLIER extends UnknownProductSupplier> = Omit<
    Supplies<PARENT_SUPPLIER>,
    keyof PARENT_SUPPLIER["known"]
> &
    Partial<PARENT_SUPPLIER["known"]>

// Same as Supplies, but without MaybeFn wrapper, meaning all supplies are resolved
export type Resolved<PARENT_SUPPLIER extends UnknownProductSupplier> = {
    [SUPPLIER in AllRequiredSuppliers<PARENT_SUPPLIER>[number] as SUPPLIER["name"]]: Supply<SUPPLIER>
} & {
    [OPTIONAL in PARENT_SUPPLIER["optionals"][number] as OPTIONAL["name"]]?: Supply<OPTIONAL>
}

// Same as Resolved, but unpacked from the supply wrapper
export type Deps<
    PARENT_SUPPLIER extends Pick<
        UnknownProductSupplier,
        "suppliers" | "optionals" | "hired"
    >
> = {
    [SUPPLIER in AllRequiredSuppliers<PARENT_SUPPLIER>[number] as SUPPLIER["name"]]: SUPPLIER["_constraint"]
} & {
    [OPTIONAL in PARENT_SUPPLIER["optionals"][number] as OPTIONAL["name"]]?: OPTIONAL["_constraint"]
}

type ResolveAssembler<
    SUPPLIER extends UnknownProductSupplier,
    ASSEMBLER extends UnknownProductSupplier,
    HIRED extends Extract<
        SUPPLIER["hired"][number],
        { name: ASSEMBLER["name"] }
    > = Extract<SUPPLIER["hired"][number], { name: ASSEMBLER["name"] }>
> =
    // Avoid distributive conditional behavior on `never` from `Extract`.
    // If no hired override matches, fall back to the original assembler type.
    [HIRED] extends [never] ? ASSEMBLER : HIRED

/**
 * ctx transforms suppliers into contextualized suppliers that can be assembled again with new request supplies.
 * This enables dynamic dependency injection within a supplier's factory.
 * @typeParam SUPPLIER - The current product supplier providing context
 * @returns A function that takes an assembler and returns it with a contextualized assemble method
 * @public
 */
export type Ctx<SUPPLIER extends UnknownProductSupplier> = <
    ASSEMBLER extends ReturnType<SUPPLIER["team"]>[number]
>(
    assembler: ASSEMBLER & (UnknownProductSupplier | Supplier)
) => ASSEMBLER extends UnknownProductSupplier ?
    ProductSupplier<
        ASSEMBLER["name"],
        ASSEMBLER["_constraint"],
        ResolveAssembler<SUPPLIER, ASSEMBLER>["suppliers"],
        ResolveAssembler<SUPPLIER, ASSEMBLER>["optionals"],
        ResolveAssembler<SUPPLIER, ASSEMBLER>["assemblers"],
        MergeSuppliers<SUPPLIER["hired"], ASSEMBLER["hired"]>,
        Supplies<SUPPLIER>,
        ResolveAssembler<SUPPLIER, ASSEMBLER>["_mock"] & ASSEMBLER["_mock"],
        ASSEMBLER["_composite"]
    >
:   ASSEMBLER & RequestSupplier // simply returns the assembler itself if it's a request supplier (noop)
/**
 * Recursively filters out suppliers of a specific type from a supplier array.
 * This is used internally to separate product suppliers from request suppliers
 * during dependency resolution.
 *
 * @typeParam SUPPLIERS - The array of suppliers to filter
 * @typeParam TYPE - The supplier type to exclude (ProductSupplier or RequestSupplier)
 * @returns A new array with the specified supplier type removed
 * @public
 */
export type ExcludeSuppliersType<
    SUPPLIERS extends Supplier[],
    TYPE extends Supplier,
    ACC extends Supplier[] = []
> =
    any[] extends SUPPLIERS ?
        TYPE extends UnknownProductSupplier ?
            RequestSupplier[]
        :   UnknownProductSupplier[]
    : // Flat conditional 1: Head matches TYPE - skip it
    SUPPLIERS extends (
        [infer Head extends TYPE, ...infer Tail extends Supplier[]]
    ) ?
        ExcludeSuppliersType<Tail, TYPE, ACC>
    : // Flat conditional 2: Head doesn't match TYPE - keep it
    SUPPLIERS extends (
        [infer Head extends Supplier, ...infer Tail extends Supplier[]]
    ) ?
        ExcludeSuppliersType<Tail, TYPE, [...ACC, Head]>
    :   // Base case
        ACC

/**
 * Recursively collects transitive suppliers
 * of a supplier into a team.
 * This type walks through the dependency tree, collecting each supplier and all of its
 * nested dependencies into a flattened array. This forms the "team" - the complete
 * set of suppliers needed to assemble a supply. The runtime equivalent is the `team()` utility.
 *
 * @internal
 */
export type TransitiveSuppliers<
    SUPPLIERS extends Supplier[],
    ACC extends Supplier[] = []
> =
    any[] extends SUPPLIERS ? Supplier[]
    : SUPPLIERS extends (
        [infer FIRST extends Supplier, ...infer REST extends Supplier[]]
    ) ?
        // Tail-recursive: queue up FIRST's suppliers + REST (both filtered), accumulate FIRST
        TransitiveSuppliers<
            [
                ...FilterSuppliers<
                    MergeSuppliers<FIRST["suppliers"], FIRST["hired"]>,
                    [...ACC, ...REST]
                >,
                ...REST
            ],
            [...ACC, FIRST]
        >
    :   ACC

/**
 * Recursively collects ALL transitive dependencies (including assemblers and optionals)
 * for strict circular dependency detection.
 *
 * @internal
 */
export type AllTransitiveSuppliers<
    SUPPLIERS extends Supplier[],
    ACC extends Supplier[] = []
> =
    any[] extends SUPPLIERS ? Supplier[]
    : SUPPLIERS extends (
        [infer FIRST extends Supplier, ...infer REST extends Supplier[]]
    ) ?
        AllTransitiveSuppliers<
            [
                ...FilterSuppliers<
                    [
                        ...MergeSuppliers<FIRST["suppliers"], FIRST["hired"]>,
                        ...FIRST["optionals"],
                        ...MergeSuppliers<FIRST["assemblers"], FIRST["hired"]>
                    ],
                    [...ACC, ...REST]
                >,
                ...REST
            ],
            [...ACC, FIRST]
        >
    :   ACC

/**
 * Filters out suppliers from OLD that have matching names in NEW.
 * This is used by the `hire` method to remove old suppliers before adding new ones,
 * allowing hired suppliers to override existing suppliers in the team.
 *
 * @typeParam OLD - The original array of suppliers to filter
 * @typeParam NEW - The array of suppliers whose names should be removed from OLD
 * @returns OLD suppliers without matching names in NEW
 * @public
 */
export type FilterSuppliers<
    OLD extends Supplier[],
    DEL extends Supplier[],
    ACC extends Supplier[] = []
> =
    any[] extends OLD | DEL ? OLD
    : OLD extends [infer Head extends Supplier, ...infer Tail] ?
        Head extends { name: DEL[number]["name"] } ?
            FilterSuppliers<Tail extends Supplier[] ? Tail : [], DEL, ACC>
        :   FilterSuppliers<
                Tail extends Supplier[] ? Tail : [],
                DEL,
                [...ACC, Head]
            >
    :   // Base case
        ACC

/**
 * Merges two supplier arrays by filtering out OLD suppliers that match NEW supplier names,
 * then appending NEW suppliers. This ensures hired suppliers override existing ones.
 * Used internally by the `hire` method to create the merged team.
 *
 * @typeParam OLD - The original array of suppliers
 * @typeParam NEW - The array of new suppliers to merge in (overriding matching names)
 * @returns A merged array with NEW suppliers replacing matching OLD suppliers
 * @public
 */
export type MergeSuppliers<OLD extends Supplier[], WITH extends Supplier[]> = [
    ...FilterSuppliers<OLD, WITH>,
    ...WITH
]

type FindDuplicateName<
    SUPPLIERS extends Supplier[],
    SEEN extends string[] = []
> =
    any[] extends SUPPLIERS ? never
    : SUPPLIERS extends (
        [infer FIRST extends Supplier, ...infer REST extends Supplier[]]
    ) ?
        string extends FIRST["name"] ? never
        : FIRST["name"] extends SEEN[number] ? FIRST["name"]
        : FindDuplicateName<REST, [...SEEN, FIRST["name"]]>
    :   never

export interface DuplicateDependencyError {
    ERROR: "Duplicate dependency name detected"
}

export type DuplicateDependencyGuard<SUPPLIER extends UnknownProductSupplier> =
    [
        FindDuplicateName<
            [
                ...SUPPLIER["suppliers"],
                ...SUPPLIER["optionals"],
                ...SUPPLIER["assemblers"]
            ]
        >
    ] extends [never] ?
        SUPPLIER
    :   DuplicateDependencyError

/**
 * Checks if a supplier has a circular dependency by seeing if its name appears
 * in the transitive dependencies of its own suppliers.
 * @public
 */

export type CircularDependencyGuard<
    SUPPLIER extends Pick<
        UnknownProductSupplier,
        "name" | "suppliers" | "optionals" | "assemblers" | "hired"
    >
> =
    string extends SUPPLIER["name"] ? SUPPLIER
    : SUPPLIER["name"] extends (
        AllTransitiveSuppliers<
            [
                ...MergeSuppliers<SUPPLIER["suppliers"], SUPPLIER["hired"]>,
                ...SUPPLIER["optionals"],
                ...MergeSuppliers<SUPPLIER["assemblers"], SUPPLIER["hired"]>
            ]
        >[number] extends infer S ?
            S extends Supplier ?
                S["name"]
            :   never
        :   never
    ) ?
        CircularDependencyError
    :   SUPPLIER

export type CircularDependencyError = {
    ERROR: "Circular dependency detected"
}

export type SupplierGraphGuard<SUPPLIER extends UnknownProductSupplier> =
    DuplicateDependencyGuard<SUPPLIER> extends infer DUPLICATE_CHECK ?
        DUPLICATE_CHECK extends DuplicateDependencyError ?
            DUPLICATE_CHECK
        :   CircularDependencyGuard<SUPPLIER>
    :   never
