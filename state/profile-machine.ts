import { assign, createMachine } from 'xstate';
import {
  FailedOperation,
  GetPostsWithUserDataResponse,
  LikeParams,
  LoggedInUser,
  Mumble,
  MumbleUser,
  MumbleUsers,
} from '../models';
import { like } from '../services/like.service';
import { getPostsWithUserData } from '../services/mumble.service';
import { createPost } from '../services/post.service';

export interface ProfileMachineContext {
  readonly isOwnProfile: boolean;
  readonly hasMorePosts: boolean;
  readonly posts: Mumble[];
  readonly hasMoreLikedPosts: boolean;
  readonly likedPosts: Mumble[];
  readonly mumbleUsers: MumbleUsers;
  readonly failedOperation: FailedOperation;
  readonly loggedInUser?: LoggedInUser;
  readonly user?: MumbleUser;
}

export const initialProfileMachineContext: ProfileMachineContext = {
  hasMorePosts: false,
  isOwnProfile: false,
  posts: [],
  hasMoreLikedPosts: false,
  likedPosts: [],
  mumbleUsers: {},
  failedOperation: 'none',
};

export interface InitProfileEvent {
  type: 'INIT_PROFILE';
  loggedInUser: LoggedInUser;
  isOwnProfile: boolean;
}

export interface LoadMorePostsEvent {
  type: 'LOAD_MORE_POSTS';
}

export interface CreatePostEvent {
  type: 'CREATE_POST';
  text: string;
  image?: File;
}

export interface LikePostEvent {
  type: 'LIKE_POST';
  id: string;
  isLiked: boolean;
}

