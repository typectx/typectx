import { $commentsQuery, $userQuery, $usersQuery } from "@/api"
import { market } from "@/market"
import type { Comment, Post } from "@/api"
import { useState } from "react"
import { $Comment } from "@/components/comment"
import { index } from "typectx"
import { dynamics } from "@/dynamics"
import { useQuery } from "@tanstack/react-query"
import { $SelectSession } from "./session"
import { useAssembleComponent, useDeps } from "@typectx/react"
import { useAssertStable } from "@/hooks"

export const $Post = market.add("Post").static({
    suppliers: [
        dynamics.$session,
        $usersQuery,
        $commentsQuery,
        $userQuery,
        dynamics.$defaultUser
    ],
    optionals: [dynamics.$post],
    assemblers: [$Comment, $SelectSession],
    factory: (initDeps, ctx) =>
        function Post({ post }: { post: Post }) {
            const {
                userQuery,
                defaultUser,
                session: [session],
                usersQuery,
                commentsQuery
            } = useDeps(initDeps)
            const { data: defaultSession } = useQuery(userQuery(defaultUser))
            const { data: users } = useQuery(usersQuery)
            const { data: comments } = useQuery(commentsQuery(post.id))
            // Local session override - falls back to parent session until user changes it
            const [postSession, setPostSession] =
                useState<typeof session>(undefined)

            const assertStableSelectSession = useAssertStable()
            const assertStableComment = useAssertStable()

            const newCtx = index(
                dynamics.$session.pack([
                    postSession ?? session ?? defaultSession,
                    setPostSession
                ]),
                dynamics.$post.pack(post)
            )

            const CommentProduct = useAssembleComponent(
                ctx($Comment).hire($SelectSession),
                newCtx
            )

            if (!users || !comments) {
                return <div>Loading users or comments...</div>
            }

            const SelectSession = assertStableSelectSession(
                CommentProduct.deps[$SelectSession.name]
            )
            const Comment = assertStableComment(CommentProduct.unpack())

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
