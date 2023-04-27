import { mapResponseToMumble } from '../models/mappers';
import { getPosts } from '../services/post.service';
import { postResponse } from '../test-data/test.data';

describe('Post Service', () => {
  const expectedMumble = mapResponseToMumble(postResponse);
  const expectedHeaders = new Headers();
  expectedHeaders.append('Content-Type', 'application/json');

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

      expect(fetch).toHaveBeenCalledTimes(1);
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

      expect(fetch).toHaveBeenCalledTimes(1);
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

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?limit=5&offset=0&newerThan=&olderThan=&creator=`,
        { headers: expectedHeaders }
      );
    });

    it('should throw error if status >= 400', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 400
        } as unknown as Response)
      );

      await expect(getPosts()).rejects.toThrow('Failed to get posts');

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?limit=5&offset=0&newerThan=&olderThan=&creator=`,
        { headers: expectedHeaders }
      );
    });
  });
});
