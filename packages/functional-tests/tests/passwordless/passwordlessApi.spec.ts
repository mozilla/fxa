/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect, test } from '../../lib/fixtures/standard';
import { getTotpCode } from '../../lib/totp';

const CLIENT_ID = 'dcdb5ae7add825d2';

async function getPasswordlessSession(
  target: any,
  email: string,
  isNew: boolean
) {
  await target.authClient.passwordlessSendCode(email, {
    clientId: CLIENT_ID,
  });
  const code = isNew
    ? await target.emailClient.getPasswordlessSignupCode(email)
    : await target.emailClient.getPasswordlessSigninCode(email);
  return target.authClient.passwordlessConfirmCode(email, code, {
    clientId: CLIENT_ID,
  });
}

test.describe('severity-2', () => {
  test.describe.configure({ mode: 'parallel' });
  test.describe('Passwordless API', () => {
    test.describe('POST /passwordless/send_code', () => {
      test('sends code to new email', async ({
        target,
        testAccountTracker,
      }) => {
        const { email } =
          testAccountTracker.generatePasswordlessAccountDetails();

        await target.authClient.passwordlessSendCode(email, {
          clientId: CLIENT_ID,
        });

        const code =
          await target.emailClient.getPasswordlessSignupCode(email);
        expect(code).toBeTruthy();
      });

      test('sends code to existing passwordless account', async ({
        target,
        testAccountTracker,
      }) => {
        const { email } = await testAccountTracker.signUpPasswordless();

        await target.authClient.passwordlessSendCode(email, {
          clientId: CLIENT_ID,
        });

        const code =
          await target.emailClient.getPasswordlessSigninCode(email);
        expect(code).toBeTruthy();
      });

      test('rejects account with password', async ({
        target,
        testAccountTracker,
      }) => {
        const credentials = await testAccountTracker.signUp();

        try {
          await target.authClient.passwordlessSendCode(credentials.email, {
            clientId: CLIENT_ID,
          });
          expect(
            true,
            'passwordlessSendCode should have been rejected for password account'
          ).toBe(false);
        } catch (err: any) {
          expect(err.errno).toBeDefined();
        }
      });

      test('rejects non-allowlisted client', async ({
        target,
        testAccountTracker,
      }) => {
        const { email } =
          testAccountTracker.generatePasswordlessAccountDetails();

        try {
          await target.authClient.passwordlessSendCode(email, {
            clientId: 'deadbeefdeadbeef',
          });
          expect(
            true,
            'passwordlessSendCode should have been rejected for non-allowlisted client'
          ).toBe(false);
        } catch (err: any) {
          expect(err).toBeDefined();
        }
      });
    });

    test.describe('POST /passwordless/confirm_code', () => {
      test('valid OTP returns verified session for new account', async ({
        target,
        testAccountTracker,
      }) => {
        const { email, password } =
          testAccountTracker.generatePasswordlessAccountDetails();
        const account: any = testAccountTracker.accounts.find(
          (a) => a.email === email
        );

        await target.authClient.passwordlessSendCode(email, {
          clientId: CLIENT_ID,
        });

        const code =
          await target.emailClient.getPasswordlessSignupCode(email);
        const result = await target.authClient.passwordlessConfirmCode(
          email,
          code,
          { clientId: CLIENT_ID }
        );

        expect(result.verified).toBe(true);
        expect(result.isNewAccount).toBe(true);

        await target.authClient.createPassword(
          result.sessionToken,
          email,
          password
        );
        if (account) {
          account.isPasswordless = false;
        }
      });

      test('valid OTP returns verified session for existing account', async ({
        target,
        testAccountTracker,
      }) => {
        const { email } = await testAccountTracker.signUpPasswordless();
        const account: any = testAccountTracker.accounts.find(
          (a) => a.email === email
        );
        const password = account?.password || '';

        await target.authClient.passwordlessSendCode(email, {
          clientId: CLIENT_ID,
        });

        const code =
          await target.emailClient.getPasswordlessSigninCode(email);
        const result = await target.authClient.passwordlessConfirmCode(
          email,
          code,
          { clientId: CLIENT_ID }
        );

        expect(result.verified).toBe(true);
        expect(result.isNewAccount).toBe(false);

        await target.authClient.createPassword(
          result.sessionToken,
          email,
          password
        );
        if (account) {
          account.isPasswordless = false;
        }
      });

      test('invalid OTP is rejected', async ({
        target,
        testAccountTracker,
      }) => {
        const { email } =
          testAccountTracker.generatePasswordlessAccountDetails();

        await target.authClient.passwordlessSendCode(email, {
          clientId: CLIENT_ID,
        });

        // Consume the real code so we can test with a bogus one
        await target.emailClient.getPasswordlessSignupCode(email);

        try {
          await target.authClient.passwordlessConfirmCode(
            email,
            '00000000',
            { clientId: CLIENT_ID }
          );
          expect(
            true,
            'passwordlessConfirmCode should have rejected invalid OTP'
          ).toBe(false);
        } catch (err: any) {
          expect(err).toBeDefined();
        }
      });

      test('TOTP account returns unverified session', async ({
        target,
        testAccountTracker,
      }) => {
        const { email, sessionToken } =
          await testAccountTracker.signUpPasswordless();
        const account: any = testAccountTracker.accounts.find(
          (a) => a.email === email
        );
        const password = account?.password || '';

        const { secret } = await target.authClient.createTotpToken(
          sessionToken,
          {}
        );
        const totpCode = await getTotpCode(secret);
        await target.authClient.verifyTotpSetupCode(sessionToken, totpCode);
        await target.authClient.completeTotpSetup(sessionToken);

        if (account) {
          account.secret = secret;
          account.sessionToken = sessionToken;
        }

        await target.authClient.passwordlessSendCode(email, {
          clientId: CLIENT_ID,
        });

        const code =
          await target.emailClient.getPasswordlessSigninCode(email);
        const result = await target.authClient.passwordlessConfirmCode(
          email,
          code,
          { clientId: CLIENT_ID }
        );

        expect(result.verified).toBe(false);
        expect(result.verificationMethod).toBe('totp-2fa');

        const cleanupTotpCode = await getTotpCode(secret);
        await target.authClient.verifyTotpCode(
          result.sessionToken,
          cleanupTotpCode
        );
        await target.authClient.createPassword(
          result.sessionToken,
          email,
          password
        );
        if (account) {
          account.isPasswordless = false;
        }
      });
    });

    test.describe('POST /passwordless/resend_code', () => {
      test('new code works after resend', async ({
        target,
        testAccountTracker,
      }) => {
        const { email, password } =
          testAccountTracker.generatePasswordlessAccountDetails();
        const account: any = testAccountTracker.accounts.find(
          (a) => a.email === email
        );

        await target.authClient.passwordlessSendCode(email, {
          clientId: CLIENT_ID,
        });

        await target.emailClient.getPasswordlessSignupCode(email);

        await target.authClient.passwordlessResendCode(email, {
          clientId: CLIENT_ID,
        });

        const code =
          await target.emailClient.getPasswordlessSignupCode(email);

        const result = await target.authClient.passwordlessConfirmCode(
          email,
          code,
          { clientId: CLIENT_ID }
        );
        expect(result.verified).toBe(true);

        await target.authClient.createPassword(
          result.sessionToken,
          email,
          password
        );
        if (account) {
          account.isPasswordless = false;
        }
      });
    });

    test.describe('End-to-end flows', () => {
      test('full signup flow', async ({
        target,
        testAccountTracker,
      }) => {
        const { email, password } =
          testAccountTracker.generatePasswordlessAccountDetails();
        const account: any = testAccountTracker.accounts.find(
          (a) => a.email === email
        );

        const result = await getPasswordlessSession(target, email, true);

        expect(result.verified).toBe(true);
        expect(result.sessionToken).toBeTruthy();

        const status = await target.authClient.sessionStatus(
          result.sessionToken
        );
        expect(status.state).toBe('verified');

        await target.authClient.createPassword(
          result.sessionToken,
          email,
          password
        );
        if (account) {
          account.isPasswordless = false;
        }
      });

      test('full signin flow', async ({
        target,
        testAccountTracker,
      }) => {
        const { email } = await testAccountTracker.signUpPasswordless();
        const account: any = testAccountTracker.accounts.find(
          (a) => a.email === email
        );
        const password = account?.password || '';

        const result = await getPasswordlessSession(target, email, false);

        expect(result.verified).toBe(true);

        await target.authClient.createPassword(
          result.sessionToken,
          email,
          password
        );
        if (account) {
          account.isPasswordless = false;
        }
      });

      test('TOTP flow: OTP then TOTP verify then verified session', async ({
        target,
        testAccountTracker,
      }) => {
        const { email, sessionToken } =
          await testAccountTracker.signUpPasswordless();
        const account: any = testAccountTracker.accounts.find(
          (a) => a.email === email
        );
        const password = account?.password || '';

        const { secret } = await target.authClient.createTotpToken(
          sessionToken,
          {}
        );
        const totpCode = await getTotpCode(secret);
        await target.authClient.verifyTotpSetupCode(sessionToken, totpCode);
        await target.authClient.completeTotpSetup(sessionToken);

        if (account) {
          account.secret = secret;
          account.sessionToken = sessionToken;
        }

        const result = await getPasswordlessSession(target, email, false);
        expect(result.verified).toBe(false);
        expect(result.verificationMethod).toBe('totp-2fa');

        const verifyTotpCode = await getTotpCode(secret);
        await target.authClient.verifyTotpCode(
          result.sessionToken,
          verifyTotpCode
        );

        const status = await target.authClient.sessionStatus(
          result.sessionToken
        );
        expect(status.state).toBe('verified');
        expect(status.details.sessionVerified).toBe(true);

        await target.authClient.createPassword(
          result.sessionToken,
          email,
          password
        );
        if (account) {
          account.isPasswordless = false;
        }
      });

      test('password creation after passwordless', async ({
        target,
        testAccountTracker,
      }) => {
        const { email } = await testAccountTracker.signUpPasswordless();
        const account: any = testAccountTracker.accounts.find(
          (a) => a.email === email
        );
        const password = account?.password || '';

        const result = await getPasswordlessSession(target, email, false);
        expect(result.verified).toBe(true);

        const createResult = await target.authClient.createPassword(
          result.sessionToken,
          email,
          password
        );
        expect(createResult).toBeDefined();

        if (account) {
          account.isPasswordless = false;
        }

        // Passwordless send should be rejected after password creation
        try {
          await target.authClient.passwordlessSendCode(email, {
            clientId: CLIENT_ID,
          });
          expect(
            true,
            'passwordlessSendCode should have been rejected for account with password'
          ).toBe(false);
        } catch (err: any) {
          expect(err.errno).toBeDefined();
        }
      });
    });
});
});
