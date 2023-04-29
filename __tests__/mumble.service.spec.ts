import {
  Mumble,
  MumbleUser,
  MumbleUsers,
  SearchPostsParams
} from '../models';
import { mapResponseToMumble, mapResponseToUser } from '../models/mappers';
import {
  matchingUserResponse,
  postResponse,
  userResponse,
} from '../test-data/test.data';

import {
  getAllUnknownUsers,
  getLikedPostsWithUserData,
  getMumbleDetailsWithUserData,
  getPostsAndLikedPostsWithUserData,
  getPostsWithUserData,
  loadNewUsersProfileTemplateData,
} from '../services/mumble.service';
import * as userService from '../services/user.service';

const mumbleUser = mapResponseToUser(userResponse);
const mumble: Mumble = mapResponseToMumble(postResponse);
const mumbles: Mumble[] = [mumble];
const existingUsers: MumbleUsers = { [mumbleUser.id]: mumbleUser };
jest.mock('../services/user.service', () => ({
  __esModule: true,
  getUserById: () => Promise.resolve(mumbleUser),
  getUsers: () => Promise.resolve(existingUsers),
}));
jest.mock('../services/post.service', () => ({
  __esModule: true,
  getPosts: () => Promise.resolve({ count: 1, posts: [postResponse] }),
  getMumbleById: () => Promise.resolve(postResponse),
  getLikedPosts: () => Promise.resolve({ count: 1, posts: [postResponse] }),
}));
jest.mock('../services/reply.service', () => ({
  __esModule: true,
  getReplies: () => Promise.resolve(mumbles),
}));

describe('Mumble Service', () => {
  const token = 'token';
  const id = '1';

  describe('getAllUnknownUsers', () => {
    it('should add new users to existing user', async () => {
      const existingUsers: MumbleUsers = { 2: mumbleUser };
      const expectedUsers: MumbleUsers = {
        2: mumbleUser,
        [mumbleUser.id]: mumbleUser,
      };
      const result = await getAllUnknownUsers(mumbles, token, existingUsers);
      expect(result).toEqual(expectedUsers);
    });

    it('should not call getUsersById if no unknown users are present', async () => {
      const matchingUser: MumbleUser = mapResponseToUser(matchingUserResponse);
      const existingUsers: MumbleUsers = { [matchingUser.id]: matchingUser };
      const expectedUsers: MumbleUsers = existingUsers;
      const result = await getAllUnknownUsers(mumbles, token, existingUsers);
      jest.spyOn(userService, 'getUserById');
      expect(userService.getUserById).not.toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });

    it('should return existing users if mumbles is empty', async () => {
      const existingUsers: MumbleUsers = { 2: mumbleUser };
      const expectedUsers: MumbleUsers = existingUsers;
      const result = await getAllUnknownUsers([], token, existingUsers);
      jest.spyOn(userService, 'getUserById');
      expect(userService.getUserById).not.toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });

    it('should add new users if no existing user exists', async () => {
      const expectedUsers: MumbleUsers = {
        [mumbleUser.id]: mumbleUser,
      };
      const result = await getAllUnknownUsers(mumbles, token, undefined);
      expect(result).toEqual(expectedUsers);
    });
  });
  describe('getPostsWithUserData', () => {
    it('should return count posts and updated mumbleUsers', async () => {
      const result = await getPostsWithUserData(
        token,
        undefined,
        existingUsers
      );
      expect(result).toEqual({
        count: 1,
        posts: [mumble],
        users: existingUsers,
      });
    });
  });

  describe('getLikedPostsWithUserData', () => {
    it('should return count posts and updated mumbleUsers', async () => {
      const result = await getLikedPostsWithUserData(
        token,
        undefined as unknown as SearchPostsParams,
        existingUsers
      );
      expect(result).toEqual({
        count: 1,
        posts: [mumble],
        users: existingUsers,
      });
    });
  });

  describe('getPostsAndLikedPostsWithUserData', () => {
    it('should return count posts likedPostCount likedPosts and updated mumbleUsers', async () => {
      const result = await getPostsAndLikedPostsWithUserData(
        token,
        undefined as unknown as SearchPostsParams
      );
      expect(result).toEqual({
        count: 1,
        posts: [mumble],
        likedPostCount: 1,
        likedPosts: [mumble],
        users: existingUsers,
      });
    });
  });

  describe('loadNewUsersProfileTemplateData', () => {
    it('should return posts and updated mumbleUsers', async () => {
      const result = await loadNewUsersProfileTemplateData(
        token,
        existingUsers
      );
      expect(result).toEqual({
        posts: [mumble],
        users: existingUsers,
      });
    });
  });

  describe('getMumbleDetailsWithUserData', () => {
    it('should return post and replies', async () => {
      const result = await getMumbleDetailsWithUserData(token, id);
      expect(result).toEqual({
        post: mumble,
        replies: [mumble],
      });
    });
  });
});
