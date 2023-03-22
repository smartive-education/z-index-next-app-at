import {
  Post,
  PostComment,
  Typography,
} from '@smartive-education/design-system-component-z-index';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  Redirect,
} from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useReducer, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  MumbleUser,
  Post as ClientPost,
  PostWithUserData,
  TimelineProps,
} from '../../models';
import { mapPostToPostWithUserData } from '../../models/mappers';
import { postReducer } from '../../reducers/post.reducers';
import { like } from '../../services/like.service';
import { createPost, getPosts } from '../../services/post.service';
import { getLoggedInUser, getUserById } from '../../services/user.service';
import { authOptions } from '../api/auth/[...nextauth]';

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
    const distinctCreators = posts.reduce((set, item) => {
      set.add(item.creator);
      return set;
    }, new Set<string>());
    const users = await Promise.all(
      Array.from(distinctCreators).map((creator: string) =>
        getUserById(creator, session?.accessToken || '')
      )
    );

    const postsWithUserData: PostWithUserData[] = posts.map((post) => {
      const matchingUser = users.find(
        (user: MumbleUser) => user.id === post.creator
      );
      return mapPostToPostWithUserData(post, matchingUser);
    });
    dispatch({ type: 'LOAD', posts: postsWithUserData, count });
  };

  const submitPost = async (image: File | undefined, form: HTMLFormElement) => {
    const createdPost: ClientPost = await createPost(
      (form.elements.namedItem('post-comment') as HTMLInputElement).value,
      image,
      session?.accessToken
    );
    //use LoggedInUser
    const user = await getLoggedInUser(session?.accessToken || '');
    dispatch({
      type: 'CREATE',
      post: mapPostToPostWithUserData(createdPost, user),
    });
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
          profileHeaderType='CREATE-POST'
          name="Hey was gibt's neues?"
          userName={session.user?.name || ''}
          src={session.user?.image || ''}
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
                profileHeaderType='POST'
                name={post.fullName}
                userName={post.userName}
                postCreationTime={post.createdTimestamp}
                src={post.avatarUrl}
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

export const getServerSideProps: GetServerSideProps<TimelineProps> = async (
  context: GetServerSidePropsContext
) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session?.accessToken) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  //outsource with param (token, existingUsers?): {count, posts, users}
  const { count, posts } = await getPosts();
  const distinctCreators = posts.reduce((set, item) => {
    set.add(item.creator);
    return set;
  }, new Set<string>());
  const users = await Promise.all(
    Array.from(distinctCreators).map((creator: string) =>
      getUserById(creator, session?.accessToken || '')
    )
  );

  const postsWithUserData: PostWithUserData[] = posts.map((post) => {
    const matchingUser = users.find(
      (user: MumbleUser) => user.id === post.creator
    );
    return mapPostToPostWithUserData(post, matchingUser);
  });
  //if error => 404
  //save users in xstate
  //loadMore should check userState first before calling users/id (optimierung für infinity scroll)
  return {
    props: {
      count,
      posts: postsWithUserData,
      users,
      //loggedInUser
    },
  };
};
