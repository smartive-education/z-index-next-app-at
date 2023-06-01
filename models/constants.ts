export const defaultProfilePicture = '/images/profile/no.image.avif';
export const noMumblesPicture = '/images/no_mumbles.avif';
export const errorPicture = '/images/error.avif';
export const noMoreMumblesPicture = '/images/caught_up.avif';

export const minute = 60 * 1000;
export const hour = 60 * minute;
export const day = 24 * hour;

// required because: https://stackoverflow.com/questions/70457750/nextjs-not-fetching-images-using-image-url-after-deploying-on-production-server/71377671#71377671
export const loader = (src: string) => {
    return () => src;
  }