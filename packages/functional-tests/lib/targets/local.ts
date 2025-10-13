/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BoolString } from '@fxa/accounts/auth-client';
import { TargetName } from '.';
import { BaseTarget, Credentials } from './base';
import { RateLimitClient } from '../ratelimit';

const RELIER_CLIENT_ID = 'dcdb5ae7add825d2';

export class LocalTarget extends BaseTarget {
  static readonly target = 'local';
  readonly name: TargetName = LocalTarget.target;
  readonly contentServerUrl = 'http://localhost:3030';
  readonly relierUrl = 'http://localhost:8080';
  readonly relierClientID = RELIER_CLIENT_ID;
  readonly rateLimitClient: RateLimitClient;

  constructor() {
    super('http://localhost:9000', 'http://localhost:9001');
    this.rateLimitClient = new RateLimitClient();
  }

  async clearRateLimits() {
    this.rateLimitClient.resetCounts();
  }

  async createAccount(
    email: string,
    password: string,
    options = { lang: 'en', preVerified: 'true' as BoolString }
  ) {
    // Quick and dirty way to see if this works...
    await this.rateLimitClient.resetCounts();
    const result = await this.authClient.signUp(email, password, options);
    await this.authClient.deviceRegister(
      result.sessionToken,
      'playwright',
      'tester'
    );
    return {
      email,
      password,
      ...result,
    } as Credentials;
  }
}
