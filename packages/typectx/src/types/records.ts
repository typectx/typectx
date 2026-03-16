import type { UnknownProductSupplierPlan } from "#types/internal"
import type {
    Supply,
    Supplier,
    UnknownProductSupplier,
    RequestSupplier
} from "#types/public"
import type { UnionToIntersection } from "#utils"

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

/**
 * Converts an array of suppliers and optionals into a corresponding supply map.
 *
 * @typeParam SUPPLIERS - Array of suppliers to convert into a supply map
 * @typeParam OPTIONALS - Array of optional suppliers to convert into a supply map
 * @returns A map where keys are supplier names and values are their assembled supplies
 * @public
 */
/* export type Supplies<
    PLAN extends Pick<
        UnknownProductSupplierPlan,
        "optionals" | "suppliers" | "hired"
    >
> = {
    [SUPPLIER in AllRequiredSuppliers<PLAN>[number] as SUPPLIER["name"]]: MaybeFn<
        [],
        Supply<SUPPLIER>
    >
} & {
    [OPTIONAL in PLAN["optionals"][number] as OPTIONAL["name"]]?: MaybeFn<
        [],
        Supply<OPTIONAL>
    >
} */

export type ToSupply<
    PLAN extends Pick<UnknownProductSupplierPlan, "optionals"> & {
        suppliers: Supplier[]
    },
    KNOWN extends ResolvedRecord<Supplier>
> = Omit<
    {
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
              > as OPTIONAL["name"]]?: Supply<OPTIONAL>
    } & UnionToIntersection<
            Extract<
                PLAN["suppliers"][number],
                UnknownProductSupplier
            >["_toSupply"]
        >,
    keyof KNOWN
> &
    Partial<KNOWN>

export type Resolved<
    TO_SUPPLY extends Partial<ResolvedRecord<Supplier>>,
    KNOWN extends ResolvedRecord<Supplier>
> = {
    [NAME in keyof TO_SUPPLY]-?: TO_SUPPLY[NAME]
} & KNOWN

// Same as Resolved, but unpacked from the supply wrapper
export type Deps<
    PLAN extends Pick<UnknownProductSupplierPlan, "optionals"> & {
        suppliers: Supplier[]
    }
> = {
    [SUPPLIER in PLAN["suppliers"][number] as SUPPLIER["name"]]: SUPPLIER["_constraint"]
} & {
    [OPTIONAL in PLAN["optionals"][number] as OPTIONAL["name"]]?: OPTIONAL["_constraint"]
} & UnionToIntersection<
        Extract<PLAN["suppliers"][number], UnknownProductSupplier>["_deps"]
    >

export type SupplyDeps<
    TO_SUPPLY extends Partial<ResolvedRecord<Supplier>>,
    OPTIONAL_KEYS extends string,
    KNOWN extends ResolvedRecord<Supplier>
> = {
    [NAME in keyof Omit<Resolved<TO_SUPPLY, KNOWN>, OPTIONAL_KEYS>]: Resolved<
        TO_SUPPLY,
        KNOWN
    >[NAME] extends Supply<infer SUPPLIER> ?
        SUPPLIER["_constraint"]
    :   never
} & {
    [NAME in keyof Pick<Resolved<TO_SUPPLY, KNOWN>, OPTIONAL_KEYS>]?: Resolved<
        TO_SUPPLY,
        KNOWN
    >[NAME] extends Supply<infer SUPPLIER> ?
        SUPPLIER["_constraint"]
    :   never
}
