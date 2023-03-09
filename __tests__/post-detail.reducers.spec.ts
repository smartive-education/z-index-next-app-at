import { describe } from '@jest/globals';
import { Post, Reply } from '../models';
import { postDetailReducer } from '../reducers/post-detail.reducers';
import {
  initialPostDetailState,
  singleMockPost,
  singleMockReply,
  singleMockReply2,
} from '../test-data/test.data';

describe('postDetailReducer', () => {
  describe('CREATE', () => {
    it('should add new reply to the first place', () => {
      expect(
        postDetailReducer(
          {
            ...initialPostDetailState,
            replies: [singleMockReply],
          },
          {
            type: 'CREATE',
            reply: singleMockReply2,
          }
        )
      ).toEqual({
        ...initialPostDetailState,
        replies: [singleMockReply2, singleMockReply],
      });
    });
  });

  describe('LIKE-POST', () => {
    it('should increase like count and set likedByUser on the post', () => {
      const likedPost: Post = {
        ...singleMockPost,
        likeCount: singleMockPost.likeCount + 1,
        likedByUser: true,
      };
      expect(
        postDetailReducer(
          {
            ...initialPostDetailState,
            post: singleMockPost,
          },
          {
            type: 'LIKE-POST',
            isLiked: true,
            id: singleMockPost.id,
          }
        )
      ).toEqual({
        ...initialPostDetailState,
        post: likedPost,
      });
    });

    it('should decrease like count and unset likedByUser on the post', () => {
      const dislikedPost: Post = {
        ...singleMockPost,
        likeCount: singleMockPost.likeCount - 1,
        likedByUser: false,
      };
      expect(
        postDetailReducer(
          {
            ...initialPostDetailState,
            post: singleMockPost,
          },
          {
            type: 'LIKE-POST',
            isLiked: false,
            id: singleMockPost.id,
          }
        )
      ).toEqual({
        ...initialPostDetailState,
        post: dislikedPost,
      });
    });
  });

  describe('LIKE-REPLY', () => {
    it('should increase like count and set likedByUser on the first reply', () => {
      const likedReply: Reply = {
        ...singleMockReply,
        likeCount: singleMockReply.likeCount + 1,
        likedByUser: true,
      };
      expect(
        postDetailReducer(
          {
            ...initialPostDetailState,
            replies: [singleMockReply, singleMockReply2],
          },
          {
            type: 'LIKE-REPLY',
            isLiked: true,
            id: singleMockReply.id,
          }
        )
      ).toEqual({
        ...initialPostDetailState,
        replies: [likedReply, singleMockReply2],
      });
    });

    it('should decrease like count and unset likedByUser on the first reply', () => {
      const dislikedReply: Reply = {
        ...singleMockReply,
        likeCount: singleMockReply.likeCount - 1,
        likedByUser: false,
      };
      expect(
        postDetailReducer(
          {
            ...initialPostDetailState,
            replies: [singleMockReply, singleMockReply2],
          },
          {
            type: 'LIKE-REPLY',
            isLiked: false,
            id: singleMockReply.id,
          }
        )
      ).toEqual({
        ...initialPostDetailState,
        replies: [dislikedReply, singleMockReply2],
      });
    });
  });
});
