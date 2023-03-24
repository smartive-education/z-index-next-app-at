import {
  GetPostResponse,
  GetPostsQueryParams,
  MumbleUser,
  Post,
  PostWithUserData,
  Response,
  GetPostsWithUserDataResponse,
  MumbleUsers,
} from '../models';
import {
  mapPostToPostWithUserData,
  mapResponseToPost,
} from '../models/mappers';
import { getUserById } from './user.service';

export const getPosts = async (
  params?: GetPostsQueryParams
): Promise<GetPostResponse> => {
  const queryParams = new URLSearchParams({
    limit: String(params?.limit || 5),
    offset: String(params?.offset || 0),
    newerThan: params?.newerThanMumbleId || '',
    olderThan: params?.olderThanMumbleId || '',
  });

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?${queryParams}`;
  const res = await fetch(url, { headers });
  const { count, data } = await res.json();
  const posts = data.map(mapResponseToPost);
  return {
    count,
    posts,
  };
};

export const getPostsWithUserData = async (
  token: string,
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

export const createPost = async (
  text: string,
  image: File | undefined,
  token: string | undefined
): Promise<Post> => {
  const formData = new FormData();
  formData.append('text', text);
  if (image) {
    formData.append('image', image);
  }

  const headers = new Headers();
  headers.append('Authorization', `Bearer ${token}`);

  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?`;
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    headers,
  });
  const response: Response = await res.json();
  return mapResponseToPost(response);
};

export const getPostById = async (id: string): Promise<Post> => {
  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/${id}`;
  const res = await fetch(url);
  const post: Response = await res.json();
  return mapResponseToPost(post);
};
