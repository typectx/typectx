import type {
    Service,
    UnknownAppService as UnknownAppService
} from "#types/public"

type FindDuplicateName<SERVICES extends Service[], SEEN extends string[] = []> =
    any[] extends SERVICES ? never
    : SERVICES extends (
        [infer FIRST extends Service, ...infer REST extends Service[]]
    ) ?
        string extends FIRST["name"] ? never
        : FIRST["name"] extends SEEN[number] ? FIRST["name"]
        : FindDuplicateName<REST, [...SEEN, FIRST["name"]]>
    :   never

export interface DuplicateDependencyError {
    ERROR: "Duplicate dependency name detected"
}

export type DuplicateDependencyGuard<
    SERVICE extends UnknownAppService,
    SERVICES extends Service[]
> =
    [FindDuplicateName<SERVICES>] extends [never] ? SERVICE
    :   DuplicateDependencyError

/**
 * Checks if a service has a circular dependency by seeing if its name appears
 * in the transitive dependencies of its own services.
 * @public
 */

export type CircularDependencyGuard<SERVICE extends UnknownAppService> =
    string extends SERVICE["name"] ? SERVICE
    : string extends keyof SERVICE["_toSupply"] ? SERVICE
    : SERVICE["name"] extends (
        keyof Omit<SERVICE["_toSupply"], keyof SERVICE["_known"]>
    ) ?
        CircularDependencyError
    :   SERVICE

export type CircularDependencyError = {
    ERROR: "Circular dependency detected"
}

export type AppServiceGuard<
    SERVICE extends UnknownAppService,
    SERVICES extends Service[]
> =
    DuplicateDependencyGuard<SERVICE, SERVICES> extends (
        DuplicateDependencyError
    ) ?
        DuplicateDependencyError
    :   CircularDependencyGuard<SERVICE>
