import { interpret } from 'xstate';
import { MumbleUsers } from '../models';
import { timelineMachine } from '../state/timeline-machine';
import { expectedMumble, expectedUser } from '../test-data/test.data';

const existingUsers: MumbleUsers = { [expectedUser.id]: expectedUser };
const loggedInUser = {
  ...expectedUser,
  accessToken: 'token',
};
const notLoggedInUser = expectedUser;
jest.mock('../services/mumble.service', () => ({
  __esModule: true,
  getPostsWithUserData: (token: string) => {
    if (token) {
      return Promise.resolve({
        count: 2,
        posts: [expectedMumble],
        users: existingUsers,
      });
    } else {
      return Promise.reject('Unauthenticated');
    }
  },
}));

jest.mock('../services/post.service', () => ({
  __esModule: true,
  createPost: (text?: string) => {
    if (text === 'failed') {
      return Promise.reject('failed');
    }
    return Promise.resolve(expectedMumble);
  },
}));

jest.mock('../services/like.service', () => ({
  __esModule: true,
  like: (id?: string) => {
    if (id === 'failed') {
      return Promise.reject('failed');
    }

    return Promise.resolve({
      id: expectedMumble.id,
      isLike: true,
    });
  },
}));

describe('timeline-machine', () => {
  it('should transition from empty to idle', () => {
    const timelineService = interpret(timelineMachine).onTransition((state) => {
      if (state.matches('idle')) {
        expect(state.context.hasMore).toBeTruthy();
        expect(state.context.posts).toEqual([expectedMumble]);
        expect(state.context.mumbleUsers).toEqual(existingUsers);
        expect(state.context.failedOperation).toEqual('none');
      }
      if (state.matches('initFailed')) {
        fail('initFailed');
      }
    });

    timelineService.start();

    timelineService.send({ type: 'INIT_TIMELINE', loggedInUser });
  });

  it('should transition from empty to initFailed if user is not loggedIn', () => {
    const timelineService = interpret(timelineMachine).onTransition((state) => {
      if (state.matches('initFailed')) {
        expect(state.context.failedOperation).toEqual('init');
      }
      if (state.matches('idle')) {
        fail('should not transition to idle');
      }
    });

    timelineService.start();

    timelineService.send({ type: 'INIT_TIMELINE', notLoggedInUser });
  });

  it('should update timeline', () => {
    const timelineService = interpret(timelineMachine).onTransition((state) => {
      if (
        state.history?.value === 'timelineInitializing' &&
        state.matches('idle')
      ) {
        timelineService.send({ type: 'UPDATE_TIMELINE_DATA' });
      }
      if (
        state.history?.value === 'timeLineUpdating' &&
        state.matches('idle')
      ) {
        expect(state.context.hasMore).toBeFalsy();
        expect(state.context.posts).toEqual([expectedMumble, expectedMumble]);
        expect(state.context.mumbleUsers).toEqual(existingUsers);
        expect(state.context.failedOperation).toEqual('none');
      }
      if (state.matches('updateFailed')) {
        fail('updateFailed');
      }
    });

    timelineService.start();

    timelineService.send({ type: 'INIT_TIMELINE', loggedInUser });
  });

  it('should create post', () => {
    const timelineService = interpret(timelineMachine).onTransition((state) => {
      if (
        state.history?.value === 'timelineInitializing' &&
        state.matches('idle')
      ) {
        timelineService.send({ type: 'CREATE_POST' });
      }
      if (state.history?.value === 'create' && state.matches('idle')) {
        expect(state.context.posts).toEqual([expectedMumble, expectedMumble]);
        expect(state.context.failedOperation).toEqual('none');
      }
      if (state.matches('mutationFailed')) {
        fail('mutationFailed');
      }
    });

    timelineService.start();

    timelineService.send({ type: 'INIT_TIMELINE', loggedInUser });
  });

  it('should transition to createFailed', () => {
    const timelineService = interpret(timelineMachine).onTransition((state) => {
      if (
        state.history?.value === 'timelineInitializing' &&
        state.matches('idle')
      ) {
        timelineService.send({ type: 'CREATE_POST', text: 'failed' });
      }
      if (state.history?.value === 'create' && state.matches('idle')) {
        fail('should not transition to idle');
      }
      if (state.matches('mutationFailed')) {
        expect(state.context.failedOperation).toEqual('create');
      }
    });

    timelineService.start();

    timelineService.send({ type: 'INIT_TIMELINE', loggedInUser });
  });

  it('should create like', () => {
    const timelineService = interpret(timelineMachine).onTransition((state) => {
      if (
        state.history?.value === 'timelineInitializing' &&
        state.matches('idle')
      ) {
        timelineService.send({
          type: 'LIKE_POST',
          id: expectedMumble.id,
          isLiked: true,
        });
      }
      if (state.history?.value === 'create' && state.matches('idle')) {
        expect(state.context.posts).toEqual([
          {
            ...expectedMumble,
            likeCount: expectedMumble.likeCount + 1,
            likedByUser: true,
          },
        ]);
        expect(state.context.failedOperation).toEqual('none');
      }
      if (state.matches('mutationFailed')) {
        fail('mutationFailed');
      }
    });

    timelineService.start();

    timelineService.send({ type: 'INIT_TIMELINE', loggedInUser });
  });

  it('should transition to mutationFailed', () => {
    const timelineService = interpret(timelineMachine).onTransition((state) => {
      if (
        state.history?.value === 'timelineInitializing' &&
        state.matches('idle')
      ) {
        timelineService.send({ type: 'LIKE_POST', id: 'failed' });
      }
      if (state.history?.value === 'like' && state.matches('idle')) {
        fail('should not transition to idle');
      }
      if (state.matches('mutationFailed')) {
        expect(state.context.failedOperation).toEqual('like');
      }
    });

    timelineService.start();

    timelineService.send({ type: 'INIT_TIMELINE', loggedInUser });
  });

  it('should load posts in background', () => {
    const timelineService = interpret(timelineMachine).onTransition((state) => {
      if (
        state.history?.value === 'timelineInitializing' &&
        state.matches('idle')
      ) {
        timelineService.send({
          type: 'POSTS_LOADED_IN_BACKGROUND',
          posts: [expectedMumble],
        });
      }
      if (state.history?.value === 'idle' && state.matches('idle')) {
        expect(state.context.posts).toEqual([expectedMumble]);
        expect(state.context.postsLoadedInTheBackground).toEqual([
          expectedMumble,
        ]);
      }
    });

    timelineService.start();

    timelineService.send({ type: 'INIT_TIMELINE', loggedInUser });
  });

  it('should set router isLoading', () => {
    const timelineService = interpret(timelineMachine).onTransition((state) => {
      if (
        state.history?.value === 'timelineInitializing' &&
        state.matches('idle')
      ) {
        timelineService.send({
          type: 'SET_ROUTER_LOADING',
          isRouterLoading: true,
        });
      }
      if (state.history?.value === 'idle' && state.matches('idle')) {
        expect(state.context.isRouterLoading).toBeTruthy();
      }
    });

    timelineService.start();

    timelineService.send({ type: 'INIT_TIMELINE', loggedInUser });
  });
});
