import { Post, PostWithUserData, Reply } from '../models'

export interface LoadPosts {
    type: 'LOAD';
    posts: PostWithUserData[];
    count: number;
}

export interface CreatePost {
    type: 'CREATE';
    post: PostWithUserData;
}

export interface LikePost {
    type: 'LIKE';
    id: string;
    isLiked: boolean;
}

export type PostAction = LoadPosts | CreatePost | LikePost;

export interface CreateReply {
    type: 'CREATE';
    reply: Reply;
}

export interface LikePostDetail {
    type: 'LIKE-POST';
    id: string;
    isLiked: boolean;
}

export interface LikeReply {
    type: 'LIKE-REPLY';
    id: string;
    isLiked: boolean;
}

export type PostDetailAction = CreateReply | LikePostDetail | LikeReply;