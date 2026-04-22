import type {
    MainService,
    RequestService,
    Service,
    Supply,
    UnknownAppService
} from "#types/public"
import type { Deps, ToSupply } from "#types/records"
import type { Merge } from "#utils"

export interface BaseService<
    NAME extends string = string,
    CONSTRAINT = unknown
> {
    name: NAME
    pack: <THIS extends Service, VALUE extends CONSTRAINT>(
        this: THIS,
        value: VALUE
    ) => Supply<THIS>
    _constraint: CONSTRAINT
}

export type Factory<
    CONSTRAINT,
    SERVICES extends MainService[] = [],
    OPTIONALS extends RequestService[] = []
> = (
    deps: Deps<{
        services: SERVICES
        optionals: OPTIONALS
    }>,
    ctx: Ctx<{
        services: SERVICES
        optionals: OPTIONALS
    }>
) => CONSTRAINT

type Warmup<
    CONSTRAINT,
    SERVICES extends MainService[] = [],
    OPTIONALS extends RequestService[] = []
> = (
    value: CONSTRAINT,
    deps: Deps<{
        services: SERVICES
        optionals: OPTIONALS
    }>
) => void

export type PartialAppServicePlan<
    CONSTRAINT,
    SERVICES extends MainService[] = [],
    OPTIONALS extends RequestService[] = []
> = {
    services?: [...SERVICES]
    optionals?: [...OPTIONALS]
    factory: Factory<CONSTRAINT, SERVICES, OPTIONALS>
    warmup?: Warmup<CONSTRAINT, SERVICES, OPTIONALS>
}

export type AppServicePlan<
    CONSTRAINT,
    SERVICES extends MainService[],
    OPTIONALS extends RequestService[]
> = {
    services: [...SERVICES]
    optionals: [...OPTIONALS]
    factory: Factory<CONSTRAINT, SERVICES, OPTIONALS>
    warmup: Warmup<CONSTRAINT, SERVICES, OPTIONALS>
}

export type UnknownAppServicePlan = AppServicePlan<
    unknown,
    MainService[],
    RequestService[]
>

/**
 * ctx transforms services into contextualized services that can be assembled again with new request supplies.
 * This enables dynamic dependency injection within a service's factory.
 * @typeParam SERVICE - The current service providing context
 * @returns A function that takes a service and returns it with a contextualized assemble method
 * @public
 */
export type Ctx<
    PLAN extends Pick<UnknownAppServicePlan, "optionals" | "services">,
    KNOWN extends Required<ToSupply<PLAN, Record<never, never>>> = Required<
        ToSupply<PLAN, Record<never, never>>
    >
> = <SERVICE extends Service>(
    service: SERVICE & (UnknownAppService | Service)
) => SERVICE extends UnknownAppService ?
    Merge<
        SERVICE,
        {
            _known: KNOWN
            _toSupply: Omit<SERVICE["_toSupply"], keyof KNOWN> & Partial<KNOWN>
            _deps: SERVICE["_deps"]
        }
    >
:   SERVICE & RequestService // simply returns the service itself if it's a request service (noop)
