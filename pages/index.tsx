import { Navigation } from '@smartive-education/design-system-component-z-index';
import { GetServerSideProps, InferGetStaticPropsType } from 'next';

type PageProps = {};

const noop = () => {};

export default function PageHome({}: PageProps): InferGetStaticPropsType<
  typeof getServerSideProps
> {
  return (
    <>
      <Navigation
        profilePictureSrc='vercel.svg'
        navigateToFeed={noop}
        navigateToProfile={noop}
        openSettings={noop}
        logout={noop}
      ></Navigation>
    </>
  );
}
export const getServerSideProps: GetServerSideProps = async () => ({
  props: { posts: require('../data/posts.json') },
});
