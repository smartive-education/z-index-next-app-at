import { Navigation } from '@smartive-education/design-system-component-z-index';
import { FC, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const noop = () => {};

  return (
    <>
      <Navigation
        profilePictureSrc={'images/profile/r.vogt.jpg'}
        navigateToFeed={() => router.push('/')}
        navigateToProfile={noop}
        openSettings={noop}
        logout={noop}
      />
      <main className='md:grid md:grid-cols-12 bg-slate-100'>
        <div className='flex flex-col sm:w-3/4 sm:mx-auto md:w-auto md:mx-0 px-4 sm:px-0 md:col-start-3 md:col-end-11 lg:col-start-4 lg:col-end-10'>
          {children}
        </div>
      </main>
    </>
  );
};
