import type { Supplier } from "#types/public"

type Id<T, CASE extends "self" | "name"> =
    CASE extends "name" ?
        T extends { name: infer N } ?
            N
        :   never
    :   T

export type MergeTuplesBy<
    CASE extends "self" | "name",
    OLD extends readonly unknown[],
    WITH extends readonly unknown[],
    ACC extends readonly unknown[] = []
> =
    any[] extends OLD | WITH ? [...OLD, ...WITH]
    : OLD extends [infer Head, ...infer Tail] ?
        Id<Head, CASE> extends Id<WITH[number], CASE> ?
            MergeTuplesBy<CASE, Tail, WITH, ACC>
        :   MergeTuplesBy<CASE, Tail, WITH, [...ACC, Head]>
    :   [...ACC, ...WITH]

/**
 * Merges two supplier arrays by filtering out OLD suppliers that match NEW supplier names,
 * then appending NEW suppliers. This ensures hired suppliers override existing ones.
 * Used internally by the `hire` method to create the merged team.
 *
 * @typeParam OLD - The original array of suppliers
 * @typeParam NEW - The array of new suppliers to merge in (overriding matching names)
 * @returns A merged array with NEW suppliers replacing matching OLD suppliers
 * @public
 */
export type MergeSupplierTuples<
    OLD extends Supplier[],
    WITH extends Supplier[]
> = MergeTuplesBy<"name", OLD, WITH>

export type MergeStringTuples<
    OLD extends readonly string[],
    WITH extends readonly string[]
> = MergeTuplesBy<"self", OLD, WITH>
