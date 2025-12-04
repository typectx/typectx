/**
 * Represents a resource - a simple value container that can be packed and unpacked.
 * Resources are immutable value holders that don't depend on other suppliers.
 * They provide the simplest form of dependency injection for configuration values or constants.
 *
 * @typeParam NAME - The unique identifier name for this resource
 * @typeParam VALUE - The type of value this resource contains
 * @public
 */
export type Resource<
    VALUE = any,
    SUPPLIER extends ResourceSupplier = ResourceSupplier
> = {
    /** Unpacks and returns the current value of this resource */
    unpack(): VALUE
    supplier: SUPPLIER
}

/**
 * Represents a resource supplier - a factory for creating resources of a specific constraint type.
 * Resource suppliers define the contract for what values can be packed into a resource.
 * They ensure type safety by constraining the values that can be supplied.
 *
 * @typeParam NAME - The unique identifier name for this resource supplier
 * @typeParam CONSTRAINT - The type constraint for values this supplier can accept
 * @public
 */
export type ResourceSupplier<NAME extends string = string, CONSTRAINT = any> = {
    /** The name/identifier of this resource supplier */
    name: NAME
    /** Packs a value into a resource, creating a new resource instance */
    pack: <VALUE extends CONSTRAINT>(
        value: VALUE
    ) => Resource<VALUE, ResourceSupplier<NAME, CONSTRAINT>>
    _: {
        /** Type marker indicating this is a resource supplier */
        resource: true
        /** The constraint type for values this supplier can pack */
        constraint: CONSTRAINT
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
export type Product<
    VALUE = any,
    SUPPLIER extends BaseProductSupplier = ProductSupplier,
    SUPPLIES = $<Supplier[], ResourceSupplier[]>,
    ASSEMBLERS_MAP = $$<Supplier[], ResourceSupplier[], ProductSupplier[]>
> = {
    /** Unpacks and returns the current value of this product */
    unpack: () => VALUE
    $: SUPPLIES
    supplier: SUPPLIER
    _: {
        $$: ASSEMBLERS_MAP
        packed: boolean
    }
}

export type BaseProductSupplier<
    NAME extends string = string,
    CONSTRAINT = any
> = {
    name: NAME
    pack: <VALUE extends CONSTRAINT>(
        value: VALUE
    ) => Product<VALUE, ProductSupplier<NAME, CONSTRAINT>>
    _: {
        constraint: CONSTRAINT
        product: true
    }
}

/**
 * Represents a product supplier - a factory for creating products with dependencies.
 * Product suppliers define how to assemble complex objects from their dependencies.
 * They support various features like lazy loading, prototypes, and assemblers.
 *
 * @typeParam NAME - The unique identifier name for this product supplier
 * @typeParam VALUE - The type of value this supplier produces
 * @typeParam SUPPLIERS - Array of suppliers this product depends on
 * @typeParam OPTIONALS - Array of optional suppliers this product may depend on
 * @typeParam ASSEMBLERS - Array of assemblers (lazy unassembled suppliers)
 * @typeParam SUPPLIES - The resolved supply map for dependencies
 * @typeParam ASSEMBLERS_MAP - Same as ASSEMBLERS, but formatted as a map with supplier names as keys.
 * @public
 */
export type ProductSupplier<
    NAME extends string = string,
    CONSTRAINT = any,
    SUPPLIERS extends MainSupplier[] = any[],
    OPTIONALS extends ResourceSupplier[] = ResourceSupplier[],
    ASSEMBLERS extends MainProductSupplier[] = any[],
    HIRED extends ProductSupplier[] = any[],
    TEAM extends Supplier[] = any[],
    $MAP extends $<MergeSuppliers<SUPPLIERS, HIRED>, OPTIONALS> = $<[], []>,
    $$MAP extends $$<
        MergeSuppliers<SUPPLIERS, HIRED>,
        OPTIONALS,
        MergeSuppliers<ASSEMBLERS, HIRED>
    > = $$<[], [], []>
> = BaseProductSupplier<NAME, CONSTRAINT> & {
    /** Array of suppliers this product depends on */
    suppliers: SUPPLIERS
    /** Array of optional suppliers this product may depend on */
    optionals: OPTIONALS
    /** Array of assemblers (lazy unassembled suppliers) */
    assemblers: ASSEMBLERS
    hired: HIRED
    team: TEAM
    /** Factory function that creates the product value from its dependencies */
    factory: ($: $MAP, $$: $$MAP) => CONSTRAINT
    /** Assembles the product by resolving dependencies */
    assemble: (
        supplied: ToSupply<SUPPLIERS, OPTIONALS, HIRED>
    ) => Product<CONSTRAINT, ProductSupplier>
    /** Optional initialization function called after factory */
    init?: (value: CONSTRAINT, $: $MAP) => void
    /** Whether this supplier should be lazily evaluated */
    lazy?: boolean
    hire: (...hired: ProductSupplier[]) => any
    _: {
        build: (...args: any[]) => Product<CONSTRAINT, ProductSupplier>
    }
}

/**
 * Union type representing any kind of supplier.
 * A supplier can be either a product supplier (complex objects with dependencies)
 * or a resource supplier (simple value containers).
 * This is the base type used throughout the typectx system for dependency injection.
 * @public
 */
export type Supplier = ProductSupplier | ResourceSupplier
export type BaseSupplier = BaseProductSupplier | ResourceSupplier

export type MainProductSupplier = ProductSupplier & {
    _: {
        isMock: false
    }
    hired: []
}

export type MainSupplier = MainProductSupplier | ResourceSupplier

export type AsProductParameters<
    CONSTRAINT = any,
    LAZY extends boolean = false,
    SUPPLIERS extends MainSupplier[] = MainSupplier[],
    OPTIONALS extends ResourceSupplier[] = ResourceSupplier[],
    ASSEMBLERS extends ProductSupplier[] = ProductSupplier[]
> = {
    suppliers?: [...SUPPLIERS]
    optionals?: [...OPTIONALS]
    assemblers?: [...ASSEMBLERS]
    factory: (
        $: $<SUPPLIERS, OPTIONALS>,
        $$: $$<SUPPLIERS, OPTIONALS, ASSEMBLERS>
    ) => CONSTRAINT
    init?: (value: CONSTRAINT, $: $<SUPPLIERS, OPTIONALS>) => void
    lazy?: LAZY
}

type MaybeFn<A extends any[], R> = R | ((...args: A) => R)

/**
 * A generic map of supplies where keys are supplier names and values are products or resources.
 * @public
 */
export type SupplyRecord<
    SUPPLIER extends BaseProductSupplier = BaseProductSupplier
> = Record<string, MaybeFn<[], Product<any, SUPPLIER>> | Resource | undefined>

/**
 * Converts an array of suppliers and optionals into a corresponding $ supply map.
 *
 * @typeParam SUPPLIERS - Array of supplier types to convert into a supply map
 * @typeParam OPTIONALS - Array of optional supplier types to convert into a supply map
 * @returns A map where keys are supplier names and values are their assembled products/resources
 * @public
 */
export type Supplies<
    SUPPLIERS extends BaseSupplier[],
    OPTIONALS extends ResourceSupplier[],
    WIDE extends boolean = true,
    $MAP extends $<SUPPLIERS, OPTIONALS, WIDE> = $<SUPPLIERS, OPTIONALS, WIDE>
> =
    ProductSupplier[] & ResourceSupplier[] extends SUPPLIERS | OPTIONALS ?
        Record<
            string,
            | MaybeFn<[], Product<any, BaseProductSupplier>>
            | Resource
            | undefined
        >
    :   {
            [SUPPLIER in SUPPLIERS[number] as SUPPLIER["name"]]: SUPPLIER extends (
                ProductSupplier
            ) ?
                MaybeFn<
                    [],
                    Product<
                        SUPPLIER["_"]["constraint"],
                        WIDE extends true ?
                            BaseProductSupplier<
                                SUPPLIER["name"],
                                SUPPLIER["_"]["constraint"]
                            >
                        :   SUPPLIER,
                        $MAP
                    >
                >
            : SUPPLIER extends ResourceSupplier ?
                Resource<SUPPLIER["_"]["constraint"], SUPPLIER>
            :   never
        } & {
            [OPTIONAL in OPTIONALS[number] as OPTIONAL["name"]]?: OPTIONAL extends (
                ProductSupplier
            ) ?
                MaybeFn<
                    [$MAP],
                    Product<
                        OPTIONAL["_"]["constraint"],
                        WIDE extends true ?
                            BaseProductSupplier<
                                OPTIONAL["name"],
                                OPTIONAL["_"]["constraint"]
                            >
                        :   OPTIONAL,
                        $MAP
                    >
                >
            : OPTIONAL extends ResourceSupplier ?
                Resource<OPTIONAL["_"]["constraint"], OPTIONAL>
            :   never
        }
/**
 * Adds callable access to Supplies type defined above.
 * This type represents the resolved dependencies that can be passed to factory functions.
 * It enables accessing dependencies either as properties or by calling with a supplier object.
 *
 * @typeParam SUPPLIERS - Array of suppliers to create the $ object from
 * @returns A callable object that provides both property access and function call access to supplies
 * @public
 */
export type $<
    SUPPLIERS extends BaseSupplier[],
    OPTIONALS extends ResourceSupplier[],
    WIDE extends boolean = true
> = {
    allKeys: (keyof Supplies<SUPPLIERS, OPTIONALS> & string)[]
    keys: (keyof Supplies<SUPPLIERS, OPTIONALS> & string)[]
} & (<
    SUPPLIER extends {
        name: keyof Supplies<SUPPLIERS, OPTIONALS> & string
    }
>(
    supplier: SUPPLIER
) => Supplies<
    SUPPLIERS,
    OPTIONALS,
    WIDE,
    $<SUPPLIERS, OPTIONALS, WIDE>
>[SUPPLIER["name"]] extends infer S ?
    S extends (...args: any[]) => any ?
        ReturnType<S>
    :   S
:   never)

/**
 * Assembler accessor type used in factory functions for lazy dependency assembly.
 * Unlike $, which provides fully assembled products, $$ provides unassembled suppliers
 * that can be assembled on-demand with custom supplies. This enables lazy evaluation
 * and dynamic dependency injection within a product's factory.
 *
 * @typeParam ASSEMBLERS - Array of product suppliers available as assemblers
 * @typeParam OPTIONALS - Array of optional resource suppliers
 * @returns A function that takes an assembler and returns it with an assemble method
 * @public
 */
export type $$<
    SUPPLIERS extends Supplier[],
    OPTIONALS extends ResourceSupplier[],
    ASSEMBLERS extends ProductSupplier[]
> = <
    ASSEMBLER extends SUPPLIERS[number] | OPTIONALS[number] | ASSEMBLERS[number]
>(
    assembler?: ASSEMBLER
) => ASSEMBLER extends ProductSupplier ?
    BaseProductSupplier<ASSEMBLER["name"], ASSEMBLER["_"]["constraint"]> & {
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
            ) => Product<
                ASSEMBLER["_"]["constraint"],
                BaseProductSupplier<
                    ASSEMBLER["name"],
                    ASSEMBLER["_"]["constraint"]
                >,
                $<HIRED, []>
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
        ) => Product<
            ASSEMBLER["_"]["constraint"],
            BaseProductSupplier<ASSEMBLER["name"], ASSEMBLER["_"]["constraint"]>
        >
    }
