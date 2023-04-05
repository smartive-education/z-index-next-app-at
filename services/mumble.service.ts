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

//TODO extract getUsers into helper
//TODO replace {} as { [key: string]: MumbleUser } with MumbleUsers
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

//TODO add Promise.allSettled to make it faster
export const getPostsAndLikedPostsWithUserData = async (
  token: string = '',
  searchParams: SearchPostsParams,
  params?: GetPostsQueryParams,
  existingUsers?: MumbleUsers
): Promise<GetPostsAndLikedPostsWithUserDataResponse> => {
  const { count, posts } = await getPosts(params);
  const { count: likedPostCount, posts: likedPosts } = await getLikedPosts(
    token,
    searchParams
  );
  const unknownCreators = [...posts, ...likedPosts].reduce((set, item) => {
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

//TODO add Promise.allsettled
export const loadnNewUsersProfileTemplateData = async (
  token: string = '',
  existingUsers?: MumbleUsers
): Promise<GetNewUserProfileTemplateData> => {
  const { posts } = await getPosts();
  const mumbleUsers = await getUsers(token);
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
    posts: postsWithUserData,
    users: mumbleUsers,
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
