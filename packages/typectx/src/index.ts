import {
    Product,
    ProductSupplier,
    SupplyMap,
    type ResourceSupplier,
    type ToSupply,
    type CircularDependencyGuard,
    type $,
    Supplier,
    AsProductParameters,
    Resource,
    MainSupplier,
    MainProductSupplier,
    MergeSuppliers,
    TransitiveSuppliers
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
         * Offers a new supplier or product with the given name.
         * The name must be unique within this market.
         *
         * @param name - The unique name for this supplier/product
         * @returns An offer object with methods to define the supplier type (asResource or asProduct)
         * @throws Error if the name already exists in this market
         * @public
         */
        offer<NAME extends string>(name: NAME) {
            assertString("name", name)
            if (names.has(name)) {
                throw new Error(`Name ${name} already exists`)
            }
            names.add(name)
            return {
                /**
                 * Creates a resource supplier that can provide values of a specific constraint type.
                 * Resources are simple value containers that can be packed and unpacked.
                 * They're ideal for configuration values, constants, or any simple data that doesn't
                 * have dependencies on other suppliers.
                 *
                 * @typeParam CONSTRAINT - The type constraint for values this resource can hold
                 * @returns A resource supplier configuration object with a `pack` method
                 * @public
                 */
                asResource<CONSTRAINT>() {
                    return {
                        name,
                        pack<THIS, VALUE extends CONSTRAINT>(
                            this: THIS,
                            value: VALUE
                        ) {
                            return {
                                name,
                                unpack: () => value,
                                supplier: this
                            }
                        },
                        _: {
                            constraint: null as unknown as CONSTRAINT,
                            resource: true as const
                        }
                    }
                },
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
                asProduct<
                    CONSTRAINT,
                    LAZY extends boolean = false,
                    SUPPLIERS extends MainSupplier[] = [],
                    OPTIONALS extends ResourceSupplier[] = [],
                    ASSEMBLERS extends MainProductSupplier[] = []
                >(
                    config: AsProductParameters<
                        CONSTRAINT,
                        LAZY,
                        SUPPLIERS,
                        OPTIONALS,
                        ASSEMBLERS
                    >
                ) {
                    function _base<
                        CONSTRAINT,
                        LAZY extends boolean = false,
                        SUPPLIERS extends MainSupplier[] = [],
                        OPTIONALS extends ResourceSupplier[] = [],
                        ASSEMBLERS extends MainProductSupplier[] = [],
                        HIRED extends ProductSupplier[] = []
                    >(
                        config: AsProductParameters<
                            CONSTRAINT,
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
                            ...TransitiveSuppliers<
                                MergeSuppliers<SUPPLIERS, HIRED>
                            >
                        ]

                        const team = buildTeam(name, [
                            ...suppliers,
                            ...hired
                        ]) as TEAM

                        const assemblersTeam = buildTeam(name, [
                            ...suppliers,
                            ...optionals,
                            ...assemblers,
                            ...hired
                        ])

                        const base = {
                            name,
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
                             * @returns A product instance with unpack(), $, reassemble() methods and the supplier reference
                             * @public
                             */
                            assemble<
                                THIS,
                                HIRE,
                                ASSEMBLE,
                                TEAM extends Supplier[],
                                SUPPLIERS extends Supplier[],
                                OPTIONALS extends ResourceSupplier[],
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
                                assertPlainObject("supplied", supplied)

                                const supplies: SupplyMap<ProductSupplier> =
                                    supplied

                                for (const supplier of Object.values(
                                    this.team
                                )) {
                                    if (
                                        !isProductSupplier(supplier) ||
                                        supplier.name in supplied
                                    )
                                        continue
                                    supplies[supplier.name] = once(() =>
                                        supplier._.build(supplier, $)
                                    )
                                }

                                const $ = (supplier: any) => {
                                    const supply = supplies[supplier.name]

                                    // A supply can only be a product, resource or function, so this is sufficient to discriminate.
                                    if (typeof supply === "function") {
                                        return supply()
                                    }
                                    return supply
                                }

                                $.keys = Object.keys(supplies)

                                // Prerun supplier factories
                                for (const supplier of Object.values(
                                    this.team
                                )) {
                                    if ("lazy" in supplier && supplier.lazy)
                                        continue
                                    try {
                                        $(supplier)?.unpack()
                                    } catch (e) {
                                        // console.error(e)
                                        // If prerun fails, we don't want to break the entire supply chain
                                        // The error will be thrown again when the dependency is actually needed
                                    }
                                }

                                return base._.build(
                                    this,
                                    $ as $<TEAM, OPTIONALS, false>
                                )
                            },
                            /**
                             * Packs a pre-constructed value into a product without dependency resolution.
                             * This is useful for providing mock values or pre-configured instances.
                             *
                             * @param value - The value to pack (must satisfy the constraint type)
                             * @returns A product instance with the packed value and no-op reassemble method
                             * @public
                             */
                            pack<THIS, VALUE extends CONSTRAINT>(
                                this: THIS,
                                value: VALUE
                            ) {
                                return {
                                    unpack: () => value,
                                    $: () => undefined,
                                    supplier: this,
                                    _: {
                                        packed: true as const
                                    }
                                }
                            },
                            _: {
                                /**
                                 * Internal build method that creates the actual product instance.
                                 * This is separated from assemble() to allow for internal reuse during
                                 * reassembly and recursive dependency resolution. It creates the factory
                                 * closure with the $ and $$ accessors and handles initialization.
                                 *
                                 * @param supplier - The supplier being built
                                 * @param $ - The supply accessor function providing resolved dependencies
                                 * @returns A product instance with unpack(), reassemble(), and $ methods
                                 * @internal
                                 */
                                build: <
                                    SUPPLIER,
                                    TEAM extends Supplier[],
                                    HIRE,
                                    ASSEMBLE,
                                    $MAP extends $<TEAM, OPTIONALS, false>
                                >(
                                    supplier: SUPPLIER & {
                                        team: TEAM
                                        hire: HIRE &
                                            ((...hired: ProductSupplier[]) => {
                                                assemble: ASSEMBLE &
                                                    ((...args: any[]) => any)
                                            })
                                    },
                                    $: $MAP
                                ) => {
                                    function reassemble(
                                        assembler: any,
                                        supplied: SupplyMap<ProductSupplier>,
                                        ...hired: ProductSupplier[]
                                    ) {
                                        const prev = Object.fromEntries(
                                            $.keys.map((name) => [
                                                name,
                                                $({
                                                    name
                                                })
                                            ])
                                        )

                                        // Stores the supplies that can be preserved to optimize reassemble
                                        const preserved: SupplyMap<ProductSupplier> =
                                            {}

                                        for (const name of Object.keys(
                                            prev
                                        ) as (keyof typeof prev)[]) {
                                            const prevSupply = prev[name] as
                                                | Product<any, ProductSupplier>
                                                | Resource
                                                | undefined

                                            if (prevSupply === undefined) {
                                                continue
                                            }

                                            if (
                                                hired.some(
                                                    (h) => h.name === name
                                                ) ||
                                                supplied[name as any] !==
                                                    undefined
                                            ) {
                                                // Do not preserve products or resources from newly hired
                                                // or newly supplied resources or products
                                                continue
                                            }

                                            if (
                                                !isProductSupplier(
                                                    prevSupply.supplier
                                                ) ||
                                                isPacked(prevSupply)
                                            ) {
                                                // Preserve if it's a resource or a packed product
                                                preserved[name as any] =
                                                    prevSupply
                                                continue
                                            }

                                            // Do not preserve if some of the products's team members
                                            // depend on newly hired or supplied
                                            if (
                                                prevSupply.supplier.team.some(
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

                                            preserved[name as any] = prevSupply
                                        }

                                        return assembler
                                            .hire(...hired)
                                            .assemble({
                                                ...preserved,
                                                ...supplied
                                            })
                                    }

                                    const $$ = (assembler: any) => {
                                        const actual =
                                            assemblersTeam.find(
                                                (member) =>
                                                    member.name ===
                                                    assembler.name
                                            ) ?? assembler

                                        if (!isProductSupplier(actual)) {
                                            return actual
                                        }

                                        return {
                                            ...actual,
                                            hire<
                                                HIRED extends ProductSupplier[]
                                            >(...hired: [...HIRED]) {
                                                return {
                                                    assemble: (
                                                        supplied: any
                                                    ) => {
                                                        return reassemble(
                                                            actual,
                                                            supplied,
                                                            ...hired
                                                        )
                                                    }
                                                }
                                            },
                                            assemble: (supplied: any) =>
                                                reassemble(actual, supplied)
                                        }
                                    }

                                    const product = {
                                        unpack: once(() => {
                                            const value = factory($ as any, $$)
                                            if (init) {
                                                init(value, $ as any)
                                            }
                                            return value
                                        }),
                                        $,
                                        supplier,
                                        _: {
                                            packed: false as const
                                        }
                                    }

                                    return product
                                },
                                product: true as const,
                                isMock: false as const,
                                constraint: null as unknown as CONSTRAINT
                            }
                        }

                        return base
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
                            CONSTRAINT,
                            LAZY extends boolean = false,
                            SUPPLIERS extends MainSupplier[] = [],
                            OPTIONALS extends ResourceSupplier[] = [],
                            ASSEMBLERS extends MainProductSupplier[] = []
                        >(
                            this: THIS & {
                                mock: MOCK
                                hire: HIRE
                            },
                            config: AsProductParameters<
                                CONSTRAINT,
                                LAZY,
                                SUPPLIERS,
                                OPTIONALS,
                                ASSEMBLERS
                            >
                        ) {
                            const base = _base(config)

                            const supplier = {
                                hire: this.hire,
                                mock: this.mock,
                                ...base,
                                _: {
                                    ...base._,
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
                            CONSTRAINT,
                            LAZY extends boolean,
                            SUPPLIERS extends MainSupplier[],
                            OPTIONALS extends ResourceSupplier[],
                            ASSEMBLERS extends MainProductSupplier[],
                            HIRED extends ProductSupplier[],
                            HIRED_2 extends ProductSupplier[]
                        >(
                            this: THIS &
                                AsProductParameters<
                                    CONSTRAINT,
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
                            const base = _base(this, ...this.hired, ...hired)

                            const supplier = {
                                mock: this.mock,
                                hire: this.hire,
                                ...base,
                                _: {
                                    ...base._,
                                    isMock: false as const,
                                    isComposite: true as const
                                }
                            }

                            return supplier as CircularDependencyGuard<
                                typeof supplier
                            >
                        },
                        ..._base(config)
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
