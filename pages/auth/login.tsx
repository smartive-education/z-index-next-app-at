import {
  Button,
  LandingPage,
} from '@smartive-education/design-system-component-z-index-at';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  return (
    <>
      <div className="grid md:grid-cols-3">
        <div className='grid md:col-start-1 md:col-span-2 min-h-[70vh]'>
          <LandingPage />
        </div>
        <div className="md:col-start-3 flex flex-col items-center justify-center min-h-[30vh]">
          <Button
            label="Login/Register"
            icon="mumble"
            color="Gradient"
            onClick={() => signIn('zitadel', { callbackUrl: '/' })}
          ></Button>
        </div>
      </div>
    </>
  );
}
