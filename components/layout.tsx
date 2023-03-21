import { Navigation } from '@smartive-education/design-system-component-z-index';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FC, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { status } = useSession();
  const noop = () => {};

  return (
    <>
      <Navigation
        profilePictureSrc={'images/profile/r.vogt.jpg'}
        navigateToFeed={() => router.push('/')}
        navigateToProfile={noop}
        openSettings={noop}
        changeLoggedInStatus={
          status === 'authenticated' ? () => signOut() : () => signIn('zitadel')
        }
        loggedInStatusLabel={status === 'authenticated' ? 'Log out' : 'Log in'}
        settingsLabel='Settings'
      />
      <main className='md:grid md:grid-cols-12 bg-slate-100'>
        <div className='flex flex-col sm:w-3/4 sm:mx-auto md:w-auto md:mx-0 px-4 sm:px-0 md:col-start-3 md:col-end-11 lg:col-start-4 lg:col-end-10'>
          {children}
        </div>
      </main>
    </>
  );
};
