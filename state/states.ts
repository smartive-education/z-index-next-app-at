import { Post } from '../models';

export interface PostsState {
    posts: Post[]
    hasMore: boolean;
}