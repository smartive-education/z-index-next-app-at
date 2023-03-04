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
import { GetPostsResponse, Post as ClientPost } from '../../models';
import { like } from '../../services/like.service';
import { createPost, getPosts } from '../../services/post.service';
import { useRouter } from 'next/router';

export default function TimelinePage({
  count,
  posts: postResponse,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState(postResponse || []);
  const [hasMore, setHasMore] = useState(postResponse.length < count);

  const loadMore = async () => {
    const { count, posts: postReponse } = await getPosts({
      limit: 1,
      offset: posts.length,
    });
    setHasMore(posts.length + postReponse.length < count);
    setPosts((currentPosts) => [...currentPosts, ...(postReponse || [])]);
  };

  // TODO outsource these after useContext
  const submitPost = async (image: File | undefined, form: HTMLFormElement) => {
    const createdPost: ClientPost = await createPost(
      (form.elements.namedItem('post-comment') as HTMLInputElement).value,
      image,
      session?.accessToken
    );
    setPosts((currentPosts) => [createdPost, ...currentPosts]);
  };

  const likePost = async (isLiked: boolean, id: string) => {
    await like(id, isLiked, session?.accessToken);
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
        {posts.map((post) => {
          if (post.type === 'post') {
            return (
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
