import { $$postsQuery } from "@/api"
import { market } from "@/market"
import { $$Post } from "@/components/post"
import { ctx } from "@/context"
import { index } from "typectx"
import { useQuery } from "@tanstack/react-query"
import { use$ } from "@typectx/react-client"

export const $$Feed = market.offer("Feed").asProduct({
    suppliers: [$$postsQuery, ctx.$$session],
    assemblers: [$$Post],
    factory: (init$, $$) => {
        console.log("Feed factory called")
        return () => {
            const $ = use$(init$, $$)
            const { data: posts } = useQuery($($$postsQuery).unpack())
            if (!posts) {
                return <div>Loading posts...</div>
            }

            return (
                <div className="space-y-6">
                    {posts.map((post) => {
                        const Post = $$($$Post)
                            .assemble(
                                index($(ctx.$$session), ctx.$$post.pack(post))
                            )
                            .unpack()
                        return <Post key={post.id} />
                    })}
                </div>
            )
        }
    }
})
