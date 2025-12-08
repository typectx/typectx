import { market } from "@/market"
import { ctx } from "@/context"
import type { Reply } from "@/api"
import { useInit$ } from "@typectx/react"
export const $$Reply = market.offer("reply").asProduct({
    suppliers: [ctx.$$post, ctx.$$session],
    factory: (init$, $$) =>
        function Reply({ reply }: { reply: Reply }) {
            const $ = useInit$(init$)
            const [session] = $(ctx.$$session).unpack()
            const post = $(ctx.$$post).unpack()
            return (
                <div className="border-2 border-orange-500 rounded-lg p-2 bg-gray-800 ml-6">
                    <div className="flex justify-between items-center">
                        <h5 className="text-sm font-medium text-orange-300">
                            💭 Reply: {reply.id}
                        </h5>
                    </div>

                    <div className="mt-2 p-2 bg-gray-700 rounded text-xs">
                        <div className="space-y-1 text-gray-300">
                            <div>
                                👤 Current User:{" "}
                                <span className="text-orange-300">
                                    {session?.id ?? "Guest"}
                                </span>
                            </div>
                            <div>
                                📄 Current Post:{" "}
                                <span className="text-purple-300">
                                    {post.id}
                                </span>
                            </div>
                            <div>
                                💬 Comment:{" "}
                                <span className="text-green-300">
                                    {reply.commentId}
                                </span>
                            </div>
                            <div>
                                💭 Reply:{" "}
                                <span className="text-orange-300">
                                    {reply.id}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
})
