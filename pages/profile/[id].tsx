import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useSession } from 'next-auth/react';
import { useContext } from 'react'
import { unstable_getServerSession } from 'next-auth/next';
import { UserContext } from '../../providers/user.provider';

import { GetUsersQueryParams, MumbleType, Reply } from '../../models';
import { getUserById } from '../../services/user.service';
import { authOptions } from '../api/auth/[...nextauth]';
import {
  ProfileCard,
} from '@smartive-education/design-system-component-z-index';

export default function ProfilePage() {
  const userState = useContext(UserContext);
  console.log(userState)
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
