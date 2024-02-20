import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import AuthClient from 'fxa-auth-client/browser';
import { sessionToken, clearSignedInAccountUid } from '../lib/cache';
import { GET_LOCAL_SIGNED_IN_STATUS } from '../components/App/gql';

export interface SessionData {
  verified: boolean | null;
  token: string | null;
  verifySession?: (
    code: string,
    options: {
      service?: string;
      scopes?: string[];
      marketingOptIn?: boolean;
      newsletters?: string[];
    }
  ) => Promise<void>;
  destroy?: () => void;
}

export const GET_SESSION_VERIFIED = gql`
  query GetSession {
    session {
      verified
    }
  }
`;

export const DESTROY_SESSION = gql`
  mutation DestroySession {
    destroySession(input: {}) {
      clientMutationId
    }
  }
`;

export class Session implements SessionData {
  private readonly authClient: AuthClient;
  private readonly apolloClient: ApolloClient<object>;
  private _loading: boolean;

  constructor(
    authClient: AuthClient,
    apolloClient: ApolloClient<NormalizedCacheObject>
  ) {
    this.authClient = authClient;
    this.apolloClient = apolloClient;
    this._loading = false;
  }

  private async withLoadingStatus<T>(promise: Promise<T>) {
    this._loading = true;
    try {
      return await promise;
    } catch (e) {
      throw e;
    } finally {
      this._loading = false;
    }
  }

  private get data() {
    const { session } = this.apolloClient.cache.readQuery<{
      session: Session;
    }>({
      query: GET_SESSION_VERIFIED,
    })!;
    return session;
  }

  get token(): string {
    return this.data.token;
  }

  get verified(): boolean {
    return this.data.verified;
  }

  // TODO: Use GQL verifyCode instead of authClient
  async verifySession(
    code: string,
    options: {
      service?: string;
      scopes?: string[];
      marketingOptIn?: boolean;
      newsletters?: string[];
    } = {}
  ) {
    await this.withLoadingStatus(
      this.authClient.sessionVerifyCode(sessionToken()!, code, options)
    );
    this.apolloClient.cache.modify({
      fields: {
        session: () => {
          return true;
        },
      },
    });
    this.apolloClient.cache.writeQuery({
      query: GET_LOCAL_SIGNED_IN_STATUS,
      data: { isSignedIn: true },
    });
  }

  async sendVerificationCode() {
    await this.withLoadingStatus(
      this.authClient.sessionResendVerifyCode(sessionToken()!)
    );
  }

  async destroy() {
    await this.apolloClient.mutate({
      mutation: DESTROY_SESSION,
      variables: { input: {} },
    });

    clearSignedInAccountUid();
  }

  async isSessionVerified() {
    const query = GET_SESSION_VERIFIED;
    const { data } = await this.apolloClient.query({
      fetchPolicy: 'network-only',
      query,
    });

    const { session } = data;
    const sessionStatus: boolean = session.verified;

    this.apolloClient.cache.modify({
      fields: {
        session: () => {
          return sessionStatus;
        },
      },
    });
    return sessionStatus;
  }
}
