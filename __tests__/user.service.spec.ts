import { MumbleUsers } from '../models';
import { mapResponseToUser } from '../models/mappers';
import {
  getLoggedInMumbleUser,
  getUserById,
  getUsers,
} from '../services/user.service';
import { userResponse } from '../test-data/test.data';

describe('User Service', () => {
  const expectedUser = mapResponseToUser(userResponse);
  const expectedMumbleUsers: MumbleUsers = {};
  expectedMumbleUsers[expectedUser.id] = expectedUser;
  const token = 'token';
  const expectedHeaders = new Headers();
  expectedHeaders.append('Content-Type', 'application/json');
  expectedHeaders.append('Authorization', `Bearer ${token}`);

  describe('getUsers', () => {
    it('should call fetch with GET with default query params', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ data: [userResponse] })
            ),
        } as unknown as Response)
      );

      const result = await getUsers(token);

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/users?limit=6&offset=0`,
        { headers: expectedHeaders }
      );
      expect(result).toEqual(expectedMumbleUsers);
    });

    it('should call fetch with GET with offset query param', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: jest
            .fn()
            .mockImplementation(() =>
              Promise.resolve({ data: [userResponse] })
            ),
        } as unknown as Response)
      );
      const result = await getUsers(token, { offset: 1 });

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/users?limit=6&offset=1`,
        { headers: expectedHeaders }
      );
      expect(result).toEqual(expectedMumbleUsers);
    });

    it('should throw error if status is not ok', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
        } as unknown as Response)
      );

      await expect(getUsers(token)).rejects.toThrow('Failed to get users');
    });

    it('should throw error if status >= 400', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 400,
        } as unknown as Response)
      );

      await expect(getUsers(token)).rejects.toThrow('Failed to get users');
    });
  });

  describe('getUserById', () => {
    const id = '1';
    it('should call get with ID', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: jest
            .fn()
            .mockImplementation(() => Promise.resolve(userResponse)),
        } as unknown as Response)
      );

      const result = await getUserById(id, token);

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/users/${id}`,
        { headers: expectedHeaders }
      );
      expect(result).toEqual(expectedUser);
    });

    it('should throw error if status is not ok', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
        } as unknown as Response)
      );

      await expect(getUserById(id, token)).rejects.toThrow(
        'Failed to get user'
      );
    });

    it('should throw error if status >= 400', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 400,
        } as unknown as Response)
      );

      await expect(getUserById(id, token)).rejects.toThrow(
        'Failed to get user'
      );
    });
  });

  describe('getLoggedInMumbleUser', () => {
    const id = '1';
    it('should call get with ID', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: jest
            .fn()
            .mockImplementation(() => Promise.resolve(userResponse)),
        } as unknown as Response)
      );

      const result = await getLoggedInMumbleUser(token);

      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/users/me`,
        { headers: expectedHeaders }
      );
      expect(result).toEqual(expectedUser);
    });

    it('should throw error if status is not ok', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
        } as unknown as Response)
      );

      await expect(getLoggedInMumbleUser(token)).rejects.toThrow(
        'Failed to get loggedInUser'
      );
    });

    it('should throw error if status >= 400', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 400,
        } as unknown as Response)
      );

      await expect(getLoggedInMumbleUser(token)).rejects.toThrow(
        'Failed to get loggedInUser'
      );
    });
  });
});
