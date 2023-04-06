import {
  Modal,
  Post,
  PostComment,
  ProfileCard,
  Skeleton,
  Toggle,
} from '@smartive-education/design-system-component-z-index-at';
import { useActor, useInterpret } from '@xstate/react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
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
  const machineService = useInterpret(profileMachine);
  const [profileState, send] = useActor(machineService);

  useEffect(() => {
    if (session?.loggedInUser) {
      machineService.send({
        type: 'INIT_PROFILE',
        loggedInUser: session.loggedInUser,
        isOwnProfile: session.loggedInUser.id === router.query.id,
        userId: router.query.id,
        background: randomProfileBackground(),
        bio: randomProfileBio(),
      });
    }

    machineService.onTransition((state) => {
      if (state.changed) {
        console.log(state.value);
      }
      if (
        state.value === 'initFailed' ||
        state.value === 'loadMoreLikedPostsFailed' ||
        state.value === 'loadMorePostsFailed' ||
        state.value === 'mutationFailed'
      ) {
        setIsErrorModalOpen(true);
      }
    });
  }, [session, machineService, router]);

  const loadMorePosts = async (): Promise<void> => {
    machineService.send({
      type: 'LOAD_MORE_POSTS',
    });
  };

  const loadMoreLikedPosts = async (): Promise<void> => {
    machineService.send({
      type: 'LOAD_MORE_LIKED_POSTS',
    });
  };

  const submitPost = async (image: File | undefined, text: string) => {
    setComment(() => ({ text, image, isDisabled: true }));
    if (text) {
      machineService.send({
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
    console.log(profileState);
    machineService.send({
      type: 'LIKE_POST',
      id,
      isLiked,
    });
  };

  const retry = (): void => {
    switch (profileState.context.failedOperation) {
      case 'init':
        machineService.send({
          type: 'RETRY_INIT',
        });
        break;
      case 'update':
        machineService.send({
          type: 'RETRY_UPDATE',
        });
        break;
      default:
        machineService.send({
          type: 'RETURN_TO_IDLE',
        });
    }
    setIsErrorModalOpen(false);
  };

  const closeErrorModal = (): void => {
    machineService.send({
      type: 'RETURN_TO_IDLE',
    });
    setIsErrorModalOpen(false);
  };

  const toggle = (): void => {
    machineService.send({
      type: 'TOGGLE',
    });
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
          profileState.context.failedOperation === 'create' ||
          profileState.context.failedOperation === 'like'
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
          name={`${profileState.context.user?.firstName} ${profileState.context.user?.lastName}`}
          userName={profileState.context.user?.userName || ''}
          profileImage={profileState.context.background}
          profilePicture={
            profileState.context.user?.avatarUrl || defaultProfilePicture
          }
          location='Rapperswil'
          calendarText='Mitglied seit 6 Monaten'
          profileText={profileState.context.bio}
        />
      </div>
      {profileState.matches('newUserProfile') && (
        <PostComment
          profileHeaderType='CREATE-POST'
          name='Voll leer hier'
          userName={`${profileState.context.user?.firstName} ${profileState.context.user?.lastName}`}
          src={profileState.context.user?.avatarUrl || defaultProfilePicture}
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
      {profileState.context.isOwnProfile && (
        <Toggle
          isToggleOn={profileState.context.isPostsOpen}
          onClick={toggle}
          onLabel='Deine Mumbles'
          offLabel='Deine Likes'
        />
      )}
      {!profileState.context.posts.length && profileState.matches('idle') ? (
        <CardWrapper
          titel='Keine Mumbles gefunden'
          src='/images/no_mumbles.png'
        />
      ) : !profileState.context.posts.length ||
        profileState.matches('loadPostsAndLikedPosts') ||
        profileState.matches('loadPosts') ? (
        <>
          <Skeleton />
          <Skeleton />
        </>
      ) : profileState.context.isPostsOpen ||
        !profileState.context.isOwnProfile ? (
        <InfiniteScroll
          dataLength={profileState.context.posts.length}
          next={loadMorePosts}
          hasMore={profileState.context.hasMorePosts || false}
          loader={<Skeleton />}
          endMessage={
            <CardWrapper
              titel='Yaay, du hast alle mumbles gesehen!'
              src='/images/caught_up.png'
            />
          }
          style={{ overflow: 'visible' }}
        >
          {profileState.context.posts?.map((post) => {
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
      ) : (
        <InfiniteScroll
          dataLength={profileState.context.likedPosts.length}
          next={loadMoreLikedPosts}
          hasMore={profileState.context.hasMoreLikedPosts || false}
          loader={<Skeleton />}
          endMessage={
            <CardWrapper
              titel='Yaay, du hast alle mumbles gesehen!'
              src='/images/caught_up.png'
            />
          }
          style={{ overflow: 'visible' }}
        >
          {profileState.context.likedPosts?.map((post) => {
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
