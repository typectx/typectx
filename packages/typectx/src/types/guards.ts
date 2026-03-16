import type { Supplier, UnknownProductSupplier } from "#types/public"

type FindDuplicateName<
    SUPPLIERS extends Supplier[],
    SEEN extends string[] = []
> =
    any[] extends SUPPLIERS ? never
    : SUPPLIERS extends (
        [infer FIRST extends Supplier, ...infer REST extends Supplier[]]
    ) ?
        string extends FIRST["name"] ? never
        : FIRST["name"] extends SEEN[number] ? FIRST["name"]
        : FindDuplicateName<REST, [...SEEN, FIRST["name"]]>
    :   never

export interface DuplicateDependencyError {
    ERROR: "Duplicate dependency name detected"
}

export type DuplicateDependencyGuard<
    SUPPLIER extends UnknownProductSupplier,
    SUPPLIERS extends Supplier[]
> =
    [FindDuplicateName<SUPPLIERS>] extends [never] ? SUPPLIER
    :   DuplicateDependencyError

/**
 * Checks if a supplier has a circular dependency by seeing if its name appears
 * in the transitive dependencies of its own suppliers.
 * @public
 */

export type CircularDependencyGuard<SUPPLIER extends UnknownProductSupplier> =
    string extends SUPPLIER["name"] ? SUPPLIER
    : string extends keyof SUPPLIER["_resolved"] ? SUPPLIER
    : SUPPLIER["name"] extends (
        keyof Omit<SUPPLIER["_resolved"], keyof SUPPLIER["_known"]>
    ) ?
        CircularDependencyError
    :   SUPPLIER

export type CircularDependencyError = {
    ERROR: "Circular dependency detected"
}

export type ProductSupplierGuard<
    SUPPLIER extends UnknownProductSupplier,
    SUPPLIERS extends Supplier[]
> =
    DuplicateDependencyGuard<SUPPLIER, SUPPLIERS> extends (
        DuplicateDependencyError
    ) ?
        DuplicateDependencyError
    :   CircularDependencyGuard<SUPPLIER>
