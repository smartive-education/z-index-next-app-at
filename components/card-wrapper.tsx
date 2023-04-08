import { Typography } from '@smartive-education/design-system-component-z-index-at';
import Image from 'next/image';
import { FC } from 'react';

interface CardWrapperProps {
  titel: string;
  src: string;
}

export const CardWrapper: FC<CardWrapperProps> = ({ titel, src }) => {
  return (
    <div className='relative py-4 px-6 md:py-8 md:px-12 bg-white border-1 border-transparent mt-4 rounded-xl flex flex-col items-center'>
      <Typography type='h4'>{titel}</Typography>
      <div className='relative rounded-xl overflow-hidden h-56 w-full'>
        <Image src={src} alt='Keine Mumbles gefunden' fill />
      </div>
    </div>
  );
};
