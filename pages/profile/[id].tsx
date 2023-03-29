import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useSession } from 'next-auth/react';
import { unstable_getServerSession } from 'next-auth/next';

import { GetUsersQueryParams, GetPostDetailsResponse, GetUserResponse, MumbleType, Reply } from '../../models';
import { getUserById } from '../../services/user.service';
import { authOptions } from '../api/auth/[...nextauth]';
import {
  ProfileCard,
} from '@smartive-education/design-system-component-z-index';

export default function ProfilePage({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  console.log(user)
  return (
      <ProfileCard
        name={`${user.firstName} ${user.lastName}`}
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
  );
}

  export const getServerSideProps: GetServerSideProps<
  GetUserResponse
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
    session?.accessToken,
    context.query.id as string
  );
    return {
      props: {
        user: {
                userName,
                firstName,
                lastName,
                avatarUrl,
              }
      }
    }
};
