import { team } from "#service/main"
import type { AppServiceGuard } from "#types/guards"
import type { AppService } from "#types/public"
import type { Supply, UnknownAppService } from "#types/public"
import type { SupplyDeps } from "#types/records"
import type { MergeStringTuples } from "#types/utils"
import type { Merge } from "#utils"
import { assertAppServices } from "#validation"

/**
 * Hires additional services into the dependency chain of this app service.
 * This allows replacing or adding services composition-root style for testing,
 * mocking, or batch assembly. Hired services override services with matching
 * names in the transitive dependency tree.
 *
 * @param hiredServices - App services to hire (replace/add to the team)
 * @returns A new app service with the hired services merged into the team
 * @public
 */
export function Hire() {
    return function hire<
        THIS extends Omit<UnknownAppService, "_hired" | "_composite"> & {
            _hired: string[]
            _composite: boolean
        },
        HIRED extends UnknownAppService[] = []
    >(
        this: THIS,
        ...hired: [...HIRED]
    ): AppServiceGuard<
        AppService<
            THIS["name"],
            THIS["_constraint"],
            THIS["_optionalKeys"],
            THIS["_known"],
            Merge<
                {
                    [SERVICE in HIRED[number] as SERVICE["name"]]?: Supply<SERVICE>
                },
                Merge<
                    Omit<
                        THIS["_toSupply"],
                        keyof HIRED[number]["_oldToSupply"]
                    >,
                    HIRED[number]["_toSupply"]
                >
            >,
            MergeStringTuples<
                THIS["_hired"],
                {
                    [K in keyof HIRED]: HIRED[K]["name"]
                }
            >,
            false,
            true
        >,
        HIRED
    > {
        assertAppServices(this.name, hired, true)
        const mergedServices = [
            ...this._services.filter(
                (oldService) =>
                    !hired.some(
                        (newService) => newService.name === oldService.name
                    )
            ),
            ...hired
        ]

        const mergedHired = [
            ...this._hired.filter(
                (oldName) =>
                    !hired.some((newService) => newService.name === oldName)
            ),
            ...hired.map((newService) => newService.name)
        ] as MergeStringTuples<
            THIS["_hired"],
            {
                [K in keyof HIRED]: HIRED[K]["name"]
            }
        >

        const _toSupply = null as unknown as Merge<
            {
                [SERVICE in HIRED[number] as SERVICE["name"]]?: Supply<SERVICE>
            },
            Merge<
                Omit<THIS["_toSupply"], keyof HIRED[number]["_oldToSupply"]>,
                HIRED[number]["_toSupply"]
            >
        >
        const _deps = null as unknown as SupplyDeps<
            typeof _toSupply,
            THIS["_optionalKeys"]
        >

        return {
            ...this,
            _services: mergedServices,
            _hired: mergedHired,
            _team: team(this.name, mergedServices, this._optionals),
            _toSupply,
            _deps,
            _oldToSupply: _toSupply,
            _oldDeps: _deps,
            _mock: false as const,
            _composite: true as const
        } satisfies AppService<
            THIS["name"],
            THIS["_constraint"],
            THIS["_optionalKeys"],
            THIS["_known"],
            Merge<
                {
                    [SERVICE in HIRED[number] as SERVICE["name"]]?: Supply<SERVICE>
                },
                Merge<
                    Omit<
                        THIS["_toSupply"],
                        keyof HIRED[number]["_oldToSupply"]
                    >,
                    HIRED[number]["_toSupply"]
                >
            >,
            MergeStringTuples<
                THIS["_hired"],
                {
                    [K in keyof HIRED]: HIRED[K]["name"]
                }
            >,
            false,
            true
        > as any
    }
}
