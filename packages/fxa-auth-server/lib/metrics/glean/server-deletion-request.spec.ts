/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mockRecord = jest.fn();

jest.mock('./server_events', () => ({
  createServerDeletionRequestEvent: () => ({ record: mockRecord }),
}));

import { createServerDeletionRequestPing } from './server-deletion-request';

const gleanMetrics = {
  enabled: true,
  applicationId: 'accounts_backend_test',
  channel: 'test',
  loggerAppName: 'auth-server-tests',
};
const uid = '0123456789abcdef0123456789abcdef';
const uidSha256 =
  '3eb1bd439947eb762998e566ccc2e099c791118b2f40579cc4f7da2b5061b7f9';

describe('createServerDeletionRequestPing', () => {
  it('submits the uid and its sha256 hash', () => {
    const submit = createServerDeletionRequestPing({ gleanMetrics });

    submit(uid);

    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockRecord).toHaveBeenCalledWith({
      user_agent: '',
      ip_address: '',
      account_user_id: uid,
      account_user_id_sha256: uidSha256,
    });
  });

  it('does nothing when Glean is disabled', () => {
    const submit = createServerDeletionRequestPing({
      gleanMetrics: { ...gleanMetrics, enabled: false },
    });

    submit(uid);

    expect(mockRecord).not.toHaveBeenCalled();
  });
});
