/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { CollectionReference } from '@google-cloud/firestore';

import type { FreeAccessProjection } from '@fxa/shared/cms';

import {
  getFreeAccessProgramJournal,
  setFreeAccessProgramJournal,
} from './free-access-program.repository';

describe('free-access-program.repository', () => {
  let docGet: jest.Mock;
  let docSet: jest.Mock;
  let docRef: { get: jest.Mock; set: jest.Mock };
  let db: jest.Mocked<Pick<CollectionReference, 'doc'>>;

  beforeEach(() => {
    docGet = jest.fn();
    docSet = jest.fn().mockResolvedValue(undefined);
    docRef = { get: docGet, set: docSet };
    db = {
      doc: jest.fn().mockReturnValue(docRef),
    } as jest.Mocked<Pick<CollectionReference, 'doc'>>;
  });

  describe('getFreeAccessProgramJournal', () => {
    it('returns null when the journal document does not exist', async () => {
      docGet.mockResolvedValue({ exists: false });

      const result = await getFreeAccessProgramJournal(
        db as unknown as CollectionReference
      );

      expect(result).toBeNull();
      expect(db.doc).toHaveBeenCalledWith('state');
    });

    it('returns the projection when the journal document exists', async () => {
      const projection: FreeAccessProjection = {
        'alice@example.com': {
          capabilities: { 'client-a': ['vpn'] },
          offeringApiIdentifiers: ['vpn'],
        },
      };
      docGet.mockResolvedValue({
        exists: true,
        data: () => ({ projection, updatedAt: 1_700_000_000_000 }),
      });

      const result = await getFreeAccessProgramJournal(
        db as unknown as CollectionReference
      );

      expect(result).toEqual(projection);
    });

    it('returns an empty projection when the document exists but the field is absent', async () => {
      docGet.mockResolvedValue({
        exists: true,
        data: () => ({ updatedAt: 1_700_000_000_000 }),
      });

      const result = await getFreeAccessProgramJournal(
        db as unknown as CollectionReference
      );

      expect(result).toEqual({});
    });
  });

  describe('setFreeAccessProgramJournal', () => {
    it('writes the projection to the state doc with a timestamp', async () => {
      const projection: FreeAccessProjection = {
        'alice@example.com': {
          capabilities: { 'client-a': ['vpn'] },
          offeringApiIdentifiers: ['vpn'],
        },
      };
      const NOW = 1_700_000_000_000;
      jest.spyOn(Date, 'now').mockReturnValue(NOW);

      await setFreeAccessProgramJournal(
        db as unknown as CollectionReference,
        projection
      );

      expect(db.doc).toHaveBeenCalledWith('state');
      expect(docSet).toHaveBeenCalledWith({ projection, updatedAt: NOW });
    });

    it('upserts (set without merge) so the prior journal is fully replaced', async () => {
      await setFreeAccessProgramJournal(
        db as unknown as CollectionReference,
        {}
      );
      // No `merge: true` option passed — confirms full overwrite semantics.
      expect(docSet).toHaveBeenCalledTimes(1);
      expect(docSet.mock.calls[0][1]).toBeUndefined();
    });
  });
});
