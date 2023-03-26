import { useInterpret } from '@xstate/react';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { AppWrapper } from '../components/app-wrapper';
import { UsersContext, usersMachine } from '../state/machines';
import '../styles/globals.css';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const userService = useInterpret(usersMachine);

  return (
    <SessionProvider session={session}>
      <UsersContext.Provider value={{ userService }}>
        <AppWrapper>
          <Component {...pageProps} />
        </AppWrapper>
      </UsersContext.Provider>
    </SessionProvider>
  );
}
