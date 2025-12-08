import { $$Feed } from "@/components/feed"
import { market } from "@/market"
import { $$SelectSession } from "@/components/session"
import { ctx } from "@/context"
import { $$userQuery, type User } from "@/api"
import { useState } from "react"
import { index } from "typectx"
import { useAssembleComponent, useInit$ } from "@typectx/react"
import { useAssertStable } from "@/hooks"
import { useQuery } from "@tanstack/react-query"

export const $$App = market.offer("App").asProduct({
    suppliers: [$$userQuery, ctx.$$defaultUser],
    assemblers: [$$SelectSession, $$Feed],
    factory: (init$, $$) =>
        function App() {
            const $ = useInit$(init$)
            const { data: defaultSession } = useQuery(
                $($$userQuery).unpack()($(ctx.$$defaultUser).unpack())
            )
            const [session, setSession] = useState<User | undefined>(undefined)
            const assertStableFeed = useAssertStable()
            const assertStableSelectSession = useAssertStable()

            const $Feed = useAssembleComponent(
                $$($$Feed).hire($$SelectSession),
                index(
                    ctx.$$session.pack([session ?? defaultSession, setSession])
                )
            )

            const Feed = assertStableFeed($Feed.unpack())

            const SelectSession = assertStableSelectSession(
                $Feed.$($$SelectSession).unpack()
            )

            return (
                <div className="min-h-screen bg-gray-900 text-white p-6">
                    <div className="max-w-2xl mx-auto">
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold text-center mb-4">
                                Social Feed Wireframe
                            </h1>
                            <SelectSession />
                        </header>
                        <Feed />
                    </div>
                </div>
            )
        }
})
