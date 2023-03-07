import { decodeTime } from 'ulid';
import { Post, Reply, Response } from '.';

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
