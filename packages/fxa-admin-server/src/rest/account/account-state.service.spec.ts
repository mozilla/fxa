/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Request } from 'express';
import { createMock } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { NotifierService } from '@fxa/shared/notifier';
import { ProfileClient } from '@fxa/profile/client';
import { DatabaseService } from '../../database/database.service';
import { AccountStateService } from './account-state.service';

const uid = (i: number) => i.toString(16).padStart(32, '0');

describe('AccountStateService', () => {
  const req = { headers: {}, ip: '127.0.0.1' } as unknown as Request;
  let queries: Array<{ select: jest.Mock; join: jest.Mock; where: jest.Mock }>;
  let service: AccountStateService;
  let disable: jest.SpyInstance;

  // Each db.account.query() resolves to the next batch of accounts.
  const givenBatches = (...batches: string[][]) => {
    queries = [];
    const account = {
      query: jest.fn(() => {
        const rows = (batches.shift() ?? []).map((email, i) => ({
          uid: uid(queries.length * 1000 + i + 1),
          normalizedEmail: email,
        }));
        const query = {
          select: jest.fn().mockReturnThis(),
          join: jest.fn().mockReturnThis(),
          whereNull: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          then: (resolve: (v: unknown) => void) => resolve(rows),
        };
        queries.push(query);
        return query;
      }),
    };
    service = new AccountStateService(
      createMock<DatabaseService>({ account: account as any }),
      createMock<ConfigService>(),
      createMock<NotifierService>(),
      createMock<ProfileClient>()
    );
    disable = jest.spyOn(service, 'disable').mockResolvedValue(true);
  };

  it('disables only the matching accounts in each batch and counts them', async () => {
    const full = Array.from({ length: 1000 }, (_, i) =>
      i % 2 ? `u${i}@evil.com` : `u${i}@example.com`
    );
    givenBatches(full, ['last@evil.com', 'last@example.com']);

    const count = await service.disableMatching(
      (email) => email.endsWith('@evil.com'),
      req
    );

    expect(count).toBe(501);
    expect(disable).toHaveBeenCalledTimes(501);
    expect(disable).toHaveBeenCalledWith(uid(2), req);
    expect(queries).toHaveLength(2);
    expect(queries[0].where).not.toHaveBeenCalledWith(
      'accounts.uid',
      '>',
      expect.anything()
    );
    expect(queries[1].where).toHaveBeenCalledWith(
      'accounts.uid',
      '>',
      Buffer.from(uid(1000), 'hex')
    );
  });

  it('matches on the primary emails row, not the signup email on accounts', async () => {
    givenBatches(['changed@evil.com']);

    await expect(
      service.disableMatching((email) => email === 'changed@evil.com', req)
    ).resolves.toBe(1);

    expect(queries[0].select).toHaveBeenCalledWith(
      'accounts.uid',
      'emails.normalizedEmail'
    );
    expect(queries[0].join).toHaveBeenCalledWith(
      'emails',
      'emails.uid',
      'accounts.uid'
    );
    expect(queries[0].where).toHaveBeenCalledWith('emails.isPrimary', true);
  });

  it('does not count an account that the update did not change', async () => {
    givenBatches(['a@evil.com', 'b@evil.com']);
    disable.mockResolvedValueOnce(false);

    await expect(service.disableMatching(() => true, req)).resolves.toBe(1);
  });
});
