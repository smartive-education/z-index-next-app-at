import {
  Modal,
  Post,
  PostComment,
  ProfileCard,
  Skeleton,
} from '@smartive-education/design-system-component-z-index-at';
import { useMachine } from '@xstate/react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { interpret } from 'xstate';
import { waitFor } from 'xstate/lib/waitFor';
import { CardWrapper } from '../../components/card-wrapper';
import {
  randomProfileBackground,
  randomProfileBio,
} from '../../data/dummy.data';
import { CommentState } from '../../models';
import { defaultProfilePicture } from '../../models/constants';
import { profileMachine } from '../../state/profile-machine';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [comment, setComment] = useState<CommentState>({
    isDisabled: true,
    text: '',
  });
  const [current, send] = useMachine(profileMachine);
  const machineService = interpret(profileMachine);

  useEffect(() => {
    machineService.start();
    if (session?.loggedInUser) {
      console.log(session?.loggedInUser);
      send({
        type: 'INIT_PROFILE',
        loggedInUser: session.loggedInUser,
        isOwnProfile: session.loggedInUser.id === router.query.id,
        userId: router.query.id,
      });
    }
    machineService.onTransition((state) => {
      if (
        state.matches('initFailed') ||
        state.matches('updateFailed') ||
        state.matches('mutationFailed')
      ) {
        setIsErrorModalOpen(true);
      }
    });

    return () => {
      machineService.stop();
    };
  }, [session, send, machineService, router]);

  const loadMorePosts = async (): Promise<void> => {
    if (session) {
      send({
        type: 'LOAD_MORE_POSTS',
      });
    }
    await waitFor(
      machineService,
      (state) => state.matches('idle') || state.matches('updateFailed')
    );
    return Promise.resolve();
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
    await waitFor(machineService, (state) => {
      if (state.matches('idle')) {
        setComment(() => ({ text: '', image: undefined, isDisabled: true }));
      }
      return state.matches('idle') || state.matches('mutationFailed');
    });
    return Promise.resolve();
  };

  const likePost = async (isLiked: boolean, id: string) => {
    console.log(current.context);
    send({
      type: 'LIKE_POST',
      id,
      isLiked,
    });
  };

  const retry = (): void => {
    switch (current.context.failedOperation) {
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
        isSingleButton={
          current.context.failedOperation === 'create' ||
          current.context.failedOperation === 'like'
        }
        closeFn={() => closeErrorModal()}
        submitFn={() => retry()}
      >
        <CardWrapper
          titel='Das hat leider nicht geklappt.'
          src='/images/no_mumbles.png'
        />
      </Modal>
      <div className='my-4'>
        {current.matches('idle') && (
          <ProfileCard
            name={`${current.context.user?.firstName} ${current.context.user?.lastName}`}
            userName={current.context.user?.userName || ''}
            profileImage={randomProfileBackground()}
            profilePicture={
              current.context.user?.avatarUrl || defaultProfilePicture
            }
            location='Rapperswil'
            calendarText='Mitglied seit 6 Monaten'
            profileText={randomProfileBio()}
          />
        )}
      </div>
      {status === 'authenticated' &&
        current.context.isOwnProfile &&
        !current.context.posts.length && ( //TODO refactor this after conditional guard has been implemented
          <PostComment
            profileHeaderType='CREATE-POST'
            name='Voll leer hier'
            userName={`${current.context.user?.firstName} ${current.context.user?.lastName}`}
            src={current.context.user?.avatarUrl || defaultProfilePicture}
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
            openProfile={() => {}}
            onSubmit={(file, text) => submitPost(file, text)}
          ></PostComment>
        )}
      {!current.context.posts.length && current.matches('idle') ? (
        <CardWrapper
          titel='Keine Mumbles gefunden'
          src='/images/no_mumbles.png'
        />
      ) : !current.context.posts.length ||
        current.matches('profileInitializing') ? (
        <>
          <Skeleton />
          <Skeleton />
        </>
      ) : (
        <InfiniteScroll
          dataLength={current.context.posts.length}
          next={loadMorePosts}
          hasMore={current.context.hasMorePosts || false}
          loader={<Skeleton />}
          endMessage={
            <CardWrapper
              titel='Yaay, du hast alle mumbles gesehen!'
              src='/images/caught_up.png'
            />
          }
          style={{ overflow: 'visible' }}
        >
          {current.context.posts?.map((post) => {
            if (post.type === 'post') {
              return (
                <Post
                  key={post.id}
                  profileHeaderType='POST'
                  name={post.fullName || ''}
                  userName={post.userName || ''}
                  postCreationTime={post.createdTimestamp}
                  src={post.avatarUrl || defaultProfilePicture}
                  content={post.text}
                  commentCount={post.replyCount || 0}
                  isLiked={post.likedByUser}
                  likeCount={post.likeCount}
                  link={`/mumble/${post.id}`}
                  comment={() => router.push(`/mumble/${post.id}`)}
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
