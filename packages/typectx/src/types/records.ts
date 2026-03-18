import type { UnknownProductSupplierPlan } from "#types/internal"
import type {
    Supply,
    Supplier,
    UnknownProductSupplier,
    RequestSupplier,
    ProductSupplier
} from "#types/public"
import type { Merge, UnionToIntersection } from "#utils"

export type MaybeFn<A extends any[], R> = R | ((...args: A) => R)
/**
 * A generic map of supplies
 * @public
 */
export type SuppliesRecord<SUPPLIER extends Supplier = Supplier> = Record<
    string,
    MaybeFn<[], Supply<SUPPLIER>>
>

/**
 * A generic map of resolved supplies
 * @public
 */
export type ResolvedRecord<SUPPLIER extends Supplier = Supplier> = Record<
    string,
    Supply<SUPPLIER>
>

/**
 * A generic map of supplies or undefined. Undefined used to force a supply not to be preserved across reassembly.
 * @public
 */
export type SuppliesOrUndefinedRecord<
    SUPPLIER extends UnknownProductSupplier = UnknownProductSupplier
> = Record<string, MaybeFn<[], Supply<SUPPLIER>> | undefined>

type ToSupplyBase<
    PLAN extends Pick<UnknownProductSupplierPlan, "optionals"> & {
        suppliers: Supplier[]
    }
> = {
    [SUPPLIER in Extract<
        PLAN["suppliers"][number],
        RequestSupplier
    > as SUPPLIER["name"]]: Supply<SUPPLIER>
} & {
    [OPTIONAL in
        | PLAN["optionals"][number]
        | Exclude<
              PLAN["suppliers"][number],
              RequestSupplier
          > as OPTIONAL["name"]]?: OPTIONAL extends RequestSupplier ?
        Supply<OPTIONAL>
    : OPTIONAL extends UnknownProductSupplier ?
        Supply<
            ProductSupplier<
                OPTIONAL["name"],
                OPTIONAL["_constraint"],
                OPTIONAL["_optionalKeys"],
                OPTIONAL["_known"],
                Partial<ResolvedRecord<Supplier>>,
                OPTIONAL["_hired"],
                OPTIONAL["_mock"],
                OPTIONAL["_composite"]
            >
        >
    :   never
}

export type ToSupply<
    PLAN extends Pick<UnknownProductSupplierPlan, "optionals"> & {
        suppliers: Supplier[]
    },
    KNOWN extends ResolvedRecord<Supplier>
> =
    any[] extends PLAN["suppliers"] ? any
    :   Merge<
            ToSupplyBase<PLAN> & {
                [NAME in keyof UnionToIntersection<
                    Extract<
                        PLAN["suppliers"][number],
                        UnknownProductSupplier
                    >["_toSupply"]
                > as NAME extends keyof ToSupplyBase<PLAN> ? never
                :   NAME]: UnionToIntersection<
                    Extract<
                        PLAN["suppliers"][number],
                        UnknownProductSupplier
                    >["_toSupply"]
                >[NAME]
            },
            Partial<KNOWN>
        >

// Same as Resolved, but unpacked from the supply wrapper
export type Deps<
    PLAN extends Pick<UnknownProductSupplierPlan, "optionals"> & {
        suppliers: Supplier[]
    }
> = {
    [SUPPLIER in
        | PLAN["suppliers"][number]
        | PLAN["optionals"][number] as SUPPLIER["name"]]: SUPPLIER extends (
        PLAN["suppliers"][number]
    ) ?
        SUPPLIER["_constraint"]
    :   SUPPLIER["_constraint"] | undefined
} & UnionToIntersection<
    Extract<PLAN["suppliers"][number], UnknownProductSupplier>["_deps"]
>

export type SupplyDeps<
    TO_SUPPLY extends Partial<ResolvedRecord<Supplier>>,
    OPTIONAL_KEYS extends string
> =
    string extends keyof Required<TO_SUPPLY> ? any
    :   {
            [NAME in keyof TO_SUPPLY]-?: Required<TO_SUPPLY>[NAME] extends (
                Supply<infer SUPPLIER>
            ) ?
                NAME extends OPTIONAL_KEYS ?
                    SUPPLIER["_constraint"] | undefined
                :   SUPPLIER["_constraint"]
            :   never
        }
