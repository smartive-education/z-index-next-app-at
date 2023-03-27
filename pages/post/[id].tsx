import {
  Post,
  PostComment,
} from '@smartive-education/design-system-component-z-index';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useReducer, useState } from 'react';
import { useRouter } from 'next/router';

import { GetPostDetailsResponse, MumbleType, Reply } from '../../models';
import { postDetailReducer } from '../../reducers/post-detail.reducers';
import { like } from '../../services/like.service';
import { getPostById } from '../../services/post.service';
import { createReply, getReplies } from '../../services/reply.service';

export default function PostDetailPage({
  post,
  replies,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(postDetailReducer, {
    post,
    replies,
  });
  const [host, setHost] = useState('');

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

  const openProfile = (userName: string) => {
    router.push(`/profile/${userName}`)
  }

  return (
    <>
      <Post
        profileHeaderType='POST'
        name={state.post.creator}
        userName='robertvogt' //TODO pass down username from user
        postCreationTime={state.post.createdTimestamp}
        src='' // TODO pass down avatar from user
        content={state.post.text}
        commentCount={state.post.replyCount}
        isLiked={state.post.likedByUser}
        likeCount={state.post.likeCount}
        link={`${host}/post/${state.post.id}`}
        comment={() => {}}
        openProfile={() => openProfile(state.post.creator)}
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
          name={session.user?.name || ''}
          userName={session.user?.name || ''}
          src={session.user?.image || ''}
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
              name={reply.creator}
              userName={reply.creator}
              postCreationTime={reply.createdTimestamp}
              src=''
              content={reply.text}
              commentCount={0} // TODO make this optional for replies
              isLiked={reply.likedByUser}
              likeCount={reply.likeCount}
              link={`${host}/post/${reply.id}`}
              comment={() => {}}
              openProfile={() => openProfile(reply.creator)}
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
