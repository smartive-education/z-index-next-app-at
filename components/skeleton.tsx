import { ProfilePicture } from '@smartive-education/design-system-component-z-index';

// TODO move to ui-lib
export default function PostSkeleton() {
  return (
    <div className='relative py-4 px-6 mt-4 md:py-8 md:px-12 bg-white border-1 border-transparent rounded-xl lg:max-w-3xl'>
      <div className='relative flex items-center md:-left-20'>
        <ProfilePicture name='' size='medium'></ProfilePicture>
        <div className='relative flex flex-col w-3/4 mb-4'>
          <div className='w-1/2 h-4 animate-skeleton ml-6 my-2'></div>
          <div className='relative w-full'>
            <span className='inline-block w-1/3 h-4 animate-skeleton ml-6'></span>
            <span className='inline-block w-1/3 h-4 animate-skeleton ml-6'></span>
          </div>
        </div>
      </div>
      <div className='w-full h-80 border-1 border-transparent rounded-xl'>
        <div className='relative flex flex-col w-full mb-2'>
          <div className='w-full h-4 animate-skeleton mb-2'></div>
          <div className='w-full h-4 animate-skeleton mb-2'></div>
          <div className='w-full h-4 animate-skeleton mb-2'></div>
        </div>
        <div className='w-full h-60 bg-slate-300 rounded-xl'></div>
      </div>
    </div>
  );
}
