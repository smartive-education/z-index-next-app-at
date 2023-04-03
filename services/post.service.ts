import {
  GetPostResponse,
  GetPostsQueryParams,
  LoggedInUser,
  Mumble,
  Response,
} from '../models';
import { mapResponseToMumble } from '../models/mappers';

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

    const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
    });
    const response: Response = await res.json();
    return mapResponseToMumble(response, loggedInUser);
  }
  throw Error('loggedInUser must exist at this point');
};

export const getMumbleById = async (id: string): Promise<Response> => {
  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/${id}`;
  const res = await fetch(url);
  const mumble: Response = await res.json();
  return mumble;
};

export const getPostsByUser = async (
  creator: string
): Promise<GetPostResponse> => {
  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?creator=${creator}`;
  const res = await fetch(url);
  const { count, data } = await res.json();
  const posts = data.map(mapResponseToMumble);
  return {
    count,
    posts,
  };
};
