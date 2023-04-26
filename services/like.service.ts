import { LikeParams } from '../models';

export const like = async (
  id: string,
  isLike: boolean,
  token: string | undefined
): Promise<LikeParams> => {
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${token}`);

  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/${id}/likes`;
  const method = isLike ? 'PUT' : 'DELETE';

  await fetch(url, {
    method: method,
    headers,
  });
  return { id, isLike };
};
