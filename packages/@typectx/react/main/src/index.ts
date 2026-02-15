import { useLayoutEffect, useState, useSyncExternalStore } from "react"
import type {
    Resolved,
    Supplier,
    Supply,
    Deps,
    RequestSupplier,
    AnyProductSupplier
} from "typectx"

export function useDeps<INIT_DEPS extends Deps<Supplier[], RequestSupplier[]>>(
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
    CONSTRAINT,
    TOSUPPLY,
    SUPPLIED extends TOSUPPLY & Record<string, Supply | undefined>,
    DEPS extends Deps<Supplier[], RequestSupplier[]>,
    RESOLVED extends Resolved<Supplier[], RequestSupplier[]>
>(
    supplier: {
        assemble: (
            supplied: TOSUPPLY & Record<string, Supply | undefined>
        ) => Supply<CONSTRAINT, AnyProductSupplier, DEPS, RESOLVED>
    },
    supplied: SUPPLIED
) {
    // First render captures the initial assembly.
    // Child components won't be in `components` until they've mounted and
    // initialized their store.
    const [first] = useState(() => supplier.assemble(supplied))

    const components = Object.entries(first.supplies).reduce(
        (acc: Record<string, Supply<any, AnyProductSupplier>>, [key, supply]) => {
            return store.has(supply.deps)  ? { ...acc, [key]: supply as Supply<any, AnyProductSupplier> } : acc
        },
        (store.has(first.deps) ? { [first.supplier.name]: first } : {})
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
                        supplied[supplier.name] !==
                            (store.get(component.deps)?.[supplier.name] ??
                                undefined)
                )
            )
                return

            store.set(
                component.deps,
                // We need ctx, because supplied here is not necessarily the
                // as supplied in the useState() call. This is not necessarily the first render, so supplies here
                // may lack the ones provided in first render.
                first._.ctx(component.supplier).assemble({
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
        componentDeps: Deps<Supplier[], RequestSupplier[]>,
        elementDeps: Deps<Supplier[], RequestSupplier[]>
    ) {
        store._.state.set(componentDeps, elementDeps)
    },
    get(componentDeps: Deps<Supplier[], RequestSupplier[]>) {
        return store._.state.get(componentDeps)
    },
    has(componentDeps: Deps<Supplier[], RequestSupplier[]>) {
        return store._.state.has(componentDeps)
    },
    trigger(componentDeps: Deps<Supplier[], RequestSupplier[]>) {
        store._.listeners.get(componentDeps)?.forEach((listener) => listener())
    },
    subscribe(
        componentDeps: Deps<Supplier[], RequestSupplier[]>,
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
            Deps<Supplier[], RequestSupplier[]>,
            Deps<Supplier[], RequestSupplier[]>
        >(),
        listeners: new WeakMap<
            Deps<Supplier[], RequestSupplier[]>,
            (() => unknown)[]
        >()
    }
}
