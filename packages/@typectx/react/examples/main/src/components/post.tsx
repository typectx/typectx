import { $$commentsQuery, $$userQuery, $$usersQuery } from "@/api"
import { market } from "@/market"
import type { Comment, Post } from "@/api"
import { useState } from "react"
import { $$Comment } from "@/components/comment"
import { index } from "typectx"
import { ctx } from "@/context"
import { useQuery } from "@tanstack/react-query"
import { $$SelectSession } from "./session"
import { useAssembleComponent, useInit$ } from "@typectx/react"
import { useAssertStable } from "@/hooks"

export const $$Post = market.offer("Post").asProduct({
    suppliers: [
        ctx.$$session,
        $$usersQuery,
        $$commentsQuery,
        $$userQuery,
        ctx.$$defaultUser
    ],
    optionals: [ctx.$$post],
    assemblers: [$$Comment, $$SelectSession],
    factory: (init$, $$) =>
        function Post({ post }: { post: Post }) {
            const $ = useInit$(init$)
            const { data: defaultSession } = useQuery(
                $($$userQuery).unpack()($(ctx.$$defaultUser).unpack())
            )
            const [session] = $(ctx.$$session).unpack()
            const { data: users } = useQuery($($$usersQuery).unpack())
            const { data: comments } = useQuery(
                $($$commentsQuery).unpack()(post.id)
            )
            // Local session override - falls back to parent session until user changes it
            const [postSession, setPostSession] =
                useState<typeof session>(undefined)

            const assertStableSelectSession = useAssertStable()
            const assertStableComment = useAssertStable()

            const newCtx = index(
                $$(ctx.$$session).pack([
                    postSession ?? session ?? defaultSession,
                    setPostSession
                ]),
                $$(ctx.$$post).pack(post)
            )

            const $Comment = useAssembleComponent(
                $$($$Comment).hire($$SelectSession),
                newCtx
            )

            if (!users || !comments) {
                return <div>Loading users or comments...</div>
            }

            const SelectSession = assertStableSelectSession(
                $Comment.$($$SelectSession).unpack()
            )
            const Comment = assertStableComment($Comment.unpack())

            return (
                <div className="border-2 border-purple-500 rounded-lg p-4 bg-gray-800">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-purple-300">
                            📝 Post: {post.id}
                        </h3>
                        <SelectSession />
                    </div>

                    <div className="space-y-3">
                        {comments.map((comment: Comment) => (
                            <Comment key={comment.id} comment={comment} />
                        ))}
                    </div>
                </div>
            )
        }
})
