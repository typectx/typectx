import { $$commentsQuery, $$usersQuery } from "@/api"
import { market } from "@/market"
import type { Comment, Post } from "@/api"
import { useState } from "react"
import { $$Comment } from "@/components/comment"
import { index } from "typectx"
import { ctx } from "@/context"
import { useQuery } from "@tanstack/react-query"
import { $$SelectSession } from "./session"
import { useAssemble, useStored } from "@typectx/react-client"

export const $$Post = market.offer("Post").asProduct({
    suppliers: [ctx.$$session, $$usersQuery, $$commentsQuery],
    optionals: [ctx.$$post],
    assemblers: [$$Comment, $$SelectSession],
    factory: (init$, $$) => {
        console.log("Post factory called")
        return ({ post }: { post: Post }) => {
            const $ = useStored(init$)
            const [session] = $(ctx.$$session).unpack()
            const { data: users } = useQuery($($$usersQuery).unpack())
            const { data: comments } = useQuery(
                $($$commentsQuery).unpack()(post.id)
            )
            const [postSession, setPostSession] = useState(session)

            const newCtx = index(
                $$(ctx.$$session).pack([postSession, setPostSession]),
                $$(ctx.$$post).pack(post)
            )

            const $Comment = useAssemble(
                $$($$Comment).hire($$SelectSession),
                newCtx
            )

            if (!users || !comments) {
                return <div>Loading users or comments...</div>
            }

            const SelectSession = $Comment.$($$SelectSession).unpack()
            const Comment = $Comment.unpack()

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
    }
})
