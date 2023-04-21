import { createContext } from 'react';
import { assign, createMachine, InterpreterFrom } from 'xstate';
import {
  FailedOperation,
  GetPostsWithUserDataResponse,
  LikeParams,
  LoggedInUser,
  Mumble,
  MumbleUsers,
} from '../models';
import { like } from '../services/like.service';
import { getPostsWithUserData } from '../services/mumble.service';
import { createPost } from '../services/post.service';

export interface TimelineMachineContext {
  readonly loggedInUser?: LoggedInUser;
  readonly hasMore: boolean;
  readonly posts: Mumble[];
  readonly mumbleUsers: MumbleUsers;
  readonly postsLoadedInTheBackground: Mumble[];
  readonly failedOperation: FailedOperation;
  readonly isRouterLoading: boolean;
}

export const initialTimelineMachineContext: TimelineMachineContext = {
  hasMore: false,
  posts: [],
  mumbleUsers: {},
  postsLoadedInTheBackground: [],
  failedOperation: 'none',
  isRouterLoading: false
};

export interface InitTimelineEvent {
  type: 'INIT_TIMELINE';
  loggedInUser: LoggedInUser;
}

export interface UpdateTimelineEvent {
  type: 'UPDATE_TIMELINE_DATA';
}
export interface LoadPostsInBackgroundEvent {
  type: 'POSTS_LOADED_IN_BACKGROUND';
  posts: Mumble[];
}

export interface ShowPostsLoadedInBackgroundEvent {
  type: 'SHOW_POSTS_LOADED_IN_BACKGROUND';
}

export interface SetRouterLoadingEvent {
  type: 'SET_ROUTER_LOADING';
  isRouterLoading: boolean;
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

export const TimelineContext = createContext({
  timelineService: {} as InterpreterFrom<typeof timelineMachine>,
});

export const timelineMachine = createMachine({
  id: 'timeline',
  initial: 'empty',
  schema: {
    context: initialTimelineMachineContext,
  },
  context: initialTimelineMachineContext,
  predictableActionArguments: true,
  states: {
    empty: {
      on: {
        INIT_TIMELINE: {
          target: 'timelineInitializing',
          actions: [
            assign<TimelineMachineContext, InitTimelineEvent>({
              loggedInUser: (_context, event) => event.loggedInUser,
            }),
          ],
        },
      },
    },
    timelineInitializing: {
      invoke: {
        src: (
          context: TimelineMachineContext
        ): Promise<GetPostsWithUserDataResponse> =>
          getPostsWithUserData(context.loggedInUser?.accessToken),
        onDone: {
          target: 'idle',
          actions: assign({
            hasMore: (_context, event) =>
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
    initFailed: {
      on: {
        RETRY_INIT: {
          target: 'timelineInitializing',
        },
        RETURN_TO_IDLE: {
          target: 'idle',
        },
      },
    },
    idle: {
      on: {
        UPDATE_TIMELINE_DATA: {
          target: 'timeLineUpdating',
        },
        CREATE_POST: {
          target: 'create',
        },
        LIKE_POST: {
          target: 'like',
        },
        POSTS_LOADED_IN_BACKGROUND: {
          target: 'idle',
          actions: [
            assign<TimelineMachineContext, LoadPostsInBackgroundEvent>({
              postsLoadedInTheBackground: (_context, event) => event.posts,
            }),
          ],
          internal: true,
        },
        SHOW_POSTS_LOADED_IN_BACKGROUND: {
          target: 'idle',
          actions: [
            assign<TimelineMachineContext, ShowPostsLoadedInBackgroundEvent>({
              posts: (context, _event) => [
                ...context.postsLoadedInTheBackground,
                ...context.posts,
              ],
              postsLoadedInTheBackground: (_context, _event) => [],
            }),
          ],
          internal: true,
        },
        SET_ROUTER_LOADING: {
          target: 'idle',
          actions: [
            assign<TimelineMachineContext, SetRouterLoadingEvent>({
              isRouterLoading: (_context, event) => event.isRouterLoading
            }),
          ],
          internal: true,
        }
      },
    },
    timeLineUpdating: {
      invoke: {
        src: (
          context: TimelineMachineContext
        ): Promise<GetPostsWithUserDataResponse> =>
          getPostsWithUserData(
            context.loggedInUser?.accessToken,
            { offset: context.posts.length },
            context.mumbleUsers
          ),
        onDone: {
          target: 'idle',
          actions: assign({
            hasMore: (context, event) =>
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
          target: 'updateFailed',
          actions: assign({
            failedOperation: (_context, _event) => 'update' as FailedOperation,
          }),
        },
      },
    },
    updateFailed: {
      on: {
        RETRY_UPDATE: {
          target: 'timeLineUpdating',
        },
        RETURN_TO_IDLE: {
          target: 'idle',
        },
      },
    },
    create: {
      invoke: {
        src: (context: TimelineMachineContext, event): Promise<Mumble> =>
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
            failedOperation: (_context, _event) => 'create' as FailedOperation,
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
        src: (context: TimelineMachineContext, event): Promise<LikeParams> =>
          like(event.id, event.isLiked, context.loggedInUser?.accessToken),
        onDone: {
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
              failedOperation: (_context, _event) => 'none' as FailedOperation,
            }),
          ],
        },
        onError: {
          target: 'mutationFailed',
          actions: assign({
            failedOperation: (_context, _event) => 'like' as FailedOperation,
          }),
        },
      },
    },
  },
});
