import { decodeTime } from 'ulid';
import { Mumble, MumbleUser, Response } from '.';

export const mapResponseToUser = (response: Response): MumbleUser =>
  ({
    ...response,
  } as MumbleUser);

//TODO fix createdTimestamp
export const mapResponseToMumble = (
  response: Response,
  user?: Partial<MumbleUser>
): Mumble => {
  if (user) {
    return {
      ...response,
      createdTimestamp: new Date(decodeTime(response?.id || '')).toDateString(),
      fullName: `${user.firstName} ${user.lastName}`,
      userName: user.userName,
      avatarUrl: user.avatarUrl,
    } as Mumble;
  }
  return {
    ...response,
    createdTimestamp: new Date(decodeTime(response?.id || '')).toDateString(),
  } as Mumble;
};
