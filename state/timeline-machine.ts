import { createContext } from 'react';
import { assign, createMachine, InterpreterFrom } from 'xstate';
import {
  GetPostsWithUserDataResponse,
  LikeParams,
  LoggedInUser,
  MumbleUsers,
  PostWithUserData,
} from '../models';
import { like } from '../services/like.service';
import { getPostsWithUserData } from '../services/mumble.service';
import { createPost } from '../services/post.service';

export interface TimelineMachineContext {
  readonly loggedInUser?: LoggedInUser;
  readonly hasMore: boolean;
  readonly posts: PostWithUserData[];
  readonly mumbleUsers: MumbleUsers;
  readonly postsLoadedInTheBackground: PostWithUserData[];
  readonly clickedPost?: PostWithUserData;
  readonly error?: Error;
}

export const initialTimelineMachineContext: TimelineMachineContext = {
  hasMore: false,
  posts: [],
  mumbleUsers: {},
  postsLoadedInTheBackground: [],
};

export interface InitTimelineEvent {
  type: 'INIT_TIMELINE';
  loggedInUser: LoggedInUser;
}

export interface UpdateTimelineEvent {
  type: 'UPDATE_TIMELINE_DATA';
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
            (_context, _event) => console.log('timelineInitializing triggered'),
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
            error: (_context, _event) => undefined,
          }),
        },
        onError: {
          target: 'initFailed',
          actions: assign({ error: (_context, event) => event.data }),
        },
      },
    },
    initFailed: {
      on: {
        RETRY_INIT: {
          target: 'timelineInitializing',
          actions: [(_context, _event) => console.log('RETRY_INIT triggered')],
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
          }),
        },
        onError: {
          target: 'updateFailed',
          actions: assign({ error: (_context, event) => event.data }),
        },
      },
    },
    updateFailed: {
      on: {
        RETRY_UPDATE: {
          target: 'timeLineUpdating',
          actions: [
            (_context, _event) => console.log('RETRY_UPDATE triggered'),
          ],
        },
      },
    },
    create: {
      invoke: {
        src: (
          context: TimelineMachineContext,
          event
        ): Promise<PostWithUserData> =>
          createPost(event.text, context.loggedInUser, event.image),
        onDone: {
          target: 'idle',
          actions: assign({
            posts: (context, event) => [event.data, ...context.posts],
            error: (_context, _event) => undefined,
          }),
        },
        onError: {
          target: 'updateFailed',
          actions: assign({ error: (_context, event) => event.data }),
        },
      },
    },
    like: {
      invoke: {
        src: (context: TimelineMachineContext, event): Promise<LikeParams> =>
          like(event.id, event.isLiked, context.loggedInUser?.accessToken),
        onDone: {
          target: 'idle',
          actions: assign({
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
            error: (_context, _event) => undefined,
          }),
        },
        onError: {
          target: 'updateFailed',
          actions: assign({ error: (_context, event) => event.data }),
        },
      },
    },
  },
});
