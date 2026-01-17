export interface Supplier<NAME extends string = string, CONSTRAINT = any> {
    name: NAME
    suppliers: any[],
    optionals: any[],
    assemblers: any[],
    hired: any[],
    team: any[],
    pack: <VALUE extends CONSTRAINT>(
        value: VALUE
    ) => Supply<VALUE, TypeSupplier<NAME, CONSTRAINT>>
    _: {
        constraint: CONSTRAINT
    }
}

export interface TypeSupplier<NAME extends string = string, CONSTRAINT = any> extends Supplier<NAME, CONSTRAINT> {
    suppliers: [],
    optionals: [],
    assemblers: [],
    hired: [],
    team: [],
    _: {
        constraint: CONSTRAINT
        type: true
    }
}

export interface ProductSupplier <
    NAME extends string = string,
    CONSTRAINT = any,
    SUPPLIERS extends MainTypeSupplier[] = any[],
    OPTIONALS extends TypeSupplier[] = TypeSupplier[],
    ASSEMBLERS extends MainProductSupplier[] = any[],
    HIRED extends ProductSupplier[] = any[],
    TEAM extends Supplier[] = any[],
    DEPS extends Deps<MergeSuppliers<SUPPLIERS, HIRED>, OPTIONALS> = any,
    CTX extends Ctx<
        MergeSuppliers<SUPPLIERS, HIRED>,
        OPTIONALS,
        MergeSuppliers<ASSEMBLERS, HIRED>
    > = Ctx<[], [], []>
> extends Supplier<NAME, CONSTRAINT> {
    /** Array of suppliers this product depends on */
    suppliers: SUPPLIERS
    /** Array of optional suppliers this product may depend on */
    optionals: OPTIONALS
    /** Array of assemblers (lazy unassembled suppliers) */
    assemblers: ASSEMBLERS
    hired: HIRED
    team: TEAM
    /** Factory function that creates the product value from its dependencies */
    factory: (deps: DEPS, ctx: CTX) => CONSTRAINT
    /** Assembles the product by resolving dependencies */
    assemble: (
        supplied: ToSupply<SUPPLIERS, OPTIONALS, HIRED>
    ) => Supply<CONSTRAINT, Supplier>
    /** Optional initialization function called after factory */
    init?: (value: CONSTRAINT, deps: DEPS) => void
    /** Whether this supplier should be lazily evaluated */
    lazy?: boolean
    hire: (...hired: ProductSupplier[]) => any
    _: {
        constraint: CONSTRAINT
        product: true
        build: (...args: any[]) => Supply<CONSTRAINT, Supplier>
    }
}

/**
 * Represents a product - a complex object that can be assembled from dependencies.
 * Products can depend on other suppliers and support reassembly with overrides.
 * They represent fully constructed instances with resolved dependencies.
 *
 * @typeParam NAME - The unique identifier name for this product
 * @typeParam VALUE - The type of value this product produces
 * @public
 */
export type Supply<
    VALUE = any,
    SUPPLIER extends Supplier = Supplier,
    DEPS extends Deps<Supplier[], TypeSupplier[]> = any,
    RESOLVED extends Resolved<Supplier[], TypeSupplier[]> = any,
    CTX = Ctx<Supplier[], TypeSupplier[], ProductSupplier[]>
> = {
    /** Unpacks and returns the current value of this product */
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
        isMock: false
    }
}

export type MainTypeSupplier = TypeSupplier & MainSupplier
export type MainProductSupplier = ProductSupplier & MainSupplier


export type ProductConfig<
    CONSTRAINT = any,
    LAZY extends boolean = false,
    SUPPLIERS extends MainSupplier[] = MainSupplier[],
    OPTIONALS extends MainTypeSupplier[] = MainTypeSupplier[],
    ASSEMBLERS extends MainProductSupplier[] = MainProductSupplier[]
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
 * A generic map of supplies where keys are supplier names and values are products or resources.
 * @public
 */
export type SuppliesRecord<SUPPLIER extends Supplier = Supplier> =
    Record<string, MaybeFn<[], Supply<any, SUPPLIER>> | undefined>

/**
 * Converts an array of suppliers and optionals into a corresponding supply map.
 *
 * @typeParam SUPPLIERS - Array of supplier types to convert into a supply map
 * @typeParam OPTIONALS - Array of optional supplier types to convert into a supply map
 * @returns A map where keys are supplier names and values are their assembled products/resources
 * @public
 */
export type Supplies<
    SUPPLIERS extends Supplier[],
    OPTIONALS extends Supplier[],
    WIDE extends boolean = true,
    DEPS extends Deps<SUPPLIERS, OPTIONALS> = Deps<SUPPLIERS, OPTIONALS>
