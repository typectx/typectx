import { $Feed } from "@/components/feed"
import { market } from "@/market"
import { $SelectSession } from "@/components/session"
import { resources } from "@/resources"
import { $userQuery, type User } from "@/api"
import { useState } from "react"
import { index } from "typectx"
import { useAssembleComponent, useDeps } from "@typectx/react"
import { useAssertStable } from "@/hooks"
import { useQuery } from "@tanstack/react-query"

export const $App = market.offer("App").asProduct({
    suppliers: [$userQuery, resources.$defaultUser],
    assemblers: [$SelectSession, $Feed],
    factory: (initDeps, ctx) =>
        function App() {
            const { userQuery, defaultUser } = useDeps(initDeps)
            const { data: defaultSession } = useQuery(userQuery(defaultUser))
            const [session, setSession] = useState<User | undefined>(undefined)
            const assertStableFeed = useAssertStable()
            const assertStableSelectSession = useAssertStable()

            const FeedProduct = useAssembleComponent(
                ctx($Feed).hire($SelectSession),
                index(
                    resources.$session.pack([
                        session ?? defaultSession,
                        setSession
                    ])
                )
            )

            const Feed = assertStableFeed(FeedProduct.unpack())

            const SelectSession = assertStableSelectSession(
                FeedProduct.deps[$SelectSession.name]
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
