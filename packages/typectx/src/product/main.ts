import type {
    MainSupplier,
    ProductConfig,
    ProductSupplier,
    RequestSupplier,
    UnknownProductSupplier
} from "#types"
import { assertProductSuppliers } from "#validation"
import { request } from "#request"
import { assemble } from "#product/assemble"
import { _build } from "#product/build"
import { dedupe, isProductSupplier, once } from "#utils"

export function main<
    NAME extends string,
    CONSTRAINT,
    SUPPLIERS extends MainSupplier[] = [],
    OPTIONALS extends RequestSupplier[] = [],
    ASSEMBLERS extends UnknownProductSupplier[] = [],
    HIRED extends UnknownProductSupplier[] = []
>(
    name: NAME,
    config: ProductConfig<
        NAME,
        CONSTRAINT,
        SUPPLIERS,
        OPTIONALS,
        ASSEMBLERS,
        HIRED
    >
): Omit<
    ProductSupplier<NAME, CONSTRAINT, SUPPLIERS, OPTIONALS, ASSEMBLERS, HIRED>,
    "mock" | "hire" | "_mock" | "_composite"
> {
    assertProductSuppliers(name, config.hired ?? [], true)

    const supplier = {
        ...request(name)<CONSTRAINT>(),
        suppliers: config.suppliers ?? ([] as unknown as SUPPLIERS),
        optionals: config.optionals ?? ([] as unknown as OPTIONALS),
        assemblers: config.assemblers ?? ([] as unknown as ASSEMBLERS),
        hired: config.hired ?? ([] as unknown as HIRED),
        known: {},
        team: once(Team()),
        assemblersTeam: once(Team(true)),
        lazy: config.lazy ?? false,
        init: config.init,
        assemble,
        _factory: config.factory,
        _request: false as const,
        _product: true as const,
        _constraint: null as unknown as CONSTRAINT,
        _build
    }

    supplier.team()
    supplier.assemblersTeam()

    return supplier
}

/**
 * Builds the transitive team of suppliers by recursively collecting all dependencies.
 * This flattens the dependency graph into a deduped array and detects circular
 * dependencies at runtime.
 *
 * @param withAssemblers - Whether to include assemblers while traversing the graph
 * @returns A flattened, deduplicated array of all transitive suppliers
 * @throws Error if a circular dependency is detected
 * @internal
 */
function Team(withAssemblers: boolean = false) {
    return function team<
        THIS extends Pick<
            UnknownProductSupplier,
            "name" | "suppliers" | "optionals" | "assemblers" | "hired"
        >
    >(this: THIS) {
        const team = [
            ...this.suppliers,
            ...this.optionals,
            ...(withAssemblers ? this.assemblers : []),
            ...this.hired
        ]
            .flatMap((supplier) => {
                if (isProductSupplier(supplier)) {
                    return [supplier, ...supplier.team()]
                }
                return [supplier]
            })
            .map((supplier) => {
                if (supplier.name === this.name)
                    throw new Error("Circular dependency detected")
                return supplier
            })

        return dedupe(team) as any
    }
}
