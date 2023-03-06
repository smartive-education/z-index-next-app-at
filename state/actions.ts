import { Post } from '../models'

export type PostActionTypes = 'LOAD' | 'CREATE' | 'LIKE'

export interface LoadPosts {
    type: 'LOAD';
    posts: Post[];
    count: number;
}

export interface CreatePost {
    type: 'CREATE';
    post: Post;
}

export interface LikePost {
    type: 'LIKE';
    id: string;
    isLiked: boolean;
}

export type PostAction = LoadPosts | CreatePost | LikePost;

