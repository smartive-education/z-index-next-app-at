import { assign, createMachine } from 'xstate';
import {
  FailedOperation,
  GetNewUserProfileTemplateData,
  GetPostsAndLikedPostsWithUserDataResponse,
  GetPostsWithUserDataResponse,
  LikeParams,
  LoggedInUser,
  Mumble,
  MumbleUser,
  MumbleUsers,
} from '../models';
import { like } from '../services/like.service';
import {
  getPostsAndLikedPostsWithUserData,
  loadnNewUsersProfileTemplateData,
  getPostsWithUserData,
  getLikedPostsWithUserData,
} from '../services/mumble.service';
import { createPost } from '../services/post.service';

export interface ProfileMachineContext {
  readonly userId: string;
  readonly isOwnProfile: boolean;
  readonly hasMorePosts: boolean;
  readonly posts: Mumble[];
  readonly hasMoreLikedPosts: boolean;
  readonly likedPosts: Mumble[];
  readonly mumbleUsers: MumbleUsers;
  readonly failedOperation: FailedOperation;
  readonly loggedInUser?: LoggedInUser;
  readonly user?: MumbleUser;
  readonly suggestedUsers: MumbleUsers;
  readonly background: string;
  readonly bio: string;
  readonly isErrorModalOpen: boolean;
  readonly isPostsOpen: boolean;
}

export const initialProfileMachineContext: ProfileMachineContext = {
  userId: '',
  hasMorePosts: false,
  isOwnProfile: false,
  posts: [],
  hasMoreLikedPosts: false,
  likedPosts: [],
  mumbleUsers: {},
  failedOperation: 'none',
  suggestedUsers: {},
  background: '',
  bio: '',
  isErrorModalOpen: false,
  isPostsOpen: true,
};

export interface InitProfileEvent {
  type: 'INIT_PROFILE';
  loggedInUser: LoggedInUser;
  isOwnProfile: boolean;
  userId: string;
  background: string;
  bio: string;
}

export interface LoadMorePostsEvent {
  type: 'LOAD_MORE_POSTS';
}

export interface LoadMoreLikedPostsEvent {
  type: 'LOAD_MORE_LIKED_POSTS';
}

