import {
  RequestResult,
  GetPostsQueryParams,
  GetPostsResponse,
  ServerPost,
  ClientPost,
} from '../models';
import { mapServerPostToPost } from '../models/mappers';

export const getPosts = async (
  params?: GetPostsQueryParams
): Promise<RequestResult<GetPostsResponse>> => {
  const queryParams = new URLSearchParams({
    limit: String(params?.limit || 5),
    offset: String(params?.offset || 0),
    newerThan: params?.newerThanMumbleId || '',
    olderThan: params?.olderThanMumbleId || '',
  });

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?${queryParams}`;

  try {
    const res = await fetch(url, { headers });
    if (res?.ok) {
      const { count, data } = await res.json();
      const posts = data.map(mapServerPostToPost);
      return {
        response: {
          count,
          posts,
        },
      };
    } else {
      const error = new Error(`Loading ${url} has failed`);
      error.cause = res.status;
      return {
        error,
      };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const createPost = async (
  text: string,
  image: File | undefined,
  token: string | undefined
): Promise<RequestResult<ClientPost>> => {
  const formData = new FormData();
  formData.append('text', text);
  if (image) {
    formData.append('image', image);
  }

  const headers = new Headers();
  headers.append('Authorization', `Bearer ${token}`);

  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
    });
    if (res?.ok) {
      const post: ServerPost = await res.json();
      return {
        response: mapServerPostToPost(post),
      };
    } else {
      const error = new Error(`Posting to ${url} has failed`);
      error.cause = res.status;
      return {
        error,
      };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};
