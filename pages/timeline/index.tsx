import {
  Post,
  PostComment,
  Typography,
} from '@smartive-education/design-system-component-z-index';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ClientPost, GetPostsResponse, RequestResult } from '../../models';
import { likePost } from '../../services/like.service';
import { createPost, getPosts } from '../../services/post.service';

export default function TimelinePage({
  response,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();
  const [posts, setPosts] = useState(response?.posts || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    response && response.posts.length < response.count
  );

  if (error) {
    return <div>An error occurred: {error.message}</div>;
  }

  const loadMore = async () => {
    const { response, error } = await getPosts({
      limit: 1,
      offset: posts.length,
    });
    if (response) {
      setHasMore(posts.length + response.posts.length < response.count);
      setPosts((currentPosts) => [...currentPosts, ...(response.posts || [])]);
    }
  };

  const submitPost = async (image: File | undefined, form: HTMLFormElement) => {
    const { response, error } = await createPost(
      (form.elements.namedItem('post-comment') as HTMLInputElement).value,
      image,
      session?.accessToken
    );
    if (response) {
      setPosts((currentPosts) => [response, ...currentPosts]);
    }
  };

  const like = async (isLiked: boolean, id: string) => {
    const { response, error } = await likePost(
      id,
      isLiked,
      session?.accessToken
    );
    if (response) {
      setPosts((currentPosts) =>
        currentPosts.map((post) => {
          if (post.id === id) {
            return {
              ...post,
              likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1,
              likedByUser: isLiked ? true : false,
            };
          }
          return post;
        })
      );
    }
  };

  return (
    <>
      <div className='my-4'>
        <span className='text-violet-600'>
          <Typography type='h2'>Wilkommen auf Mumble</Typography>
        </span>
        <Typography type='h4'>Finde raus was passiert in der Welt!</Typography>
      </div>
      <PostComment
        name="Hey was gibt's neues?"
        userName='robertvogt' //TODO pass down username from user
        src='images/profile/r.vogt.jpg' // TOD read from user
        postCreationTime={''}
        placeholder='Deine Meinung zählt!'
        LLabel='Bild hochladen'
        RLabel='Absenden'
        openProfile={() => {}}
        onSubmit={(file, form) => submitPost(file, form)}
      ></PostComment>
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
            setIsLiked={(isLiked) => like(isLiked, post.id)}
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
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  RequestResult<GetPostsResponse>
> = async () => {
  const { response, error } = await getPosts();
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
