import {
  Post,
  PostComment,
  Typography,
} from '@smartive-education/design-system-component-z-index';
import { useActor } from '@xstate/react';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContext, useEffect, useReducer, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  GetPostsWithUserDataResponse,
  MumbleUser,
  Post as ClientPost,
} from '../../models';
import { mapPostToPostWithUserData } from '../../models/mappers';
import { postReducer } from '../../reducers/post.reducers';
import { like } from '../../services/like.service';
import { getPostsWithUserData } from '../../services/mumble.service';
import { createPost } from '../../services/post.service';
import { UsersContext } from '../../state/machines';
import { authOptions } from '../api/auth/[...nextauth]';

export default function TimelinePage({
  count,
  posts,
  users,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [host, setHost] = useState('');
  const usersContext = useContext(UsersContext);
  const [usersState] = useActor(usersContext.userService);
  const [state, dispatch] = useReducer(postReducer, {
    hasMore: posts.length < count,
    posts,
  });

  useEffect(() => {
    setHost(() => window.location.origin);
    usersContext.userService.send({ type: 'LOAD_USERS', mumbleUsers: users });
  }, [users, usersContext]);

  const loadMore = async () => {
    const {
      count,
      posts: postsWithUserData,
      users: updatedUsers,
    } = await getPostsWithUserData(
      session?.accessToken || '',
      { limit: 5, offset: state.posts.length },
      usersState.context.mumbleUsers
    );
    dispatch({ type: 'LOAD', posts: postsWithUserData, count });
    usersContext.userService.send({
      type: 'UPDATE_USERS',
      mumbleUsers: updatedUsers,
    });
  };

  const submitPost = async (image: File | undefined, form: HTMLFormElement) => {
    if (session) {
      const createdPost: ClientPost = await createPost(
        (form.elements.namedItem('post-comment') as HTMLInputElement).value,
        image,
        session.accessToken
      );
      const loggedInUser: Partial<MumbleUser> = {
        firstName: session.firstName,
        lastName: session.lastName,
        userName: session.userName,
        avatarUrl: session.avatarUrl,
      };
      dispatch({
        type: 'CREATE',
        post: mapPostToPostWithUserData(
          createdPost,
          loggedInUser as MumbleUser
        ),
      });
    }
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

export const getServerSideProps: GetServerSideProps<
  GetPostsWithUserDataResponse
> = async (context: GetServerSidePropsContext) => {
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

  const { count, posts, users } = await getPostsWithUserData(
    session.accessToken
  );
  return {
    props: {
      count,
      posts,
      users,
    },
  };
};
