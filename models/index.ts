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

export interface Response {
  readonly id: string;
  [key: string]: any;
}

export interface Post extends MumbleBase {
  readonly replyCount: number;
  readonly createdTimestamp: string;
}

export interface PostWithUserData extends Post {
  fullName: string;
  userName: string;
  avatarUrl: string;
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
  readonly posts: Post[];
}

export interface GetPostsWithUserDataResponse {
  readonly users: MumbleUsers;
  readonly count: number;
  readonly posts: PostWithUserData[];
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
  readonly posts: Post[];
}
export interface Reply extends MumbleBase {
  readonly parentId: string;
  readonly createdTimestamp: string;
}

export interface ReplyWithUserData extends Reply {
  fullName: string;
  userName: string;
  avatarUrl: string;
}

export interface GetPostDetailsResponse {
  readonly post: PostWithUserData;
  readonly replies: ReplyWithUserData[];
}

export interface MumbleUsers {
  [key: string]: MumbleUser;
}

export interface LikeParams {
  id: string;
  isLike: boolean;
}

export interface ErrorState {
  failedOperation: FailedOperation;
  isErrorModalOpen: boolean;
}
