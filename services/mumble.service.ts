import {
  GetPostDetailsResponse,
  GetPostsQueryParams,
  GetPostsWithUserDataResponse,
  Mumble,
  MumbleUser,
  MumbleUsers,
} from '../models';
import {
  mapResponseToMumble,
} from '../models/mappers';
import { getMumbleById, getPosts } from './post.service';
import { getReplies } from './reply.service';
import { getUserById } from './user.service';

export const getPostsWithUserData = async (
  token: string = '',
  params?: GetPostsQueryParams,
  existingUsers?: MumbleUsers
): Promise<GetPostsWithUserDataResponse> => {
  const { count, posts } = await getPosts(params);
  const unknownCreators = posts.reduce((set, item) => {
    if (!existingUsers || !existingUsers[item.creator]) {
      set.add(item.creator);
    }
    return set;
  }, new Set<string>());
  const users = await Promise.all(
    Array.from(unknownCreators).map((creator: string) =>
      getUserById(creator, token)
    )
  );

  const updatedUsers: MumbleUsers = {
    ...(existingUsers || {}),
    ...users.reduce((newUsers, user: MumbleUser) => {
      newUsers[user.id] = user;
      return newUsers;
    }, {} as { [key: string]: MumbleUser }),
  };

  const postsWithUserData: Mumble[] = posts.map((post) => {
    return mapResponseToMumble(post, updatedUsers[post.creator]);
  });

  return {
    count,
    posts: postsWithUserData,
    users: updatedUsers,
  };
};

export const getMumbleDetailsWithUserData = async (
  token: string,
  id: string
): Promise<GetPostDetailsResponse> => {
  const mumble = await getMumbleById(id);
  const replies = await getReplies(id);
  const creators = replies.reduce((set, item) => {
    set.add(item.creator);
    return set;
  }, new Set<string>());
  creators.add(mumble.creator);
  const users = await Promise.all(
    Array.from(creators).map((creator: string) => getUserById(creator, token))
  );

  const updatedUsers: MumbleUsers = {
    ...users.reduce((newUsers, user: MumbleUser) => {
      newUsers[user.id] = user;
      return newUsers;
    }, {} as { [key: string]: MumbleUser }),
  };

  const postWithUserData: Mumble = mapResponseToMumble(
    mumble,
    updatedUsers[mumble.creator]
  );
  const repliesWithUserData: Mumble[] = replies.map((reply) => {
    return mapResponseToMumble(reply, updatedUsers[reply.creator]);
  });

  return {
    post: postWithUserData,
    replies: repliesWithUserData,
  };
};
