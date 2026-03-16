import { main } from "#product/main"
import type { ProductSupplierGuard } from "#types/guards"
import type { PartialProductSupplierPlan } from "#types/internal"
import { assertProductConfig } from "#validation"
import type {
    MainSupplier,
    RequestSupplier,
    UnknownProductSupplier,
    Mock as MockType
} from "#types/public"

/**
 * Creates a mock version of this product supplier with different dependencies.
 * Mocks are used for creating test variations of a product supplier with different implementations
 * while keeping the same name. This is useful for testing, stubbing, or providing
 * alternative implementations without affecting the original supplier.
 *
 * @typeParam CONSTRAINT - The type constraint for the mock
 * @typeParam SUPPLIERS - Dependencies for the mock (can be different from the original)
 * @typeParam OPTIONALS - Array of optional request suppliers for the mock
 * @param config - Configuration for the mock
 * @param config.factory - Factory function for the mock
 * @param config.suppliers - Dependencies for the mock (can be different from the original)
 * @param config.optionals - Optional dependencies for the mock
 * @param config.init - Optional initialization function for the mock
 * @param config.lazy - Whether the mock should be lazily evaluated
 * @returns A mock product supplier with mock flag set to true
 * @public
 */
export function Mock<NAME extends string, CONSTRAINT>() {
    return function mock<
        THIS extends UnknownProductSupplier,
        CONSTRAINT2 extends THIS["_constraint"],
        SUPPLIERS2 extends MainSupplier[] = [],
        OPTIONALS2 extends RequestSupplier[] = []
    >(
        this: THIS & {
            name: NAME
            _constraint: CONSTRAINT
        },
        config: PartialProductSupplierPlan<CONSTRAINT2, SUPPLIERS2, OPTIONALS2>
    ): ProductSupplierGuard<
        MockType<THIS, CONSTRAINT2, SUPPLIERS2, OPTIONALS2>,
        [...SUPPLIERS2, ...OPTIONALS2]
    > {
        assertProductConfig(this.name, config)
        const mock = main(this.name, config)

        return {
            ...this,
            ...mock,
            hired: [] as [],
            _mock: true as const,
            _composite: false as const,
            _oldResolved: this._resolved,
            _oldToSupply: this._toSupply,
            _oldDeps: this._deps
        } satisfies MockType<THIS, CONSTRAINT2, SUPPLIERS2, OPTIONALS2> as any
    }
}
