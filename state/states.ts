import { Post, PostWithUserData, Reply } from '../models';

export interface PostsState {
    posts: PostWithUserData[];
    hasMore: boolean;
}

export interface PostDetailState {
    post: Post;
    replies: Reply[];
}
