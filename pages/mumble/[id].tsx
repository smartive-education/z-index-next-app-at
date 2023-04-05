import {
  Modal,
  Post,
  PostComment,
} from '@smartive-education/design-system-component-z-index-at';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { getToken } from 'next-auth/jwt';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useReducer, useState } from 'react';
import { CardWrapper } from '../../components/card-wrapper';
import {
  CommentState,
  GetPostDetailsResponse,
  Mumble,
  MumbleType,
} from '../../models';
import { defaultProfilePicture } from '../../models/constants';
import { mapResponseToMumble } from '../../models/mappers';
import { like } from '../../services/like.service';
import { getMumbleDetailsWithUserData } from '../../services/mumble.service';
import { createReply } from '../../services/reply.service';
import { mumbleDetailReducer } from '../../state/mumble-detail';

export default function PostDetailPage({
  post,
  replies,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [comment, setComment] = useState<CommentState>({
    isDisabled: true,
    text: '',
  });
  const [state, dispatch] = useReducer(mumbleDetailReducer, {
    post,
    replies,
    hasError: false,
  });

  //without reinitializing the reducer react would not re-render the page in case only the id changes in the url
  useEffect(() => {
    dispatch({
      type: 'INIT',
      post,
      replies,
    });
  }, [post, replies]);

  const reply = async (image: File | undefined, text: string) => {
    setComment(() => ({ text, image, isDisabled: true }));
    if (session) {
      try {
        const createdReply: Mumble = await createReply(
          text,
          image,
          session.accessToken,
          post.id
        );
        dispatch({
          type: 'CREATE',
          reply: mapResponseToMumble(createdReply, session.loggedInUser),
        });
        setComment(() => ({ text: '', image: undefined, isDisabled: true }));
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          hasError: true,
        });
      }
    }
  };

  const likeMumble = async (isLiked: boolean, id: string, type: MumbleType) => {
    try {
      await like(id, isLiked, session?.accessToken);
      if (type === 'post') {
        dispatch({ type: 'LIKE-POST', id, isLiked });
      } else {
        dispatch({ type: 'LIKE-REPLY', id, isLiked });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        hasError: true,
      });
    }
  };

  return (
    <>
      <Modal
        title='Oops.'
        isOpen={state.hasError}
        LLable='Abbrechen'
        isSingleButton={true}
        closeFn={() =>
          dispatch({
            type: 'SET_ERROR',
            hasError: false,
          })
        }
        submitFn={() => {}}
      >
        <CardWrapper
          titel='Das hat leider nicht geklappt.'
          src='/images/no_mumbles.png'
        />
      </Modal>
      <Post
        profileHeaderType='POST'
        name={state.post.fullName || ''}
        userName={state.post.userName || ''}
        postCreationTime={state.post.createdTimestamp}
        src={state.post.avatarUrl || defaultProfilePicture}
        content={state.post.text}
        commentCount={state.post.replyCount || 0}
        isLiked={state.post.likedByUser}
        likeCount={state.post.likeCount}
        link={`/mumble/${state.post.id}`}
        comment={() => {}}
        openProfile={() => router.push(`/profile/${state.post.creator}`)}
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
          name={post.fullName || ''}
          userName={post.userName || ''}
          src={post.avatarUrl || defaultProfilePicture}
          postCreationTime=''
          placeholder='Was meinst du dazu?'
          LLabel='Bild hochladen'
          RLabel='Absenden'
          isDisabled={comment.isDisabled}
          textValue={comment.text}
          fileValue={comment.image}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setComment((state) => ({
              ...state,
              text: event.target.value,
              isDisabled: !event.target.value,
            }))
          }
          openProfile={() => router.push(`/profile/${session.loggedInUser.id}`)}
          onSubmit={(file, text) => reply(file, text)}
        ></PostComment>
      )}
      {state.replies.map((reply) => {
        if (reply.type === 'reply') {
          return (
            <Post
              profileHeaderType='REPLY'
              key={reply.id}
              name={reply.fullName || ''}
              userName={reply.userName || ''}
              postCreationTime={reply.createdTimestamp}
              src={reply.avatarUrl || defaultProfilePicture}
              content={reply.text}
              commentCount={0}
              isLiked={reply.likedByUser}
              likeCount={reply.likeCount}
              link={`/mumble/${reply.id}`}
              comment={() => router.push(`/mumble/${reply.id}`)}
              openProfile={() => router.push(`/profile/${reply.creator}`)}
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
> = async (context: GetServerSidePropsContext) => {
  const session = await getToken({ req: context.req });

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  const { post, replies } = await getMumbleDetailsWithUserData(
    session?.accessToken as string,
    context.query.id as string
  );
  return {
    props: {
      post,
      replies,
    },
  };
};
