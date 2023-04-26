import {
  GetUsersQueryParams,
  Mumble,
  MumbleUser,
  MumbleUsers,
} from '../models';
import { mapResponseToUser } from '../models/mappers';

export const getAllUnknownUsers = async (
  mumbles: Mumble[],
  token: string,
  existingUsers?: MumbleUsers
): Promise<MumbleUsers> => {
  const unknownCreators = mumbles.reduce((set, item) => {
    if (!existingUsers || !existingUsers[item.creator]) {
      set.add(item.creator);
    }
    return set;
  }, new Set<string>());
  const users = await Promise.all(
    Array.from(unknownCreators).map((creator: string) =>
      getUserById(creator, token)
    )
  );

  const updatedUsers: MumbleUsers = {
    ...(existingUsers || {}),
    ...users.reduce((newUsers, user: MumbleUser) => {
      newUsers[user.id] = user;
      return newUsers;
    }, {} as MumbleUsers),
  };
  return updatedUsers;
};

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

  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/users?${queryParams}`;
  const res = await fetch(url, { headers });
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

  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/users/me`;
  const res = await fetch(url, { headers });
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

  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/users/${id}`;
  const res = await fetch(url, { headers });
  const response = await res.json();
  return mapResponseToUser(response);
};