export const profileMachine = createMachine(
  {
    id: 'profile',
    initial: 'empty',
    schema: {
      context: initialProfileMachineContext,
    },
    context: initialProfileMachineContext,
    predictableActionArguments: true,
    states: {
      empty: {
        on: {
          INIT_PROFILE: [
            {
              target: 'loadPostsAndLikedPosts',
              actions: [
                assign<ProfileMachineContext, InitProfileEvent>({
                  loggedInUser: (_context, event) => event.loggedInUser,
                  isOwnProfile: (_context, event) => event.isOwnProfile,
                }),
                (_context, _event) =>
                  console.log('loadPostsAndLikedPosts triggered'),
              ],
              cond: 'isOwnProfile',
            },
            {
              target: 'loadPosts',
              actions: [
                assign<ProfileMachineContext, InitProfileEvent>({
                  loggedInUser: (_context, event) => event.loggedInUser,
                  isOwnProfile: (_context, event) => event.isOwnProfile,
                }),
                (_context, _event) => console.log('loadPosts triggered'),
              ],
            },
          ],
        },
      },
      loadPostsAndLikedPosts: {
        invoke: {
          src: (
            context: ProfileMachineContext
          ): Promise<GetPostsWithUserDataResponse> =>
            getPostsWithUserData(context.loggedInUser?.accessToken),
          onDone: [
            {
              target: 'loadUsersAndPosts',
              actions: assign({
                hasMorePosts: (_context, event) =>
                  event.data.posts?.length < event.data.count,
                posts: (_context, event) => event.data.posts,
                mumbleUsers: (_context, event) => event.data.users,
                failedOperation: (_context, _event) =>
                  'none' as FailedOperation,
              }),
              cond: 'isEmptyProfile',
            },
            {
              target: 'idle',
              actions: assign({
                hasMorePosts: (_context, event) =>
                  event.data.posts?.length < event.data.count,
                posts: (_context, event) => event.data.posts,
                mumbleUsers: (_context, event) => event.data.users,
                failedOperation: (_context, _event) =>
                  'none' as FailedOperation,
              }),
            },
          ],
          onError: {
            target: 'loadPostsAndLikedPostsFailed',
            actions: assign({
              failedOperation: (_context, _event) => 'init' as FailedOperation,
            }),
          },
        },
      },
      loadPosts: {
        invoke: {
          src: (
            context: ProfileMachineContext
          ): Promise<GetPostsWithUserDataResponse> =>
            getPostsWithUserData(context.loggedInUser?.accessToken),
          onDone: {
            target: 'idle',
            actions: assign({
              hasMorePosts: (_context, event) =>
                event.data.posts?.length < event.data.count,
              posts: (_context, event) => event.data.posts,
              mumbleUsers: (_context, event) => event.data.users,
              failedOperation: (_context, _event) => 'none' as FailedOperation,
            }),
          },
          onError: {
            target: 'initFailed',
            actions: assign({
              failedOperation: (_context, _event) => 'init' as FailedOperation,
            }),
          },
        },
      },
      idle: {},
      loadPostsAndLikedPostsFailed: {},
      loadUsersAndPosts: {
        invoke: {
          src: (
            context: ProfileMachineContext
          ): Promise<GetPostsWithUserDataResponse> =>
            getPostsWithUserData(context.loggedInUser?.accessToken),
          onDone: {
            target: 'newUserProfile',
            actions: assign({
              hasMorePosts: (_context, event) =>
                event.data.posts?.length < event.data.count,
              posts: (_context, event) => event.data.posts,
              mumbleUsers: (_context, event) => event.data.users,
              failedOperation: (_context, _event) => 'none' as FailedOperation,
            }),
          },
          onError: {
            target: 'initFailed',
            actions: assign({
              failedOperation: (_context, _event) => 'init' as FailedOperation,
            }),
          },
        },
      },
      initFailed: {},
      newUserProfile: {
        on: {
          CREATE_POST: {
            target: 'create',
          },
          LIKE_POST: {
            target: 'like',
          },
        },
      },
      create: {
        invoke: {
          src: (context: ProfileMachineContext, event): Promise<Mumble> =>
            createPost(event.text, context.loggedInUser, event.image),
          onDone: {
            target: 'idle',
            actions: assign({
              posts: (context, event) => [event.data, ...context.posts],
              failedOperation: (_context, _event) => 'none' as FailedOperation,
            }),
          },
          onError: {
            target: 'mutationFailed',
            actions: assign({
              failedOperation: (_context, _event) =>
                'create' as FailedOperation,
            }),
          },
        },
      },
      mutationFailed: {
        on: {
          RETURN_TO_IDLE: {
            target: 'newUserProfile',
            actions: [
              (_context, _event) => console.log('RETURN_TO_IDLE triggered'),
            ],
          },
        },
      },
      like: {
        invoke: {
          src: (context: ProfileMachineContext, event): Promise<LikeParams> =>
            like(event.id, event.isLiked, context.loggedInUser?.accessToken),
          onDone: [
            {
              target: 'newUserProfile',
              actions: [
                assign({
                  posts: (context, event) =>
                    context.posts.map((post) => {
                      if (post.id === event.data.id) {
                        return {
                          ...post,
                          likeCount: event.data.isLike
                            ? post.likeCount + 1
                            : post.likeCount - 1,
                          likedByUser: event.data.isLike,
                        };
                      }
                      return post;
                    }),
                  failedOperation: (_context, _event) =>
                    'none' as FailedOperation,
                }),
                (_context, _event) => console.log('LIKE triggered'),
              ],
              cond: 'isEmptyProfile',
            },
            {
              target: 'idle',
              actions: [
                assign({
                  posts: (context, event) =>
                    context.posts.map((post) => {
                      if (post.id === event.data.id) {
                        return {
                          ...post,
                          likeCount: event.data.isLike
                            ? post.likeCount + 1
                            : post.likeCount - 1,
                          likedByUser: event.data.isLike,
                        };
                      }
                      return post;
                    }),
                  failedOperation: (_context, _event) =>
                    'none' as FailedOperation,
                }),
                (_context, _event) => console.log('LIKE triggered'),
              ],
            },
          ],
          onError: {
            target: 'mutationFailed',
            actions: assign({
              failedOperation: (_context, _event) => 'like' as FailedOperation,
            }),
          },
        },
      },
    },
  },
  {
    guards: {
      isEmptyProfile: (context: ProfileMachineContext) =>
        context.isOwnProfile &&
        !context.posts.length &&
        !context.likedPosts.length,
      isOwnProfile: (context: ProfileMachineContext) => context.isOwnProfile,
    },
  }
);
