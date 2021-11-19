import AuthClient from 'fxa-auth-client';
import { EmailClient } from '../email';

export type Credentials = Awaited<ReturnType<AuthClient['signUp']>> & {
  email: string;
  password: string;
  secret?: string;
};

export abstract class BaseTarget {
  readonly auth: AuthClient;
  readonly email: EmailClient;
  abstract readonly contentServerUrl: string;
  abstract readonly relierUrl: string;

  constructor(readonly authServerUrl: string, emailUrl?: string) {
    this.auth = new AuthClient(authServerUrl);
    this.email = new EmailClient(emailUrl);
  }

  get baseUrl() {
    return this.contentServerUrl;
  }

  abstract createAccount(email: string, password: string): Promise<Credentials>;
}
