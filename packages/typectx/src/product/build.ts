import type { Ctx, UnknownProductSupplierPlan } from "#types/internal"
import type { Supplier, Supply, UnknownProductSupplier } from "#types/public"
import type { SuppliesRecord, ToSupply } from "#types/records"
import { isProductSupplier, once } from "#utils"

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

function prerun(supplier: { _team: Supplier[] }, deps: Record<string, any>) {
    // Prerun supplier factories in the background (non-blocking)
    for (const member of supplier._team) {
        if ("_lazy" in member && member._lazy) continue

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

export function Ctx<
    PLAN extends Pick<UnknownProductSupplierPlan, "suppliers" | "optionals">
>(
    plan: PLAN,
    resolved: Required<ToSupply<PLAN, Record<never, never>>>
): Ctx<PLAN> {
    return <SUPPLIER extends Supplier>(supplier: SUPPLIER): any => {
        const actual =
            plan.suppliers.find((member) => member.name === supplier.name) ??
            supplier

        if (!isProductSupplier(actual)) {
            return actual
        }

        return {
            ...actual,
            _known: resolved
        }
    }
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
            if (!this._team.some((member) => member.name === name)) {
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
            deps: {},
            resolved: {}
        }
    )

    // Prerun supplier factories in the background (non-blocking)
    prerun(this, deps)

    const ctx = Ctx(
        { suppliers: this._suppliers, optionals: this._optionals },
        resolved
    )

    const supply = {
        unpack: once(() => {
            const value = this._factory(deps, ctx)
            if (this._init) {
                this._init(value, deps)
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
