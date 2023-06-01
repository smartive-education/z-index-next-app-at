import { Mumble, Response } from '../models';
import { mapResponseToMumble, getApiUrl } from '../models/mappers';

export const getReplies = async (id: string): Promise<Mumble[]> => {
  const url = `${getApiUrl()}/posts/${id}/replies`;
  const res = await fetch(url);
  if (!res.ok || res.status >= 400) {
    throw new Error('Failed to get replies');
  }
  const response: Response[] = await res.json();
  return response.map((item) => mapResponseToMumble(item));
};

export const createReply = async (
  text: string,
  image: File | undefined,
  token: string | undefined,
  postId: string
): Promise<Mumble> => {
  const formData = new FormData();
  formData.append('text', text);
  if (image) {
    formData.append('image', image);
  }

  const headers = new Headers();
  headers.append('Authorization', `Bearer ${token}`);

  const url = `${getApiUrl()}/posts/${postId}`;
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    headers,
  });
  if (!res.ok || res.status >= 400) {
    throw new Error('Failed to create reply');
  }
  const response: Response = await res.json();
  return mapResponseToMumble(response);
};
