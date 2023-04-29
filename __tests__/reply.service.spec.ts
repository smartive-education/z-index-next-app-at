import { mapResponseToMumble } from '../models/mappers';
import { createReply, getReplies } from '../services/reply.service';
import { postResponse } from '../test-data/test.data';

describe('Reply Service', () => {
  const token = 'token';
  const expectedMumble = mapResponseToMumble(postResponse);
  const expectedHeaders = new Headers();
  expectedHeaders.append('Authorization', `Bearer ${token}`);
  const id = '1';

  describe('getReplies', () => {
    it('should call fetch with GET with default query params', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: jest
            .fn()
            .mockImplementation(() => Promise.resolve([postResponse])),
        } as unknown as Response)
      );

      const result = await getReplies(id);

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/${id}/replies`
      );
      expect(result).toEqual([expectedMumble]);
    });

    it('should throw error if status is not ok', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
          json: jest
            .fn()
            .mockImplementation(() => Promise.resolve([postResponse])),
        } as unknown as Response)
      );

      await expect(getReplies(id)).rejects.toThrow('Failed to get replies');
    });

    it('should throw error if status >= 400', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 400,
          json: jest
            .fn()
            .mockImplementation(() => Promise.resolve([postResponse])),
        } as unknown as Response)
      );

      await expect(getReplies(id)).rejects.toThrow('Failed to get replies');
    });
  });

  describe('createReply', () => {
    const text = 'text';
    const image = new File([''], 'image.png', { type: 'image/png' });

    const expectedHeaders = new Headers();
    expectedHeaders.append('Authorization', `Bearer ${token}`);

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

      const result = await createReply(text, undefined, token, id);

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/${id}`,
        {
          headers: expectedHeaders,
          method: 'POST',
          body: expectedBody,
        }
      );
      expect(result).toEqual(expectedMumble);
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

    const result = await createReply(text, image, token, id);

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/${id}`,
      {
        headers: expectedHeaders,
        method: 'POST',
        body: expectedBody,
      }
    );
    expect(result).toEqual(expectedMumble);
    });

    it('should throw error if status is not ok', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
        } as unknown as Response)
      );

      await expect(createReply(text, undefined, token, id)).rejects.toThrow(
        'Failed to create reply'
      );
    });

    it('should throw error if status >= 400', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 400,
        } as unknown as Response)
      );

      await expect(createReply(text, undefined, token, id)).rejects.toThrow(
        'Failed to create reply'
      );
    });
  });
});
