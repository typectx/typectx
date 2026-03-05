import { Hire } from "#product/hire"
import { main } from "#product/main"
import { Mock } from "#product/mock"
import {
    MainSupplier,
    type ProductConfig,
    type RequestSupplier,
    type ProductSupplier,
    type UnknownProductSupplier,
    type SupplierGraphGuard,
    type Supplier
} from "#types"
import { assertName, assertProductConfig } from "#validation"

export function supplier<NAME extends string>(name: NAME) {
    return {
        request<CONSTRAINT = any>(): RequestSupplier<NAME, CONSTRAINT> {
            return {
                name,
                suppliers: [],
                optionals: [],
                assemblers: [],
                hired: [],
                pack<THIS extends Supplier, VALUE extends CONSTRAINT>(
                    this: THIS,
                    value: VALUE
                ) {
                    return {
                        unpack: () => value,
                        deps: {} as never,
                        supplies: {} as never,
                        supplier: this,
                        _ctx: (() => null) as never,
                        _packed: true as const
                    }
                },
                _constraint: null as unknown as CONSTRAINT,
                _request: true as const,
                _mock: false as const
            }
        },
        /**
         * Creates a product supplier that can assemble complex objects from dependencies.
         * Product suppliers can depend on other suppliers and have factory functions for creation.
         *
         * @typeParam CONSTRAINT - The type constraint for products this supplier produces
         * @typeParam SUPPLIERS - Array of suppliers this supplier depends on
         * @typeParam OPTIONALS - Array of optional request suppliers this supplier may depend on
         * @typeParam ASSEMBLERS - Array of assemblers (lazy unassembled product suppliers)
         * @param config - Configuration object for the supplier
         * @param config.suppliers - Array of suppliers this supplier depends on
         * @param config.optionals - Array of optional request suppliers this supplier may depend on
         * @param config.assemblers - Array of assemblers (lazy unassembled product suppliers)
         * @param config.factory - Factory function that creates the product from its dependencies
         * @param config.init - Optional initialization function called after factory
         * @param config.lazy - Whether the supplier should be lazily evaluated
         *
         * @returns A product supplier with methods like assemble, pack, mock, and hire
         * @public
         */
        product<
            CONSTRAINT,
            SUPPLIERS extends MainSupplier[] = [],
            OPTIONALS extends RequestSupplier[] = [],
            ASSEMBLERS extends UnknownProductSupplier[] = []
        >(
            config: ProductConfig<
                NAME,
                CONSTRAINT,
                SUPPLIERS,
                OPTIONALS,
                ASSEMBLERS
            >
        ): SupplierGraphGuard<
            ProductSupplier<
                NAME,
                CONSTRAINT,
                SUPPLIERS,
                OPTIONALS,
                ASSEMBLERS,
                [],
                Record<never, unknown>,
                false,
                false
            >
        > {
            assertName(name)
            assertProductConfig(name, config)

            return {
                ...main(name, config),
                mock: Mock<NAME, CONSTRAINT>(),
                hire: Hire<[]>(),
                _mock: false as const,
                _composite: false as const
            } satisfies ProductSupplier<
                NAME,
                CONSTRAINT,
                SUPPLIERS,
                OPTIONALS,
                ASSEMBLERS,
                [],
                Record<never, unknown>,
                false,
                false
            > as any
        }
    }
}

export { index, sleep, once } from "#utils"
export * from "#types"
