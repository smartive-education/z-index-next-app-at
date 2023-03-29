import { GetUsersQueryParams, MumbleUser } from '../models';
import { mapResponseToUser } from '../models/mappers';

export const getUsers = async (
  token: string,
  params?: GetUsersQueryParams
): Promise<Map<string, MumbleUser>> => {
  const queryParams = new URLSearchParams({
    limit: String(params?.limit || 1000),
    offset: String(params?.offset || 0),
  });

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', `Bearer ${token}`);

  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/users?${queryParams}`;
  const res = await fetch(url, { headers });
  const { data } = await res.json();
  return data
    .map(mapResponseToUser)
    .reduce((result: Map<string, MumbleUser>, item: MumbleUser) => {
      result.set(item.id, item);
      return result;
    }, new Map());
};

export const getLoggedInUser = async (token: string): Promise<MumbleUser> => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', `Bearer ${token}`);

  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/users/me`;
  const res = await fetch(url, { headers });
  const response = await res.json();
  return mapResponseToUser(response);
};

export const getUserById = async (
  token: string,
  id?: string): Promise<MumbleUser> => {
  const headers = new Headers();
  console.log('param', id)
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', `Bearer ${token}`);

  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/users/${id}`;
  const res = await fetch(url, { headers });
  const response = await res.json();
  return mapResponseToUser(response);
}
