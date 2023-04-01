import {
  GetPostDetailsResponse,
  GetPostsQueryParams,
  GetPostsWithUserDataResponse,
  MumbleUser,
  MumbleUsers,
  PostWithUserData,
  ReplyWithUserData
} from '../models';
import { mapPostToPostWithUserData, mapReplyToReplyWithUserData } from '../models/mappers';
import { getPostById, getPosts } from './post.service';
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

  const postsWithUserData: PostWithUserData[] = posts.map((post) => {
    return mapPostToPostWithUserData(post, updatedUsers[post.creator]);
  });

  return {
    count,
    posts: postsWithUserData,
    users: updatedUsers,
  };
};

export const getPostDetailsWithUserData = async (
  token: string,
  id: string
): Promise<GetPostDetailsResponse> => {
  const post = await getPostById(id);
  const replies = await getReplies(id);
  const creators = replies.reduce((set, item) => {
    set.add(item.creator);
    return set;
  }, new Set<string>());
  creators.add(post.creator);
  const users = await Promise.all(
    Array.from(creators).map((creator: string) =>
      getUserById(creator, token)
    )
  );

  const updatedUsers: MumbleUsers = {
    ...users.reduce((newUsers, user: MumbleUser) => {
      newUsers[user.id] = user;
      return newUsers;
    }, {} as { [key: string]: MumbleUser }),
  };

  const postWithUserData: PostWithUserData = mapPostToPostWithUserData(post, updatedUsers[post.creator]);
  const repliesWithUserData: ReplyWithUserData[] = replies.map((reply) => {
    return mapReplyToReplyWithUserData(reply, updatedUsers[reply.creator]);
  });

  return {
    post: postWithUserData,
    replies: repliesWithUserData,
  };
};
