import { like } from '../services/like.service';

describe('like', () => {
  const token = 'token';
  const expectedHeaders = new Headers();
  expectedHeaders.append('Authorization', `Bearer ${token}`);
  it('should call fetch with PUT if isLike is true', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ ok: true } as Response));

    const result = await like('1', true, token);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/1/likes`,
      { headers: expectedHeaders, method: 'PUT' }
    );
    expect(result).toEqual({ id: '1', isLike: true });
  });

  it('should call fetch with DELETE if isLike is true', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ ok: true } as Response));

    const result = await like('1', false, token);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/1/likes`,
      { headers: expectedHeaders, method: 'DELETE' }
    );
    expect(result).toEqual({ id: '1', isLike: false });
  });

  it('should throw error if status is not ok', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ ok: false } as Response));

    await expect(like('1', false, token)).rejects.toThrow('Like failed');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/1/likes`,
      { headers: expectedHeaders, method: 'DELETE' }
    );
  });

  it('should throw error if status >= 400', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ ok: true, status: 400 } as Response)
      );

    await expect(like('1', false, token)).rejects.toThrow('Like failed');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts/1/likes`,
      { headers: expectedHeaders, method: 'DELETE' }
    );
  });
});
