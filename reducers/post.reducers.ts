import { PostAction } from '../state/actions';
import { PostsState } from '../state/states';

export function postReducer(state: PostsState, action: PostAction): PostsState {
  switch (action.type) {
    case 'LOAD':
      return {
        ...state,
        hasMore: state.posts.length + action.posts?.length < action.count,
        posts: [...state.posts, ...(action.posts || [])],
      };
    case 'CREATE':
      return {
        ...state,
        posts: [action.post, ...state.posts],
      };
    case 'LIKE':
      return {
        ...state,
        posts: state.posts.map((post) => {
          if (post.id === action.id) {
            return {
              ...post,
              likeCount: action.isLiked
                ? post.likeCount + 1
                : post.likeCount - 1,
              likedByUser: action.isLiked,
            };
          }
          return post;
        }),
      };
  }
}
