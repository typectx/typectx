import type {
    MainSupplier,
    ProductConfig,
    ProductSupplier,
    RequestSupplier,
    UnknownProductSupplier
} from "#types"
import { assertProductSuppliers } from "#validation"
import { assemble } from "#product/assemble"
import { _build } from "#product/build"
import { dedupe, isProductSupplier, once } from "#utils"
import { supplier } from "#index"

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

    const s = {
        ...supplier(name).request<CONSTRAINT>(),
        suppliers: config.suppliers ?? ([] as unknown as SUPPLIERS),
        optionals: config.optionals ?? ([] as unknown as OPTIONALS),
        assemblers: config.assemblers ?? ([] as unknown as ASSEMBLERS),
        hired: config.hired ?? ([] as unknown as HIRED),
        known: {},
        team: once(function <
            THIS extends Pick<
                UnknownProductSupplier,
                "name" | "suppliers" | "optionals" | "assemblers" | "hired"
            >
        >(this: THIS) {
            const team = [...this.suppliers, ...this.optionals, ...this.hired]
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
        }),
        lazy: config.lazy ?? false,
        init: config.init,
        assemble,
        _factory: config.factory,
        _request: false as const,
        _product: true as const,
        _constraint: null as unknown as CONSTRAINT,
        _build
    }

    s.team()
    return s
}
