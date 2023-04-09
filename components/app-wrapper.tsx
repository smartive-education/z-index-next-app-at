import { Navigation } from '@smartive-education/design-system-component-z-index-at';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FC, ReactNode } from 'react';
import { defaultProfilePicture } from '../models/constants';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  return (
    <>
      {status === 'authenticated' && (
        <>
          <Navigation
            profilePictureSrc={
              session.loggedInUser?.avatarUrl || defaultProfilePicture
            }
            navigateToFeed={() => router.push('/')}
            navigateToProfile={() =>
              router.push(`/profile/${session.loggedInUser.id}`)
            }
            changeLoggedInStatus={
              status === 'authenticated'
                ? () => signOut({ callbackUrl: '/' })
                : () => signIn('zitadel', { callbackUrl: '/' })
            }
            loggedInStatusLabel={
              status === 'authenticated' ? 'Log out' : 'Log in'
            }
            settingsLabel="Settings"
          />
          <main className="md:grid md:grid-cols-12 bg-slate-100 min-h-screen">
            <div className="flex flex-col sm:w-3/4 sm:mx-auto md:w-auto md:mx-0 px-4 sm:px-0 md:col-start-3 md:col-end-11 lg:col-start-4 lg:col-end-10 2xl:col-start-5 2xl:col-end-9">
              {children}
            </div>
          </main>
        </>
      )}
    </>
  );
};