> =
    Supplier[] extends SUPPLIERS | OPTIONALS ?
        Record<string, MaybeFn<[], Supply> | undefined>
    :   {
            [SUPPLIER in SUPPLIERS[number] as SUPPLIER["name"]]: MaybeFn<
                    [],
                    Supply<
                        SUPPLIER["_"]["constraint"],
                        WIDE extends true ?
                            Supplier<
                                SUPPLIER["name"],
                                SUPPLIER["_"]["constraint"]
                            >
                        :   SUPPLIER,
                        SUPPLIER extends ProductSupplier ? DEPS : Record<never, never>
                    >
                >
        } & {
            [OPTIONAL in OPTIONALS[number] as OPTIONAL["name"]]?: 
                MaybeFn<
                    [],
                    Supply<
                        OPTIONAL["_"]["constraint"],
                        WIDE extends true ?
                            Supplier<
                                OPTIONAL["name"],
                                OPTIONAL["_"]["constraint"]
                            >
                        :   OPTIONAL,
                        OPTIONAL extends ProductSupplier ? DEPS : Record<never, never>
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
    Supplier[] extends SUPPLIERS | OPTIONALS ?
        Record<string, MaybeFn<[], Supply> | undefined>
    :   {
            [SUPPLIER in SUPPLIERS[number] as SUPPLIER["name"]]:
                Supply<
                    SUPPLIER["_"]["constraint"],
                    WIDE extends true ?
                        TypeSupplier<
                            SUPPLIER["name"],
                            SUPPLIER["_"]["constraint"]
                        >
                    :   SUPPLIER,
                    DEPS
                >
           
        } & {
            [OPTIONAL in OPTIONALS[number] as OPTIONAL["name"]]?:
                Supply<
                    OPTIONAL["_"]["constraint"],
                    WIDE extends true ?
                        TypeSupplier<
                            OPTIONAL["name"],
                            OPTIONAL["_"]["constraint"]
                        >
                    :   OPTIONAL,
                    DEPS
                >
           
        }


export type Deps<
    SUPPLIERS extends Supplier[],
    OPTIONALS extends Supplier[]
> = {
    [SUPPLIER in SUPPLIERS[number] as SUPPLIER["name"]]: SUPPLIER["_"]["constraint"]
} & {
    [OPTIONAL in OPTIONALS[number] as OPTIONAL["name"]]:
        | OPTIONAL["_"]["constraint"]
        | undefined
}

/**
 * Assembler accessor type used in factory functions for lazy dependency assembly.
 * ctx provides unassembled contextualized suppliers that can be assembled on-demand with custom supplies.
 * This enables lazy evaluation and dynamic dependency injection within a product's factory.
 * @typeParam SUPPLIERS - Array of suppliers available in the context
 * @typeParam OPTIONALS - Array of optional resource suppliers
 * @typeParam ASSEMBLERS - Array of product suppliers available as assemblers
 * @returns A function that takes an assembler and returns it with an assemble method
 * @public
 */
export type Ctx<
    SUPPLIERS extends Supplier[],
    OPTIONALS extends TypeSupplier[],
    ASSEMBLERS extends ProductSupplier[]
> = <
    ASSEMBLER extends SUPPLIERS[number] | OPTIONALS[number] | ASSEMBLERS[number]
>(
    assembler?: ASSEMBLER
) => ASSEMBLER extends ProductSupplier ?
    Supplier<ASSEMBLER["name"], ASSEMBLER["_"]["constraint"]> & {
        hire: <HIRED extends ProductSupplier[]>(
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
                Supplier<
                    ASSEMBLER["name"],
                    ASSEMBLER["_"]["constraint"]
                >,
                Deps<HIRED, []>
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
            Supplier<ASSEMBLER["name"], ASSEMBLER["_"]["constraint"]>
        >
    }
:   ASSEMBLER // simply returns the assembler itself if it's a runtime supplier (noop)
/**
 * Recursively filters out suppliers of a specific type from a supplier array.
 * This is used internally to separate product suppliers from resource suppliers
 * during dependency resolution.
 *
 * @typeParam SUPPLIERS - The array of suppliers to filter
 * @typeParam TYPE - The supplier type to exclude (ProductSupplier or ResourceSupplier)
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
 * Recursively collects transitive suppliers (excluding optionals and assemblers)
 * of a supplier into a team.
 * This type walks through the dependency tree, collecting each supplier and all of its
 * nested dependencies into a flattened array. This forms the "team" - the complete
 * set of suppliers needed to assemble a product. The runtime equivalent is the `team()` utility.
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

/**
 * Recursively collects ALL transitive dependencies (including assemblers and optionals)
 * for strict circular dependency detection. Unlike TransitiveSuppliers, this traverses
 * "weak" links that are not part of the immediate supply chain but could form cycles.
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
 * This type walks through the dependency tree and accumulates all optional resource
 * suppliers declared by product suppliers in the tree.
 *
 * @typeParam SUPPLIERS - The array of suppliers to collect optionals from
 * @returns A flattened array of all optional resource suppliers
 * @internal
 */
export type Optionals<
    SUPPLIERS extends Supplier[],
    ACC extends Supplier[] = []
> =
    SUPPLIERS extends [infer FIRST extends Supplier, ...infer REST extends Supplier[]] ?
        Optionals<
            REST,
            [...ACC, ...FIRST["optionals"]]
        >
    :   ACC

/**
 * Determines which suppliers need to be supplied externally when assembling a product.
 * This type computes the set of resource suppliers that must be provided because they
 * cannot be automatically assembled. It excludes product suppliers (which are autowired)
 * and returns only the resource suppliers from the transitive dependency tree.
 * Resources are merged from suppliers, hired suppliers, and hired assemblers.
 *
 * @typeParam SUPPLIERS - The array of suppliers to analyze
 * @typeParam OPTIONALS - The array of optional resource suppliers
 * @typeParam HIRED - The array of hired suppliers
 * @returns A supply map of only the resource suppliers that must be provided
 * @public
 */
export type ToSupply<
    SUPPLIERS extends Supplier[],
    OPTIONALS extends TypeSupplier[],
    HIRED extends ProductSupplier[]
> = Supplies<
    ExcludeSuppliersType<
        TransitiveSuppliers<MergeSuppliers<SUPPLIERS, HIRED>>,
        ProductSupplier
    >,
    [
        ...OPTIONALS,
        ...Optionals<
            ExcludeSuppliersType<
                TransitiveSuppliers<MergeSuppliers<SUPPLIERS, HIRED>>,
                TypeSupplier
            >
        >,
        ...ExcludeSuppliersType<
            TransitiveSuppliers<MergeSuppliers<SUPPLIERS, HIRED>>,
            ProductSupplier
        >
    ]
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
        ProductSupplier,
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
