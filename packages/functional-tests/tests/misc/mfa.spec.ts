/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';

/**
 * These tests are end to end tests to validate that mfa endpoints are really
 * functioning as intended. They exercise the sending, receiving, and validation
 * of an otp code. Upon verification of the otp code, a jwt access token will
 * be returned. The tests then validate that the jwt token can be used for the
 * 'mfa' auth strategy that we added to work in conjunction with the issued
 * access token.
 */
test.describe('severity-2 #smoke', () => {
  test(`get otp code for mfa, and exchange it for valid jwt`, async ({
    target,
    testAccountTracker,
  }) => {
    const credentials = await testAccountTracker.signUpSync();
    const client = target.createAuthClient(2);
    let resp = await client.mfaRequestOtp(credentials.sessionToken, 'test');
    expect(resp.status).toBe('success');

    // Verify the otp code
    const code = await target.emailClient.getVerifyAccountChangeCode(
      credentials.email
    );

    // Try accessing the protected action test endpoint with jwt
    resp = await client.mfaOtpVerify(credentials.sessionToken, code, 'test');
    expect(resp.accessToken).toBeDefined();
    const jwtAccessToken = resp.accessToken;

    // Try accessing the protected action again
    resp = await client.mfaTestGet(jwtAccessToken);
    expect(resp.status).toBe('success');

    resp = await client.mfaTestPost(jwtAccessToken);
    expect(resp.status).toBe('success');

    let scopeError = undefined;
    try {
      resp = await client.mfaTestPost2(jwtAccessToken);
    } catch (err) {
      scopeError = err;
    }
    expect(scopeError?.code).toBe(403);
    expect(scopeError?.errno).toBe(999);
    expect(scopeError?.error).toBe('Forbidden');
    expect(scopeError?.message).toBe('Insufficient scope');
    expect(scopeError?.data).toBe(
      '{"got":["mfa:test"],"need":[{"selection":["mfa:test2"]}]}'
    );
  });
});
