import type { Post, User } from "@/api"
import { supplier } from "typectx"

export const req = {
    $defaultUser: supplier("defaultUser").request<string>(),
    $session:
        supplier("session").request<
            [User | undefined, (user: User | undefined) => void]
        >(),
    $post: supplier("post").request<Post>()
}
