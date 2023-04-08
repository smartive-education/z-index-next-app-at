import {
  Modal,
  PostComment,
  Skeleton,
  Typography
} from '@smartive-education/design-system-component-z-index-at';
import { useActor } from '@xstate/react';
import { GetStaticProps } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { AppWrapper } from '../components/app-wrapper';
import { CardWrapper } from '../components/card-wrapper';
import { Mumbles } from '../components/mumbles';
import { CommentState } from '../models';
import {
  defaultProfilePicture,
  noMumblesPicture
} from '../models/constants';
import { TimelineContext } from '../state/timeline-machine';

export default function TimelinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comment, setComment] = useState<CommentState>({
    isDisabled: true,
    text: '',
  });
  const timelineContext = useContext(TimelineContext);
  const [timelineState, send] = useActor(timelineContext.timelineService);

  useEffect(() => {
    if (session?.loggedInUser && timelineState.matches('empty')) {
      send({
        type: 'INIT_TIMELINE',
        loggedInUser: session.loggedInUser,
      });
    }
  }, [session, send, timelineState, timelineContext]);

  const loadMore = async (): Promise<void> => {
    if (session) {
      send({
        type: 'UPDATE_TIMELINE_DATA',
      });
    }
  };

  const submitPost = async (image: File | undefined, text: string) => {
    setComment(() => ({ text, image, isDisabled: true }));
    if (text) {
      send({
        type: 'CREATE_POST',
        text,
        image,
      });
    }
    const sub = timelineContext.timelineService.subscribe((state) => {
      if (state.matches('idle')) {
        setComment(() => ({ text: '', image: undefined, isDisabled: true }));
      }
      if (state.matches('mutationFailed') || state.matches('idle')) {
        return Promise.resolve(() => sub.unsubscribe());
      }
    });
  };

  const likePost = async (isLiked: boolean, id: string) => {
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
      default:
        send({
          type: 'RETURN_TO_IDLE',
        });
    }
  };

  const closeErrorModal = (): void => {
    send({
      type: 'RETURN_TO_IDLE',
    });
  };

  return (
    <AppWrapper>
      <Modal
        title='Oops.'
        isOpen={
          timelineState.matches('initFailed') ||
          timelineState.matches('updateFailed') ||
          timelineState.matches('mutationFailed')
        }
        LLable='Abbrechen'
        RLable='Erneut versuchen'
        RIcon='refresh'
        isSingleButton={
          timelineState.context.failedOperation === 'create' ||
          timelineState.context.failedOperation === 'like'
        }
        closeFn={() => closeErrorModal()}
        submitFn={() => retry()}
      >
        <CardWrapper
          titel='Das hat leider nicht geklappt.'
          src={noMumblesPicture}
        />
      </Modal>
      <div className='my-4'>
        <span className='text-violet-600'>
          <Typography type='h2'>Wilkommen auf Mumble</Typography>
        </span>
        <Typography type='h3'>Finde raus was in der Welt passiert!</Typography>
      </div>
      {status === 'authenticated' && (
        <PostComment
          profileHeaderType='CREATE-POST'
          name="Hey was gibt's neues?"
          userName={session.loggedInUser.userName}
          src={session.loggedInUser.avatarUrl || defaultProfilePicture}
          postCreationTime={''}
          placeholder='Deine Meinung zählt!'
          LLabel='Bild hochladen'
          RLabel='Absenden'
          isDisabled={comment.isDisabled}
          textValue={comment.text}
          fileValue={comment.image}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setComment((state) => ({
              ...state,
              text: event.target.value,
              isDisabled: !event.target.value,
            }))
          }
          openProfile={() => router.push(`/profile/${session.loggedInUser.id}`)}
          onSubmit={(file, text) => submitPost(file, text)}
        ></PostComment>
      )}
      {!timelineState.context.posts.length && timelineState.matches('idle') ? (
        <CardWrapper titel='Keine Mumbles gefunden' src={noMumblesPicture} />
      ) : !timelineState.context.posts.length ||
        timelineState.matches('timelineInitializing') ? (
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
      ) : (
        <Mumbles
          mumbles={timelineState.context.posts}
          mumbleType='post'
          hasMore={timelineState.context.hasMore}
          isEndMessageNeeded={true}
          setIsLiked={likePost}
          loadMorePosts={loadMore}
          openMumbleDetails={(id: string) => router.push(`/mumble/${id}`)}
          openProfile={(id: string) => router.push(`/profile/${id}`)}
        />
      )}
    </AppWrapper>
  );
}

export const getStaticProps: GetStaticProps<{}> = async () => {
  return {
    props: {},
  };
};
