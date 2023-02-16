import { Post } from '@smartive-education/design-system-component-z-index';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useState } from 'react';
import { Call, ClientPost, GetPostsResponse } from '../../models';
import { fetchPosts } from '../../services/post.service';

export default function TimelinePage({
  response,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [posts, setPosts] = useState(response?.posts || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    response && response.posts.length < response.count
  );

  if (error) {
    return <div>An error occurred: {error.message}</div>;
  }

  const loadMore = async () => {
    const { response, error } = await fetchPosts({
      limit: 1,
      offset: posts.length,
    });
    if (response) {
      setHasMore(posts.length + response.posts.length < response.count);
      setPosts([...posts, ...(response.posts || [])]);
    }
  };
  return (
    <>
      {posts.map((post: ClientPost) => (
        <Post
          key={post.id}
          name={post.creator}
          userName='robertvogt'
          postCreationTime={post.createdTimestamp}
          src={post.mediaUrl}
          content={post.text}
          commentCount={post.replyCount}
          isLiked={post.likedByUser}
          likeCount={post.likeCount}
          link=''
          comment={() => {}}
          openProfile={() => {}}
        ></Post>
      ))}
      {hasMore ? (
        <button
          onClick={() => loadMore()}
          disabled={loading}
          className='bg-indigo-400 px-2 py-1 rounded-lg mt-4'
        >
          {loading ? '...' : 'Load more'}
        </button>
      ) : (
        ''
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  Call<GetPostsResponse>
> = async () => {
  const { response, error } = await fetchPosts();
  return !!error
    ? {
        props: {
          error,
        },
      }
    : {
        props: {
          response,
        },
      };
};
