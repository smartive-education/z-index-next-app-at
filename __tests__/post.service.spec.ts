import { LoggedInUser } from '../models';
import { mapResponseToMumble } from '../models/mappers';
import {
  createPost,
  getLikedPosts,
  getMumbleById,
  getPosts,
  getPostsByUser,
} from '../services/post.service';
import { postResponse } from '../test-data/test.data';

describe('Post Service', () => {
  const expectedMumble = mapResponseToMumble(postResponse);
  const expectedHeaders = new Headers();
  expectedHeaders.append('Content-Type', 'application/json');
  const token = 'token';

  describe('getPosts', () => {
    it('should call fetch with GET with default query params', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ count: 1, data: [postResponse] })
            ),
        } as unknown as Response)
      );

      const result = await getPosts();

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?limit=5&offset=0&newerThan=&olderThan=&creator=`,
        { headers: expectedHeaders }
      );
      expect(result).toEqual({ count: 1, posts: [expectedMumble] });
    });

    it('should call fetch with GET with newerThan query param', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ count: 1, data: [postResponse] })
            ),
        } as unknown as Response)
      );

      const result = await getPosts({ newerThanMumbleId: '1' });

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?limit=5&offset=0&newerThan=1&olderThan=&creator=`,
        { headers: expectedHeaders }
      );
      expect(result).toEqual({ count: 1, posts: [expectedMumble] });
    });

    it('should throw error if status is not ok', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
        } as unknown as Response)
      );

      await expect(getPosts()).rejects.toThrow('Failed to get posts');

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?limit=5&offset=0&newerThan=&olderThan=&creator=`,
        { headers: expectedHeaders }
      );
    });

    it('should throw error if status >= 400', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 400,
        } as unknown as Response)
      );

      await expect(getPosts()).rejects.toThrow('Failed to get posts');

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?limit=5&offset=0&newerThan=&olderThan=&creator=`,
        { headers: expectedHeaders }
      );
    });
  });

  describe('getLikedPosts', () => {
    const expectedHeaders = new Headers();
    expectedHeaders.append('Content-Type', 'application/json');
    expectedHeaders.append('Authorization', `Bearer ${token}`);
    expectedHeaders.append('Accept', 'application/json');

    const expectedBody = {
      offset: 0,
      limit: 5,
      likedBy: ['1'],
      text: '',
      tags: [],
      mentions: [],
      isReply: false,
    };
    it('should call POST with default body', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ count: 1, data: [postResponse] })
            ),
        } as unknown as Response)
      );

      const result = await getLikedPosts(token, { likedBy: ['1'] });

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/search`,
        {
          headers: expectedHeaders,
          method: 'POST',
          body: JSON.stringify(expectedBody),
        }
      );
      expect(result).toEqual({ count: 1, posts: [expectedMumble] });
    });

    it('should call POST with offset', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ count: 1, data: [postResponse] })
            ),
        } as unknown as Response)
      );

      const result = await getLikedPosts(token, { likedBy: ['1'], offset: 1 });

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/search`,
        {
          headers: expectedHeaders,
          method: 'POST',
          body: JSON.stringify({ ...expectedBody, offset: 1 }),
        }
      );
      expect(result).toEqual({ count: 1, posts: [expectedMumble] });
    });

    it('should throw error if status is not ok', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
        } as unknown as Response)
      );

      await expect(getLikedPosts(token, { likedBy: ['1'] })).rejects.toThrow(
        'Failed to get posts'
      );

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/search`,
        {
          headers: expectedHeaders,
          method: 'POST',
          body: JSON.stringify({ ...expectedBody }),
        }
      );
    });

    it('should throw error if status >= 400', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 400,
        } as unknown as Response)
      );

      await expect(getLikedPosts(token, { likedBy: ['1'] })).rejects.toThrow(
        'Failed to get posts'
      );

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/search`,
        {
          headers: expectedHeaders,
          method: 'POST',
          body: JSON.stringify({ ...expectedBody }),
        }
      );
    });
  });

  describe('createPost', () => {
    const text = 'text';
    const image = new File([''], 'image.png', { type: 'image/png' });
    const loggedInUser: LoggedInUser = {
      id: '1',
      userName: 'username',
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
      avatarUrl: 'avatarUrl',
      accessToken: token,
    };

    const expectedHeaders = new Headers();
    expectedHeaders.append('Authorization', `Bearer ${token}`);

    const expectedMumbleWithUserData = {
      ...expectedMumble,
      userName: loggedInUser.userName,
      fullName: `${loggedInUser.firstName} ${loggedInUser.lastName}`,
      avatarUrl: loggedInUser.avatarUrl,
    };

    it('should call POST with text only', async () => {
      const expectedBody = new FormData();
      expectedBody.append('text', text);
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: jest
            .fn()
            .mockImplementation(() => Promise.resolve(postResponse)),
        } as unknown as Response)
      );

      const result = await createPost(text, loggedInUser);

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?`,
        {
          headers: expectedHeaders,
          method: 'POST',
          body: expectedBody,
        }
      );
      expect(result).toEqual(expectedMumbleWithUserData);
    });

    it('should call POST with text and image', async () => {
      const expectedBody = new FormData();
      expectedBody.append('text', text);
      expectedBody.append('image', image);
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: jest
            .fn()
            .mockImplementation(() => Promise.resolve(postResponse)),
        } as unknown as Response)
      );

      const result = await createPost(text, loggedInUser, image);

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?`,
        {
          headers: expectedHeaders,
          method: 'POST',
          body: expectedBody,
        }
      );
      expect(result).toEqual(expectedMumbleWithUserData);
    });

    it('should throw error if loggedInUser is missing', async () => {
      await expect(createPost(text, undefined)).rejects.toThrow(
        'loggedInUser must exist at this point'
      );
    });

    it('should throw error if status is not ok', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
        } as unknown as Response)
      );

      await expect(createPost('', loggedInUser)).rejects.toThrow(
        'Failed to create post'
      );
    });

    it('should throw error if status >= 400', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 400,
        } as unknown as Response)
      );

      await expect(createPost('', loggedInUser)).rejects.toThrow(
        'Failed to create post'
      );
    });
  });

  describe('getMumbleById', () => {
    const id = '1';
    it('should call get with ID', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve(postResponse)
            ),
        } as unknown as Response)
      );

      const result = await getMumbleById(id);

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/${id}`
      );
      expect(result).toEqual(postResponse);
    });

    it('should throw error if status is not ok', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
        } as unknown as Response)
      );

      await expect(getMumbleById(id)).rejects.toThrow('Failed to get post');

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/${id}`
      );
    });

    it('should throw error if status >= 400', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 400,
        } as unknown as Response)
      );

      await expect(getMumbleById(id)).rejects.toThrow('Failed to get post');

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/${id}`
      );
    });
  });

  describe('getPostsByUser', () => {
    const creator = '1';
    it('should call GET with creator', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ count: 1, data: [postResponse] })
            ),
        } as unknown as Response)
      );

      const result = await getPostsByUser(creator);

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?creator=${creator}`,
      );
      expect(result).toEqual({ count: 1, posts: [expectedMumble] });
    });

    it('should throw error if status is not ok', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
          json: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ count: 1, data: [postResponse] })
            ),
        } as unknown as Response)
      );

      await expect(getPostsByUser(creator)).rejects.toThrow('Failed to get posts');
    });

    it('should throw error if status >= 400', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 400,
          json: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ count: 1, data: [postResponse] })
            ),
        } as unknown as Response)
      );

      await expect(getPostsByUser(creator)).rejects.toThrow('Failed to get posts');
    });
  });

});
