import { PostDetailAction } from '../state/actions';
import { PostDetailState } from '../state/states';

export function postDetailReducer(
  state: PostDetailState,
  action: PostDetailAction
): PostDetailState {
  switch (action.type) {
    case 'INIT':
      return {
        post: action.post,
        replies: action.replies,
      };
    case 'CREATE':
      return {
        ...state,
        post: {
          ...state.post,
          replyCount: state.post.replyCount + 1,
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
  }
}
