import {
  Modal,
  Post,
  PostComment,
  Skeleton,
  Typography,
} from '@smartive-education/design-system-component-z-index-at';
import { useActor } from '@xstate/react';
import { GetStaticProps } from 'next';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { TimelineContext } from '../../state/timeline-machine';

export default function TimelinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [host, setHost] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const timelineContext = useContext(TimelineContext);
  const [timelineState, send] = useActor(timelineContext.timelineService);

  useEffect(() => {
    setHost(() => window.location.origin); //TODO move to Comment component
    if (session?.loggedInUser && timelineState.matches('empty')) {
      send({
        type: 'INIT_TIMELINE',
        loggedInUser: session.loggedInUser,
      });
    }
    const sub = timelineContext.timelineService.subscribe((state) => {
      if (
        state.matches('initFailed') ||
        state.matches('updateFailed') ||
        state.matches('mutationFailed')
      ) {
        setIsErrorModalOpen(true);
      }
    });
    return sub.unsubscribe();
  }, [session, send, timelineState, timelineContext]);

  const loadMore = async (): Promise<void> => {
    if (session) {
      send({
        type: 'UPDATE_TIMELINE_DATA',
      });
    }
    const sub = timelineContext.timelineService.subscribe((state) => {
      if (state.matches('idle')) {
        return Promise.resolve(() => sub.unsubscribe());
      }
      if (state.matches('updateFailed')) {
        return Promise.reject(() => sub.unsubscribe());
      }
    });
  };

  const submitPost = async (image: File | undefined, text: string) => {
    console.log(timelineState.context);
    if (text) {
      send({
        type: 'CREATE_POST',
        text,
        image,
      });
    }
  };

  const likePost = async (isLiked: boolean, id: string) => {
    console.log(timelineState.context);
    send({
      type: 'LIKE_POST',
      id,
      isLiked,
    });
  };

  const retry = (): void => {
    switch (timelineState.context.failedOperation) {
      case 'init':
        send({
          type: 'RETRY_INIT',
        });
        break;
      case 'update':
        send({
          type: 'RETRY_UPDATE',
        });
        break;
      case 'create':
      case 'like':
        send({
          type: 'RETURN_TO_IDLE',
        });
        break;
      default:
        send({
          type: 'RETURN_TO_IDLE',
        });
    }
    setIsErrorModalOpen(false);
  };

  const closeErrorModal = (): void => {
    send({
      type: 'RETURN_TO_IDLE',
    });
    setIsErrorModalOpen(false);
  };

  return (
    <>
      <Modal
        title='Oops.'
        isOpen={isErrorModalOpen}
        LLable='Abbrechen'
        RLable='Erneut versuchen'
        RIcon='refresh'
        closeFn={() => closeErrorModal()}
        submitFn={() => retry()}
      >
        <Typography type='paragraph-m'>
          Das hat leider nicht geklappt.
        </Typography>
      </Modal>
      <div className='my-4'>
        <span className='text-violet-600'>
          <Typography type='h2'>Wilkommen auf Mumble</Typography>
        </span>
        <Typography type='h3'>Finde raus was passiert in der Welt!</Typography>
      </div>
      {status === 'authenticated' && (
        <PostComment
          profileHeaderType='CREATE-POST'
          name="Hey was gibt's neues?"
          userName={session.user?.name || ''}
          src={session.user?.image || ''}
          postCreationTime={''}
          placeholder='Deine Meinung zählt!'
          LLabel='Bild hochladen'
          RLabel='Absenden'
          openProfile={() => router.push('/profile/me')}
          onSubmit={(file, text) => submitPost(file, text)}
        ></PostComment>
      )}
      {!timelineState.context.posts.length ||
      timelineState.matches('timelineInitializing') ? (
        <>
          <Skeleton />
          <Skeleton />
        </>
      ) : (
        <InfiniteScroll
          dataLength={timelineState.context.posts.length}
          next={loadMore}
          hasMore={timelineState.context.hasMore || false}
          loader={<Skeleton />}
          endMessage={
            <p style={{ textAlign: 'center' }}>
              <b>Yay! You have seen it all</b>
            </p>
          }
          style={{ overflow: 'visible' }}
        >
          {timelineState.context.posts?.map((post) => {
            if (post.type === 'post') {
              return (
                <Post
                  key={post.id}
                  profileHeaderType='POST'
                  name={post.fullName}
                  userName={post.userName}
                  postCreationTime={post.createdTimestamp}
                  src={post.avatarUrl}
                  content={post.text}
                  commentCount={post.replyCount}
                  isLiked={post.likedByUser}
                  likeCount={post.likeCount}
                  link={`${host}/post/${post.id}`}
                  comment={() => router.push(`/post/${post.id}`)}
                  openProfile={() => router.push(`/profile/${post.creator}`)}
                  setIsLiked={(isLiked) => likePost(isLiked, post.id)}
                  copyLabel='Copy Link'
                  copiedLabel='Link Copied'
                >
                  {post.mediaUrl && (
                    <Image
                      src={post.mediaUrl}
                      alt={post.text}
                      fill
                      sizes='(min-width: 60rem) 40vw,
                        (min-width: 30rem) 50vw,
                        100vw'
                    />
                  )}
                </Post>
              );
            } else {
              return '';
            }
          })}
        </InfiniteScroll>
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps<{}> = async () => {
  return {
    props: {},
  };
};
