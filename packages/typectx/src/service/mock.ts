import { main } from "#service/main"
import type { AppServiceGuard } from "#types/guards"
import type { PartialAppServicePlan } from "#types/internal"
import { assertAppServiceConfig } from "#validation"
import type {
    MainService,
    RequestService,
    UnknownAppService,
    Mock as MockType
} from "#types/public"

/**
 * Creates a mock version of this app service with different dependencies.
 * Mocks are used for creating test variations of a app service with different implementations
 * while keeping the same name. This is useful for testing, stubbing, or providing
 * alternative implementations without affecting the original service.
 *
 * @typeParam CONSTRAINT - The type constraint for the mock
 * @typeParam SERVICES - Dependencies for the mock (can be different from the original)
 * @typeParam OPTIONALS - Array of optional request services for the mock
 * @param config - Configuration for the mock
 * @param config.factory - Factory function for the mock
 * @param config.services - Dependencies for the mock (can be different from the original)
 * @param config.optionals - Optional dependencies for the mock
 * @param config.init - Optional initialization function for the mock
 * @param config.lazy - Whether the mock should be lazily evaluated
 * @returns A mock app service with mock flag set to true
 * @public
 */
export function Mock<NAME extends string, CONSTRAINT>() {
    return function mock<
        THIS extends UnknownAppService,
        CONSTRAINT2 extends THIS["_constraint"],
        SERVICES2 extends MainService[] = [],
        OPTIONALS2 extends RequestService[] = []
    >(
        this: THIS & {
            name: NAME
            _constraint: CONSTRAINT
        },
        config: PartialAppServicePlan<CONSTRAINT2, SERVICES2, OPTIONALS2>
    ): AppServiceGuard<
        MockType<THIS, CONSTRAINT2, SERVICES2, OPTIONALS2>,
        [...SERVICES2, ...OPTIONALS2]
    > {
        assertAppServiceConfig(this.name, config)
        const mock = main(this.name, config)

        return {
            ...this,
            ...mock,
            hired: [] as [],
            _mock: true as const,
            _composite: false as const,
            _oldToSupply: this._toSupply,
            _oldDeps: this._deps
        } satisfies MockType<THIS, CONSTRAINT2, SERVICES2, OPTIONALS2> as any
    }
}
