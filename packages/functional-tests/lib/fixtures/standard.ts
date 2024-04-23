import { Browser, expect, firefox, test as base } from '@playwright/test';
import crypto from 'crypto';
import { create, Credentials, ServerTarget, TargetName } from '../targets';
import { EmailClient } from '../email';
import { create as createPages } from '../../pages';
import { BaseTarget } from '../targets/base';
import { getCode } from 'fxa-settings/src/lib/totp';
import { getFirefoxUserPrefs } from '../../lib/targets/firefoxUserPrefs';

// The DEBUG env is used to debug without the playwright inspector, like in vscode
// see .vscode/launch.json
const DEBUG = !!process.env.DEBUG;

export { expect };
export type POMS = ReturnType<typeof createPages>;

export const BLOCKED_EMAIL_PREFIX = 'blocked{id}';
export const BOUNCED_EMAIL_PREFIX = 'bounced{id}';
export const FORCE_PWD_EMAIL_PREFIX = 'forcepwdchange{id}';
export const SIGNIN_EMAIL_PREFIX = 'signin{id}';
export const SIGNUP_REACT_EMAIL_PREFIX = 'signup_react{id}';
export const SYNC_EMAIL_PREFIX = 'sync{id}';
type EmailPrefix =
  | typeof BLOCKED_EMAIL_PREFIX
  | typeof BOUNCED_EMAIL_PREFIX
  | typeof FORCE_PWD_EMAIL_PREFIX
  | typeof SIGNIN_EMAIL_PREFIX
  | typeof SIGNUP_REACT_EMAIL_PREFIX
  | typeof SYNC_EMAIL_PREFIX;

export const PASSWORD = 'passwordzxcv';
export const NEW_PASSWORD = 'new_password';

type EmailFixtureOptions = {
  prefix: EmailPrefix; // Prefix for the email address
  password: string; // Password for the email address
};

export type TestOptions = {
  pages: POMS;
  syncBrowserPages: POMS;
  credentials: Credentials;
  emailOptions: EmailFixtureOptions[];
  emails: string[];
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
    const password = 'passwordzxcv';
    await target.emailClient.clear(email);
    let credentials: Credentials;

    try {
      credentials = await target.createAccount(email, password);
    } catch (e) {
      const newCreds = await target.authClient.signIn(email, password);
      await target.authClient.accountDestroy(
        email,
        password,
        {},
        newCreds.sessionToken
      );
      credentials = await target.createAccount(email, password);
    }

    await use(credentials);

    //teardown
    await target.emailClient.clear(email);

    try {
      // we don't know if the original session still exists
      // the test may have called signOut()
      const { sessionToken } = await target.authClient.signIn(
        email,
        credentials.password
      );

      if (credentials.secret) {
        credentials.sessionToken = sessionToken;
        await target.authClient.verifyTotpCode(
          sessionToken,
          await getCode(credentials.secret)
        );
      }

      await target.authClient.accountDestroy(
        email,
        credentials.password,
        {},
        sessionToken
      );
    } catch (err) {
      if (
        err.message ===
        'Sign in with this email type is not currently supported'
      ) {
        // The user changed their primary email, the test case must manually destroy the account
      } else if (
        err.message === 'The request was blocked for security reasons'
      ) {
        // Some accounts are always prompted to unblock their account, ie emails starting
        // `blocked.`. These accounts need to be destroyed in the test case
      } else if (err.message !== 'Unknown account') {
        throw err;
      }
      //s'ok
    }
  },

  pages: async ({ target, page }, use) => {
    const pages = createPages(page, target);
    await use(pages);
  },

  syncBrowserPages: async ({ target }, use) => {
    const syncBrowserPages = await newPagesForSync(target);

    await use(syncBrowserPages);

    await syncBrowserPages.browser?.close();
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
              name: '__fxa_storage.experiment.generalizedReactApp',
              value: JSON.stringify({ enrolled: false }),
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

  emailOptions: [{ prefix: SIGNIN_EMAIL_PREFIX, password: PASSWORD }], // Default options for the fixture

  emails: async (
    { target, pages: { login }, emailOptions },
    use
  ): Promise<void> => {
    const emails = emailOptions.map((emailOptions) => {
      return (
        emailOptions.prefix.replace(
          '{id}',
          crypto.randomBytes(8).toString('hex') + ''
        ) + '@restmail.net'
      );
    });
    await login.clearCache(); // Clear cache for each email

    // Pass the generated email to the test along with the password
    await use(emails);

    for (const [index, email] of emails.entries()) {
      await teardownEmail(target, email, emailOptions[index]);
    }
  },
});

async function teardownEmail(
  target: BaseTarget,
  email: string,
  emailOptions: EmailFixtureOptions
) {
  const accountStatus = await target.authClient.accountStatusByEmail(email);
  if (accountStatus.exists) {
    const creds = await target.authClient.signIn(email, emailOptions.password);
    await target.authClient.accountDestroy(
      email,
      emailOptions.password,
      {},
      creds.sessionToken
    );
  }
}

export async function newPages(browser: Browser, target: BaseTarget) {
  const context = await browser.newContext();
  const page = await context.newPage();
  return createPages(page, target);
}

// When running tests that utilize Sync (sign-in/out), we need to run them in a
// completely different browser, otherwise we will get timeout issues.
// The main cause of this is that Sync sets a property
// `identity.fxaccounts.lastSignedInUserHash` to the last
// user signed in. On subsequent login to Sync, a dialog is prompted for the user
// to confirm. Playwright does not have functionality to click browser ui.
async function newPagesForSync(target: BaseTarget) {
  const browser = await firefox.launch({
    args: DEBUG ? ['-start-debugger-server'] : undefined,
    firefoxUserPrefs: getFirefoxUserPrefs(target.name, DEBUG),
    headless: !DEBUG,
  });
  return {
    ...(await newPages(browser, target)),
    browser: browser,
  };
}
