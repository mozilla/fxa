/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';

export async function getAccountFromFromLocalStorage(
  email: string,
  page: Page
) {
  return await page.evaluate((email) => {
    const accounts: Array<{
      email: string;
      sessionToken: string;
      uid: string;
    }> = JSON.parse(localStorage.getItem('__fxa_storage.accounts') || '{}');
    return Object.values(accounts).find((x) => x.email === email);
  }, email);
}

export async function denormalizeStoredEmail(email: string, page: Page) {
  return page.evaluate((uid) => {
    const accounts = JSON.parse(
      localStorage.getItem('__fxa_storage.accounts') || '{}'
    );

    for (const accountId in accounts) {
      if (accountId === uid) {
        const account = accounts[accountId];

        if (account.email === email) {
          account.email = email.toUpperCase();
        }
      }
    }
    localStorage.setItem('__fxa_storage.accounts', JSON.stringify(accounts));
  }, email);
}
