import { Hire } from "#product/hire"
import { main } from "#product/main"
import { Mock } from "#product/mock"
import { request } from "#request"
import {
    MainSupplier,
    type ProductConfig,
    type RequestSupplier,
    type ProductSupplier,
    type UnknownProductSupplier,
    type CircularDependencyGuard
} from "#types"
import { assertName, assertProductConfig } from "#validation"

/**
 * Creates a new market instance for managing suppliers.
 * A market provides a namespace for creating and managing suppliers without name conflicts.
 * Each market maintains its own registry of supplier names to prevent collisions.
 *
 * @returns A market object with methods to create suppliers
 * @public
 */
export const createMarket = () => {
    const names = new Set<string>()
    const market = {
        /**
         * Declares a new supplier with the given name.
         * The name must be unique within this market.
         *
         * @param name - The unique name for this supplier
         * @returns An offer object with methods to define request or product suppliers
         * @throws Error if the name already exists in this market
         * @public
         */
        add<NAME extends string>(name: NAME) {
            assertName(name)
            if (names.has(name)) {
                throw new Error(`Name ${name} already exists`)
            }
            names.add(name)

            return {
                name,
                request: request(name),
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
                ): CircularDependencyGuard<
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
    }

    return market
}

export { index, sleep, once } from "#utils"
export * from "#types"
