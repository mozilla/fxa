/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SaltVersion } from '../../../fxa-auth-client/lib/salt';
import AuthClient from '../../../fxa-auth-client/lib/client';
import { EmailClient } from '../email';
import { SmsClient } from '../sms';
import { TargetName } from './index';

export type Credentials = Awaited<ReturnType<AuthClient['signUp']>> & {
  email: string;
  password: string;
  secret?: string;
  sessionToken?: string;
};

interface SubConfig {
  product: string;
  name: string;
  plan: string;
}

export abstract class BaseTarget {
  readonly authClient: AuthClient;
  readonly emailClient: EmailClient;
  readonly smsClient: SmsClient;
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
    this.smsClient = new SmsClient();
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
    return new AuthClient(this.authServerUrl, {
      keyStretchVersion: keyStretchVersion as SaltVersion,
    });
  }

  abstract createAccount(
    email: string,
    password: string,
    options?: any
  ): Promise<Credentials>;
}
