import {
  GetNewUserProfileTemplateData,
  GetPostDetailsResponse,
  GetPostsAndLikedPostsWithUserDataResponse,
  GetPostsQueryParams,
  GetPostsWithUserDataResponse,
  Mumble,
  MumbleUser,
  MumbleUsers,
  SearchPostsParams,
} from '../models';
import { mapResponseToMumble } from '../models/mappers';
import { getLikedPosts, getMumbleById, getPosts } from './post.service';
import { getReplies } from './reply.service';
import { getUserById, getUsers } from './user.service';

export const getPostsWithUserData = async (
  token: string = '',
  params?: GetPostsQueryParams,
  existingUsers?: MumbleUsers
): Promise<GetPostsWithUserDataResponse> => {
  const { count, posts } = await getPosts(params);
  const updatedUsers = await getAllUnknownUsers(posts, token, existingUsers);
  const postsWithUserData: Mumble[] = posts.map((post) => {
    return mapResponseToMumble(post, updatedUsers[post.creator]);
  });

  return {
    count,
    posts: postsWithUserData,
    users: updatedUsers,
  };
};

export const getLikedPostsWithUserData = async (
  token: string = '',
  searchParams: SearchPostsParams,
  existingUsers?: MumbleUsers
): Promise<GetPostsWithUserDataResponse> => {
  const { count, posts } = await getLikedPosts(token, searchParams);
  const updatedUsers = await getAllUnknownUsers(posts, token, existingUsers);
  const postsWithUserData: Mumble[] = posts.map((post) => {
    return mapResponseToMumble(post, updatedUsers[post.creator]);
  });

  return {
    count,
    posts: postsWithUserData,
    users: updatedUsers,
  };
};

export const getPostsAndLikedPostsWithUserData = async (
  token: string = '',
  searchParams: SearchPostsParams,
  params?: GetPostsQueryParams,
  existingUsers?: MumbleUsers
): Promise<GetPostsAndLikedPostsWithUserDataResponse> => {
  const [postsResult, likedPostsResult] = await Promise.all([
    getPosts(params),
    getLikedPosts(token, searchParams),
  ]);
  const { count, posts } = postsResult;
  const { count: likedPostCount, posts: likedPosts } = likedPostsResult;
  const updatedUsers = await getAllUnknownUsers(
    [...posts, ...likedPosts],
    token,
    existingUsers
  );
  const postsWithUserData: Mumble[] = posts.map((post) => {
    return mapResponseToMumble(post, updatedUsers[post.creator]);
  });
  const likedPostsWithUserData: Mumble[] = likedPosts.map((post) => {
    return mapResponseToMumble(post, updatedUsers[post.creator]);
  });

  return {
    count,
    likedPostCount,
    posts: postsWithUserData,
    likedPosts: likedPostsWithUserData,
    users: updatedUsers,
  };
};

export const loadNewUsersProfileTemplateData = async (
  token: string = '',
  existingUsers?: MumbleUsers
): Promise<GetNewUserProfileTemplateData> => {
  const [postsResult, usersResult] = await Promise.all([
    getPosts(),
    getUsers(token),
  ]);
  const { posts } = postsResult;
  const mumbleUsers = usersResult;
  const updatedUsers = await getAllUnknownUsers(posts, token, existingUsers);
  const postsWithUserData: Mumble[] = posts.map((post) => {
    return mapResponseToMumble(post, updatedUsers[post.creator]);
  });

  return {
    posts: postsWithUserData,
    users: mumbleUsers,
  };
};

export const getMumbleDetailsWithUserData = async (
  token: string,
  id: string
): Promise<GetPostDetailsResponse> => {
  const [postResult, repliesResult] = await Promise.all([
    getMumbleById(id),
    getReplies(id),
  ]);
  const mumble = mapResponseToMumble(postResult);
  const replies = repliesResult;
  const updatedUsers = await getAllUnknownUsers([mumble, ...replies], token);
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

export const getAllUnknownUsers = async (
  mumbles: Mumble[],
  token: string,
  existingUsers?: MumbleUsers
): Promise<MumbleUsers> => {
  const unknownCreators = mumbles.reduce((set, item) => {
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
    }, {} as MumbleUsers),
  };
  return updatedUsers;
};