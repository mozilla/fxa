/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import AuthClient from '../../fxa-auth-client/lib/client';
import { BaseTarget } from './targets/base';
import { TestAccountTracker } from './testAccountTracker';

/**
 * Requests and verifies an `mfa:email` OTP, returning a JWT that authorizes
 * recovery-email mutations. The OTP is sent to the account's current primary
 * email, supplied via `primaryEmail`.
 */
export async function getEmailMfaJwt(
  client: AuthClient,
  sessionToken: string,
  primaryEmail: string,
  target: BaseTarget
): Promise<string> {
  const { status } = await client.mfaRequestOtp(
    sessionToken,
    'email',
    target.ciHeader
  );
  expect(status).toBe('success');

  const code =
    await target.emailClient.getVerifyAccountChangeCode(primaryEmail);
  const { accessToken } = await client.mfaOtpVerify(
    sessionToken,
    code,
    'email',
    target.ciHeader
  );
  expect(accessToken).toBeDefined();
  return accessToken;
}

/**
 * Adds `email` as a secondary email and confirms it with the code sent to that
 * address, leaving it verified and ready to be promoted to primary.
 */
export async function addVerifiedSecondaryEmail(
  client: AuthClient,
  emailMfaJwt: string,
  email: string,
  target: BaseTarget
): Promise<void> {
  await client.recoveryEmailCreate(emailMfaJwt, email, target.ciHeader);
  const code = await target.emailClient.getVerifySecondaryCode(email);
  await client.recoveryEmailSecondaryVerifyCode(
    emailMfaJwt,
    email,
    code,
    target.ciHeader
  );
}

/**
 * Signs up a verified account with v1 or v2 credentials, then makes a new
 * email primary so the signup email is only a secondary. The tracked account
 * is updated so cleanup signs in with the new primary.
 */
export async function signUpAndSwapPrimaryEmail(
  target: BaseTarget,
  testAccountTracker: TestAccountTracker,
  version: 1 | 2,
  primaryEmail = testAccountTracker.generateEmail()
) {
  const client = target.createAuthClient(version);
  const account = testAccountTracker.generateAccountDetails();
  const signupEmail = account.email;

  const { uid, sessionToken } = await client.signUp(
    signupEmail,
    account.password,
    { lang: 'en' },
    target.ciHeader
  );
  const signupCode = await target.emailClient.getVerifyCode(signupEmail);
  await client.verifyCode(uid, signupCode, {}, target.ciHeader);

  const emailMfaJwt = await getEmailMfaJwt(
    client,
    sessionToken,
    signupEmail,
    target
  );
  await addVerifiedSecondaryEmail(client, emailMfaJwt, primaryEmail, target);
  await client.recoveryEmailSetPrimaryEmailWithJwt(
    emailMfaJwt,
    primaryEmail,
    target.ciHeader
  );

  account.email = primaryEmail;
  account.originalEmail = signupEmail;

  return { account, client, emailMfaJwt, signupEmail, primaryEmail };
}
