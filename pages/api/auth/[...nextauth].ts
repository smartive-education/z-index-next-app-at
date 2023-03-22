import NextAuth, { NextAuthOptions } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    fullName: string;
    userName: string;
    avatarUrl: string;
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
      async profile(profile) {
        return {
          id: profile.sub,
          username: profile.preferred_username?.replace(
            '@smartive.zitadel.cloud',
            ''
          ),
        };
      },
    },
  ],
  session: {
    maxAge: 12 * 60 * 60, // 12 hours
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
}

export default NextAuth(authOptions);