export interface RetryUpdateEvent {
  type: 'RETRY_UPDATE';
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
                  userId: (_context, event) => event.userId,
                  background: (_context, event) => event.background,
                  bio: (_context, event) => event.bio,
                }),
                (_context, _event) =>
                  console.log('loadPostsAndLikedPosts triggered'),
              ],
              cond: 'isOwnProfileAtInit',
            },
            {
              target: 'loadPosts',
              actions: [
                assign<ProfileMachineContext, InitProfileEvent>({
                  loggedInUser: (_context, event) => event.loggedInUser,
                  isOwnProfile: (_context, event) => event.isOwnProfile,
                  userId: (_context, event) => event.userId,
                  background: (_context, event) => event.background,
                  bio: (_context, event) => event.bio,
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
          ): Promise<GetPostsAndLikedPostsWithUserDataResponse> =>
            getPostsAndLikedPostsWithUserData(
              context.loggedInUser?.accessToken,
              { likedBy: [context.loggedInUser?.id || ''] },
              { creator: context.loggedInUser?.id },
              context.mumbleUsers
            ),
          onDone: [
            {
              target: 'checkForEmptyProfile',
              actions: assign({
                hasMorePosts: (_context, event) =>
                  event.data.posts?.length < event.data.count,
                posts: (_context, event) => event.data.posts,
                hasMoreLikedPosts: (_context, event) =>
                  event.data.likedPosts?.length < event.data.likedPostCount,
                likedPosts: (_context, event) => event.data.likedPosts,
                mumbleUsers: (_context, event) => event.data.users,
                user: (context, _event) => context.loggedInUser,
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
      checkForEmptyProfile: {
        always: [
          { target: 'idle', cond: 'isNotEmptyProfile' },
          { target: 'loadNewUserProfileTemplateData', cond: 'isEmptyProfile' },
        ],
      },
      loadPosts: {
        invoke: {
          src: (
            context: ProfileMachineContext
          ): Promise<GetPostsWithUserDataResponse> =>
            getPostsWithUserData(context.loggedInUser?.accessToken, {
              creator: context.userId,
            }),
          onDone: {
            target: 'idle',
            actions: assign({
              hasMorePosts: (_context, event) =>
                event.data.posts?.length < event.data.count,
              posts: (_context, event) => event.data.posts,
              mumbleUsers: (_context, event) => event.data.users,
              user: (context, event) => event.data.users[context.userId],
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
      idle: {
        on: {
          LOAD_MORE_POSTS: {
            target: 'loadMorePosts',
          },
          LOAD_MORE_LIKED_POSTS: {
            target: 'loadMoreLikedPosts',
            cond: 'isOwnProfile',
          },
          TOGGLE: {
            target: 'idle',
            cond: 'isOwnProfile',
            actions: [
              assign<ProfileMachineContext, InitProfileEvent>({
                isPostsOpen: (context, _event) => !context.isPostsOpen,
              }),
              (_context, _event) => console.log('TOGGLE triggered'),
            ],
            internal: true,
          },
          CREATE_POST: {
            target: 'create',
            cond: 'isEmptyProfile',
          },
          LIKE_POST: {
            target: 'like',
          },
        },
      },
      loadPostsAndLikedPostsFailed: {
        on: {
          RETRY_INIT: {
            target: 'loadPostsAndLikedPosts',
            actions: [
              (_context, _event) => console.log('RETRY_INIT triggered'),
            ],
          },
          RETURN_TO_IDLE: {
            target: 'idle',
            actions: [
              (_context, _event) => console.log('RETURN_TO_IDLE triggered'),
            ],
          },
        },
      },
      loadMorePosts: {
        invoke: {
          src: (
            context: ProfileMachineContext
          ): Promise<GetPostsWithUserDataResponse> =>
            getPostsWithUserData(context.loggedInUser?.accessToken, {
              creator: context.userId,
              offset: context.posts.length,
            }),
          onDone: {
            target: 'idle',
            actions: assign({
              hasMorePosts: (context, event) =>
                context.posts.length + event.data.posts?.length <
                event.data.count,
              posts: (context, event) => [
                ...context.posts,
                ...(event.data.posts || []),
              ],
              mumbleUsers: (_context, event) => event.data.users,
              failedOperation: (_context, _event) => 'none' as FailedOperation,
            }),
          },
          onError: {
            target: 'loadMorePostsFailed',
            actions: assign({
              failedOperation: (_context, _event) =>
                'update' as FailedOperation,
            }),
          },
        },
      },
      loadMorePostsFailed: {
        on: {
          RETRY_UPDATE: {
            target: 'loadMorePosts',
            actions: [
              (_context, _event) => console.log('RETRY_UPDATE triggered'),
            ],
          },
          RETURN_TO_IDLE: {
            target: 'idle',
            actions: [
              (_context, _event) => console.log('RETURN_TO_IDLE triggered'),
            ],
          },
        },
      },
      loadMoreLikedPosts: {
        invoke: {
          src: (
            context: ProfileMachineContext
          ): Promise<GetPostsWithUserDataResponse> =>
            getLikedPostsWithUserData(context.loggedInUser?.accessToken, {
              likedBy: [context.userId],
              offset: context.likedPosts.length,
            }),
          onDone: {
            target: 'idle',
            actions: assign({
              hasMoreLikedPosts: (context, event) =>
                context.likedPosts.length + event.data.posts?.length <
                event.data.count,
              likedPosts: (context, event) => [
                ...context.likedPosts,
                ...(event.data.posts || []),
              ],
              mumbleUsers: (_context, event) => event.data.users,
              failedOperation: (_context, _event) => 'none' as FailedOperation,
            }),
          },
          onError: {
            target: 'loadMoreLikedPostsFailed',
            actions: assign({
              failedOperation: (_context, _event) =>
                'update' as FailedOperation,
            }),
          },
        },
      },
      loadMoreLikedPostsFailed: {
        on: {
          RETRY_UPDATE: {
            target: 'loadMoreLikedPosts',
            actions: [
              (_context, _event) => console.log('RETRY_UPDATE triggered'),
            ],
          },
          RETURN_TO_IDLE: {
            target: 'idle',
            actions: [
              (_context, _event) => console.log('RETURN_TO_IDLE triggered'),
            ],
          },
        },
      },
      loadNewUserProfileTemplateData: {
        invoke: {
          src: (
            context: ProfileMachineContext
          ): Promise<GetNewUserProfileTemplateData> =>
            loadnNewUsersProfileTemplateData(context.loggedInUser?.accessToken),
          onDone: {
            target: 'newUserProfile',
            actions: assign({
              hasMorePosts: (_context, _event) => false,
              posts: (_context, event) => event.data.posts,
              suggestedUsers: (_context, event) => event.data.users,
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
      initFailed: {
        on: {
          RETRY_INIT: [
            {
              target: 'loadPostsAndLikedPosts',
              actions: [
                (_context, _event) =>
                  console.log('loadPostsAndLikedPosts triggered'),
              ],
              cond: 'isOwnProfile',
            },
            {
              target: 'loadPosts',
              actions: [
                (_context, _event) => console.log('loadPosts triggered'),
              ],
            },
          ],
        },
      },
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
      isNotEmptyProfile: (context: ProfileMachineContext) =>
        !context.isOwnProfile ||
        !!context.posts.length ||
        !!context.likedPosts.length,
      isOwnProfile: (context: ProfileMachineContext) => context.isOwnProfile,
      isOwnProfileAtInit: (_context: ProfileMachineContext, event) =>
        event.isOwnProfile,
    },
  }
);
