import { describe } from '@jest/globals';
import { Post } from '../models';
import { postReducer } from '../reducers/post.reducers';
import { PostsState } from '../state/states';
import {
  initialPostState,
  mockPosts,
  singleMockPost,
} from '../test-data/test.data';

describe('postReducer', () => {
  const expectedPostState: PostsState = {
    posts: mockPosts,
    hasMore: true,
  };

  describe('LOAD', () => {
    it('should add loaded elements to the post state', () => {
      expect(
        postReducer(initialPostState, {
          type: 'LOAD',
          posts: mockPosts,
          count: 5,
        })
      ).toEqual(expectedPostState);
    });
    it('should add loaded elements to the post state with hasMore false', () => {
      expect(
        postReducer(initialPostState, {
          type: 'LOAD',
          posts: mockPosts,
          count: mockPosts.length,
        })
      ).toEqual({
        ...expectedPostState,
        hasMore: false,
      });
    });

    it('should not fail when loaded post is undefined', () => {
      expect(
        postReducer(initialPostState, {
          type: 'LOAD',
          posts: undefined as unknown as Post[],
          count: 0,
        })
      ).toEqual(initialPostState);
    });
  });

  describe('CREATE', () => {
    it('should add element to the first place', () => {
      expect(
        postReducer(
          {
            ...initialPostState,
            posts: mockPosts,
          },
          {
            type: 'CREATE',
            post: singleMockPost,
          }
        )
      ).toEqual({
        posts: [singleMockPost, ...mockPosts],
        hasMore: false,
      });
    });
  });

  describe('LIKE', () => {
    it('should increase like count and set likedByUser on the first post', () => {
      const likedPost: Post = {
        ...mockPosts[0],
        likeCount: mockPosts[0].likeCount + 1,
        likedByUser: true,
      };
      expect(
        postReducer(
          {
            ...initialPostState,
            posts: mockPosts,
          },
          {
            type: 'LIKE',
            isLiked: true,
            id: mockPosts[0].id,
          }
        )
      ).toEqual({
        posts: [likedPost, mockPosts[1], mockPosts[2]],
        hasMore: false,
      });
    });

    it('should decrease like count and unset likedByUser on the first post', () => {
      const dislikedPost: Post = {
        ...mockPosts[0],
        likeCount: mockPosts[0].likeCount - 1,
        likedByUser: false,
      };
      expect(
        postReducer(
          {
            ...initialPostState,
            posts: mockPosts,
          },
          {
            type: 'LIKE',
            isLiked: false,
            id: mockPosts[0].id,
          }
        )
      ).toEqual({
        posts: [dislikedPost, mockPosts[1], mockPosts[2]],
        hasMore: false,
      });
    });
  });
});
