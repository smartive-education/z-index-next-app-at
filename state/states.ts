import { Post, Reply } from '../models';

export interface PostsState {
    posts: Post[];
    hasMore: boolean;
}

export interface PostDetailState {
    post: Post;
    replies: Reply[];
}