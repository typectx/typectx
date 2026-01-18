import {
    SuppliesRecord,
    type ToSupply,
    type CircularDependencyGuard,
    type Ctx,
    Supplier,
    MainSupplier,
    MergeSuppliers,
    TransitiveSuppliers,
    type Deps,
    type Resolved,
    type ProductConfig,
    type MainTypeSupplier,
    type ProductSupplier,
    type TypeSupplier,
    type Supply,
    type SuppliesOrUndefinedRecord
} from "#types"

import { once, team as buildTeam, isProductSupplier, isPacked } from "#utils"
import {
    assertString,
    assertPlainObject,
    assertProductConfig,
    assertProductSuppliers
} from "#validation"

/**
 * Creates a new market instance for managing suppliers and products.
 * A market provides a namespace for creating and managing suppliers without name conflicts.
 * Each market maintains its own registry of supplier names to prevent collisions.
 *
 * @returns A market object with methods to create suppliers and products
 * @public
 */
export const createMarket = () => {
    const names = new Set<string>()
    const market = {
        /**
         * Declares a new supplier or product with the given name.
         * The name must be unique within this market.
         *
         * @param name - The unique name for this supplier
         * @returns An offer object with methods to define the supplier type (asResource or asProduct)
         * @throws Error if the name already exists in this market
         * @public
         */
        add<NAME extends string>(name: NAME) {
            assertString("name", name)
            if (names.has(name)) {
                throw new Error(`Name ${name} already exists`)
            }
            names.add(name)

            function type<CONSTRAINT = any>() {
                return {
                    name,
                    suppliers: [] ,
                    optionals: [],
                    assemblers: [] ,
                    hired: [] ,
                    team: [] ,
                    pack<THIS, VALUE extends CONSTRAINT>(
                        this: THIS,
                        value: VALUE
                    ) {
                        return {
                            unpack: () => value,
                            deps: {},
                            supplies: {},
                            supplier: this,
                            _: {
                                ctx: () => null as any,
                                packed: true as const
                            }
                        }
                    },
                    _: {
                        constraint: null as unknown as CONSTRAINT,       
                        type: true as const,
                        isMock: false as const
                    },
                }
            }

            return {
                type,
                /**
                 * Creates a product supplier that can assemble complex objects from dependencies.
                 * Products can depend on other suppliers and have factory functions for creation.
                 * They represent complex objects that require dependency injection and orchestration.
                 *
                 * @typeParam CONSTRAINT - The type constraint for values this product produces
                 * @typeParam LAZY - Whether this product should be lazily evaluated
                 * @typeParam SUPPLIERS - Array of suppliers this product depends on
                 * @typeParam OPTIONALS - Array of optional resource suppliers this product may depend on
                 * @typeParam ASSEMBLERS - Array of assemblers (lazy unassembled product suppliers)
                 * @param config - Configuration object for the product
                 * @param config.suppliers - Array of suppliers this product depends on
                 * @param config.optionals - Array of optional resource suppliers
                 * @param config.assemblers - Array of assemblers (lazy unassembled suppliers)
                 * @param config.factory - Factory function that creates the product value from its dependencies
                 * @param config.init - Optional initialization function called after factory
                 * @param config.lazy - Whether the product should be lazily evaluated
                 *
                 * @returns A product supplier with methods like assemble, pack, mock, and hire
                 * @public
                 */
                product<
                    CONSTRAINT=any,
                    LAZY extends boolean = false,
                    SUPPLIERS extends MainSupplier[] = [],
                    OPTIONALS extends MainTypeSupplier[] = [],
                    ASSEMBLERS extends ProductSupplier[] = []
                >(
                    config: ProductConfig<
                        CONSTRAINT,
                        LAZY,
                        SUPPLIERS,
                        OPTIONALS,
                        ASSEMBLERS
                    >
                ) {
                    function _main<
                        CONSTRAINT2 extends CONSTRAINT,
                        LAZY extends boolean = false,
                        SUPPLIERS extends MainSupplier[] = [],
                        OPTIONALS extends MainTypeSupplier[] = [],
                        ASSEMBLERS extends ProductSupplier[] = [],
                        HIRED extends ProductSupplier[] = []
                    >(
                        config: ProductConfig<
                            CONSTRAINT2,
                            LAZY,
                            SUPPLIERS,
                            OPTIONALS,
                            ASSEMBLERS
                        >,
                        ...hired: [...HIRED]
                    ) {
                        assertProductConfig(name, config)
                        assertProductSuppliers(name, hired, true)

                        const {
                            suppliers = [] as unknown as SUPPLIERS,
                            optionals = [] as unknown as OPTIONALS,
                            assemblers = [] as unknown as ASSEMBLERS,
                            factory,
                            init,
                            lazy = false as LAZY
                        } = config

                        type TEAM = [
                            ...OPTIONALS,
                            ...TransitiveSuppliers<
                                MergeSuppliers<SUPPLIERS, HIRED>
                            >
                        ]

                        const team = buildTeam(name, [
                            ...suppliers,
                            ...optionals,
                            ...hired
                        ]) as TEAM

                        const assemblersTeam = buildTeam(name, [
                            ...suppliers,
                            ...assemblers,
                            ...hired
                        ])

                        const _main = {
                            ...type<CONSTRAINT2>(),
                            suppliers,
                            optionals,
                            assemblers,
                            hired,
                            team,
                            lazy,
                            factory,
                            init,

                            /**
                             * Assembles the product by resolving all dependencies and creating the final instance.
                             * This method orchestrates the dependency resolution by building the transitive team
                             * of all suppliers, autowiring product dependencies, and calling the internal build method.
                             * Only resource dependencies need to be supplied; product dependencies are autowired.
                             *
                             * @param supplied - Map of resource supplies to use for dependency resolution
                             * @returns A product instance with unpack(), deps, supplies and the supplier reference
                             * @public
                             */
                            assemble<
                                THIS,
                                HIRE,
                                ASSEMBLE,
                                TEAM extends Supplier[],
                                SUPPLIERS extends Supplier[],
                                OPTIONALS extends TypeSupplier[],
                                HIRED extends ProductSupplier[]
                            >(
                                this: THIS & {
                                    team: TEAM
                                    hire: HIRE &
                                        ((...hired: ProductSupplier[]) => {
                                            assemble: ASSEMBLE &
                                                ((...args: any[]) => any)
                                        })
                                    suppliers: SUPPLIERS
                                    optionals: OPTIONALS
                                    hired: HIRED
                                },
                                supplied: ToSupply<SUPPLIERS, OPTIONALS, HIRED>
                            ) {
                                const supplies = _main._.assemble(this, supplied)
                                return _main._.build(this, supplies)
                            },
                            _: {
                                product: true as const,
                                isMock: false as const,
                                constraint: null as unknown as CONSTRAINT2,
                                /**
                                 * Assembles the product by resolving all dependencies and creating the final instance.
                                 * This method orchestrates the dependency resolution by building the transitive team
                                 * of all suppliers, autowiring product dependencies, and calling the internal build method.
                                 * Only resource dependencies need to be supplied; product dependencies are autowired.
                                 *
                                 * @param supplied - Map of resource supplies to use for dependency resolution
                                 * @returns A product instance with unpack(), deps, supplies methods and the supplier reference
                                 * @public
                                 */
                                assemble<
                                    THIS,
                                    HIRE,
                                    ASSEMBLE,
                                    TEAM extends Supplier[],
                                    SUPPLIERS extends Supplier[],
                                    OPTIONALS extends TypeSupplier[],
                                    HIRED extends ProductSupplier[]
                                >(
                                    thisSupplier: THIS & {
                                        team: TEAM
                                        hire: HIRE &
                                            ((...hired: ProductSupplier[]) => {
                                                assemble: ASSEMBLE &
                                                    ((...args: any[]) => any)
                                            })
                                        suppliers: SUPPLIERS
                                        optionals: OPTIONALS
                                        hired: HIRED
                                    },
                                    supplied: ToSupply<
                                        SUPPLIERS,
                                        OPTIONALS,
                                        HIRED
                                    >
                                ) {
                                    assertPlainObject("supplied", supplied)

                                    const supplies: any = supplied

                                    for (const supplier of Object.values(
                                        thisSupplier.team
                                    )) {
                                        if (
                                            !isProductSupplier(supplier) ||
                                            supplier.name in supplied
                                        )
                                            continue

                                        supplies[supplier.name] = once(() =>
                                            supplier._.build(supplier, supplies)
                                        )
                                    }

                                    return supplies
                                },
                                /**
                                 * Internal build method that creates the actual supply.
                                 * This is separated from assemble() to allow for internal reuse during
                                 * reassembly and recursive dependency resolution. It creates the factory
                                 * closure with the deps and ctx accessors and handles initialization.
                                 *
                                 * @param supplier - The supplier building the supply
                                 * @param supplies - The supply map providing resolved dependencies
                                 * @returns A supply instance with unpack(), deps, supplies, and ctx methods
                                 * @internal
                                 */
                                build: <
                                    THIS,
                                    TEAM extends Supplier[],
                                    OPTIONALS extends TypeSupplier[],
                                    ASSEMBLERS extends ProductSupplier[],
                                    HIRE,
                                    ASSEMBLE,
                                    SUPPLIES extends
                                        SuppliesRecord<ProductSupplier>
                                >(
                                    thisSupplier: THIS & {
                                        team: TEAM
                                        optionals: OPTIONALS
                                        hire: HIRE &
                                            ((...hired: ProductSupplier[]) => {
                                                assemble: ASSEMBLE &
                                                    ((...args: any[]) => any)
                                            })
                                    },
                                    supplies: SUPPLIES
                                ) => {
                                    const resolve = once(() =>
                                        Object.entries(supplies).reduce(
                                            (acc, [name, supply]) => {
                                                if (
                                                    typeof supply === "function"
                                                ) {
                                                    acc[name] = supply()
                                                    return acc
                                                }

                                                acc[name] = supply
                                                return acc
                                            },
                                            {} as Record<string, any>
                                        )
                                    )

                                    const {deps, resolved} = Object.keys(supplies).reduce(
                                        (acc, name) => {
                                            if (
                                                !thisSupplier.team.some(
                                                    (member) =>
                                                        member.name === name
                                                )
                                            ) {
                                                return acc
                                            }

                                            Object.defineProperty(
                                                acc.resolved,
                                                name,
                                                {
                                                    get() {
                                                        return resolve()[
                                                            name
                                                        ]
                                                    },
                                                    enumerable: true,
                                                    configurable: true
                                                }
                                            )

                                            Object.defineProperty(
                                                acc.deps,
                                                name,
                                                {
                                                    get() {
                                                        return resolve()[name]?.unpack()
                                                    },
                                                    enumerable: true,
                                                    configurable: true
                                                }
                                            )
                                            return acc
                                        },
                                        {
                                            deps: {} as Deps<
                                                MergeSuppliers<SUPPLIERS, HIRED>,
                                                OPTIONALS
                                            >,
                                            resolved:
                                                {} as Resolved<
                                                    MergeSuppliers<SUPPLIERS, HIRED>,
                                                    OPTIONALS
                                                >
                                        }
                                    )

                                    // Prerun supplier factories in the background (non-blocking)
                                    for (const supplier of Object.values(
                                        thisSupplier.team
                                    )) {
                                        if ("lazy" in supplier && supplier.lazy)
                                            continue

                                        // If prerun fails, we don't want to break the entire supply chain
                                        // The error will be thrown again when the dependency is actually needed
                                        Promise.resolve()
                                            .then(() => deps[supplier.name as keyof Deps<MergeSuppliers<SUPPLIERS, HIRED>, OPTIONALS>])
                                            .catch(() => {
                                                // Silently catch errors during prerun
                                                // The error will be thrown again when the dependency is actually accessed
                                            })
                                    }

                                    const ctx = ((assembler: any) => {
                                        if (!isProductSupplier(assembler)) {
                                            return assembler
                                        }
                                        const actual = assemblersTeam.find(
                                            (member) =>
                                                member.name === assembler.name
                                        )
                                        if (!actual) {
                                            throw new Error(
                                                `Assembler ${assembler.name} not found`
                                            )
                                        }

                                        return {
                                            ...actual,
                                            hire<
                                                HIRED extends { name: string }[]
                                            >(...hired: [...HIRED]) {
                                                const actualHired = hired.map(
                                                    (hired) => {
                                                        if (
                                                            !isProductSupplier(
                                                                hired
                                                            )
                                                        ) {
                                                            throw new Error(
                                                                `Hired assembler ${hired.name} is not a buildtime supplier`
                                                            )
                                                        }
                                                        const actual =
                                                            assemblersTeam.find(
                                                                (assembler) =>
                                                                    assembler.name ===
                                                                    hired.name
                                                            ) as
                                                                | ProductSupplier
                                                                | undefined
                                                        if (!actual) {
                                                            throw new Error(
                                                                `Hired assembler ${hired.name} not found`
                                                            )
                                                        }

                                                        return actual
                                                    }
                                                )

                                                return {
                                                    assemble: (supplied: any) =>
                                                        reassemble(
                                                            actual,
                                                            supplied,
                                                            ...actualHired
                                                        )
                                                }
                                            },
                                            assemble: (supplied: any) =>
                                                reassemble(actual, supplied)
                                        }
                                    }) as Ctx<TEAM, OPTIONALS, ASSEMBLERS>

                                    function reassemble(
                                        assembler: any,
                                        supplied: SuppliesOrUndefinedRecord,
                                        ...hired: ProductSupplier[]
                                    ) {
                                        const resolved = resolve()
                                        // Stores the supplies that can be preserved to optimize reassemble
                                        const preserved: SuppliesRecord = {}

                                        for (const name of Object.keys(
                                            resolved
                                        )) {
                                            const supply = resolved[name] as Supply

                                            if (
                                                hired.some(
                                                    (h) => h.name === name
                                                ) ||
                                                name in supplied
                                            ) {
                                                // Do not preserve products or resources from newly hired
                                                // or newly supplied resources or products
                                                continue
                                            }

                                            // Do not preserve if some of the products's team members
                                            // depend on newly hired or supplied
                                            if (
                                                supply.supplier.team.some(
                                                    (t) =>
                                                        t.name in supplied ||
                                                        hired.some(
                                                            (h) =>
                                                                h.name ===
                                                                t.name
                                                        )
                                                )
                                            ) {
                                                continue
                                            }

                                            preserved[name as any] = supply
                                        }

                                        const definedSupplied = Object.fromEntries(Object.entries(supplied).filter(([_, value]) => value !== undefined))

                                        const hiredAssembler = assembler.hire(
                                            ...hired
                                        )
                                        const newSupplies =
                                            hiredAssembler._.assemble(
                                                hiredAssembler,
                                                {
                                                    ...preserved,
                                                    ...definedSupplied
                                                }
                                            )

                                        return hiredAssembler._.build(
                                            hiredAssembler,
                                            newSupplies
                                        )
                                    }

                                    const product = {
                                        unpack: once(() => {
                                            const value = factory(
                                                deps,
                                                ctx
                                            )
                                            if (init) {
                                                init(value, deps)
                                            }
                                            return value
                                        }),
                                        deps,
                                        supplies: resolved,
                                        supplier: thisSupplier,
                                        _: {
                                            ctx,
                                            packed: false as const
                                        }
                                    }

                                    return product
                                }
                            }
                        }

                        return _main
                    }

                    const supplier = {
                        /**
                         * Creates a mock version of this product supplier with different dependencies.
                         * Mocks are used for creating test variations of a product with different implementations
                         * while keeping the same name. This is useful for testing, stubbing, or providing
                         * alternative implementations without affecting the original supplier.
                         *
                         * @typeParam CONSTRAINT - The type constraint for the mock
                         * @typeParam LAZY - Whether the mock should be lazily evaluated
                         * @typeParam SUPPLIERS - Array of suppliers for the mock
                         * @typeParam OPTIONALS - Array of optional resource suppliers for the mock
                         * @typeParam ASSEMBLERS - Array of assemblers for the mock
                         * @param config - Configuration for the mock
                         * @param config.factory - Factory function for the mock
                         * @param config.suppliers - Dependencies for the mock (can be different from the original)
                         * @param config.optionals - Optional dependencies for the mock
                         * @param config.assemblers - Assemblers for the mock
                         * @param config.init - Optional initialization function for the mock
                         * @param config.lazy - Whether the mock should be lazily evaluated
                         * @returns A mock product supplier with isMock flag set to true
                         * @public
                         */
                        mock<
                            THIS,
                            MOCK,
                            HIRE,
                            CONSTRAINT2 extends CONSTRAINT,
                            LAZY extends boolean = false,
                            SUPPLIERS extends MainSupplier[] = [],
                            OPTIONALS extends MainTypeSupplier[] = [],
                            ASSEMBLERS extends ProductSupplier[] = []
                        >(
                            this: THIS & {
                                mock: MOCK
                                hire: HIRE
                            },
                            config: ProductConfig<
                                CONSTRAINT2,
                                LAZY,
                                SUPPLIERS,
                                OPTIONALS,
                                ASSEMBLERS
                            >
                        ) {
                            const main = _main(config)

                            const supplier = {
                                hire: this.hire,
                                mock: this.mock,
                                ...main,
                                _: {
                                    ...main._,
                                    isMock: true as const
                                }
                            }

                            return supplier as CircularDependencyGuard<
                                typeof supplier
                            >
                        },
                        /**
                         * Hires additional suppliers into the dependency chain of this product.
                         * This allows replacing or adding suppliers composition-root style for testing,
                         * mocking, or batch assembly. Hired suppliers override suppliers with matching
                         * names in the transitive dependency tree.
                         *
                         * @param hiredSuppliers - Product suppliers to hire (replace/add to the team)
                         * @returns A new product supplier with the hired suppliers merged into the team
                         * @public
                         */
                        hire<
                            THIS,
                            MOCK,
                            HIRE,
                            CONSTRAINT2 extends CONSTRAINT,
                            LAZY extends boolean,
                            SUPPLIERS extends MainSupplier[],
                            OPTIONALS extends MainTypeSupplier[],
                            ASSEMBLERS extends ProductSupplier[],
                            HIRED extends ProductSupplier[],
                            HIRED_2 extends ProductSupplier[]
                        >(
                            this: THIS &
                                ProductConfig<
                                    CONSTRAINT2,
                                    LAZY,
                                    SUPPLIERS,
                                    OPTIONALS,
                                    ASSEMBLERS
                                > & {
                                    hired: [...HIRED]
                                    mock: MOCK
                                    hire: HIRE
                                },
                            ...hired: [...HIRED_2]
                        ) {
                            const main = _main(this, ...this.hired, ...hired)

                            const supplier = {
                                mock: this.mock,
                                hire: this.hire,
                                ...main,
                                _: {
                                    ...main._,
                                    isMock: false as const,
                                    isComposite: true as const
                                }
                            }

                            return supplier as CircularDependencyGuard<
                                typeof supplier
                            >
                        },
                        ..._main(config)
                    }

                    return supplier as CircularDependencyGuard<typeof supplier>
                }
            } 
        }
    }
    
    return market
}

export { index, sleep } from "#utils"
export * from "#types"
