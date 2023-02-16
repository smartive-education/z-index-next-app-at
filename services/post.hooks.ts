import useSWR from 'swr';
import { Call, GetPostsQueryParams, GetPostsResponse } from '../models';

export const fetchPosts = async (
  params?: GetPostsQueryParams
): Promise<GetPostsResponse> => {
  const queryParams = new URLSearchParams({
    limit: String(params?.limit || 5),
    offset: String(params?.offset || 0),
    newerThan: params?.newerThanMumbleId || '',
    olderThan: params?.olderThanMumbleId || '',
  });

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?${queryParams}`;

  const res = await fetch(url, { headers });

  const { count, data } = (await res.json()) as GetPostsResponse;

  return { count, data };
};

export function usePosts(params?: GetPostsQueryParams): Call<GetPostsResponse> {
  const queryParams = new URLSearchParams({
    limit: String(params?.limit || 5),
    offset: String(params?.offset || 0),
    newerThan: params?.newerThanMumbleId || '',
    olderThan: params?.olderThanMumbleId || '',
  });

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  const fetcher = (url: string, headers: Headers) =>
    fetch(url, { headers }).then((res) => res.json());
  const { data, error, isLoading } = useSWR<GetPostsResponse>(
    [
      `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/posts?${queryParams}`,
      headers,
    ],
    fetcher
  );

  return {
    response: data,
    isLoading,
    error,
  };
}
