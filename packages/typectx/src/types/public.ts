import type { AppServiceGuard } from "#types/guards"
import type { BaseService, Ctx, PartialAppServicePlan } from "#types/internal"
import type {
    ResolvedRecord,
    SuppliesRecord,
    SupplyDeps,
    ToSupply
} from "#types/records"
import type { MergeStringTuples } from "#types/utils"
import type { Merge } from "#utils"

export interface RequestService<
    NAME extends string = string,
    CONSTRAINT = unknown
> extends BaseService<NAME, CONSTRAINT> {
    _constraint: CONSTRAINT
    _request: true
    _mock: false
}

export interface AppService<
    NAME extends string,
    CONSTRAINT,
    OPTIONAL_KEYS extends string,
    KNOWN extends ResolvedRecord<Service>,
    TO_SUPPLY extends Partial<ResolvedRecord<Service>>,
    HIRED extends string[],
    MOCK extends boolean = boolean,
    COMPOSITE extends boolean = boolean
> extends BaseService<NAME, CONSTRAINT> {
    /** Assembles the service by providing request supplies and auto-wiring app dependencies */
    assemble: <THIS extends UnknownAppService>(
        this: THIS,
        toSupply: THIS["_toSupply"]
    ) => Supply<THIS>
    mock: <
        THIS extends UnknownAppService & {
            name: NAME
            _constraint: CONSTRAINT
            _mock: false
        },
        CONSTRAINT2 extends THIS["_constraint"],
        SERVICES2 extends MainService[] = [],
        OPTIONALS2 extends RequestService[] = []
    >(
        this: THIS,
        config: PartialAppServicePlan<CONSTRAINT2, SERVICES2, OPTIONALS2>
    ) => AppServiceGuard<
        Mock<THIS, CONSTRAINT2, SERVICES2, OPTIONALS2>,
        [...SERVICES2, ...OPTIONALS2]
    >
    hire: <
        THIS extends UnknownAppService & {
            _composite: boolean
        },
        HIRED extends UnknownAppService[] = []
    >(
        this: THIS,
        ...hired: [...HIRED]
    ) => AppServiceGuard<
        AppService<
            THIS["name"],
            THIS["_constraint"],
            THIS["_optionalKeys"],
            THIS["_known"],
            Merge<
                {
                    [SERVICE in HIRED[number] as SERVICE["name"]]?: Supply<SERVICE>
                },
                Merge<
                    Omit<
                        THIS["_toSupply"],
                        keyof HIRED[number]["_oldToSupply"]
                    >,
                    HIRED[number]["_toSupply"]
                >
            >,
            MergeStringTuples<
                THIS["_hired"],
                {
                    [K in keyof HIRED]: HIRED[K]["name"]
                }
            >,
            false,
            true
        >,
        HIRED
    >
    _app: true
    _request: false
    _constraint: CONSTRAINT
    _optionalKeys: OPTIONAL_KEYS
    _known: KNOWN
    _toSupply: TO_SUPPLY
    _deps: SupplyDeps<TO_SUPPLY, OPTIONAL_KEYS>
    _oldToSupply: TO_SUPPLY
    _oldDeps: SupplyDeps<TO_SUPPLY, OPTIONAL_KEYS>
    /** Array of services this service depends on */
    _services: MainService[]
    /** Array of optional request services this service may depend on */
    _optionals: RequestService[]
    _team: Service[]
    _hired: HIRED
    /** Factory function that creates the service's value from its dependencies */
    _factory: (deps: any, ctx: Ctx<any, any>) => any
    /** Optional initialization function called after factory */
    _init?: (value: any, deps: any) => void
    _build: <THIS extends UnknownAppService>(
        this: THIS,
        supplies: SuppliesRecord
    ) => Supply<THIS>
    /** Whether this service should be lazily evaluated */
    _lazy?: boolean
    _mock: MOCK
    _composite: COMPOSITE
}

export type Service = UnknownAppService | RequestService
export type MainService = Service & {
    _mock: false
}

export type UnknownAppService = AppService<
    string,
    unknown,
    string,
    ResolvedRecord<any>,
    Partial<ResolvedRecord<any>>,
    string[],
    boolean
>

export type Mock<
    SERVICE extends UnknownAppService,
    CONSTRAINT2 extends SERVICE["_constraint"],
    SERVICES2 extends MainService[] = [],
    OPTIONALS2 extends RequestService[] = []
> = Omit<
    AppService<
        SERVICE["name"],
        CONSTRAINT2,
        OPTIONALS2[number]["name"],
        Record<never, never>,
        ToSupply<
            {
                services: SERVICES2
                optionals: OPTIONALS2
            },
            Record<never, never>
        >,
        [],
        true
    >,
    "_mock" | "_composite" | "_oldResolved" | "_oldToSupply" | "_oldDeps"
> & {
    _mock: true
    _composite: false
    _oldToSupply: SERVICE["_toSupply"]
    _oldDeps: SERVICE["_deps"]
}

/**
 * Represents a supply - The result of assembling a service
 * with all its app and request dependencies, which can easily be passed
 * to other services.
 *
 * @typeParam NAME - The unique identifier name for this supply
 * @typeParam VALUE - The type of value this supply holds
 * @public
 */
export type AppSupply<SERVICE extends UnknownAppService> = {
    name: SERVICE["name"]
    unpack: () => SERVICE["_constraint"]
    deps: SERVICE["_deps"]
    supplies: {
        [NAME in keyof SERVICE["_toSupply"]]-?: NonNullable<
            SERVICE["_toSupply"][NAME]
        >
    }
    service: SERVICE
    _ctx: Ctx<any>
    _packed: boolean
}

export type RequestSupply<SERVICE extends RequestService> = {
    name: SERVICE["name"]
    unpack: () => SERVICE["_constraint"]
    service: SERVICE
    _packed: boolean
}

export type Supply<SERVICE extends Service> =
    SERVICE extends RequestService ? RequestSupply<SERVICE>
    :   AppSupply<Extract<SERVICE, UnknownAppService>>
