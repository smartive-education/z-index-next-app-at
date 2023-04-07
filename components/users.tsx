import { UserWidget } from '@smartive-education/design-system-component-z-index-at';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { MumbleUsers } from '../models';
import { defaultProfilePicture } from '../models/constants';

export interface UsersProps {
  users: MumbleUsers;
  onClick: (id: string) => void
}

export const Users: FC<UsersProps> = ({ users, onClick }) => {
  const router = useRouter();
  return (
    <div className='grid grid-cols-3 gap-4 my-4'>
      {Object.values(users).map((user) => {
        return (
          <div key={user.id} onClick={() => onClick(user.id)} className='cursor-pointer'>
            <UserWidget
              name={`${user.firstName} ${user.lastName}`}
              username={user.userName}
              src={user.avatarUrl || defaultProfilePicture}
            />
          </div>
        );
      })}
    </div>
  );
};
