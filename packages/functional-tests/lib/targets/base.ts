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
  abstract readonly contentServerUrl: string;
  abstract readonly paymentsServerUrl: string;
  abstract readonly relierUrl: string;
  abstract readonly relierClientID: string;
  abstract readonly name: TargetName;
  abstract readonly subscriptionConfig: SubConfig;

  // Must be lazy loaded, because it depends on abstract field, 'name'.
  get smsClient() {
    if (this._smsClient == null) {
      this._smsClient = new SmsClient(this.name);
    }
    return this._smsClient;
  }
  private _smsClient: SmsClient | undefined;

  get baseUrl() {
    return this.contentServerUrl;
  }

  constructor(
    readonly authServerUrl: string,
    emailUrl?: string
  ) {
    this.authClient = this.createAuthClient(2);
    this.emailClient = new EmailClient(emailUrl);
  }

  createAuthClient(keyStretchVersion: 1 | 2): AuthClient {
    return new AuthClient(this.authServerUrl, {
      keyStretchVersion: keyStretchVersion,
    });
  }

  abstract clearRateLimits(): Promise<void>;

  abstract createAccount(
    email: string,
    password: string,
    options?: any
  ): Promise<Credentials>;
}
