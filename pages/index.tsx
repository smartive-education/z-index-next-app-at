import PostSkeleton from '../components/skeleton';

export default function SkeletonPage() {
  const skeletons = [1, 2, 3, 4];
  return (
    <>
      {skeletons.map((item) => (
        <PostSkeleton key={item}></PostSkeleton>
      ))}
    </>
  );
}
