import { useLayoutEffect, useState, useSyncExternalStore } from "react"
import type {
    Deps,
    UnknownProductSupplier,
    ToSupply,
    ResolvedRecord,
    Supply,
    Supplier
} from "typectx"

export function useDeps<INIT_DEPS extends Deps<UnknownProductSupplier>>(
    initDeps: INIT_DEPS
) {
    // useSyncExternalStore subscribes to store updates.
    // Combined with the two-phase update in useAssembleComponent (silent set + deferred trigger),
    // all components get single render pass regardless of memoization.
    if (!store.has(initDeps)) {
        store.set(initDeps, initDeps)
    }
    const deps = useSyncExternalStore(
        (listener) => store.subscribe(initDeps, listener),
        () => store.get(initDeps),
        () => initDeps
    ) as INIT_DEPS
    return deps ?? initDeps
}

export function useAssembleComponent<
    SUPPLIER extends UnknownProductSupplier,
    TO_SUPPLY extends ToSupply<SUPPLIER> = ToSupply<SUPPLIER>
>(supplier: SUPPLIER, supplied: TO_SUPPLY) {
    // First render captures the initial assembly.
    // Child components won't be in `components` until they've mounted and
    // initialized their store.
    const [first] = useState(() => supplier.assemble(supplied))

    function isProductSupply(
        supply: Supply<Supplier>
    ): supply is Supply<UnknownProductSupplier> {
        return (
            "_product" in supply.supplier && supply.supplier._product === true
        )
    }

    const components = Object.entries(first.supplies).reduce(
        (acc, [key, supply]) => {
            if (!isProductSupply(supply)) return acc
            if (store.has(supply.deps)) return { ...acc, [key]: supply }
            return acc
        },
        store.has(first.deps) ?
            ({
                [first.supplier.name]: first
            } as ResolvedRecord<UnknownProductSupplier>)
        :   ({} as ResolvedRecord<UnknownProductSupplier>)
        // Assertion necessary because intersection of mapped types do not work well with wide types
    )

    const triggered = Object.entries(components)
        .map(([key, component]) => {
            if (
                // This is not the team! Team is transitive, this is just the direct dependencies!
                ![
                    ...component.supplier.suppliers,
                    ...component.supplier.optionals,
                    ...component.supplier.hired
                ].some(
                    (supplier) =>
                        supplier.name in supplied &&
                        supplied[
                            supplier.name as keyof Omit<
                                TO_SUPPLY,
                                keyof SUPPLIER["known"]
                            >
                        ] !==
                            (store.get(component.deps)?.[supplier.name] ??
                                undefined)
                )
            )
                return

            store.set(
                component.deps,
                // We need ctx, because supplied here is not necessarily the same
                // as supplied in the useState() call. This is not necessarily the first render, so supplies here
                // may lack the ones provided in first render.
                first._ctx(component.supplier).assemble({
                    ...supplied,
                    ...components
                }).deps
            )

            return component
        })
        .filter((component) => component !== undefined)

    // Always only one render pass!
    // If component is memoed, then the synchronous render from parent will be skipped,
    // If component is not memoed, then the synchronous render from parent will be executed,
    // the snapshot will get updated, meaning the re-render from useLayoutEffect will be aborted.
    // Since snapshot has not changed since synchronous render.
    // Result: single render for all children, equivalent to React Context!
    useLayoutEffect(() => {
        triggered.forEach((component) => store.trigger(component.deps))
    })

    // Always return first for referential stability.
    // Updates to child components propagate via store.set() above,
    // which useInit$ reads via useSyncExternalStore.
    return first
}

export const useAssembleHook = useAssembleComponent

const store = {
    set(
        componentDeps: Deps<UnknownProductSupplier>,
        elementDeps: Deps<UnknownProductSupplier>
    ) {
        store._.state.set(componentDeps, elementDeps)
    },
    get(componentDeps: Deps<UnknownProductSupplier>) {
        return store._.state.get(componentDeps)
    },
    has(componentDeps: Deps<UnknownProductSupplier>) {
        return store._.state.has(componentDeps)
    },
    trigger(componentDeps: Deps<UnknownProductSupplier>) {
        store._.listeners.get(componentDeps)?.forEach((listener) => listener())
    },
    subscribe(
        componentDeps: Deps<UnknownProductSupplier>,
        listener: () => unknown
    ) {
        store._.listeners.set(componentDeps, [
            ...(store._.listeners.get(componentDeps) ?? []),
            listener
        ])

        return () => {
            store._.listeners.set(
                componentDeps,
                store._.listeners
                    .get(componentDeps)
                    ?.filter((l) => l !== listener) ?? []
            )
        }
    },
    _: {
        state: new WeakMap<
            Deps<UnknownProductSupplier>,
            Deps<UnknownProductSupplier>
        >(),
        listeners: new WeakMap<
            Deps<UnknownProductSupplier>,
            (() => unknown)[]
        >()
    }
}
