import { Mumble } from '../models';

export interface InitMumbleDetailState {
    type: 'INIT';
    post: Mumble;
    replies: Mumble[]
}

export interface CreateReply {
    type: 'CREATE';
    reply: Mumble;
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

export type PostDetailAction = CreateReply | LikePostDetail | LikeReply | InitMumbleDetailState;