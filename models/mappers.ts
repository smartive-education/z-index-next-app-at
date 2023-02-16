import { decodeTime } from 'ulid';
import { ClientPost, ServerPost } from '.';

export const mapServerPostToPost = (serverPost: ServerPost): ClientPost => ({
  ...serverPost,
  createdTimestamp: new Date(decodeTime(serverPost.id)).toDateString(),
});
