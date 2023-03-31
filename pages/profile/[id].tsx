import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { unstable_getServerSession } from 'next-auth/next';

import { GetProfileResponse } from '../../models';
import { getUserById } from '../../services/user.service';
import { getPostByUser } from '../../services/post.service'
import { authOptions } from '../api/auth/[...nextauth]';
import {
  ProfileCard,
  Post,
} from '@smartive-education/design-system-component-z-index';

export default function ProfilePage({
  user,
  posts,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [host, setHost] = useState('');
  const router = useRouter();

  useEffect(() => {
    setHost(() => window.location.origin);
  }, []);
  const fullName = `${user.firstName} ${user.lastName}`
  return (
     <div>
      <ProfileCard
          name={fullName}
          userName={user.userName.toString()}
          profileImage=""
          profilePicture={user.avatarUrl.toString()}
          location=""
          calendarText=""
          profileText=""
          openProfile={() => {}}
          followed={false}
          onFollow={() => {}}
          onEdit={() => {}}
        />
          {posts?.data.map((post) => {
            return (
              <Post
                key={post.id}
                profileHeaderType='POST'
                name={fullName}
                userName={user.userName}
                postCreationTime={post.createdTimestamp}
                src={user.avatarUrl}
                content={post.text}
                commentCount={post.replyCount}
                isLiked={post.likedByUser}
                likeCount={post.likeCount}
                link={`${host}/post/${post.id}`}
                comment={() => router.push(`/post/${post.id}`)}
                openProfile={() => router.push(`/profile/${post.creator}`)}
                setIsLiked={() => {}}
             //   setIsLiked={(isLiked) => likePost(isLiked, post.id)}
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
          })}
      </div>
  );
}

  export const getServerSideProps: GetServerSideProps<
  GetProfileResponse
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
  const { userName, firstName, lastName, avatarUrl } = await getUserById(
    context.query.id as string,
    session?.accessToken,
  );
  const posts = await getPostByUser(context.query.id as string);

    return {
      props: {
        user: {
                userName,
                firstName,
                lastName,
                avatarUrl,
              },
        posts,
      }
    }
};
