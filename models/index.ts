export type MumbleType = 'post' | 'reply' | 'deleted';
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';
export type FailedOperation = 'init' | 'update' | 'create' | 'like' | 'none';

export interface MumbleBase {
  readonly id: string;
  readonly creator: string;
  readonly text: string;
  readonly mediaUrl: string;
  readonly mediaType: string;
  readonly likeCount: number;
  readonly likedByUser: boolean;
  readonly type: MumbleType;
}

export interface Mumble extends MumbleBase {
  readonly createdTimestamp: string;
  readonly replyCount?: number;
  readonly parentId?: string;
  readonly fullName?: string;
  readonly userName?: string;
  readonly avatarUrl?: string;
}

export interface Response {
  readonly id: string;
  [key: string]: any;
}

export interface MumbleUser {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface LoggedInUser extends MumbleUser {
  accessToken: string;
  displayName: string;
  profileLink: string;
  email?: string;
  city?: string;
  bio?: string;
  posterImage?: string;
  createdAt?: string;
}

export interface GetPostResponse {
  readonly count: number;
  readonly posts: Mumble[];
}

export interface GetPostsWithUserDataResponse {
  readonly users: MumbleUsers;
  readonly count: number;
  readonly posts: Mumble[];
}

export interface GetPostsQueryParams {
  limit?: number;
  offset?: number;
  newerThanMumbleId?: string;
  olderThanMumbleId?: string;
}

export interface GetUsersQueryParams {
  limit?: number;
  offset?: number;
}
export interface GetProfileResponse {
  readonly user: MumbleUser;
  readonly posts: Mumble[];
}

export interface GetPostDetailsResponse {
  readonly post: Mumble;
  readonly replies: Mumble[];
}

export interface MumbleUsers {
  [key: string]: MumbleUser;
}

export interface LikeParams {
  id: string;
  isLike: boolean;
}
