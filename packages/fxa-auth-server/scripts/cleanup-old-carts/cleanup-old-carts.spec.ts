/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CartCleanup } from './cleanup-old-carts';

describe('CartCleanup', () => {
  let cartCleanup: CartCleanup;
  let dbStub: {
    deleteFrom: jest.Mock;
    where: jest.Mock;
    execute: jest.Mock;
    updateTable: jest.Mock;
    set: jest.Mock;
  };

  const deleteBefore = new Date('2024-01-01T00:00:00Z');
  const anonymizeBefore = new Date('2023-06-01T00:00:00Z');
  const anonymizeFields = new Set(['taxAddress'] as const);

  beforeEach(() => {
    dbStub = {
      deleteFrom: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
      updateTable: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
    };

    cartCleanup = new CartCleanup(
      deleteBefore,
      anonymizeBefore,
      anonymizeFields,
      dbStub as any
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('run', () => {
    it('deletes old carts', async () => {
      await cartCleanup.run();

      expect(dbStub.deleteFrom).toHaveBeenCalledWith('carts');
      expect(dbStub.where).toHaveBeenCalledWith(
        'updatedAt',
        '<',
        deleteBefore.getTime()
      );
      expect(dbStub.execute).toHaveBeenCalled();
    });

    it('anonymizes fields within carts', async () => {
      await cartCleanup.run();

      expect(dbStub.updateTable).toHaveBeenCalledWith('carts');
      expect(dbStub.where).toHaveBeenCalledWith(
        'updatedAt',
        '<',
        anonymizeBefore.getTime()
      );
      expect(dbStub.set).toHaveBeenCalledWith('taxAddress', null);
      expect(dbStub.execute).toHaveBeenCalledTimes(2);
    });

    it('does not anonymize if no fields are provided', async () => {
      cartCleanup = new CartCleanup(
        deleteBefore,
        anonymizeBefore,
        new Set(),
        dbStub as any
      );
      await cartCleanup.run();

      expect(dbStub.updateTable).not.toHaveBeenCalled();
    });

    it('does not anonymize if anonymizeBefore is null', async () => {
      cartCleanup = new CartCleanup(
        deleteBefore,
        null,
        anonymizeFields,
        dbStub as any
      );
      await cartCleanup.run();

      expect(dbStub.updateTable).not.toHaveBeenCalled();
    });
  });
});
