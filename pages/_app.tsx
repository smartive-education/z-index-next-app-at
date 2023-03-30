import { useInterpret } from '@xstate/react';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AppWrapper } from '../components/app-wrapper';
import { UsersContext, usersMachine } from '../state/machines';
import '../styles/globals.css';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const userService = useInterpret(usersMachine);

  return (
    <>
      <Head>
        <meta charSet='UTF-8' />
        <meta
          name='description'
          content='Mumble Project Application for the Advanced Frontend Engineering CAS'
        />
        <meta name='author' content='Team Z-index' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </Head>
      <SessionProvider session={session}>
        <UsersContext.Provider value={{ userService }}>
          <AppWrapper>
            <Component {...pageProps} />
          </AppWrapper>
        </UsersContext.Provider>
      </SessionProvider>
    </>
  );
}
