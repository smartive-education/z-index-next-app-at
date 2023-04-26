import { Mumble } from '../models';

export interface MumbleDetailState {
  post: Mumble;
  replies: Mumble[];
  hasError: boolean;
}

export interface InitMumbleDetailState {
  type: 'INIT';
  post: Mumble;
  replies: Mumble[];
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

export interface SetError {
  type: 'SET_ERROR';
  hasError: boolean;
}

export type PostDetailAction =
  | CreateReply
  | LikePostDetail
  | LikeReply
  | InitMumbleDetailState
  | SetError;

export function mumbleDetailReducer(
  state: MumbleDetailState,
  action: PostDetailAction
): MumbleDetailState {
  switch (action.type) {
    case 'INIT':
      return {
        post: action.post,
        replies: action.replies,
        hasError: false,
      };
    case 'CREATE':
      return {
        ...state,
        post: {
          ...state.post,
          replyCount: (state.post.replyCount || 0) + 1,
        },
        replies: [action.reply, ...state.replies],
      };
    case 'LIKE-POST':
      return {
        ...state,
        post: {
          ...state.post,
          likeCount: action.isLiked
            ? state.post.likeCount + 1
            : state.post.likeCount - 1,
          likedByUser: action.isLiked,
        },
      };
    case 'LIKE-REPLY':
      return {
        ...state,
        replies: state.replies.map((reply) => {
          if (reply.id === action.id) {
            return {
              ...reply,
              likeCount: action.isLiked
                ? reply.likeCount + 1
                : reply.likeCount - 1,
              likedByUser: action.isLiked,
            };
          } else {
            return reply;
          }
        }),
      };
    case 'SET_ERROR':
      return {
        ...state,
        hasError: action.hasError,
      };
  }
}