:   ASSEMBLER //Matched by optionals, simply returns the optional itself.
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
    TYPE extends Supplier
> =
    SUPPLIERS extends [infer Head, ...infer Tail] ?
        Head extends TYPE ?
            Tail extends Supplier[] ?
                ExcludeSuppliersType<Tail, TYPE>
            :   []
        : Tail extends Supplier[] ? [Head, ...ExcludeSuppliersType<Tail, TYPE>]
        : [Head]
    :   []

/**
 * Recursively collects transitive suppliers (excluding optionals and assemblers)
 * of a supplier into a team.
 * This type walks through the dependency tree, collecting each supplier and all of its
 * nested dependencies into a flattened array. This forms the "team" - the complete
 * set of suppliers needed to assemble a product. The runtime equivalent is the `team()` utility.
 *
 * @internal
 */
export type TransitiveSuppliers<SUPPLIERS extends Supplier[]> =
    SUPPLIERS extends [infer FIRST, ...infer REST] ?
        FIRST extends ProductSupplier ?
            [
                FIRST,
                ...TransitiveSuppliers<
                    MergeSuppliers<FIRST["suppliers"], FIRST["hired"]>
                >,
                ...TransitiveSuppliers<REST extends Supplier[] ? REST : []>
            ]
        : FIRST extends ResourceSupplier ?
            [FIRST, ...TransitiveSuppliers<REST extends Supplier[] ? REST : []>]
        :   never
    :   []

