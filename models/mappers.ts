import { decodeTime } from 'ulid';
import { Mumble, MumbleUser, Response } from '.';
import { day, hour, minute } from './constants';

export const mapResponseToUser = (response: Response): MumbleUser =>
  ({
    ...response,
  } as MumbleUser);

export const mapResponseToMumble = (
  response: Response,
  user?: Partial<MumbleUser>
): Mumble => {
  if (user) {
    return {
      ...response,
      createdTimestamp: convertTimeStamp(
        new Date(decodeTime(response?.id || '')),
        new Date()
      ),
      fullName: `${user.firstName} ${user.lastName}`,
      userName: user.userName,
      avatarUrl: user.avatarUrl,
    } as Mumble;
  }
  return {
    ...response,
    createdTimestamp: convertTimeStamp(
      new Date(decodeTime(response?.id || '')),
      new Date()
    ),
  } as Mumble;
};

export const convertTimeStamp = (creationDate: Date, current: Date): string => {
  const elapsedTimeInMillis = current.valueOf() - creationDate.valueOf();
  const days = Math.floor(elapsedTimeInMillis / day);
  if (days >= 1) {
    return `vor ${days} ${days < 2 ? 'Tag' : 'Tage'}`;
  }
  const hours = Math.floor(elapsedTimeInMillis / hour);
  if (hours >= 1) {
    return `vor ${hours} ${hours < 2 ? 'Stunde' : 'Stunden'}`;
  }
  const minutes = Math.floor(elapsedTimeInMillis / minute);
  if (minutes >= 1) {
    return `vor ${minutes} ${minutes < 2 ? 'Minute' : 'Minuten'}`;
  }
  return 'jetzt';
};

export const convertRouteToSiteName = (route: string): string => {
  switch (route) {
    case '/':
      return 'Timeline';
    case '/mumble/[id]':
      return 'Detail';
    case '/profile/[id]':
      return 'Profile';
    case '/auth/login':
      return 'Login';
    case '/error':
      return 'Error';
    default:
      return '';
  }
};

export const getApiUrl = (): string => {
  const env = process.env;
  return env.NEXT_PUBLIC_QWACKER_API_URL ?? '';
}