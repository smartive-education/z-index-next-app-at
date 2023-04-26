import {
  Button,
  Typography,
} from '@smartive-education/design-system-component-z-index-at';
import { Layout } from '../../components/app-wrapper';
import { CardWrapper } from '../../components/card-wrapper';
import { errorPicture } from '../../models/constants';
import { useRouter } from 'next/router';

export default function OfflineFallbackPage() {
  const router = useRouter();

  return (
    <Layout>
      <div className="h-screen flex flex-col items-center justify-center">
        <Typography type="h2">You&apos;re offline</Typography>
        <div className="w-[80vh] my-4">
          <CardWrapper
            titel="Please check your internet connection and try again."
            src={errorPicture}
          />
        </div>
        <div className="my-4">
          <Button
            label="Nochmal versuchen"
            icon="refresh"
            onClick={() => router.back()}
          ></Button>
        </div>
      </div>
    </Layout>
  );
}
