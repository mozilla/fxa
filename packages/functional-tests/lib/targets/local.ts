/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BoolString } from '../../../fxa-auth-client/lib/client';
import { TargetName } from '.';
import { BaseTarget, Credentials } from './base';
import { RateLimitClient } from '../ratelimit';

const RELIER_CLIENT_ID = 'dcdb5ae7add825d2';

/**
 * Host the local stack is reachable on.
 *
 * Defaults to localhost. Override when the supplicant is not on this machine's loopback, for
 * example a Tailscale address so a simulator or a real device reaches the same origin the
 * authority uses. Start the stack with matching PUBLIC_URL/FXA_URL/FXA_OAUTH_URL, or its
 * served config will still advertise localhost.
 */
const LOCAL_HOST = process.env.FXA_LOCAL_HOST ?? 'localhost';
const CONTENT_ORIGIN =
  process.env.FXA_CONTENT_ORIGIN ?? `http://${LOCAL_HOST}:3030`;
const AUTH_ORIGIN = process.env.FXA_AUTH_ORIGIN ?? `http://${LOCAL_HOST}:9000`;

export class LocalTarget extends BaseTarget {
  static readonly target = 'local';
  readonly name: TargetName = LocalTarget.target;
  readonly contentServerUrl = CONTENT_ORIGIN;
  readonly paymentsNextUrl = 'http://localhost:3035';
  readonly paymentsTestOfferingId = '123donepro';
  readonly paymentsTestPriceId = 'price_1NSnz3BVqmGyQTMaIkV5wjEc';
  readonly relierUrl = 'http://localhost:8080';
  readonly relierClientID = RELIER_CLIENT_ID;
  readonly rateLimitClient: RateLimitClient;

  constructor() {
    // 9001 is the auth server's admin/test port, used only by this test runner and bound to
    // loopback, so it stays on localhost even when the supplicant reaches us on another host.
    super(AUTH_ORIGIN, 'http://localhost:9001');
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
    const result = await this.authClient.signUp(
      email,
      password,
      options,
      this.ciHeader
    );
    await this.authClient.deviceRegister(
      result.sessionToken,
      'playwright',
      'tester'
    );
    return {
      email,
      password,
      verified: options.preVerified === 'true',
      ...result,
    } as Credentials;
  }
}
