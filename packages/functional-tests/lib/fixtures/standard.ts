import { Browser, expect, firefox, test as base } from '@playwright/test';
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

export const PASSWORD = 'passwordzxcv';
export const NEW_PASSWORD = 'new_password';

type EmailFixtureOptions = {
  prefix?: string; // Prefix for the email address
  PASSWORD: string; // Password for the email address
  NEW_PASSWORD?: string;
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
    await target.email.clear(email);
    let credentials: Credentials;

    try {
      credentials = await target.createAccount(email, password);
    } catch (e) {
      const newCreds = await target.auth.signIn(email, password);
      await target.auth.accountDestroy(
        email,
        password,
        {},
        newCreds.sessionToken
      );
      credentials = await target.createAccount(email, password);
    }

    await use(credentials);

    //teardown
    await target.email.clear(email);

    try {
      // we don't know if the original session still exists
      // the test may have called signOut()
      const { sessionToken } = await target.auth.signIn(
        email,
        credentials.password
      );

      if (credentials.secret) {
        credentials.sessionToken = sessionToken;
        await target.auth.verifyTotpCode(
          sessionToken,
          await getCode(credentials.secret)
        );
      }

      await target.auth.accountDestroy(
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

  emailOptions: [{ prefix: '', PASSWORD }], // Default options for the fixture

  emails: async (
    { target, pages: { login }, emailOptions },
    use
  ): Promise<void> => {
    const emails = await Promise.all(
      emailOptions.map(async (emailOptions) =>
        login.createEmail(emailOptions.prefix ?? '')
      )
    );
    await login.clearCache(); // Clear cache for each email

    // Pass the generated email to the test along with the password
    await use(emails);
    for (const [index, email] of emails.entries()) {
      const emailExists = await target.auth.accountStatusByEmail(email);
      if (emailExists.exists) {
        const x = emailOptions[index];
        await teardownEmail(target, email, x.NEW_PASSWORD ?? x.PASSWORD);
      }
    }
  },
});

export async function teardownEmail(
  target: BaseTarget,
  email: string,
  PASSWORD: string
) {
  try {
    const creds = await target.auth.signIn(email, PASSWORD);
    await target.auth.accountDestroy(email, PASSWORD, {}, creds.sessionToken);
  } catch (error) {
    // If the account is not created during the execution of the test, which
    // can happen if the test fails prematurly, an exception will be thrown
    // during email cleanup
    const ERROR_1 = 'Bad Request';
    const ERROR_2 = 'Request blocked';
    if (!(error.error === ERROR_1) && !(error.error === ERROR_2)) {
      throw error;
    }
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
export async function newPagesForSync(target: BaseTarget) {
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
