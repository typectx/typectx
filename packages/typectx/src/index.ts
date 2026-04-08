import { Hire } from "#service/hire"
import { main } from "#service/main"
import { Mock } from "#service/mock"
import { type PartialAppServicePlan } from "#types/internal"
import type { ToSupply } from "#types/records"
import type { AppServiceGuard } from "#types/guards"
import { assertName, assertAppServiceConfig } from "#validation"
import type {
    MainService,
    AppService,
    RequestService,
    Service,
    Supply
} from "#types/public"

export function service<NAME extends string>(name: NAME) {
    return {
        request<CONSTRAINT = any>(): RequestService<NAME, CONSTRAINT> {
            return {
                name,
                pack<THIS extends Service, VALUE extends CONSTRAINT>(
                    this: THIS,
                    value: VALUE
                ): Supply<THIS> {
                    return {
                        unpack: () => value,
                        deps: {} as never,
                        supplies: {} as never,
                        service: this,
                        _ctx: (() => null) as never,
                        _packed: true as const
                    } as any
                },
                _constraint: null as unknown as CONSTRAINT,
                _request: true as const,
                _mock: false as const
            }
        },
        /**
         * Creates an app service that can assemble complex objects from dependencies.
         * App services can depend on other services and have factory functions for creation.
         *
         * @typeParam CONSTRAINT - The type constraint for values this service produces
         * @typeParam SERVICES - Array of services this service depends on
         * @typeParam OPTIONALS - Array of optional request services this service may depend on
         * @param config - Configuration object for the service
         * @param config.services - Array of services this service depends on
         * @param config.optionals - Array of optional request services this service may depend on
         * @param config.factory - Factory function that creates the value from its dependencies
         * @param config.init - Optional initialization function called after factory
         * @param config.lazy - Whether the service should be lazily evaluated
         *
         * @returns An app service with methods like assemble, pack, mock, and hire
         * @public
         */
        app<
            CONSTRAINT,
            SERVICES extends MainService[] = [],
            OPTIONALS extends RequestService[] = []
        >(
            config: PartialAppServicePlan<CONSTRAINT, SERVICES, OPTIONALS>
        ): AppServiceGuard<
            AppService<
                NAME,
                CONSTRAINT,
                OPTIONALS[number]["name"],
                Record<never, never>,
                ToSupply<
                    {
                        services: SERVICES
                        optionals: OPTIONALS
                    },
                    Record<never, never>
                >,
                [],
                false
            >,
            [...SERVICES, ...OPTIONALS]
        > {
            assertName(name)
            assertAppServiceConfig(name, config)

            return {
                ...main(name, config),
                mock: Mock<NAME, CONSTRAINT>(),
                hire: Hire(),
                _mock: false as const,
                _composite: false as const
            } satisfies AppService<
                NAME,
                CONSTRAINT,
                OPTIONALS[number]["name"],
                Record<never, never>,
                ToSupply<
                    {
                        services: SERVICES
                        optionals: OPTIONALS
                    },
                    Record<never, never>
                >,
                [],
                false
            > as any
        }
    }
}

export { index, sleep, once } from "#utils"
export * from "#types/public"
