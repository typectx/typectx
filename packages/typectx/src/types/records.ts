import type { UnknownAppServicePlan } from "#types/internal"
import type {
    Supply,
    Service,
    UnknownAppService,
    RequestService,
    AppService
} from "#types/public"
import type { Merge, UnionToIntersection } from "#utils"

export type MaybeFn<A extends any[], R> = R | ((...args: A) => R)
/**
 * A generic map of supplies
 * @public
 */
export type SuppliesRecord<SERVICE extends Service = Service> = Record<
    string,
    MaybeFn<[], Supply<SERVICE>>
>

/**
 * A generic map of resolved supplies
 * @public
 */
export type ResolvedRecord<SERVICE extends Service = Service> = Record<
    string,
    Supply<SERVICE>
>

/**
 * A generic map of supplies or undefined. Undefined used to force a supply not to be preserved across reassembly.
 * @public
 */
export type SuppliesOrUndefinedRecord<
    SERVICE extends UnknownAppService = UnknownAppService
> = Record<string, MaybeFn<[], Supply<SERVICE>> | undefined>

type ToSupplyBase<
    PLAN extends Pick<UnknownAppServicePlan, "optionals"> & {
        services: Service[]
    }
> = {
    [SERVICE in Extract<
        PLAN["services"][number],
        RequestService
    > as SERVICE["name"]]: Supply<SERVICE>
} & {
    [OPTIONAL in
        | PLAN["optionals"][number]
        | Exclude<
              PLAN["services"][number],
              RequestService
          > as OPTIONAL["name"]]?: OPTIONAL extends RequestService ?
        Supply<OPTIONAL>
    : OPTIONAL extends UnknownAppService ?
        Supply<
            AppService<
                OPTIONAL["name"],
                OPTIONAL["_constraint"],
                OPTIONAL["_optionalKeys"],
                OPTIONAL["_known"],
                Partial<ResolvedRecord<Service>>,
                OPTIONAL["_hired"],
                OPTIONAL["_mock"]
            >
        >
    :   never
}

type FindDepFirstAppearanceInServiceTuple<
    SERVICES extends Service[],
    KEY extends "_toSupply" | "_deps",
    NAME extends PropertyKey
> =
    SERVICES extends [infer Head, ...infer Tail] ?
        Tail extends Service[] ?
            Head extends UnknownAppService ?
                NAME extends keyof Head[KEY] ?
                    Head[KEY][NAME]
                :   FindDepFirstAppearanceInServiceTuple<Tail, KEY, NAME>
            :   FindDepFirstAppearanceInServiceTuple<Tail, KEY, NAME>
        :   never
    :   never

export type ToSupply<
    PLAN extends Pick<UnknownAppServicePlan, "optionals"> & {
        services: Service[]
    },
    KNOWN extends ResolvedRecord<Service>
> =
    any[] extends PLAN["services"] ? any
    :   Merge<
            ToSupplyBase<PLAN> & {
                [NAME in keyof UnionToIntersection<
                    Extract<
                        PLAN["services"][number],
                        UnknownAppService
                    >["_toSupply"]
                > as NAME extends keyof ToSupplyBase<PLAN> ? never
                :   NAME]: FindDepFirstAppearanceInServiceTuple<
                    PLAN["services"],
                    "_toSupply",
                    NAME
                >
            },
            Partial<KNOWN>
        >

type DepsBase<
    PLAN extends Pick<UnknownAppServicePlan, "optionals"> & {
        services: Service[]
    }
> = {
    [SERVICE in
        | PLAN["services"][number]
        | PLAN["optionals"][number] as SERVICE["name"]]: SERVICE extends (
        PLAN["services"][number]
    ) ?
        SERVICE["_constraint"]
    :   SERVICE["_constraint"] | undefined
}

// Same as Resolved, but unpacked from the supply wrapper
export type Deps<
    PLAN extends Pick<UnknownAppServicePlan, "optionals"> & {
        services: Service[]
    }
> =
    any[] extends PLAN["services"] ? any
    :   DepsBase<PLAN> & {
            [NAME in keyof UnionToIntersection<
                Extract<PLAN["services"][number], UnknownAppService>["_deps"]
            > as NAME extends keyof DepsBase<PLAN> ? never
            :   NAME]: FindDepFirstAppearanceInServiceTuple<
                PLAN["services"],
                "_deps",
                NAME
            >
        }

export type SupplyDeps<
    TO_SUPPLY extends Partial<ResolvedRecord<Service>>,
    OPTIONAL_KEYS extends string
> =
    string extends keyof Required<TO_SUPPLY> ? any
    :   {
            [NAME in keyof TO_SUPPLY]-?: Required<TO_SUPPLY>[NAME] extends (
                Supply<infer SERVICE>
            ) ?
                NAME extends OPTIONAL_KEYS ?
                    SERVICE["_constraint"] | undefined
                :   SERVICE["_constraint"]
            :   never
        }
