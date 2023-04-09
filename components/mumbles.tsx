import {
  Post,
  Skeleton,
} from '@smartive-education/design-system-component-z-index-at';
import { FC, RefObject } from 'react';
import { Mumble, MumbleType } from '../models';
import Image from 'next/image';
import {
  defaultProfilePicture,
  noMoreMumblesPicture,
} from '../models/constants';
import { useRouter } from 'next/router';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CardWrapper } from './card-wrapper';

export interface MumblesProps {
  mumbles: Mumble[];
  mumbleType: MumbleType;
  hasMore: boolean;
  isEndMessageNeeded: boolean;
  openProfile: (id: string, ref: RefObject<HTMLDivElement>) => void;
  openMumbleDetails: (id: string, ref: RefObject<HTMLDivElement>) => void;
  setIsLiked: (isLiked: boolean, mumbleId: string) => void;
  loadMorePosts: () => void;
}

export const Mumbles: FC<MumblesProps> = ({
  mumbles,
  mumbleType,
  hasMore,
  isEndMessageNeeded,
  openProfile,
  openMumbleDetails,
  setIsLiked,
  loadMorePosts,
}) => {
  const router = useRouter();
  return (
    <>
      <InfiniteScroll
        dataLength={mumbles.length}
        next={loadMorePosts}
        hasMore={hasMore}
        loader={<Skeleton />}
        endMessage={
          isEndMessageNeeded && (
            <CardWrapper
              titel="Yaay, du hast alle mumbles gesehen!"
              src={noMoreMumblesPicture}
            />
          )
        }
        style={{ overflow: 'visible' }}
      >
        {mumbles.map((mumble, index) => {
          return (
            mumble.type === mumbleType && (
              <Post
                key={mumble.id}
                profileHeaderType={mumbleType === 'post' ? 'POST' : 'REPLY'}
                name={mumble.fullName}
                userName={mumble.userName}
                postCreationTime={mumble.createdTimestamp}
                src={mumble.avatarUrl || defaultProfilePicture}
                content={mumble.text}
                commentCount={mumble.replyCount || 0}
                isLiked={mumble.likedByUser}
                likeCount={mumble.likeCount}
                link={`/mumble/${mumble.id}`}
                comment={(ref: RefObject<HTMLDivElement>) =>
                  openMumbleDetails(mumble.id, ref)
                }
                openProfile={(ref: RefObject<HTMLDivElement>) =>
                  openProfile(mumble.creator, ref)
                }
                setIsLiked={(isLiked) => setIsLiked(isLiked, mumble.id)}
                copyLabel="Copy Link"
                copiedLabel="Link Copied"
              >
                {mumble.mediaUrl && (
                  <Image
                    src={mumble.mediaUrl}
                    alt={mumble.text}
                    fill
                    priority={index < 3}
                    sizes="(min-width: 60rem) 40vw,
                        (min-width: 30rem) 50vw,
                        100vw"
                    className="object-cover"
                  />
                )}
              </Post>
            )
          );
        })}
      </InfiniteScroll>
    </>
  );
};
