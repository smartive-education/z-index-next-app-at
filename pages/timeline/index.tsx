import { Post } from '@smartive-education/design-system-component-z-index';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Image from 'next/image';
import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ClientPost, GetPostsResponse, RequestResult } from '../../models';
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
    <InfiniteScroll
      dataLength={posts.length}
      next={loadMore}
      hasMore={hasMore || false}
      loader={<h4>Loading...</h4>}
      endMessage={
        <p style={{ textAlign: 'center' }}>
          <b>Yay! You have seen it all</b>
        </p>
      }
      style={{ overflow: 'visible' }}
    >
      {posts.map((post: ClientPost) => (
        <Post
          key={post.id}
          name={post.creator}
          userName='robertvogt' //TODO pass down username from user
          postCreationTime={post.createdTimestamp}
          src='' // TODO pass down avatar from user
          content={post.text}
          commentCount={post.replyCount}
          isLiked={post.likedByUser}
          likeCount={post.likeCount}
          link=''
          comment={() => {}}
          openProfile={() => {}}
        >
          {post.mediaUrl && (
            <Image
              src={post.mediaUrl}
              alt={post.text}
              fill
              sizes='(min-width: 60rem) 40vw,
                        (min-width: 30rem) 50vw,
                        100vw'
            />
          )}
        </Post>
      ))}
    </InfiniteScroll>
  );
}

export const getServerSideProps: GetServerSideProps<
  RequestResult<GetPostsResponse>
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
