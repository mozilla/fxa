/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/node';
import { Request } from 'express';
import { createMock } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { NotifierService } from '@fxa/shared/notifier';
import { ProfileClient } from '@fxa/profile/client';
import { DatabaseService } from '../../database/database.service';
import { AccountStateService } from './account-state.service';

jest.mock('@sentry/node', () => ({ captureException: jest.fn() }));

const uid = (i: number) => i.toString(16).padStart(32, '0');

describe('AccountStateService', () => {
  const req = { headers: {}, ip: '127.0.0.1' } as unknown as Request;
  let scans: Array<{
    select: jest.Mock;
    join: jest.Mock;
    where: jest.Mock;
    whereNull: jest.Mock;
    whereRaw: jest.Mock;
  }>;
  let service: AccountStateService;
  let disable: jest.SpyInstance;

  // The first knex('emails') call answers the max id; each later one is a
  // range scan that resolves to the next list of primary emails.
  const givenEmails = (maxId: number | null, ...ranges: string[][]) => {
    scans = [];
    let asked = false;
    const knex = jest.fn(() => {
      if (!asked) {
        asked = true;
        return {
          max: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue({ maxId }),
        };
      }
      const rows = (ranges.shift() ?? []).map((email, i) => ({
        uid: Buffer.from(uid(scans.length * 100 + i + 1), 'hex'),
        normalizedEmail: email,
      }));
      const scan = {
        select: jest.fn().mockReturnThis(),
        join: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        whereNull: jest.fn().mockReturnThis(),
        whereRaw: jest.fn().mockReturnThis(),
        then: (resolve: (v: unknown) => void) => resolve(rows),
      };
      scans.push(scan);
      return scan;
    });
    service = new AccountStateService(
      createMock<DatabaseService>({
        knex: knex as unknown as DatabaseService['knex'],
      }),
      createMock<ConfigService>(),
      createMock<NotifierService>(),
      createMock<ProfileClient>()
    );
    disable = jest.spyOn(service, 'disable').mockResolvedValue(true);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('scans emails in id ranges of 10,000 up to the newest id', async () => {
    givenEmails(25_000);

    await service.disableMatching({ test: () => true }, req);

    expect(
      scans.map((scan) =>
        scan.where.mock.calls.filter(([column]) => column === 'emails.id')
      )
    ).toEqual([
      [
        ['emails.id', '>', 0],
        ['emails.id', '<=', 10_000],
      ],
      [
        ['emails.id', '>', 10_000],
        ['emails.id', '<=', 20_000],
      ],
      [
        ['emails.id', '>', 20_000],
        ['emails.id', '<=', 25_000],
      ],
    ]);
  });

  it('reports progress after each range', async () => {
    givenEmails(15_000, ['a@evil.com'], ['b@evil.com']);
    const onProgress = jest.fn().mockResolvedValue(undefined);

    await service.disableMatching({ test: () => true }, req, { onProgress });

    expect(onProgress.mock.calls).toEqual([
      [{ scanned: 10_000, total: 15_000, disabled: 1, errors: 0 }],
      [{ scanned: 15_000, total: 15_000, disabled: 2, errors: 0 }],
    ]);
  });

  it('reads the primary email of enabled accounts only', async () => {
    givenEmails(1, ['changed@evil.com']);

    await service.disableMatching({ test: () => true }, req);

    expect(scans[0].join).toHaveBeenCalledWith(
      'accounts',
      'accounts.uid',
      'emails.uid'
    );
    expect(scans[0].select).toHaveBeenCalledWith(
      'emails.uid',
      'emails.normalizedEmail'
    );
    expect(scans[0].where).toHaveBeenCalledWith('emails.isPrimary', true);
    expect(scans[0].whereNull).toHaveBeenCalledWith('accounts.disabledAt');
  });

  it('resumes after the id an earlier scan reached', async () => {
    givenEmails(25_000);

    await service.disableMatching({ test: () => true }, req, {
      after: 20_000,
    });

    expect(scans).toHaveLength(1);
    expect(scans[0].where).toHaveBeenCalledWith('emails.id', '>', 20_000);
    expect(scans[0].where).toHaveBeenCalledWith('emails.id', '<=', 25_000);
  });

  it('stops between accounts when the scan is aborted', async () => {
    givenEmails(1, ['a@evil.com', 'b@evil.com']);
    const scan = new AbortController();
    disable.mockImplementationOnce(async () => {
      scan.abort(new Error('lost the lock'));
      return true;
    });

    await expect(
      service.disableMatching({ test: () => true }, req, {
        signal: scan.signal,
      })
    ).rejects.toThrow('lost the lock');
    expect(disable).toHaveBeenCalledTimes(1);
  });

  it('filters domains in SQL and disables every row that comes back', async () => {
    givenEmails(1, ['a@evil.com', 'b@spam.net']);

    await expect(
      service.disableMatching({ domains: ['evil.com', 'spam.net'] }, req)
    ).resolves.toEqual({ disabled: 2, errors: 0 });

    expect(scans[0].whereRaw).toHaveBeenCalledWith(
      "SUBSTRING_INDEX(emails.normalizedEmail, '@', -1) IN (?, ?)",
      ['evil.com', 'spam.net']
    );
    expect(disable).toHaveBeenCalledWith(uid(1), req);
    expect(disable).toHaveBeenCalledWith(uid(2), req);
  });

  it('disables only the rows that pass a predicate', async () => {
    givenEmails(1, ['a@evil.com', 'b@example.com', 'c@evil.com']);

    await expect(
      service.disableMatching(
        { test: (email) => email.endsWith('@evil.com') },
        req
      )
    ).resolves.toEqual({ disabled: 2, errors: 0 });

    expect(scans[0].whereRaw).not.toHaveBeenCalled();
    expect(disable.mock.calls).toEqual([
      [uid(1), req],
      [uid(3), req],
    ]);
  });

  it('does not count an account that the update did not change', async () => {
    givenEmails(1, ['a@evil.com', 'b@evil.com']);
    disable.mockResolvedValueOnce(false);

    await expect(
      service.disableMatching({ test: () => true }, req)
    ).resolves.toEqual({ disabled: 1, errors: 0 });
  });

  it('skips an account that fails to disable, counts it, and reports it', async () => {
    givenEmails(1, ['a@evil.com', 'b@evil.com', 'c@evil.com']);
    const error = new Error('ER_LOCK_WAIT_TIMEOUT');
    disable.mockResolvedValueOnce(true).mockRejectedValueOnce(error);

    await expect(
      service.disableMatching({ test: () => true }, req)
    ).resolves.toEqual({ disabled: 2, errors: 1 });

    expect(disable).toHaveBeenCalledTimes(3);
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      extra: { uid: uid(2) },
    });
  });

  it('gives up after ten accounts in a row fail to disable', async () => {
    givenEmails(
      1,
      Array.from({ length: 12 }, (_, i) => `u${i}@evil.com`)
    );
    disable.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(
      service.disableMatching({ test: () => true }, req)
    ).rejects.toThrow('ECONNREFUSED');
    expect(disable).toHaveBeenCalledTimes(10);
  });

  it('does not give up when the failures are not in a row', async () => {
    givenEmails(
      1,
      Array.from({ length: 12 }, (_, i) => `u${i}@evil.com`)
    );
    disable.mockImplementation(async (id: string) => {
      if (id === uid(6)) {
        return true;
      }
      throw new Error('ER_LOCK_WAIT_TIMEOUT');
    });

    await expect(
      service.disableMatching({ test: () => true }, req)
    ).resolves.toEqual({ disabled: 1, errors: 11 });
  });

  it('scans nothing when there are no emails', async () => {
    givenEmails(null);

    await expect(
      service.disableMatching({ test: () => true }, req)
    ).resolves.toEqual({ disabled: 0, errors: 0 });
    expect(scans).toHaveLength(0);
  });
});
