import {
  Modal,
  PostComment,
  ProfileCard,
  Skeleton,
  Toggle,
  Typography,
} from '@smartive-education/design-system-component-z-index-at';
import { useActor, useInterpret } from '@xstate/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useState } from 'react';
import { waitFor } from 'xstate/lib/waitFor';
import { AppWrapper } from '../../components/app-wrapper';
import { CardWrapper } from '../../components/card-wrapper';
import { Mumbles } from '../../components/mumbles';
import { Users } from '../../components/users';
import {
  randomProfileBackground,
  randomProfileBio,
} from '../../data/dummy.data';
import { CommentState } from '../../models';
import {
  defaultProfilePicture,
  errorPicture,
  noMumblesPicture,
} from '../../models/constants';
import { profileMachine } from '../../state/profile-machine';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [comment, setComment] = useState<CommentState>({
    isDisabled: true,
    text: '',
  });
  const machineService = useInterpret(profileMachine);
  const [profileState] = useActor(machineService);

  useEffect(() => {
    if (
      session?.loggedInUser &&
      profileState.context.userId !== router.query.id
    ) {
      machineService.send({
        type: 'INIT_PROFILE',
        loggedInUser: session.loggedInUser,
        isOwnProfile: session.loggedInUser.id === router.query.id,
        userId: router.query.id,
        background: randomProfileBackground(),
        bio: randomProfileBio(),
      });
    }
  }, [session, machineService, router, profileState]);

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
        if (profileState.matches('loadMorePostsFailed')) {
          machineService.send({
            type: 'LOAD_MORE_POSTS',
          });
        } else {
          machineService.send({
            type: 'LOAD_MORE_LIKED_POSTS',
          });
        }
        break;
      default:
        machineService.send({
          type: 'RETURN_TO_IDLE',
        });
    }
  };

  const closeErrorModal = (): void => {
    machineService.send({
      type: 'RETURN_TO_IDLE',
    });
  };

  const toggle = (): void => {
    machineService.send({
      type: 'TOGGLE',
    });
  };

  return (
    <AppWrapper>
      <Modal
        title="Oops."
        isOpen={
          profileState.matches('initFailed') ||
          profileState.matches('loadMorePostsFailed') ||
          profileState.matches('loadMoreLikedPostsFailed') ||
          profileState.matches('mutationFailed')
        }
        LLable="Abbrechen"
        RLable="Erneut versuchen"
        RIcon="refresh"
        isSingleButton={
          profileState.context.failedOperation === 'create' ||
          profileState.context.failedOperation === 'like'
        }
        closeFn={() => closeErrorModal()}
        submitFn={() => retry()}
      >
        <CardWrapper
          titel="Das hat leider nicht geklappt."
          src={errorPicture}
        />
      </Modal>
      {!profileState.context.user ? (
        <div className="my-4 h-[25rem]">
          <Skeleton isProfile={true} />
        </div>
      ) : (
        <div className="my-4">
          <ProfileCard
            name={`${profileState.context.user?.firstName} ${profileState.context.user?.lastName}`}
            userName={profileState.context.user?.userName || ''}
            profileImage={profileState.context.background}
            profilePicture={
              profileState.context.user?.avatarUrl || defaultProfilePicture
            }
            location="Rapperswil"
            calendarText="Mitglied seit 6 Monaten"
            profileText={profileState.context.bio}
          />
        </div>
      )}
      {profileState.context.isNewUserProfile && (
        <>
          <PostComment
            profileHeaderType="CREATE-POST"
            name="Voll leer hier"
            userName={`${profileState.context.user?.firstName} ${profileState.context.user?.lastName}`}
            src={profileState.context.user?.avatarUrl || defaultProfilePicture}
            placeholder="Deine Meinung zählt!"
            LLabel="Bild hochladen"
            RLabel="Absenden"
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
            onSubmit={(file, text) => submitPost(file, text)}
          ></PostComment>
          <div className="mt-4">
            <Typography type="h3">Empfohlene Users</Typography>
          </div>
          <Users
            users={profileState.context.suggestedUsers}
            onClick={(id) => router.push(id)}
          />
          <Typography type="h3">Empfohlene Mumbles</Typography>
        </>
      )}
      {profileState.context.isOwnProfile &&
        !profileState.context.isNewUserProfile &&
        !!profileState.context.likedPosts.length && (
          <Toggle
            isToggleOn={profileState.context.isPostsOpen}
            onClick={toggle}
            onLabel="Deine Mumbles"
            offLabel="Deine Likes"
          />
        )}
      {!profileState.context.posts.length && profileState.matches('idle') && (
        <CardWrapper titel="Keine Mumbles gefunden" src={noMumblesPicture} />
      )}
      {!profileState.context.posts.length ||
      profileState.matches('loadPostsAndLikedPosts') ||
      profileState.matches('loadPosts') ? (
        <>
          <Skeleton />
          <Skeleton />
        </>
      ) : (
        <Mumbles
          mumbles={
            profileState.context.isPostsOpen
              ? profileState.context.posts
              : profileState.context.likedPosts
          }
          mumbleType="post"
          hasMore={
            profileState.context.isPostsOpen
              ? profileState.context.hasMorePosts
              : profileState.context.hasMoreLikedPosts
          }
          isEndMessageNeeded={!profileState.context.isNewUserProfile}
          setIsLiked={likePost}
          loadMorePosts={
            profileState.context.isPostsOpen
              ? loadMorePosts
              : loadMoreLikedPosts
          }
          openMumbleDetails={(id) => router.push(`/mumble/${id}`)}
          openProfile={(id) => router.push(`/profile/${id}`)}
        />
      )}
    </AppWrapper>
  );
}
