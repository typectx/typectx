import { useLayoutEffect, useState, useSyncExternalStore } from "react"
import {
    type $,
    type ResourceSupplier,
    type Supplier,
    type Product,
    isProduct,
    Resource,
    ProductSupplier
} from "typectx"

export function useInit$<INIT$ extends $<Supplier[], ResourceSupplier[]>>(
    init$: INIT$
) {
    // useSyncExternalStore subscribes to store updates.
    // Combined with the two-phase update in useAssembleComponent (silent set + deferred trigger),
    // all components get single render pass regardless of memoization.
    if (!store.has(init$)) {
        store.set(init$, init$)
    }
    const $ = useSyncExternalStore(
        (listener) => store.subscribe(init$, listener),
        () => store.get(init$),
        () => init$
    ) as INIT$
    return $ ?? init$
}

export function useAssembleComponent<
    CONSTRAINT,
    TOSUPPLY,
    SUPPLIED extends TOSUPPLY & Record<string, Product | Resource | undefined>,
    SUPPLIES extends $<Supplier[], ResourceSupplier[]>
>(
    supplier: {
        assemble: (
            supplied: TOSUPPLY & Record<string, Product | Resource | undefined>
        ) => Product<CONSTRAINT, ProductSupplier, SUPPLIES>
    },
    supplied: SUPPLIED
) {
    // First render captures the initial assembly.
    // Child components won't be in `components` until they've mounted and
    // initialized their store.
    const [first] = useState(() => supplier.assemble(supplied))

    const components = first.$.keys.reduce<Record<string, Product>>(
        (acc, key) => {
            const supply = first.$({ name: key })
            if (!isProduct(supply)) return acc
            return store.has(supply.$) ? { ...acc, [key]: supply } : acc
        },
        store.has(first.$) ? { [first.supplier.name]: first } : {}
    )

    const triggered = Object.entries(components)
        .map(([key, component]) => {
            if (
                ![
                    ...component.supplier.suppliers,
                    ...component.supplier.optionals,
                    ...component.supplier.hired
                ].some(
                    (supplier) =>
                        supplier.name in supplied &&
                        supplied[supplier.name] !==
                            (store.get(component.$)?.({
                                name: supplier.name
                            }) ?? undefined)
                )
            )
                return

            store.set(
                component.$,
                first._.$$(component.supplier).assemble({
                    ...supplied,
                    ...components
                }).$
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
        triggered.forEach((component) => store.trigger(component.$))
    })

    // Always return first for referential stability.
    // Updates to child components propagate via store.set() above,
    // which useInit$ reads via useSyncExternalStore.
    return first
}

const store = {
    set(
        component$: $<Supplier[], ResourceSupplier[]>,
        element$: $<Supplier[], ResourceSupplier[]>
    ) {
        store._.state.set(component$, element$)
    },
    get(component$: $<Supplier[], ResourceSupplier[]>) {
        return store._.state.get(component$)
    },
    has(component$: $<Supplier[], ResourceSupplier[]>) {
        return store._.state.has(component$)
    },
    trigger(component$: $<Supplier[], ResourceSupplier[]>) {
        store._.listeners.get(component$)?.forEach((listener) => listener())
    },
    subscribe(
        component$: $<Supplier[], ResourceSupplier[]>,
        listener: () => unknown
    ) {
        store._.listeners.set(component$, [
            ...(store._.listeners.get(component$) ?? []),
            listener
        ])

        return () => {
            store._.listeners.set(
                component$,
                store._.listeners
                    .get(component$)
                    ?.filter((l) => l !== listener) ?? []
            )
        }
    },
    _: {
        state: new WeakMap<
            $<Supplier[], ResourceSupplier[]>,
            $<Supplier[], ResourceSupplier[]>
        >(),
        listeners: new WeakMap<
            $<Supplier[], ResourceSupplier[]>,
            (() => unknown)[]
        >()
    }
}
