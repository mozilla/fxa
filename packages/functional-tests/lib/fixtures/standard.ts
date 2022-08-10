import { Browser, test as base, expect } from '@playwright/test';
import { TargetName, ServerTarget, create, Credentials } from '../targets';
import { EmailClient } from '../email';
import { create as createPages } from '../../pages';
import { BaseTarget } from '../targets/base';
import { getCode } from 'fxa-settings/src/lib/totp';

export { expect };
export type POMS = ReturnType<typeof createPages>;

export type TestOptions = {
  pages: POMS;
  credentials: Credentials;
};
export type WorkerOptions = { targetName: TargetName; target: ServerTarget };

export const test = base.extend<TestOptions, WorkerOptions>({
  targetName: ['local', { scope: 'worker', option: true }],

  target: [
    async ({ targetName }, use) => {
      const target = create(targetName);
      await use(target);
    },
    { scope: 'worker', auto: true },
  ],

  credentials: async ({ target }, use, testInfo) => {
    const email = EmailClient.emailFromTestTitle(testInfo.title);
    const password = 'asdzxcasd';
    await target.email.clear(email);
    let credentials: Credentials;
    try {
      credentials = await target.createAccount(email, password);
    } catch (e) {
      await target.auth.accountDestroy(email, password);
      credentials = await target.createAccount(email, password);
    }

    await use(credentials);

    //teardown
    await target.email.clear(credentials.email);
    try {
      await target.auth.accountDestroy(credentials.email, credentials.password);
    } catch (error: any) {
      if (error.message === 'Unconfirmed session') {
        // If totp was enabled we'll need a verified session to destroy the account
        if (credentials.secret) {
          // we don't know if the original session still exists
          // the test may have called signOut()
          const { sessionToken } = await target.auth.signIn(
            credentials.email,
            credentials.password
          );
          credentials.sessionToken = sessionToken;
          await target.auth.verifyTotpCode(
            sessionToken,
            await getCode(credentials.secret)
          );
          await target.auth.accountDestroy(
            credentials.email,
            credentials.password,
            {},
            sessionToken
          );
        } else {
          throw error;
        }
      } else if (error.message !== 'Unknown account') {
        throw error;
      }
      //s'ok
    }
  },

  pages: async ({ target, page }, use) => {
    const pages = createPages(page, target);
    await use(pages);
  },

  storageState: async ({ target, credentials }, use) => {
    // This is to store our session without logging in through the ui
    await use({
      cookies: [],
      origins: [
        {
          origin: target.contentServerUrl,
          localStorage: [
            {
              name: '__fxa_storage.currentAccountUid',
              value: JSON.stringify(credentials.uid),
            },
            {
              name: '__fxa_storage.accounts',
              value: JSON.stringify({
                [credentials.uid]: {
                  sessionToken: credentials.sessionToken,
                  uid: credentials.uid,
                },
              }),
            },
          ],
        },
      ],
    });
  },
});

export async function newPages(browser: Browser, target: BaseTarget) {
  const context = await browser.newContext();
  const page = await context.newPage();
  return createPages(page, target);
}
