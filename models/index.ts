export type MumbleType = 'post' | 'reply' | 'deleted';
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

export interface GetPostsResponse {
  readonly count: number;
  readonly posts: Post[];
}

export interface GetPostsQueryParams {
  limit?: number;
  offset?: number;
  newerThanMumbleId?: string;
  olderThanMumbleId?: string;
}
export interface Reply extends MumbleBase {
  readonly parentId: string;
  readonly createdTimestamp: string;
}

export interface GetPostDetailsResponse {
  readonly post: Post;
  readonly replies: Reply[];
}
