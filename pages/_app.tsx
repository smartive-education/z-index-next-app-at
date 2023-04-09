import { useInterpret } from '@xstate/react';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { TimelineContext, timelineMachine } from '../state/timeline-machine';
import '../styles/globals.css';
import { useRouter } from 'next/router';
import { convertRouteToSiteName } from '../models/mappers';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  const timelineService = useInterpret(timelineMachine);
  const router = useRouter();

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta
          name="description"
          content="Mumble Project Application for the Advanced Frontend Engineering CAS"
        />
        <meta name="author" content="Attila Toth" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`${convertRouteToSiteName(router.route)} | Mumble`}</title>
      </Head>
      <SessionProvider session={session}>
        <TimelineContext.Provider value={{ timelineService }}>
          <Component {...pageProps} />
        </TimelineContext.Provider>
      </SessionProvider>
    </>
  );
}
