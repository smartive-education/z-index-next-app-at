import { PostWithUserData, ReplyWithUserData } from '../models';

export interface PostsState {
    posts: PostWithUserData[];
    hasMore: boolean;
}

export interface PostDetailState {
    post: PostWithUserData;
    replies: ReplyWithUserData[];
}
