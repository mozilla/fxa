import AuthClient from 'fxa-auth-client/lib/client';
import { EmailClient } from '../email';
import { TargetName } from './index';

export type Credentials = Awaited<ReturnType<AuthClient['signUp']>> & {
  email: string;
  password: string;
  secret?: string;
  sessionToken?: string;
};

interface SubConfig {
  product: string;
  plan: string;
}

export abstract class BaseTarget {
  readonly authClient: AuthClient;
  readonly emailClient: EmailClient;
  abstract readonly contentServerUrl: string;
  abstract readonly paymentsServerUrl: string;
  abstract readonly relierUrl: string;
  abstract readonly relierClientID: string;
  abstract readonly name: TargetName;
  abstract readonly subscriptionConfig: SubConfig;

  constructor(readonly authServerUrl: string, emailUrl?: string) {
    const keyStretchVersion = parseInt(
      process.env.AUTH_CLIENT_KEY_STRETCH_VERSION || '1'
    );
    this.authClient = this.createAuthClient(keyStretchVersion);
    this.emailClient = new EmailClient(emailUrl);
  }

  get baseUrl() {
    return this.contentServerUrl;
  }

  createAuthClient(keyStretchVersion = 1): AuthClient {
    if (![1, 2].includes(keyStretchVersion)) {
      throw new Error(
        `Invalid keyStretchVersion =${keyStretchVersion}. The` +
          `process.env.AUTH_CLIENT_KEY_STRETCH_VERSION= ` +
          `${process.env.AUTH_CLIENT_KEY_STRETCH_VERSION}, is it set correctly?`
      );
    }
    return new AuthClient(this.authServerUrl, { keyStretchVersion });
  }

  abstract createAccount(
    email: string,
    password: string,
    options?: any
  ): Promise<Credentials>;
}
