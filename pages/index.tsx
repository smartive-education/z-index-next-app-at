import {
  Post,
  PostComment,
  Typography,
} from '@smartive-education/design-system-component-z-index';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useReducer, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { GetPostsResponse, Post as ClientPost } from '../models';
import { like } from '../services/like.service';
import { createPost, getPosts } from '../services/post.service';
import { useRouter } from 'next/router';
import { postReducer } from '../reducers/post.reducers';

export default function TimelinePage({
  count,
  posts,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [host, setHost] = useState('');
  const [state, dispatch] = useReducer(postReducer, {
    hasMore: posts.length < count,
    posts,
  });

  useEffect(() => {
    setHost(() => window.location.origin);
  }, []);

  const loadMore = async () => {
    const { count, posts } = await getPosts({
      limit: 10,
      offset: state.posts.length,
    });
    dispatch({ type: 'LOAD', posts, count });
  };

  const submitPost = async (image: File | undefined, form: HTMLFormElement) => {
    const createdPost: ClientPost = await createPost(
      (form.elements.namedItem('post-comment') as HTMLInputElement).value,
      image,
      session?.accessToken
    );
    dispatch({ type: 'CREATE', post: createdPost });
  };

  const likePost = async (isLiked: boolean, id: string) => {
    await like(id, isLiked, session?.accessToken);
    dispatch({ type: 'LIKE', id, isLiked });
  };

  return (
    <>
      <div className='my-4'>
        <span className='text-violet-600'>
          <Typography type='h2'>Wilkommen auf Mumble</Typography>
        </span>
        <Typography type='h4'>Finde raus was passiert in der Welt!</Typography>
      </div>
      {status === 'authenticated' && (
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
      )}
      <InfiniteScroll
        dataLength={state.posts.length}
        next={loadMore}
        hasMore={state.hasMore || false}
        loader={<h4>Loading...</h4>}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>Yay! You have seen it all</b>
          </p>
        }
        style={{ overflow: 'visible' }}
      >
        {state.posts.map((post) => {
          if (post.type === 'post') {
            return (
              <Post
                key={post.id}
                name={post.creator}
                userName={post.creator}
                postCreationTime={post.createdTimestamp}
                src={session?.user?.image || ''}
                content={post.text}
                commentCount={post.replyCount}
                isLiked={post.likedByUser}
                likeCount={post.likeCount}
                link={`${host}/post/${post.id}`}
                comment={() => router.push(`/post/${post.id}`)}
                openProfile={() => {}}
                setIsLiked={(isLiked) => likePost(isLiked, post.id)}
                copyLabel='Copy Link'
                copiedLabel='Link Copied'
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
            );
          } else {
            return '';
          }
        })}
      </InfiniteScroll>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  GetPostsResponse
> = async () => {
  const { count, posts } = await getPosts();
  return {
    props: {
      count,
      posts,
    },
  };
};
