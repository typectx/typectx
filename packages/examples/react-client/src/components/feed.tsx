import { $$postsQuery } from "@/api"
import { market } from "@/market"
import { $$Post } from "@/components/post"
import { useQuery } from "@tanstack/react-query"
import { useStored } from "@typectx/react-client"

export const $$Feed = market.offer("Feed").asProduct({
    suppliers: [$$postsQuery, $$Post],
    factory: (init$, $$) => {
        console.log("Feed factory called")
        return () => {
            const $ = useStored(init$)
            const { data: posts } = useQuery($($$postsQuery).unpack())
            if (!posts) {
                return <div>Loading posts...</div>
            }

            const Post = $($$Post).unpack()

            return (
                <div className="space-y-6">
                    {posts.map((post) => {
                        return <Post key={post.id} post={post} />
                    })}
                </div>
            )
        }
    }
})
