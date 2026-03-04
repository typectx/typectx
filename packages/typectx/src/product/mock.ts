import { main } from "#product/main"
import type {
    CircularDependencyGuard,
    MainSupplier,
    ProductConfig,
    ProductSupplier,
    RequestSupplier,
    UnknownProductSupplier
} from "#types"
import { assertProductConfig } from "#validation"

/**
 * Creates a mock version of this product supplier with different dependencies.
 * Mocks are used for creating test variations of a product supplier with different implementations
 * while keeping the same name. This is useful for testing, stubbing, or providing
 * alternative implementations without affecting the original supplier.
 *
 * @typeParam CONSTRAINT - The type constraint for the mock
 * @typeParam SUPPLIERS - Dependencies for the mock (can be different from the original)
 * @typeParam OPTIONALS - Array of optional request suppliers for the mock
 * @typeParam ASSEMBLERS - Array of assemblers for the mock
 * @param config - Configuration for the mock
 * @param config.factory - Factory function for the mock
 * @param config.suppliers - Dependencies for the mock (can be different from the original)
 * @param config.optionals - Optional dependencies for the mock
 * @param config.assemblers - Assemblers for the mock
 * @param config.init - Optional initialization function for the mock
 * @param config.lazy - Whether the mock should be lazily evaluated
 * @returns A mock product supplier with mock flag set to true
 * @public
 */
export function Mock<NAME extends string, CONSTRAINT>() {
    return function mock<
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
            NAME,
            CONSTRAINT2,
            SUPPLIERS2,
            OPTIONALS2,
            ASSEMBLERS2
        >
    ): CircularDependencyGuard<
        ProductSupplier<
            THIS["name"],
            CONSTRAINT2,
            SUPPLIERS2,
            OPTIONALS2,
            ASSEMBLERS2,
            [],
            Record<never, unknown>,
            true
        >
    > {
        assertProductConfig(this.name, config)
        const mock = main(this.name, config)

        return {
            ...this,
            ...mock,
            hired: [],
            _mock: true as const,
            _composite: false as const
        } satisfies ProductSupplier<
            THIS["name"],
            CONSTRAINT2,
            SUPPLIERS2,
            OPTIONALS2,
            ASSEMBLERS2,
            [],
            Record<never, unknown>,
            true,
            false
        > as any
    }
}
