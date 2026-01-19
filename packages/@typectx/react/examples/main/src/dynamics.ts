import { market } from "@/market"
import type { Post, User } from "@/api"

export const dynamics = {
    $defaultUser: market.add("defaultUser").dynamic<string>(),
    $session: market
        .add("session")
        .dynamic<[User | undefined, (user: User | undefined) => void]>(),
    $post: market.add("post").dynamic<Post>()
}
