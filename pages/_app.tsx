import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { AppWrapper } from '../components/app-wrapper';
import '../styles/globals.css';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <AppWrapper>
        <Component {...pageProps} />
      </AppWrapper>
    </SessionProvider>
  );
}
