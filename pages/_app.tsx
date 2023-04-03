import { useInterpret } from '@xstate/react';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AppWrapper } from '../components/app-wrapper';
import { TimelineContext, timelineMachine } from '../state/timeline-machine';
import '../styles/globals.css';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const timelineService = useInterpret(timelineMachine);

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
        <TimelineContext.Provider value={{ timelineService }}>
          <AppWrapper>
            <Component {...pageProps} />
          </AppWrapper>
        </TimelineContext.Provider>
      </SessionProvider>
    </>
  );
}
