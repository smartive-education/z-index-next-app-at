import {
  Post,
  PostComment,
} from '@smartive-education/design-system-component-z-index';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useContext, useEffect, useReducer, useState } from 'react';
import { GetPostDetailsResponse, MumbleType, Reply } from '../../models';
import { UserContext } from '../../providers/user.provider';
import { postDetailReducer } from '../../reducers/post-detail.reducers';
import { like } from '../../services/like.service';
import { getPostById } from '../../services/post.service';
import { createReply, getReplies } from '../../services/reply.service';

export default function PostDetailPage({
  post,
  replies,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(postDetailReducer, {
    post,
    replies,
  });
  const [host, setHost] = useState('');
  const userState = useContext(UserContext);
  useEffect(() => {
    setHost(() => window.location.origin);
  }, []);

  const submitReply = async (
    image: File | undefined,
    form: HTMLFormElement
  ) => {
    const createdReply: Reply = await createReply(
      (form.elements.namedItem('post-comment') as HTMLInputElement).value,
      image,
      session?.accessToken,
      post.id
    );
    dispatch({ type: 'CREATE', reply: createdReply });
  };

  const likeMumble = async (isLiked: boolean, id: string, type: MumbleType) => {
    await like(id, isLiked, session?.accessToken);
    if (type === 'post') {
      dispatch({ type: 'LIKE-POST', id, isLiked });
    } else {
      dispatch({ type: 'LIKE-REPLY', id, isLiked });
    }
  };

  return (
    <>
      <Post
        profileHeaderType='POST'
        name={`${userState.mumbleUsers.get(post.creator)?.firstName} ${
          userState.mumbleUsers.get(post.creator)?.lastName
        }`}
        userName={userState.mumbleUsers.get(post.creator)?.userName || ''}
        postCreationTime={state.post.createdTimestamp}
        src={userState.mumbleUsers.get(post.creator)?.avatarUrl || ''}
        content={state.post.text}
        commentCount={state.post.replyCount}
        isLiked={state.post.likedByUser}
        likeCount={state.post.likeCount}
        link={`${host}/post/${state.post.id}`}
        comment={() => {}}
        openProfile={() => {}}
        setIsLiked={(isLiked) =>
          likeMumble(isLiked, state.post.id, state.post.type)
        }
        copyLabel='Copy Link'
        copiedLabel='Link Copied'
      >
        {state.post.mediaUrl && (
          <Image
            src={state.post.mediaUrl}
            alt={state.post.text}
            fill
            sizes='(min-width: 60rem) 40vw,
                          (min-width: 30rem) 50vw,
                          100vw'
          />
        )}
      </Post>
      {status === 'authenticated' && (
        <PostComment
          profileHeaderType='CREATE-REPLY'
          name={`${userState.loggedInUser?.firstName} ${userState.loggedInUser?.lastName}`}
          userName={userState.loggedInUser?.userName || ''}
          src={userState.loggedInUser?.avatarUrl || ''}
          postCreationTime={''}
          placeholder='Was meinst du dazu?'
          LLabel='Bild hochladen'
          RLabel='Absenden'
          openProfile={() => {}}
          onSubmit={(file, form) => submitReply(file, form)}
        ></PostComment>
      )}
      {state.replies.map((reply) => {
        if (reply.type === 'reply') {
          return (
            <Post
              profileHeaderType='REPLY'
              key={reply.id}
              name={`${userState.mumbleUsers.get(reply.creator)?.firstName} ${
                userState.mumbleUsers.get(reply.creator)?.lastName
              }`}
              userName={
                userState.mumbleUsers.get(reply.creator)?.userName || ''
              }
              postCreationTime={reply.createdTimestamp}
              src={userState.mumbleUsers.get(reply.creator)?.avatarUrl || ''}
              content={reply.text}
              commentCount={0} // TODO make this optional for replies
              isLiked={reply.likedByUser}
              likeCount={reply.likeCount}
              link={`${host}/post/${reply.id}`}
              comment={() => {}}
              openProfile={() => {}}
              setIsLiked={(isLiked) =>
                likeMumble(isLiked, reply.id, reply.type)
              }
              copyLabel='Copy Link'
              copiedLabel='Link Copied'
            >
              {reply.mediaUrl && (
                <Image
                  src={reply.mediaUrl}
                  alt={reply.text}
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
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  GetPostDetailsResponse
> = async ({ query }) => {
  const post = await getPostById(query.id as string);
  const replies = await getReplies(query.id as string);
  return {
    props: {
      post,
      replies,
    },
  };
};
