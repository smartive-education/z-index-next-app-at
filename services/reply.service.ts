import { Mumble, Response } from '../models';
import { mapResponseToMumble } from '../models/mappers';

export const getReplies = async (id: string): Promise<Mumble[]> => {
  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/${id}/replies`;
  const res = await fetch(url);
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

  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/${postId}`;
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    headers,
  });
  const response: Response = await res.json();
  return mapResponseToMumble(response);
};
