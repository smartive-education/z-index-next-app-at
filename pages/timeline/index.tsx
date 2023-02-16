import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Call, ClientPost } from '../../models';
import { mapServerPostToPost } from '../../models/mappers';
import { fetchPosts } from '../../services/post.hooks';
import { Post } from '@smartive-education/design-system-component-z-index';

export default function TimelinePage({
  response,
  isLoading,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      {response?.posts.map((post: ClientPost) => (
        <Post
          key={post.id}
          name={post.creator}
          userName='robertvogt'
          postCreationTime={post.createdTimestamp}
          src={post.mediaUrl}
          content={post.text}
          commentCount={post.replyCount}
          isLiked={post.likedByUser}
          likeCount={post.likeCount}
          link=''
          comment={() => {}}
          openProfile={() => {}}
        ></Post>
      ))}
    </>
  );
}

export const getServerSideProps: GetServerSideProps<
  Call<{ count: number; posts: ClientPost[] }>
> = async () => {
  try {
    const { count, data } = await fetchPosts();
    const posts = data.map(mapServerPostToPost);
    return {
      props: {
        response: { count, posts },
        isLoading: false,
      },
    };
  } catch (error) {
    return {
      props: {
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      },
    };
  }
};
