import { describe } from '@jest/globals';
import { mumbleDetailReducer } from '../state/mumble-detail';
import {
  initialPostDetailState,
  singleMockPost,
  singleMockReply,
  singleMockReply2,
} from '../test-data/test.data';
import { Mumble } from '../models';

describe('postDetailReducer', () => {
  describe('CREATE', () => {
    it('should add new reply to the first place', () => {
      expect(
        mumbleDetailReducer(
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
        post: {
          ...initialPostDetailState.post,
          replyCount: 1,
        },
        replies: [singleMockReply2, singleMockReply],
      });
    });
  });

  describe('LIKE-POST', () => {
    it('should increase like count and set likedByUser on the post', () => {
      const likedPost: Mumble = {
        ...singleMockPost,
        likeCount: singleMockPost.likeCount + 1,
        likedByUser: true,
      };
      expect(
        mumbleDetailReducer(
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
      const dislikedPost: Mumble = {
        ...singleMockPost,
        likeCount: singleMockPost.likeCount - 1,
        likedByUser: false,
      };
      expect(
        mumbleDetailReducer(
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
      const likedReply: Mumble = {
        ...singleMockReply,
        likeCount: singleMockReply.likeCount + 1,
        likedByUser: true,
      };
      expect(
        mumbleDetailReducer(
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
      const dislikedReply: Mumble = {
        ...singleMockReply,
        likeCount: singleMockReply.likeCount - 1,
        likedByUser: false,
      };
      expect(
        mumbleDetailReducer(
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
