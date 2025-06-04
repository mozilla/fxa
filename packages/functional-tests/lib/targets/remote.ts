/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseTarget, Credentials } from './base';

export abstract class RemoteTarget extends BaseTarget {
  async clearRateLimits() {
    // no-op: We can't clear customs for smoke tests.
  }

  async createAccount(
    email: string,
    password: string,
    options = { lang: 'en', preVerified: 'true' }
  ): Promise<Credentials> {
    // FXA-9550 - The preVerified option doesn't work in production
    const { preVerified, ...filteredOptions } = options;
    const creds = await this.authClient.signUp(
      email,
      password,
      filteredOptions
    );
    if (preVerified === 'true') {
      const code = await this.emailClient.getVerifyCode(email);
      await this.authClient.verifyCode(creds.uid, code);
    }
    await this.authClient.deviceRegister(
      creds.sessionToken,
      'playwright',
      'tester'
    );
    return {
      email,
      password,
      ...creds,
    };
  }
}
