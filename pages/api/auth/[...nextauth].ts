import NextAuth, { NextAuthOptions } from 'next-auth';
import { LoggedInUser } from '../../../models';
import { getUserById } from '../../../services/user.service';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    loggedInUser: LoggedInUser;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'zitadel',
      name: 'zitadel',
      type: 'oauth',
      version: '2',
      wellKnown:
        'https://cas-fee-advanced-ocvdad.zitadel.cloud/.well-known/openid-configuration',
      clientId: '181236603920908545@cas_fee_adv_qwacker_prod',
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
      idToken: true,
      checks: ['pkce', 'state'],
      client: {
        token_endpoint_auth_method: 'none',
      },
      async profile(_, { access_token }): Promise<LoggedInUser> {
        if (!access_token) throw new Error('No access token found');

        const { userinfo_endpoint } = await (
          await fetch(
            `${process.env.ZITADEL_ISSUER}/.well-known/openid-configuration`
          )
        ).json();

        const profile = await (
          await fetch(userinfo_endpoint, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          })
        ).json();

        const user = (await getUserById(
          profile.sub,
          access_token
        )) as LoggedInUser;

        return {
          ...user,
          email: profile.email,
        };
      },
    },
  ],
  session: {
    maxAge: 12 * 60 * 60, // 12 hours
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.expiresAt = (account.expires_at as number) * 1000;
      }
      if (user) {
        token.user = user as LoggedInUser;
      }

      if (Date.now() > (token.expiresAt as number)) {
        delete token.accessToken;
      }

      return token;
    },
    async session({ session, token }) {
      session.loggedInUser = token.user as LoggedInUser;
      session.accessToken = token.accessToken as string;
      session.loggedInUser.accessToken = token.accessToken as string;
      return session;
    },
  },
};

export default NextAuth(authOptions);
