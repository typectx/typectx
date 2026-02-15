export interface Supplier<NAME extends string = string, CONSTRAINT = any> {
    name: NAME
    suppliers: any[]
    optionals: any[]
    assemblers: any[]
    hired: any[]
    team: any[]
    pack: <VALUE extends CONSTRAINT>(
        value: VALUE
    ) => Supply<
        VALUE,
        RequestSupplier<NAME, CONSTRAINT>,
        Record<never, never>,
        Record<never, never>
    >
    _: {
        constraint: CONSTRAINT
    }
}

export interface RequestSupplier<NAME extends string = string, CONSTRAINT = any>
    extends Supplier<NAME, CONSTRAINT> {
    suppliers: never[]
    optionals: never[]
    assemblers: never[]
    hired: never[]
    team: never[]
    _: {
        constraint: CONSTRAINT
        request: true
    }
}

export interface AnyProductSupplier extends Supplier<string, any> {
    suppliers: any[]
    optionals: any[]
    assemblers: any[]
    hired: any[]
    team: any[]
    factory: (deps: any, ctx: any) => any
    assemble: (supplied: any) => Supply<any, AnyProductSupplier, any, any, any>
    init?: (value: any, deps: any) => void
    lazy?: boolean
    hire: (...hired: AnyProductSupplier[]) => any
    _: {
        constraint: any
        product: true
        build: (...args: any[]) => Supply<any, AnyProductSupplier, any, any>
    }
}

export interface ProductSupplier<
    NAME extends string,
    CONSTRAINT,
    SUPPLIERS extends MainSupplier[],
    OPTIONALS extends RequestSupplier[],
    ASSEMBLERS extends AnyProductSupplier[],
    HIRED extends AnyProductSupplier[] = [],
    TEAM extends Supplier[] = Team<SUPPLIERS, OPTIONALS, HIRED>,
    DEPS extends Deps<MergeSuppliers<SUPPLIERS, HIRED>, OPTIONALS> = Deps<
        MergeSuppliers<SUPPLIERS, HIRED>,
        OPTIONALS
    >,
    RESOLVED extends Resolved<
        MergeSuppliers<SUPPLIERS, HIRED>,
        OPTIONALS
    > = Resolved<MergeSuppliers<SUPPLIERS, HIRED>, OPTIONALS>,
    CTX extends Ctx<
        MergeSuppliers<SUPPLIERS, HIRED>,
        OPTIONALS,
        MergeSuppliers<ASSEMBLERS, HIRED>
    > = Ctx<TEAM, OPTIONALS, ASSEMBLERS>
