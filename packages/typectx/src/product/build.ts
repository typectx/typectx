import type {
    Ctx,
    Deps,
    MaybeFn,
    MergeSuppliers,
    Resolved,
    Supplier,
    ToSupply,
    SuppliesRecord,
    Supply,
    UnknownProductSupplier,
    ProductSupplier
} from "#types"
import { isPacked, isProductSupplier, once } from "#utils"

function createResolver(supplies: SuppliesRecord) {
    return once(() => {
        return Object.entries(supplies).reduce(
            (acc, [name, supply]) => {
                if (typeof supply === "function") {
                    acc[name] = supply()
                    return acc
                }

                acc[name] = supply
                return acc
            },
            {} as Record<string, any>
        )
    })
}

function prerun(
    supplier: { team: () => Supplier[] },
    deps: Record<string, any>
) {
    // Prerun supplier factories in the background (non-blocking)
    for (const member of Object.values(supplier.team())) {
        if ("lazy" in member && member.lazy) continue

        // If prerun fails, we don't want to break the entire supply chain
        // The error will be thrown again when the dependency is actually needed
        Promise.resolve()
            .then(() => deps[member.name])
            .catch(() => {
                // Silently catch errors during prerun
                // The error will be thrown again when the dependency is actually accessed
            })
    }
}

function Ctx<SUPPLIER extends UnknownProductSupplier>(
    supplier: SUPPLIER,
    resolved: Resolved<UnknownProductSupplier>
): Ctx<SUPPLIER> {
    return <ASSEMBLER extends Supplier>(assembler: ASSEMBLER): any => {
        const assemblersTeam = supplier.assemblersTeam()
        const actual = assemblersTeam.find(
            (member) => member.name === assembler.name
        )
        if (!actual) {
            throw new Error(`Assembler ${assembler.name} not found`)
        }

        if (!isProductSupplier(actual)) {
            return actual
        }

        return {
            ...actual,
            known: resolved,
            assemble: (supplied: ToSupply<typeof actual>) =>
                reassemble(actual, resolved, supplied)
        }
    }
}

function reassemble<
    ASSEMBLER extends UnknownProductSupplier,
    HIRED extends UnknownProductSupplier[]
>(
    assembler: ASSEMBLER,
    resolved: Record<string, Supply>,
    supplied: Record<string, unknown>,
    ...hired: [...HIRED]
): Supply<
    ProductSupplier<
        ASSEMBLER["name"],
        ASSEMBLER["_constraint"],
        ASSEMBLER["suppliers"],
        ASSEMBLER["optionals"],
        ASSEMBLER["assemblers"],
        MergeSuppliers<ASSEMBLER["hired"], HIRED>,
        Record<never, unknown>,
        false,
        true
    >
> {
    // Stores the supplies that can be preserved to optimize reassemble
    const preserved: SuppliesRecord = {}

    for (const name of Object.keys(resolved)) {
        const supply = resolved[name]

        if (!supply) {
            throw new Error("Impossible state: supply not found in resolved")
        }

        if (hired.some((h) => h.name === name) || name in supplied) {
            // Do not preserve supplies from newly hired
            // or newly supplied
            continue
        }

        // Do not preserve if some of the suppliers's team members
        // depend on newly hired or supplied (unless packed supplies
        // which are preserved if not directly overwritten by supplied)
        if (
            !isPacked(supply) &&
            isProductSupplier(supply.supplier) &&
            supply.supplier
                .team()
                .some(
                    (t) =>
                        t.name in supplied ||
                        hired.some((h) => h.name === t.name)
                )
        ) {
            continue
        }

        preserved[name] = supply
    }

    const definedSupplied: SuppliesRecord = Object.fromEntries(
        Object.entries(supplied).filter(
            (entry): entry is [string, MaybeFn<[], Supply>] =>
                entry[1] !== undefined
        )
    )

    const hiredAssembler = assembler.hire<typeof assembler, HIRED>(...hired)

    if ("ERROR" in hiredAssembler) {
        throw new Error("Circular dependency detected")
    }

    const newSupplies = hiredAssembler.assemble({
        ...preserved,
        ...definedSupplied
    } as any).supplies // Assertion required here because there is no way to relate the types of the supplies

    return hiredAssembler._build(newSupplies)
}

/**
 * Internal build method that creates the actual supply.
 * This is separated from assemble() to allow for internal reuse during
 * reassembly and recursive dependency resolution. It creates the factory
 * closure with the deps and ctx accessors and handles initialization.
 *
 * @param this - The product supplier building the supply
 * @param supplies - The supply map providing resolved dependencies
 * @returns A supply instance with unpack(), deps, supplies, and ctx methods
 * @internal
 */

export function _build<THIS extends UnknownProductSupplier>(
    this: THIS,
    supplies: SuppliesRecord
): Supply<THIS> {
    const resolve = createResolver(supplies)

    const { deps, resolved } = Object.keys(supplies).reduce(
        (acc, name) => {
            if (!this.team().some((member) => member.name === name)) {
                return acc
            }

            Object.defineProperty(acc.resolved, name, {
                get() {
                    return resolve()[name]
                },
                enumerable: true,
                configurable: true
            })

            Object.defineProperty(acc.deps, name, {
                get() {
                    return resolve()[name]?.unpack()
                },
                enumerable: true,
                configurable: true
            })
            return acc
        },
        {
            deps: {} as Deps<THIS>,
            resolved: {} as Resolved<THIS>
        }
    )

    // Prerun supplier factories in the background (non-blocking)
    prerun(this, deps)

    const ctx = Ctx(this, resolved)

    const supply = {
        unpack: once(() => {
            const value = this._factory(deps, ctx)
            if (this.init) {
                this.init(value, deps)
            }
            return value
        }),
        deps,
        supplies: resolved,
        supplier: this,
        _ctx: ctx,
        _packed: false as const
    }

    return supply as any
}
