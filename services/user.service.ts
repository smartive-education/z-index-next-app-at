import { GetUsersQueryParams, MumbleUser, MumbleUsers } from '../models';
import { mapResponseToUser, getApiUrl } from '../models/mappers';

export const getUsers = async (
  token: string,
  params?: GetUsersQueryParams
): Promise<MumbleUsers> => {
  const queryParams = new URLSearchParams({
    limit: String(params?.limit || 6),
    offset: String(params?.offset || 0),
  });

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', `Bearer ${token}`);

  const url = `${getApiUrl()}/users?${queryParams}`;
  const res = await fetch(url, { headers });
  if (!res.ok || res.status >= 400) {
    throw new Error('Failed to get users');
  }
  const { data } = await res.json();
  return data
    .map(mapResponseToUser)
    .reduce((newUsers: MumbleUsers, user: MumbleUser) => {
      newUsers[user.id] = user;
      return newUsers;
    }, {} as MumbleUsers);
};

export const getLoggedInMumbleUser = async (
  token: string
): Promise<MumbleUser> => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', `Bearer ${token}`);

  const url = `${getApiUrl()}/users/me`;
  const res = await fetch(url, { headers });
  if (!res.ok || res.status >= 400) {
    throw new Error('Failed to get loggedInUser');
  }
  const response = await res.json();
  return mapResponseToUser(response);
};

export const getUserById = async (
  id: string,
  token: string
): Promise<MumbleUser> => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', `Bearer ${token}`);

  const url = `${getApiUrl()}/users/${id}`;
  const res = await fetch(url, { headers });
  if (!res.ok || res.status >= 400) {
    throw new Error('Failed to get user');
  }
  const response = await res.json();
  return mapResponseToUser(response);
};