> extends Supplier<NAME, CONSTRAINT> {
    /** Array of suppliers this supplier depends on */
    suppliers: SUPPLIERS
    /** Array of optional request suppliers this supplier may depend on */
    optionals: OPTIONALS
    /** Array of assemblers (lazy unassembled suppliers) */
    assemblers: ASSEMBLERS
    hired: HIRED
    team: TEAM
    /** Factory function that creates the product from its dependencies */
    factory: (deps: DEPS, ctx: CTX) => CONSTRAINT
    /** Assembles the supplier by providing request values and auto-wiring product dependencies */
    assemble: (
        supplied: ToSupply<SUPPLIERS, OPTIONALS, HIRED>
    ) => Supply<CONSTRAINT, AnyProductSupplier, DEPS, RESOLVED>
    /** Optional initialization function called after factory */
    init?: (value: CONSTRAINT, deps: DEPS) => void
    /** Whether this supplier should be lazily evaluated */
    lazy?: boolean
    hire: (...hired: AnyProductSupplier[]) => any
    _: {
        constraint: CONSTRAINT
        product: true
        build: (
            ...args: any[]
        ) => Supply<CONSTRAINT, AnyProductSupplier, DEPS, RESOLVED>
    }
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
export type Supply<
    VALUE = any,
    SUPPLIER extends Supplier = Supplier,
    DEPS extends Deps<Supplier[], RequestSupplier[]> = any,
    RESOLVED extends Resolved<Supplier[], RequestSupplier[]> = any,
    CTX = Ctx<Supplier[], RequestSupplier[], AnyProductSupplier[]>
> = {
    /** Unpacks and returns the current value of this supply */
    unpack: () => VALUE
    deps: DEPS
    supplies: RESOLVED
    supplier: SUPPLIER
    _: {
        ctx: CTX
        packed: boolean
    }
}

export type MainSupplier = Supplier & {
    _: {
        mock: false
    }
}

export type MainRequestSupplier = RequestSupplier & MainSupplier

export type ProductConfig<
    CONSTRAINT = any,
    LAZY extends boolean = false,
    SUPPLIERS extends MainSupplier[] = MainSupplier[],
    OPTIONALS extends MainRequestSupplier[] = MainRequestSupplier[],
    ASSEMBLERS extends AnyProductSupplier[] = AnyProductSupplier[]
> = {
    suppliers?: [...SUPPLIERS]
    optionals?: [...OPTIONALS]
    assemblers?: [...ASSEMBLERS]
    factory: (
        deps: Deps<SUPPLIERS, OPTIONALS>,
        ctx: Ctx<SUPPLIERS, OPTIONALS, ASSEMBLERS>
    ) => CONSTRAINT
    init?: (value: CONSTRAINT, deps: Deps<SUPPLIERS, OPTIONALS>) => void
    lazy?: LAZY
}

type MaybeFn<A extends any[], R> = R | ((...args: A) => R)

/**
 * A generic map of supplies
 * @public
 */
export type SuppliesRecord<SUPPLIER extends Supplier = Supplier> = Record<
    string,
    MaybeFn<[], Supply<any, SUPPLIER>>
>

/**
 * A generic map of supplies or undefined. Undefined used to force a supply not to be preserved across reassembly.
 * @public
 */
export type SuppliesOrUndefinedRecord<SUPPLIER extends Supplier = Supplier> =
    Record<string, MaybeFn<[], Supply<any, SUPPLIER>> | undefined>

/**
 * Converts an array of suppliers and optionals into a corresponding supply map.
 *
 * @typeParam SUPPLIERS - Array of suppliers to convert into a supply map
 * @typeParam OPTIONALS - Array of optional suppliers to convert into a supply map
 * @returns A map where keys are supplier names and values are their assembled supplies
 * @public
 */
export type Supplies<
    SUPPLIERS extends Supplier[],
    OPTIONALS extends Supplier[],
    WIDE extends boolean = true,
    DEPS extends Deps<SUPPLIERS, OPTIONALS> = Deps<SUPPLIERS, OPTIONALS>
> =
    Supplier[] extends SUPPLIERS | OPTIONALS ?
        Record<string, MaybeFn<[], Supply>>
    :   {
            [SUPPLIER in SUPPLIERS[number] as SUPPLIER["name"]]: MaybeFn<
                [],
                Supply<
                    SUPPLIER["_"]["constraint"],
                    WIDE extends true ?
                        Supplier<SUPPLIER["name"], SUPPLIER["_"]["constraint"]>
                    :   SUPPLIER,
                    SUPPLIER extends AnyProductSupplier ? DEPS
                    :   Record<never, never>
                >
            >
        } & {
            [OPTIONAL in OPTIONALS[number] as OPTIONAL["name"]]?: MaybeFn<
                [],
                Supply<
                    OPTIONAL["_"]["constraint"],
                    WIDE extends true ?
                        Supplier<OPTIONAL["name"], OPTIONAL["_"]["constraint"]>
                    :   OPTIONAL,
                    OPTIONAL extends AnyProductSupplier ? DEPS
                    :   Record<never, never>
                >
            >
        }

// Same as Supplies, but without MaybeFn wrapper, meaning all supplies are resolved
export type Resolved<
    SUPPLIERS extends Supplier[],
    OPTIONALS extends Supplier[],
    WIDE extends boolean = true,
    DEPS extends Deps<SUPPLIERS, OPTIONALS> = Deps<SUPPLIERS, OPTIONALS>
> =
    Supplier[] extends SUPPLIERS | OPTIONALS ? Record<string, Supply>
    :   {
            [SUPPLIER in SUPPLIERS[number] as SUPPLIER["name"]]: Supply<
                SUPPLIER["_"]["constraint"],
                WIDE extends true ?
                    RequestSupplier<
                        SUPPLIER["name"],
                        SUPPLIER["_"]["constraint"]
                    >
                :   SUPPLIER,
                DEPS
            >
        } & {
            [OPTIONAL in OPTIONALS[number] as OPTIONAL["name"]]?: Supply<
                OPTIONAL["_"]["constraint"],
                WIDE extends true ?
                    RequestSupplier<
                        OPTIONAL["name"],
                        OPTIONAL["_"]["constraint"]
                    >
                :   OPTIONAL,
                DEPS
            >
        }

// Same as Resolved, but unpacked from the supply wrapper
export type Deps<SUPPLIERS extends Supplier[], OPTIONALS extends Supplier[]> = {
    [SUPPLIER in SUPPLIERS[number] as SUPPLIER["name"]]: SUPPLIER["_"]["constraint"]
} & {
    [OPTIONAL in OPTIONALS[number] as OPTIONAL["name"]]?: OPTIONAL["_"]["constraint"]
}

/**
 * ctx transforms suppliers into contextualized suppliers that can be assembled again with new request supplies.
 * This enables dynamic dependency injection within a supplier's factory.
 * @typeParam SUPPLIERS - Array of suppliers available in the context
 * @typeParam OPTIONALS - Array of optional request suppliers
 * @typeParam ASSEMBLERS - Array of product suppliers available as assemblers
 * @returns A function that takes an assembler and returns it with an assemble method
 * @public
 */
export type Ctx<
    SUPPLIERS extends Supplier[],
    OPTIONALS extends RequestSupplier[],
    ASSEMBLERS extends AnyProductSupplier[]
> = <
    ASSEMBLER extends {
        name:
            | SUPPLIERS[number]["name"]
            | OPTIONALS[number]["name"]
            | ASSEMBLERS[number]["name"]
    }
>(
    assembler?: ASSEMBLER
) => ASSEMBLER extends AnyProductSupplier ?
    Omit<
        ProductSupplier<
            ASSEMBLER["name"],
            ASSEMBLER["_"]["constraint"],
            ASSEMBLER["suppliers"],
            ASSEMBLER["optionals"],
            ASSEMBLER["assemblers"],
            ASSEMBLER["hired"]
        >,
        "assemble" | "hire"
    > & {
        hire: <HIRED extends AnyProductSupplier[]>(
            ...hired: [...HIRED]
        ) => CircularDependencyGuard<{
            name: ASSEMBLER["name"]
            suppliers: ASSEMBLER["suppliers"]
            optionals: ASSEMBLER["optionals"]
            assemblers: ASSEMBLER["assemblers"]
            hired: MergeSuppliers<ASSEMBLER["hired"], HIRED>
            assemble: (
                supplied: Omit<
                    ToSupply<
                        ASSEMBLER["suppliers"],
                        ASSEMBLER["optionals"],
                        MergeSuppliers<ASSEMBLER["hired"], HIRED>
                    >,
                    keyof ToSupply<SUPPLIERS, OPTIONALS, []>
                >
            ) => Supply<
                ASSEMBLER["_"]["constraint"],
                ProductSupplier<
                    ASSEMBLER["name"],
                    ASSEMBLER["_"]["constraint"],
                    ASSEMBLER["suppliers"],
                    ASSEMBLER["optionals"],
                    ASSEMBLER["assemblers"],
                    ASSEMBLER["hired"]
                >,
                Deps<MergeSuppliers<SUPPLIERS, HIRED>, OPTIONALS>,
                Resolved<MergeSuppliers<SUPPLIERS, HIRED>, OPTIONALS>
            >
        }>
        assemble: (
            supplied: Omit<
                ToSupply<
                    ASSEMBLER["suppliers"],
                    ASSEMBLER["optionals"],
                    ASSEMBLER["hired"]
                >,
                keyof ToSupply<SUPPLIERS, OPTIONALS, []>
            >
        ) => Supply<
            ASSEMBLER["_"]["constraint"],
            ProductSupplier<
                ASSEMBLER["name"],
                ASSEMBLER["_"]["constraint"],
                ASSEMBLER["suppliers"],
                ASSEMBLER["optionals"],
                ASSEMBLER["assemblers"],
                ASSEMBLER["hired"]
            >,
            Deps<SUPPLIERS, OPTIONALS>,
            Resolved<SUPPLIERS, OPTIONALS>
        >
    }
:   ASSEMBLER // simply returns the assembler itself if it's a runtime supplier (noop)
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
    // Flat conditional 1: Head matches TYPE - skip it
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
    SUPPLIERS extends (
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

export type Team<
    SUPPLIERS extends Supplier[],
    OPTIONALS extends RequestSupplier[],
    HIRED extends AnyProductSupplier[]
> = [...OPTIONALS, ...TransitiveSuppliers<MergeSuppliers<SUPPLIERS, HIRED>>]

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
    SUPPLIERS extends (
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
    SUPPLIERS extends (
        [infer FIRST extends Supplier, ...infer REST extends Supplier[]]
    ) ?
        Optionals<REST, [...ACC, ...FIRST["optionals"]]>
    :   ACC

/**
 * Determines which supplies need to be dynamically supplied when assembling.
 * This type computes the set of request supplies that must be provided to assemble a product supplier.
 * It excludes product suppliers (which are autowired)
 * and returns only request suppliers from the product supplier's transitive dependency tree.
 *
 * @typeParam SUPPLIERS - The array of suppliers to analyze
 * @typeParam OPTIONALS - The array of optional suppliers
 * @typeParam HIRED - The array of hired suppliers
 * @returns A supply map of only the request suppliers that must be provided
 * @public
 */
export type ToSupply<
    SUPPLIERS extends Supplier[],
    OPTIONALS extends RequestSupplier[],
    HIRED extends AnyProductSupplier[]
> = Supplies<
    ExcludeSuppliersType<
        TransitiveSuppliers<MergeSuppliers<SUPPLIERS, HIRED>>,
        AnyProductSupplier
    >,
    [
        ...OPTIONALS,
        ...Optionals<
            ExcludeSuppliersType<
                TransitiveSuppliers<MergeSuppliers<SUPPLIERS, HIRED>>,
                RequestSupplier
            >
        >,
        ...ExcludeSuppliersType<
            TransitiveSuppliers<MergeSuppliers<SUPPLIERS, HIRED>>,
            RequestSupplier
        >
    ],
    true,
    any
>

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
    OLD extends [infer Head extends Supplier, ...infer Tail] ?
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

/**
 * Checks if a supplier has a circular dependency by seeing if its name appears
 * in the transitive dependencies of its own suppliers.
 * @public
 */

export type CircularDependencyGuard<
    SUPPLIER extends Pick<
        AnyProductSupplier,
        "name" | "suppliers" | "optionals" | "assemblers" | "hired"
    >
> =
    SUPPLIER["name"] extends (
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
