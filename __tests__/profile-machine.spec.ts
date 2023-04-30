import { interpret } from 'xstate';
import { MumbleUsers } from '../models';
import { profileMachine } from '../state/profile-machine';
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
  getPostsAndLikedPostsWithUserData: (token: string) => {
    if (token) {
      return Promise.resolve({
        count: 2,
        likedPostCount: 2,
        posts: token === 'empty' ? [] : [expectedMumble],
        likedPosts: token === 'empty' ? [] : [expectedMumble],
        users: existingUsers,
      });
    } else {
      return Promise.reject('Unauthenticated');
    }
  },
  getLikedPostsWithUserData: (token: string) => {
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
  loadNewUsersProfileTemplateData: (token: string) => {
    if (token) {
      return Promise.resolve({
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

describe('profile-machine', () => {
  const initEvent = {
    type: 'INIT_PROFILE',
    loggedInUser,
    isOwnProfile: true,
    userId: loggedInUser.id,
    background: 'background',
    bio: 'bio',
  };
  it('should transition from empty to idle with own Profile', () => {
    const profileService = interpret(profileMachine).onTransition((state) => {
      if (state.matches('idle')) {
        expect(state.context.isOwnProfile).toBeTruthy();
        expect(state.context.userId).toEqual(loggedInUser.id);
        expect(state.context.background).toEqual('background');
        expect(state.context.bio).toEqual('bio');
        expect(state.context.hasMorePosts).toBeTruthy();
        expect(state.context.posts).toEqual([expectedMumble]);
        expect(state.context.hasMoreLikedPosts).toBeTruthy();
        expect(state.context.likedPosts).toEqual([expectedMumble]);
        expect(state.context.mumbleUsers).toEqual(existingUsers);
        expect(state.context.failedOperation).toEqual('none');
      }
      if (state.matches('initFailed')) {
        fail('initFailed');
      }
    });

    profileService.start();

    profileService.send(initEvent);
  });

  it('should transition from empty to idle with stranger Profile', () => {
    const profileService = interpret(profileMachine).onTransition((state) => {
      if (state.matches('idle')) {
        expect(state.context.isOwnProfile).toBeFalsy();
        expect(state.context.userId).toEqual(loggedInUser.id);
        expect(state.context.background).toEqual('background');
        expect(state.context.bio).toEqual('bio');
        expect(state.context.hasMorePosts).toBeTruthy();
        expect(state.context.posts).toEqual([expectedMumble]);
        expect(state.context.hasMoreLikedPosts).toBeFalsy();
        expect(state.context.likedPosts).toEqual([]);
        expect(state.context.mumbleUsers).toEqual(existingUsers);
        expect(state.context.failedOperation).toEqual('none');
      }
      if (state.matches('initFailed')) {
        fail('initFailed');
      }
    });

    profileService.start();

    profileService.send({
      ...initEvent,
      isOwnProfile: false,
    });
  });

  it('should transition from empty to initFailed if user is not loggedIn', () => {
    const profileService = interpret(profileMachine).onTransition((state) => {
      if (state.matches('initFailed')) {
        expect(state.context.failedOperation).toEqual('init');
      }
      if (state.matches('idle')) {
        fail('should not transition to idle');
      }
    });

    profileService.start();

    profileService.send({ type: 'INIT_PROFILE', notLoggedInUser });
  });

  it('should loadMorePosts', () => {
    const profileService = interpret(profileMachine).onTransition((state) => {
      if (
        state.history?.value === 'loadPostsAndLikedPosts' &&
        state.matches('idle')
      ) {
        profileService.send({ type: 'LOAD_MORE_POSTS' });
      }
      if (state.history?.value === 'loadMorePosts' && state.matches('idle')) {
        expect(state.context.hasMorePosts).toBeFalsy();
        expect(state.context.posts).toEqual([expectedMumble, expectedMumble]);
        expect(state.context.mumbleUsers).toEqual(existingUsers);
        expect(state.context.failedOperation).toEqual('none');
      }
      if (state.matches('updateFailed')) {
        fail('updateFailed');
      }
    });

    profileService.start();

    profileService.send(initEvent);
  });

  it('should loadMoreLikedPosts', () => {
    const profileService = interpret(profileMachine).onTransition((state) => {
      if (
        state.history?.value === 'loadPostsAndLikedPosts' &&
        state.matches('idle')
      ) {
        profileService.send({ type: 'LOAD_MORE_LIKED_POSTS' });
      }
      if (
        state.history?.value === 'loadMoreLikedPosts' &&
        state.matches('idle')
      ) {
        expect(state.context.hasMoreLikedPosts).toBeFalsy();
        expect(state.context.likedPosts).toEqual([
          expectedMumble,
          expectedMumble,
        ]);
        expect(state.context.mumbleUsers).toEqual(existingUsers);
        expect(state.context.failedOperation).toEqual('none');
      }
      if (state.matches('updateFailed')) {
        fail('updateFailed');
      }
    });

    profileService.start();

    profileService.send(initEvent);
  });

  it('should loadNewUserProfileTemplateData', () => {
    const profileService = interpret(profileMachine).onTransition((state) => {
      if (
        state.history?.value === 'loadNewUserProfileTemplateData' &&
        state.matches('idle')
      ) {
        expect(state.context.hasMorePosts).toBeFalsy();
        expect(state.context.posts).toEqual([expectedMumble]);
        expect(state.context.mumbleUsers).toEqual(existingUsers);
        expect(state.context.isNewUserProfile).toBeTruthy();
        expect(state.context.failedOperation).toEqual('none');
      }
    });

    profileService.start();

    profileService.send({
      ...initEvent,
      loggedInUser: {
        ...loggedInUser,
        accessToken: 'empty',
      },
    });
  });

  it('should create post if user is new', () => {
    let counter = 0; // to prevent infinite loop, since the mocked service will always return the same data (emptyPosts)
    const profileService = interpret(profileMachine).onTransition((state) => {
      if (
        state.history?.value === 'loadNewUserProfileTemplateData' &&
        state.matches('idle')
      ) {
        if (counter === 0) {
          profileService.send({ type: 'CREATE_POST' });
          counter++;
        }
      }
      if (state.matches('create')) {
        expect(state.context.posts).toEqual([expectedMumble]);
      }
      if (state.matches('mutationFailed')) {
        fail('mutationFailed');
      }
    });

    profileService.start();

    profileService.send({
      ...initEvent,
      loggedInUser: {
        ...loggedInUser,
        accessToken: 'empty',
      },
    });
  });

  it('should transition to createFailed', () => {
    const profileService = interpret(profileMachine).onTransition((state) => {
      if (
        state.history?.value === 'loadNewUserProfileTemplateData' &&
        state.matches('idle')
      ) {
        profileService.send({ type: 'CREATE_POST', text: 'failed' });
      }
      if (
        state.history?.value === 'loadPostsAndLikedPosts' &&
        state.matches('idle')
      ) {
        fail('should not transition to idle');
      }
      if (state.matches('mutationFailed')) {
        expect(state.context.failedOperation).toEqual('create');
      }
    });

    profileService.start();

    profileService.send({
      ...initEvent,
      loggedInUser: {
        ...loggedInUser,
        accessToken: 'empty',
      },
    });
  });

  it('should create like', () => {
    const profileService = interpret(profileMachine).onTransition((state) => {
      if (
        state.history?.value === 'loadPostsAndLikedPosts' &&
        state.matches('idle')
      ) {
        profileService.send({
          type: 'LIKE_POST',
          id: expectedMumble.id,
          isLiked: true,
        });
      }
      if (state.history?.value === 'like' && state.matches('idle')) {
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

    profileService.start();

    profileService.send(initEvent);
  });

  it('should transition to mutationFailed', () => {
    const profileService = interpret(profileMachine).onTransition((state) => {
      if (
        state.history?.value === 'loadPostsAndLikedPosts' &&
        state.matches('idle')
      ) {
        profileService.send({ type: 'LIKE_POST', id: 'failed' });
      }
      if (state.history?.value === 'like' && state.matches('idle')) {
        fail('should not transition to idle');
      }
      if (state.matches('mutationFailed')) {
        expect(state.context.failedOperation).toEqual('like');
      }
    });

    profileService.start();

    profileService.send(initEvent);
  });

  it('should set router isLoading', () => {
    const profileService = interpret(profileMachine).onTransition((state) => {
      if (
        state.history?.value === 'loadPostsAndLikedPosts' &&
        state.matches('idle')
      ) {
        profileService.send({
          type: 'SET_ROUTER_LOADING',
          isRouterLoading: true,
        });
      }
      if (state.history?.value === 'idle' && state.matches('idle')) {
        expect(state.context.isRouterLoading).toBeTruthy();
      }
    });

    profileService.start();

    profileService.send(initEvent);
  });

  it('should set TOGGLE', () => {
    const profileService = interpret(profileMachine).onTransition((state) => {
      if (
        state.history?.value === 'loadPostsAndLikedPosts' &&
        state.matches('idle')
      ) {
        profileService.send({
          type: 'TOGGLE',
          isPostsOpen: false,
        });
      }
      if (state.history?.value === 'idle' && state.matches('idle')) {
        expect(state.context.isPostsOpen).toBeFalsy();
      }
    });

    profileService.start();

    profileService.send(initEvent);
  });
});
