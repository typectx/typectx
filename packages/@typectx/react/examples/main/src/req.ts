import { market } from "@/market"
import type { Post, User } from "@/api"

export const req = {
    $defaultUser: market.add("defaultUser").request<string>(),
    $session: market
        .add("session")
        .request<[User | undefined, (user: User | undefined) => void]>(),
    $post: market.add("post").request<Post>()
}
