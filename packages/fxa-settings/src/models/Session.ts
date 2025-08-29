import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import AuthClient from 'fxa-auth-client/browser';
import { accountCache, apolloCache } from '../lib/cache';
import * as Sentry from '@sentry/browser';

export class Session {
  private readonly authClient: AuthClient;

  // TBD: Why isn't this a typed object! Or at least, NormalizedCacheObject...
  private readonly apolloClient: ApolloClient<object>;

  constructor(
    authClient: AuthClient,
    apolloClient: ApolloClient<NormalizedCacheObject>
  ) {
    this.authClient = authClient;
    this.apolloClient = apolloClient;
  }

  get verified(): boolean {
    const data = apolloCache.getSessionVerified();

    if (data != null) {
      return data.verified;
    }
    return false;
  }

  async verifySession(
    code: string,
    options: {
      service?: string;
      scopes?: string[];
      marketingOptIn?: boolean;
      newsletters?: string[];
    } = {}
  ) {
    let success = false;
    const token = accountCache.getCurrentAccount()?.sessionToken;
    if (token) {
      try {
        await this.authClient.sessionVerifyCode(token, code, options);
        success = true;
      } catch (err) {
        // Capture this for now, just so we can keep an eye on things
        Sentry.captureException(err);
      }
    }

    // TBD: Pretty sure we wanted to change this session.verified is true
    apolloCache.setSessionVerified(success);

    // TBD: Very unclear. Why are we setting this here? This action has to do with session.verify, not with isSigned!
    // I'd think the user was already signed in if they got to this point.
    apolloCache.setLocalSignedInStatus(success);
  }

  async sendVerificationCode() {
    const token = accountCache.getCurrentAccount()?.sessionToken;
    if (token != null) {
      await this.authClient.sessionResendVerifyCode(token);
    }
  }

  async destroy() {
    await this.apolloClient.mutate({
      mutation: gql`
        mutation DestroySession {
          destroySession(input: {}) {
            clientMutationId
          }
        }
      `,
      variables: { input: {} },
    });

    accountCache.clearSignedInAccountUid();
  }

  get isDestroyed() {
    return accountCache.getCurrentAccount() == null;
  }

  async isSessionVerified() {
    const result = await this.apolloClient.query<{
      session: { verified: boolean };
    }>({
      fetchPolicy: 'network-only',
      query: gql`
        query GetSession {
          session {
            verified
          }
        }
      `,
    });

    apolloCache.setSessionVerified(result.data.session.verified);

    return result.data.session.verified;

    // Huh? Leaving this here, cause it seems very wrong... but I don't understand how/why
    // it doesn't cause more problems....
    //
    // Is this overwriting the state of 'session' in the cache with a boolean value???
    //
    // const { session } = result.data;
    // const sessionStatus: boolean = session.verified;
    // this.apolloClient.cache.modify({
    //   fields: {
    //     session: () => {
    //       return sessionStatus;
    //     },
    //   },
    // });
    // return sessionStatus;
  }

  async isValid(sessionToken: string) {
    // If the current session token is valid, the following query will succeed.
    // If current session is not valid an 'Invalid Token' error will be thrown.
    const result = await this.apolloClient.query<{ isValidToken: boolean }>({
      fetchPolicy: 'network-only',
      query: gql`
        query GetSessionIsValid($sessionToken: String!) {
          isValidToken(sessionToken: $sessionToken)
        }
      `,
      variables: { sessionToken },
    });

    if (result.data.isValidToken === true) {
      apolloCache.setLocalSignedInStatus(true);
      return true;
    } else {
      // Seems like this was missing... If the token isn't valid, then the user
      // cannot be signed in.
      apolloCache.setLocalSignedInStatus(false);
      return false;
    }
  }
}
