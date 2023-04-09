import {
  Button,
  Typography,
} from '@smartive-education/design-system-component-z-index-at';
import { useRouter } from 'next/router';
import { CardWrapper } from '../../components/card-wrapper';
import { errorPicture } from '../../models/constants';

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <Typography type="h2">Oops. Das hätte nicht passieren dürfen!</Typography>
      <div className="w-[80vh] my-4">
        <CardWrapper titel="Was wollen sie jetzt tun?" src={errorPicture} />
      </div>
      <div className="my-4">
        <Button
          label="Nochmal versuchen?"
          icon="refresh"
          onClick={() => router.back()}
        ></Button>
      </div>
      <div className="my-4">
        <Button
          label="Zur Home Seite"
          icon="right"
          onClick={() => router.push('/')}
        ></Button>
      </div>
    </div>
  );
}
