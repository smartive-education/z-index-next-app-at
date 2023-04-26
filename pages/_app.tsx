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
        <link
          rel="manifest"
          crossOrigin="use-credentials"
          href="/manifest.json"
        />
        <link rel="apple-touch-icon" href="/icon-192x192.webp" />
        <meta name="theme-color" content="#bd10e0" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
        />
      </Head>
      <SessionProvider session={session}>
        <TimelineContext.Provider value={{ timelineService }}>
          <Component {...pageProps} />
        </TimelineContext.Provider>
      </SessionProvider>
    </>
  );
}
