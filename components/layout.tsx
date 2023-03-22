import { Navigation } from '@smartive-education/design-system-component-z-index';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FC, ReactNode, useEffect } from 'react';
import { getLoggedInUser } from '../services/user.service';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const noop = () => {};
  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('zitadel', { callbackUrl: '/timeline' });
    }
  }, [status]);
  useEffect(() => {
    const updateSessionWithUserData = async () => {
      if (session?.accessToken) {
        const user = await getLoggedInUser(session.accessToken);
        session.fullName = `${user.firstName} ${user.lastName}`;
        session.userName = user.userName;
        session.avatarUrl = user.avatarUrl;
      }
    };
    updateSessionWithUserData();
  }, [session]);

  return (
    <>
      {status === 'authenticated' ? (
        <>
          <Navigation
            profilePictureSrc={'images/profile/r.vogt.jpg'}
            navigateToFeed={() => router.push('/timeline')}
            navigateToProfile={noop}
            openSettings={noop}
            changeLoggedInStatus={
              status === 'authenticated'
                ? () => signOut({ callbackUrl: '/' })
                : () => signIn('zitadel', { callbackUrl: '/timeline' })
            }
            loggedInStatusLabel={
              status === 'authenticated' ? 'Log out' : 'Log in'
            }
            settingsLabel='Settings'
          />
          <main className='md:grid md:grid-cols-12 bg-slate-100'>
            <div className='flex flex-col sm:w-3/4 sm:mx-auto md:w-auto md:mx-0 px-4 sm:px-0 md:col-start-3 md:col-end-11 lg:col-start-4 lg:col-end-10'>
              {children}
            </div>
          </main>
        </>
      ) : (
        'Skeleton'
      )}
    </>
  );
};
