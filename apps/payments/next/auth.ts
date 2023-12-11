import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    {
      id: 'fxa',
      name: 'Firefox Accounts',
      type: 'oidc',
      issuer: 'http://localhost:3030',
      wellKnown: `http://localhost:3030/.well-known/openid-configuration`,
      checks: ['pkce', 'state'],
      client: {
        token_endpoint_auth_method: 'none',
      },
      authorization: { params: { scope: 'openid email profile' } },
      clientId: '32aaeb6f1c21316a',
    },
  ],
  callbacks: {
    async session(params: any) {
      params.session.user.id = params.token.sub;
      return params.session;
    },
    async redirect(all) {
      console.log('REDIRECT');
      console.log(all);
      return all.url;
    },
    async signIn(all) {
      console.log('SIGN IN');
      console.log(all);
      return true;
    },
  },
});
