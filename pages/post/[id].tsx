import {
  Post,
  PostComment,
} from '@smartive-education/design-system-component-z-index';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { GetPostDetailsResponse, MumbleType, Reply } from '../../models';
import { like } from '../../services/like.service';
import { getPostById } from '../../services/post.service';
import { createReply, getReplies } from '../../services/reply.service';

export default function PostDetailPage({
  post: postReponse,
  replies: repliesResponse,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();
  const [post, setPost] = useState(postReponse);
  const [replies, setReplies] = useState(repliesResponse || []);
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
    setReplies((currentReplies) => [createdReply, ...currentReplies]);
  };

  const likeMumble = async (isLiked: boolean, id: string, type: MumbleType) => {
    await like(id, isLiked, session?.accessToken);
    if (type === 'post') {
      setPost((post) => ({
        ...post,
        likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1,
        likedByUser: isLiked ? true : false,
      }));
    } else {
      setReplies((currentReplies) =>
        currentReplies.map((reply) => {
          if (reply.id === id) {
            return {
              ...reply,
              likeCount: isLiked ? reply.likeCount + 1 : reply.likeCount - 1,
              likedByUser: isLiked ? true : false,
            };
          } else {
            return reply;
          }
        })
      );
    }
  };

  return (
    <>
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
        link={`${host}/post/${post.id}`}
        comment={() => {}}
        openProfile={() => {}}
        setIsLiked={(isLiked) => likeMumble(isLiked, post.id, post.type)}
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
      <PostComment
        name=''
        userName='robertvogt' //TODO pass down username from user
        src='images/profile/r.vogt.jpg' // TOD read from user
        postCreationTime={''}
        placeholder='Was meinst du dazu?'
        LLabel='Bild hochladen'
        RLabel='Absenden'
        openProfile={() => {}}
        onSubmit={(file, form) => submitReply(file, form)}
      ></PostComment>
      {replies.map((reply) => {
        if (reply.type === 'reply') {
          return (
            <Post
              key={reply.id}
              name={reply.creator}
              userName='robertvogt' //TODO pass down username from user
              postCreationTime={reply.createdTimestamp}
              src='' // TODO pass down avatar from user
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
