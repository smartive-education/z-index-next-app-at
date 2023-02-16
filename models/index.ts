export interface Call<T> {
  readonly response?: T;
  readonly error?: Error;
}
export interface MumbleBase {
  readonly id: string;
  readonly creator: string;
  readonly text: string;
  readonly mediaUrl: string;
  readonly mediaType: string;
  readonly likeCount: number;
  readonly likedByUser: boolean;
  readonly type: string;
}

export interface ServerPost extends MumbleBase {
  readonly replyCount: number;
}

export interface ClientPost extends MumbleBase {
  readonly replyCount: number;
  readonly createdTimestamp: string;
}

export interface GetPostsResponse {
  readonly count: number;
  readonly posts: ClientPost[];
}

export interface GetPostsQueryParams {
  limit?: number;
  offset?: number;
  newerThanMumbleId?: string;
  olderThanMumbleId?: string;
}
export interface Reply extends MumbleBase {
  readonly parentId: string;
}
