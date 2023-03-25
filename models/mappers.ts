import { decodeTime } from 'ulid';
import { MumbleUser, Post, PostWithUserData, Reply, ReplyWithUserData, Response } from '.';

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

export const mapResponseToUser = (response: Response): MumbleUser =>
  ({
    ...response,
  } as MumbleUser);

export const mapPostToPostWithUserData = (
  post: Post,
  user?: MumbleUser
): PostWithUserData =>
  ({
    ...post,
    fullName: `${user?.firstName} ${user?.lastName}`,
    userName: user?.userName,
    avatarUrl: user?.avatarUrl,
  } as PostWithUserData);

  export const mapReplyToReplyWithUserData = (
    reply: Reply,
    user?: MumbleUser
  ): ReplyWithUserData =>
    ({
      ...reply,
      fullName: `${user?.firstName} ${user?.lastName}`,
      userName: user?.userName,
      avatarUrl: user?.avatarUrl,
    } as ReplyWithUserData);