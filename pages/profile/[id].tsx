import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useSession } from 'next-auth/react';
import { unstable_getServerSession } from 'next-auth/next';

import { GetUsersQueryParams, MumbleType, Reply } from '../../models';
import { getUserById } from '../../services/user.service';
import { authOptions } from '../api/auth/[...nextauth]';
import {
  ProfileCard,
} from '@smartive-education/design-system-component-z-index';

export default function ProfilePage({
  MumbleUser,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
console.log(MumbleUser)
  return (
      <ProfileCard
        name="a"
        userName=""
        profileImage=""
        profilePicture=""
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

export const getServerSideProps: GetServerSideProps<GetUsersQueryParams> = async (
  context: GetServerSidePropsContext,
  ) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  const profile = await getUserById('201164897906589953', session?.accessToken || '');
  return {
    props: {
      MumbleUser,
    },
  };
};
