import {
  GetPostResponse,
  GetPostsQueryParams,
  LoggedInUser,
  Mumble,
  Response,
  SearchPostsRequestBody,
  SearchPostsParams,
} from '../models';
import { mapResponseToMumble, getApiUrl } from '../models/mappers';

export const getPosts = async (
  params?: GetPostsQueryParams
): Promise<GetPostResponse> => {
  const queryParams = new URLSearchParams({
    limit: String(params?.limit || 5),
    offset: String(params?.offset || 0),
    newerThan: params?.newerThanMumbleId || '',
    olderThan: params?.olderThanMumbleId || '',
    creator: params?.creator || '',
  });

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const url = `${getApiUrl()}/posts?${queryParams}`;
  const res = await fetch(url, { headers });
  if (!res.ok || res.status >= 400 ) {
    throw new Error('Failed to get posts');
  }
  const { count, data } = await res.json();
  const posts = data.map(mapResponseToMumble);
  return {
    count,
    posts,
  };
};

export const getLikedPosts = async (
  token: string,
  params: SearchPostsParams
): Promise<GetPostResponse> => {
  const searchConditions: SearchPostsRequestBody = {
    offset: params?.offset || 0,
    limit: params?.limit || 5,
    likedBy: params.likedBy,
    text: '',
    tags: [],
    mentions: [],
    isReply: false,
  };

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', `Bearer ${token}`);
  headers.append('Accept', 'application/json');

  const url = `${getApiUrl()}/posts/search`;
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(searchConditions),
    headers,
  });
  if (!res.ok || res.status >= 400 ) {
    throw new Error('Failed to get posts');
  }
  const { count, data } = await res.json();
  const posts = data.map(mapResponseToMumble);
  return {
    count,
    posts,
  };
};

export const createPost = async (
  text: string,
  loggedInUser?: LoggedInUser,
  image?: File
): Promise<Mumble> => {
  if (loggedInUser) {
    const formData = new FormData();
    formData.append('text', text);
    if (image) {
      formData.append('image', image);
    }

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${loggedInUser.accessToken}`);

    const url = `${getApiUrl()}/posts?`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
    });
    if (!res.ok || res.status >= 400 ) {
      throw new Error('Failed to create post');
    }
    const response: Response = await res.json();
    return mapResponseToMumble(response, loggedInUser);
  }
  throw Error('loggedInUser must exist at this point');
};

export const getMumbleById = async (id: string): Promise<Response> => {
  const url = `${getApiUrl()}/posts/${id}`;
  const res = await fetch(url);
  if (!res.ok || res.status >= 400 ) {
    throw new Error('Failed to get post');
  }
  const mumble: Response = await res.json();
  return mumble;
};

export const getPostsByUser = async (
  creator: string
): Promise<GetPostResponse> => {
  const url = `${getApiUrl()}/posts?creator=${creator}`;
  const res = await fetch(url);
  const { count, data } = await res.json();
  if (!res.ok || res.status >= 400 ) {
    throw new Error('Failed to get posts');
  }
  const posts = data.map(mapResponseToMumble);
  return {
    count,
    posts,
  };
};
