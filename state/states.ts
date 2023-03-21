import { MumbleUser, Post, PostWithUserData, Reply } from '../models';

export interface PostsState {
    posts: PostWithUserData[];
    hasMore: boolean;
}

export interface PostDetailState {
    post: Post;
    replies: Reply[];
}

export interface UserState {
    loggedInUser?: MumbleUser;
    mumbleUsers: Map<string, MumbleUser>;
}

export const initialUserState: UserState = {
    loggedInUser: undefined,
    mumbleUsers: new Map()
}