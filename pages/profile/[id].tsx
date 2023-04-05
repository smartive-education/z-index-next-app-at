import {
  Modal,
  Post,
  PostComment,
  ProfileCard,
  Skeleton
} from '@smartive-education/design-system-component-z-index-at';
import { useMachine } from '@xstate/react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { interpret } from 'xstate';
import { waitFor } from 'xstate/lib/waitFor';
import { CardWrapper } from '../../components/card-wrapper';
import { profileMachine } from '../../state/profile-machine';
import { ProfileImage } from './profileImage';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [host, setHost] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [current, send] = useMachine(profileMachine);
  const machineService = interpret(profileMachine);

  useEffect(() => {
    setHost(() => window.location.origin); //TODO move to Comment component
    machineService.start();
    if (session?.loggedInUser) {
      send({
        type: 'INIT_PROFILE',
        loggedInUser: session.loggedInUser,
        isOwnProfile: session.loggedInUser.id === router.query.id,
        userId: router.query.id
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
    if (text) {
      send({
        type: 'CREATE_POST',
        text,
        image,
      });
    }
  };

  const likePost = async (isLiked: boolean, id: string) => {
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
        <ProfileCard
          name={`${current.context.user?.firstName} ${current.context.user?.lastName}`}
          userName={current.context.user?.userName || ''}
          profileImage=''
          profilePicture=''
          location=''
          calendarText=''
          profileText=''
          openProfile={() => {}}
          followed={false}
          onFollow={() => {}}
          onEdit={() => {}}
        />
      </div>
      {status === 'authenticated' &&
        current.context.isOwnProfile &&
        !current.context.posts.length && ( //TODO refactor this after conditional quard has been implemented
          <PostComment
            profileHeaderType='CREATE-POST'
            name='Voll leer hier'
            userName={session.user?.name || ''}
            src={session.user?.image || ''}
            postCreationTime={''}
            placeholder='Deine Meinung zählt!'
            LLabel='Bild hochladen'
            RLabel='Absenden'
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
                  src={post.avatarUrl || ''}
                  content={post.text}
                  commentCount={post.replyCount || 0}
                  isLiked={post.likedByUser}
                  likeCount={post.likeCount}
                  link={`${host}/mumble/${post.id}`}
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

