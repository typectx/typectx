import type { RequestSupplier, Supplier } from "#types"

export const request = <NAME extends string>(name: NAME) => {
    return function <CONSTRAINT = any>(): RequestSupplier<NAME, CONSTRAINT> {
        return {
            name,
            suppliers: [],
            optionals: [],
            assemblers: [],
            hired: [],
            pack<THIS extends Supplier, VALUE extends CONSTRAINT>(
                this: THIS,
                value: VALUE
            ) {
                return {
                    unpack: () => value,
                    deps: {} as never,
                    supplies: {} as never,
                    supplier: this,
                    _ctx: (() => null) as never,
                    _packed: true as const
                }
            },
            _constraint: null as unknown as CONSTRAINT,
            _request: true as const,
            _mock: false as const
        }
    }
}
