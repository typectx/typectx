import { $$postsQuery } from "@/api"
import { market } from "@/market"
import { $$Post } from "@/components/post"
import { useQuery } from "@tanstack/react-query"
import { useInit$ } from "@typectx/react"
import { useAssertStable } from "@/hooks"

export const $$Feed = market.offer("Feed").asProduct({
    suppliers: [$$postsQuery, $$Post],
    factory: (init$, $$) =>
        function Feed() {
            const $ = useInit$(init$)
            const { data: posts } = useQuery($($$postsQuery).unpack())

            const assertStablePost = useAssertStable()
            if (!posts) {
                return <div>Loading posts...</div>
            }

            const Post = assertStablePost($($$Post).unpack())

            return (
                <div className="space-y-6">
                    {posts.map((post) => {
                        return <Post key={post.id} post={post} />
                    })}
                </div>
            )
        }
})
