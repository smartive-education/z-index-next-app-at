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
  loadNewUsersProfileTemplateData,
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
  readonly isNewUserProfile: boolean;
  readonly isRouterLoading: boolean;
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
  isNewUserProfile: false,
  isRouterLoading: false
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

export interface SetRouterLoadingEvent {
  type: 'SET_ROUTER_LOADING';
  isRouterLoading: boolean;
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
            target: 'initFailed',
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
          SET_ROUTER_LOADING: {
            target: 'idle',
            actions: [
              assign<ProfileMachineContext, SetRouterLoadingEvent>({
                isRouterLoading: (_context, event) => event.isRouterLoading
              }),
            ],
            internal: true,
          },
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
            ],
            internal: true,
          },
          CREATE_POST: {
            target: 'create',
            cond: 'isNewUserProfile',
          },
          LIKE_POST: {
            target: 'like',
          },
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
                  hasMorePosts: (_context) =>
                    initialProfileMachineContext.hasMorePosts,
                  posts: (_context) => initialProfileMachineContext.posts,
                  hasMoreLikedPosts: (_context) =>
                    initialProfileMachineContext.hasMoreLikedPosts,
                  likedPosts: (_context) =>
                    initialProfileMachineContext.likedPosts,
                  mumbleUsers: (_context) =>
                    initialProfileMachineContext.mumbleUsers,
                  failedOperation: (_context) => 'none' as FailedOperation,
                  user: (_context) => initialProfileMachineContext.user,
                  suggestedUsers: (_context) =>
                    initialProfileMachineContext.suggestedUsers,
                  isErrorModalOpen: (_context) =>
                    initialProfileMachineContext.isErrorModalOpen,
                  isPostsOpen: (_context) =>
                    initialProfileMachineContext.isPostsOpen,
                  isNewUserProfile: false,
                }),
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
                  hasMorePosts: (_context) =>
                    initialProfileMachineContext.hasMorePosts,
                  posts: (_context) => initialProfileMachineContext.posts,
                  hasMoreLikedPosts: (_context) =>
                    initialProfileMachineContext.hasMoreLikedPosts,
                  likedPosts: (_context) =>
                    initialProfileMachineContext.likedPosts,
                  mumbleUsers: (_context) =>
                    initialProfileMachineContext.mumbleUsers,
                  failedOperation: (_context) => 'none' as FailedOperation,
                  user: (_context) => initialProfileMachineContext.user,
                  suggestedUsers: (_context) =>
                    initialProfileMachineContext.suggestedUsers,
                  isErrorModalOpen: (_context) =>
                    initialProfileMachineContext.isErrorModalOpen,
                  isPostsOpen: (_context) =>
                    initialProfileMachineContext.isPostsOpen,
                  isNewUserProfile: false,
                }),
              ],
            },
          ],
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
          LOAD_MORE_POSTS: {
            target: 'loadMorePosts',
          },
          RETURN_TO_IDLE: {
            target: 'idle',
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
          LOAD_MORE_LIKED_POSTS: {
            target: 'loadMoreLikedPosts',
          },
          RETURN_TO_IDLE: {
            target: 'idle',
          },
        },
      },
      loadNewUserProfileTemplateData: {
        invoke: {
          src: (
            context: ProfileMachineContext
          ): Promise<GetNewUserProfileTemplateData> =>
            loadNewUsersProfileTemplateData(context.loggedInUser?.accessToken),
          onDone: {
            target: 'idle',
            actions: assign({
              hasMorePosts: (_context, _event) => false,
              posts: (_context, event) => event.data.posts,
              suggestedUsers: (_context, event) => event.data.users,
              isNewUserProfile: (_context, _event) => true,
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
              cond: 'isOwnProfile',
            },
            {
              target: 'loadPosts',
            },
          ],
          RETURN_TO_IDLE: {
            target: 'idle',
          },
        },
      },
      create: {
        invoke: {
          src: (context: ProfileMachineContext, event): Promise<Mumble> =>
            createPost(event.text, context.loggedInUser, event.image),
          onDone: {
            target: 'loadPostsAndLikedPosts',
            actions: assign({
              posts: (context, event) => [event.data, ...context.posts],
              failedOperation: (_context, _event) => 'none' as FailedOperation,
              isNewUserProfile: false,
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
            target: 'idle',
          },
        },
      },
      like: {
        invoke: {
          src: (context: ProfileMachineContext, event): Promise<LikeParams> =>
            like(event.id, event.isLiked, context.loggedInUser?.accessToken),
          onDone: [
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
                  likedPosts: (context, event) =>
                    context.likedPosts.map((post) => {
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
      isNewUserProfile: (context: ProfileMachineContext) =>
        context.isNewUserProfile,
      isOwnProfile: (context: ProfileMachineContext) => context.isOwnProfile,
      isOwnProfileAtInit: (_context: ProfileMachineContext, event) =>
        event.isOwnProfile,
    },
  }
);
