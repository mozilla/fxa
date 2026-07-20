/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { FirestoreService } from '@fxa/shared/db/firestore';
import type { FreeAccessProjection } from '@fxa/shared/cms';

import { FreeAccessProgramJournalManager } from './free-access-program.journal.manager';
import { MockFreeAccessProgramJournalManagerConfigProvider } from './free-access-program.journal.manager.config';
import * as repository from './free-access-program.repository';

jest.mock('./free-access-program.repository', () => ({
  getFreeAccessProgramJournal: jest.fn(),
  setFreeAccessProgramJournal: jest.fn(),
}));

describe('FreeAccessProgramJournalManager', () => {
  let manager: FreeAccessProgramJournalManager;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockFreeAccessProgramJournalManagerConfigProvider,
        FreeAccessProgramJournalManager,
        {
          provide: FirestoreService,
          useValue: {
            collection: jest.fn().mockReturnValue({}),
          },
        },
      ],
    }).compile();

    manager = module.get(FreeAccessProgramJournalManager);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('get', () => {
    it('forwards to getFreeAccessProgramJournal with the collection ref', async () => {
      const projection: FreeAccessProjection = {
        'alice@example.com': {
          capabilities: { 'client-a': ['vpn'] },
          offeringApiIdentifiers: ['vpn'],
        },
      };
      jest
        .spyOn(repository, 'getFreeAccessProgramJournal')
        .mockResolvedValue(projection);

      const result = await manager.get();

      expect(repository.getFreeAccessProgramJournal).toHaveBeenCalledWith(
        expect.anything()
      );
      expect(result).toBe(projection);
    });

    it('returns null when the underlying repository returns null', async () => {
      jest
        .spyOn(repository, 'getFreeAccessProgramJournal')
        .mockResolvedValue(null);
      await expect(manager.get()).resolves.toBeNull();
    });
  });

  describe('set', () => {
    it('forwards the projection to setFreeAccessProgramJournal', async () => {
      const projection: FreeAccessProjection = {
        'alice@example.com': {
          capabilities: { 'client-a': ['vpn'] },
          offeringApiIdentifiers: ['vpn'],
        },
      };
      jest
        .spyOn(repository, 'setFreeAccessProgramJournal')
        .mockResolvedValue(undefined);

      await manager.set(projection);

      expect(repository.setFreeAccessProgramJournal).toHaveBeenCalledWith(
        expect.anything(),
        projection
      );
    });
  });
});