/**
 * Recursively collects ALL transitive dependencies (including assemblers and optionals)
 * for strict circular dependency detection. Unlike TransitiveSuppliers, this traverses
 * "weak" links that are not part of the immediate supply chain but could form cycles.
 *
 * @internal
 */
export type AllTransitiveSuppliers<SUPPLIERS extends Supplier[]> =
    SUPPLIERS extends [infer FIRST, ...infer REST] ?
        FIRST extends ProductSupplier ?
            [
                FIRST,
                ...AllTransitiveSuppliers<
                    MergeSuppliers<FIRST["suppliers"], FIRST["hired"]>
                >,
                ...AllTransitiveSuppliers<FIRST["optionals"]>,
                ...AllTransitiveSuppliers<
                    MergeSuppliers<FIRST["assemblers"], FIRST["hired"]>
                >,
                ...AllTransitiveSuppliers<REST extends Supplier[] ? REST : []>
            ]
        : FIRST extends ResourceSupplier ?
            [
                FIRST,
                ...AllTransitiveSuppliers<REST extends Supplier[] ? REST : []>
            ]
        :   never
    :   []

/**
 * Recursively collects all optional suppliers from a supplier array.
 * This type walks through the dependency tree and accumulates all optional resource
 * suppliers declared by product suppliers in the tree.
 *
 * @typeParam SUPPLIERS - The array of suppliers to collect optionals from
 * @returns A flattened array of all optional resource suppliers
 * @internal
 */
