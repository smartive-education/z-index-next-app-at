import { RequestResult } from '../models';

export const likePost = async (
  id: string,
  isLike: boolean,
  token: string | undefined
): Promise<RequestResult<string>> => {
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${token}`);

  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/${id}/likes`;
  const method = isLike ? 'PUT' : 'DELETE';

  try {
    const res = await fetch(url, {
      method: method,
      headers,
    });
    if (res?.ok) {
      return {
        response: id,
      };
    } else {
      const error = new Error(`${method} on ${url} has failed`);
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
