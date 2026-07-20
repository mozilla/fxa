/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppError as error } from '@fxa/accounts/errors';

import { FreeAccessInProcessNotifier } from './free-access-in-process-notifier';

describe('FreeAccessInProcessNotifier', () => {
  let db: { accountRecord: jest.Mock };
  let profileClient: { deleteCache: jest.Mock };
  let log: { notifyAttachedServices: jest.Mock };
  let notifier: FreeAccessInProcessNotifier;

  const UID = 'a'.repeat(32);

  beforeEach(() => {
    db = {
      accountRecord: jest.fn().mockResolvedValue({ uid: UID }),
    };
    profileClient = {
      deleteCache: jest.fn().mockResolvedValue(undefined),
    };
    log = {
      notifyAttachedServices: jest.fn().mockResolvedValue(undefined),
    };
    notifier = new FreeAccessInProcessNotifier(
      db,
      profileClient as any,
      log as any
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolves email to uid via the auth DB', async () => {
    await notifier.notifyEmailChanged('user@example.com');
    expect(db.accountRecord).toHaveBeenCalledWith('user@example.com');
  });

  it('invalidates the profile cache for the resolved uid', async () => {
    await notifier.notifyEmailChanged('user@example.com');
    expect(profileClient.deleteCache).toHaveBeenCalledWith(UID);
  });

  it('publishes a profileDataChange event with the uid and a unix-seconds ts', async () => {
    const beforeCall = Date.now() / 1000;
    await notifier.notifyEmailChanged('user@example.com');
    const afterCall = Date.now() / 1000;

    expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
    const [event, request, data] = log.notifyAttachedServices.mock.calls[0];
    expect(event).toBe('profileDataChange');
    expect(request).toEqual({});
    expect(data.uid).toBe(UID);
    expect(data.ts).toBeGreaterThanOrEqual(beforeCall);
    expect(data.ts).toBeLessThanOrEqual(afterCall);
  });

  it('swallows ACCOUNT_UNKNOWN so the rest of the batch keeps going', async () => {
    const err: any = new Error('Unknown account');
    err.errno = error.ERRNO.ACCOUNT_UNKNOWN;
    db.accountRecord.mockRejectedValue(err);

    await expect(
      notifier.notifyEmailChanged('ghost@example.com')
    ).resolves.toBeUndefined();
    expect(profileClient.deleteCache).not.toHaveBeenCalled();
    expect(log.notifyAttachedServices).not.toHaveBeenCalled();
  });

  it('rethrows non-ACCOUNT_UNKNOWN account-lookup errors', async () => {
    db.accountRecord.mockRejectedValue(new Error('db-broken'));

    await expect(
      notifier.notifyEmailChanged('user@example.com')
    ).rejects.toThrow('db-broken');
    expect(profileClient.deleteCache).not.toHaveBeenCalled();
    expect(log.notifyAttachedServices).not.toHaveBeenCalled();
  });

  it('rethrows when profileClient.deleteCache rejects', async () => {
    profileClient.deleteCache.mockRejectedValue(new Error('profile-down'));

    await expect(
      notifier.notifyEmailChanged('user@example.com')
    ).rejects.toThrow('profile-down');
    expect(log.notifyAttachedServices).not.toHaveBeenCalled();
  });
});
