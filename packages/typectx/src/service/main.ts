import type { PartialAppServicePlan } from "#types/internal"
import { assertAppServices } from "#validation"
import { assemble, preassemble } from "#service/assemble"
import { _build } from "#service/build"
import { service } from "#index"
import type { SupplyDeps, ToSupply } from "#types/records"
import { dedupe, isAppService } from "#utils"
import type {
    AppService,
    OriginalService,
    RequestService,
    Service
} from "#types/public"

export function main<
    NAME extends string,
    CONSTRAINT,
    SERVICES extends OriginalService[] = [],
    OPTIONALS extends RequestService[] = []
>(
    name: NAME,
    plan: PartialAppServicePlan<CONSTRAINT, SERVICES, OPTIONALS>
): Omit<
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
        boolean
    >,
    "mock" | "hire" | "_mock"
> {
    assertAppServices(name, [], true)

    const _team = team(name, plan.services ?? [], plan.optionals ?? [])

    const _toSupply = null as unknown as ToSupply<
        {
            services: SERVICES
            optionals: OPTIONALS
        },
        Record<never, never>
    >

    const _deps = null as unknown as SupplyDeps<
        typeof _toSupply,
        OPTIONALS[number]["name"]
    >

    return {
        ...service(name).request<CONSTRAINT>(),
        assemble,
        preassemble,
        _factory: plan.factory,
        _build,
        _services: plan.services ?? [],
        _optionals: plan.optionals ?? [],
        _team,
        _hired: [] as [],
        _known: {},
        _warmup: plan.warmup,
        _request: false as const,
        _app: true as const,
        _constraint: null as unknown as CONSTRAINT,
        _optionalKeys: null as unknown as OPTIONALS[number]["name"],
        _toSupply,
        _deps,
        _oldToSupply: _toSupply,
        _oldDeps: _deps
    }
}

export function team(
    name: string,
    services: Service[],
    optionals: RequestService[]
) {
    return dedupe(
        [...services, ...optionals]
            .flatMap((service) => {
                if (isAppService(service)) {
                    return [service, ...service._team]
                }
                return [service]
            })
            .map((s) => {
                if (s.name === name) {
                    throw new Error("Circular dependency detected")
                }
                return s
            })
    )
}
