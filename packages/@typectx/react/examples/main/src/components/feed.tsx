import { $postsQuery } from "@/api"
import { $Post } from "@/components/post"
import { useQuery } from "@tanstack/react-query"
import { useDeps } from "@typectx/react"
import { useAssertStable } from "@/hooks"
import { supplier } from "typectx"

export const $Feed = supplier("Feed").product({
    suppliers: [$postsQuery, $Post],
    factory: (initDeps) =>
        function Feed() {
            const { postsQuery, Post } = useDeps(initDeps)
            const { data: posts } = useQuery(postsQuery)

            const assertStablePost = useAssertStable()
            if (!posts) {
                return <div>Loading posts...</div>
            }

            assertStablePost(Post)

            return (
                <div className="space-y-6">
                    {posts.map((post) => {
                        return <Post key={post.id} post={post} />
                    })}
                </div>
            )
        }
})
