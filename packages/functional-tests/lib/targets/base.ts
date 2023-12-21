import AuthClient from 'fxa-auth-client/lib/client';
import { EmailClient } from '../email';
import { TargetName } from './index';

export type Credentials = Awaited<ReturnType<AuthClient['signUp']>> & {
  email: string;
  password: string;
  secret?: string;
};

interface SubConfig {
  product: string;
  plan: string;
}

export abstract class BaseTarget {
  readonly auth: AuthClient;
  readonly email: EmailClient;
  abstract readonly contentServerUrl: string;
  abstract readonly paymentsServerUrl: string;
  abstract readonly relierUrl: string;
  abstract readonly name: TargetName;
  abstract readonly subscriptionConfig: SubConfig;

  constructor(readonly authServerUrl: string, emailUrl?: string) {
    this.auth = new AuthClient(authServerUrl, { saltVersion: 2 });
    this.email = new EmailClient(emailUrl);
  }

  get baseUrl() {
    return this.contentServerUrl;
  }

  abstract createAccount(
    email: string,
    password: string,
    options?: any
  ): Promise<Credentials>;
}
