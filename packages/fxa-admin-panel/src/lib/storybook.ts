/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { adminApi } from './api';
import { REST_API_ERROR } from '../components/ErrorAlert/mocks';

const originalAdminApi = { ...adminApi };

// Global loader, so a story without its own stubs does not keep the previous story's stubs.
export const resetAdminApi = async () => {
  Object.assign(adminApi, originalAdminApi);
};

// Story loader that replaces adminApi methods, so pages render without a server.
// Stories share the stubbed object, so page stories opt out of autodocs.
export const stubAdminApi = (stubs: Partial<typeof adminApi>) => async () => {
  Object.assign(adminApi, stubs);
};

const succeed = async () => true;

// Fake successes for the account actions in PageAccountSearch and its children.
export const accountActionStubs: Partial<typeof adminApi> = {
  clearEmailBounce: succeed,
  deleteRecoveryPhone: succeed,
  disableAccount: succeed,
  editLocale: succeed,
  enableAccount: succeed,
  recordSecurityEvent: succeed,
  remove2FA: succeed,
  removePasskey: succeed,
  removePasskeyWrap: succeed,
  removePasskeys: succeed,
  unlinkAccount: succeed,
  unsubscribeFromMailingLists: succeed,
  unverifyEmail: succeed,
};

// Stubs the same methods, but each one rejects like a failed API call.
export const stubAdminApiErrors = (stubs: Partial<typeof adminApi>) =>
  stubAdminApi(
    Object.fromEntries(
      Object.keys(stubs).map((name) => [
        name,
        () => Promise.reject(REST_API_ERROR),
      ])
    )
  );
