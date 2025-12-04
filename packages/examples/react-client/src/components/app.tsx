import { $$Feed } from "@/components/feed"
import { market } from "@/market"
import { $$userQuery } from "@/api"
import { $$SelectSession } from "@/components/session"
import { ctx } from "@/context"
import type { User } from "@/api"
import { useState } from "react"
import { index } from "typectx"
import { useQuery } from "@tanstack/react-query"
import { useAssemble, useStored } from "@typectx/react-client"
import { $$Post } from "./post"

export const $$App = market.offer("App").asProduct({
    suppliers: [$$userQuery],
    assemblers: [$$SelectSession, $$Feed, $$Post],
    factory: (init$, $$) => {
        console.log("App factory called")
        return ({ defaultUserId }: { defaultUserId: string }) => {
            const $ = useStored(init$)
            const { data: defaultSession } = useQuery(
                $($$userQuery).unpack()(defaultUserId)
            )
            const [session, setSession] = useState<User | undefined>()

            const $Feed = useAssemble(
                $$($$Feed).hire($$($$SelectSession), $$($$Post)),
                index(
                    ctx.$$session.pack([session ?? defaultSession, setSession])
                )
            )
            if (!defaultSession) {
                return <div>Loading default user...</div>
            }

            const Feed = $Feed.unpack()
            const SelectSession = $Feed.$($$SelectSession).unpack()

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
    }
})
