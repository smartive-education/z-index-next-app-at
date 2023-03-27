import { decodeTime } from 'ulid';
import { MumbleUser, Post, Reply, Response, Profile } from '.';

export const mapResponseToPost = (response: Response): Post =>
  ({
    ...response,
    createdTimestamp: new Date(decodeTime(response.id)).toDateString(), //TODO add logic to change this to current date - created date string
  } as Post);

export const mapResponseToReply = (response: Response): Reply =>
  ({
    ...response,
    createdTimestamp: new Date(decodeTime(response.id)).toDateString(), //TODO add logic to change this to current date - created date string
  } as Reply);

  export const mapResponseToProfile = (response: Response): Profile =>
  ({
    ...response,//TODO add logic to change this to current date - created date string
  } as Profile);

  export const mapResponseToUser = (response: Response): MumbleUser =>
  ({
    ...response,
  } as MumbleUser);
