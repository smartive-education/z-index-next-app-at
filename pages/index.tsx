import { Skeleton } from '@smartive-education/design-system-component-z-index';

export default function SkeletonPage() {
  const skeletons = [1, 2, 3, 4];
  return (
    <>
      {skeletons.map((item) => (
        <Skeleton key={item}></Skeleton>
      ))}
    </>
  );
}