export type Optionals<SUPPLIERS extends Supplier[]> =
    SUPPLIERS extends [infer FIRST, ...infer REST] ?
        FIRST extends ProductSupplier ?
            [
                ...FIRST["optionals"],
                ...Optionals<REST extends Supplier[] ? REST : []>
            ]
        : FIRST extends ResourceSupplier ?
            Optionals<REST extends Supplier[] ? REST : []>
        :   never
    :   []

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
    OPTIONALS extends ResourceSupplier[],
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
                ResourceSupplier
            >
        >,
        ...ExcludeSuppliersType<
            TransitiveSuppliers<MergeSuppliers<SUPPLIERS, HIRED>>,
            ResourceSupplier
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
    NEW extends ProductSupplier[]
> =
    OLD extends [infer Head, ...infer Tail] ?
        Tail extends Supplier[] ?
            Head extends { name: NEW[number]["name"] } ?
                FilterSuppliers<Tail, NEW>
            :   [Head, ...FilterSuppliers<Tail, NEW>]
        : Head extends { name: NEW[number]["name"] } ? []
        : [Head]
    :   []

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
export type MergeSuppliers<
    OLD extends Supplier[],
    NEW extends ProductSupplier[]
> = [...FilterSuppliers<OLD, NEW>, ...NEW]

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
