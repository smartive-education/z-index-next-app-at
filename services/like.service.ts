import { LikeParams } from '../models';
import { getApiUrl } from '../models/mappers';

export const like = async (
  id: string,
  isLike: boolean,
  token: string | undefined
): Promise<LikeParams> => {
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${token}`);

  const url = `${getApiUrl()}/posts/${id}/likes`;
  const method = isLike ? 'PUT' : 'DELETE';

  const response: Response = await fetch(url, {
    method: method,
    headers,
  });

  if (!response.ok || response.status >= 400 ) {
    throw new Error('Like failed');
  }
  
  return { id, isLike };
};
