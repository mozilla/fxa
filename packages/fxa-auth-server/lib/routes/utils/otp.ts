/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { authenticator } from 'otplib';
import { StatsD } from 'hot-shots';
import { AppError as errors } from '@fxa/accounts/errors';

export interface OtpDb {
  totpToken(uid: string): Promise<{ verified: boolean; enabled: boolean }>;
}

export type OtpOptions = { epoch?: number; step?: number; window?: number };

export class OtpUtils {
  constructor(
    private readonly db: OtpDb,
    private readonly statsd: StatsD
  ) {}

  async hasTotpToken(account: { uid: string }) {
    const { uid } = account;
    let result;
    try {
      result = await this.db.totpToken(uid);
    } catch (err) {
      if (err.errno === errors.ERRNO.TOTP_TOKEN_NOT_FOUND) {
        return false;
      }
      throw err;
    }
    return !!(result && result.verified && result.enabled);
  }

  // Codes for a verified account are per session, so a code from one sign-in
  // cannot confirm another. Signup codes stay on the account's emailCode.
  getEmailOtpSecret(
    primaryEmail: { isVerified: boolean; emailCode: string },
    sessionToken: { tokenVerificationId?: string | null }
  ): string | null {
    return primaryEmail.isVerified
      ? sessionToken.tokenVerificationId || null
      : primaryEmail.emailCode;
  }

  generateOtpCode(secret: string, otpOptions: OtpOptions) {
    const otpAuth = new authenticator.Authenticator();
    otpAuth.options = Object.assign({}, authenticator.options, otpOptions, {
      secret,
    });
    return otpAuth.generate(secret);
  }

  verifyOtpCode(
    code: string,
    secret: string,
    otpOptions: OtpOptions,
    type: string
  ) {
    const otpAuthenticator = new authenticator.Authenticator();
    otpAuthenticator.options = Object.assign(
      {},
      authenticator.options,
      otpOptions,
      { secret }
    );
    const valid = otpAuthenticator.check(code, secret);
    const delta = otpAuthenticator.checkDelta(code, secret);

    if (type && delta !== undefined && delta !== null) {
      // Offset delta by window so the value is always non-negative.
      // With window=1: delta -1 → 0, delta 0 → 1, delta 1 → 2.
      // Telegraf's statsd plugin only accepts non-negative histogram values.
      const window = otpOptions?.window ?? 1;
      this.statsd.histogram(`${type}.totp.delta_histogram`, delta + window);
    }
    // Return delta for logging
    return { valid, delta };
  }
}

export default function (db, statsd) {
  return new OtpUtils(db, statsd);
}
