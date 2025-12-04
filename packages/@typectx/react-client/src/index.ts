import { useState, useSyncExternalStore } from "react"
import {
    type $,
    type ResourceSupplier,
    type Supplier,
    type Product,
    isProduct,
    Resource,
    ProductSupplier,
    BaseProductSupplier
} from "typectx"

export function useStored<INIT$ extends $<Supplier[], ResourceSupplier[]>>(
    init$: INIT$
) {
    const stored$ = useSyncExternalStore(
        (listener: () => unknown) => store.subscribe(init$, listener),
        () => store.get(init$),
        () => init$
    ) as INIT$
    return stored$ ?? init$
}

export function useAssemble<
    CONSTRAINT,
    TOSUPPLY,
    SUPPLIED extends TOSUPPLY & Record<string, Product | Resource | undefined>,
    SUPPLIES extends $<Supplier[], ResourceSupplier[]>
>(
    supplier: {
        assemble: (
            supplied: TOSUPPLY & Record<string, Product | Resource | undefined>
        ) => Product<CONSTRAINT, BaseProductSupplier, SUPPLIES>
    },
    supplied: SUPPLIED
) {
    // First render captures the initial assembly.
    // Child components won't be in `components` until they've mounted and
    // subscribed via useStored. On subsequent renders, subscribed children
    // are detected and notified of changes. The useStored fallback
    // (element$ ?? component$) ensures children receive initial values
    // before they're registered in the store.
    const [first] = useState(() => supplier.assemble(supplied))

    const components = [first.supplier.name, ...first.$.keys].reduce<
        Record<string, Product>
    >((acc, key) => {
        const supply = first.$({ name: key })
        if (!isProduct(supply)) return acc
        return store.isSubscribed(supply.$) ? { ...acc, [key]: supply } : acc
    }, {})

    Object.entries(components).forEach(([key, component]) => {
        if (
            ![
                ...component.supplier.suppliers,
                ...component.supplier.optionals,
                ...component.supplier.hired
            ].some(
                (supplier) =>
                    supplier.name in supplied &&
                    supplied[supplier.name] !==
                        (store.get(component.$)?.({ name: supplier.name }) ??
                            undefined)
            )
        )
            return
        store.set(
            component.$,
            component.supplier.assemble({ ...supplied, ...components }).$
        )
    })

    return first.supplier.name in components ?
            first
        :   supplier.assemble({ ...supplied, ...components })
}

const store = {
    set(
        component$: $<Supplier[], ResourceSupplier[]>,
        element$: $<Supplier[], ResourceSupplier[]>
    ) {
        store._.state.set(component$, element$)
        store._.listeners.get(component$)?.forEach((listener) => listener())
    },
    get(component$: $<Supplier[], ResourceSupplier[]>) {
        return store._.state.get(component$)
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
    isSubscribed(component$: $<Supplier[], ResourceSupplier[]>) {
        return !!store._.listeners.get(component$)
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
