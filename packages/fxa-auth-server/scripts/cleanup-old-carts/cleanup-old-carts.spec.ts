/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import { CartCleanup } from './cleanup-old-carts';

describe('CartCleanup', () => {
  let cartCleanup: CartCleanup;
  let dbStub: {
    deleteFrom: sinon.SinonSpy;
    where: sinon.SinonSpy;
    execute: sinon.SinonSpy;
    updateTable: sinon.SinonSpy;
    set: sinon.SinonSpy;
  };

  const deleteBefore = new Date('2024-01-01T00:00:00Z');
  const anonymizeBefore = new Date('2023-06-01T00:00:00Z');
  const anonymizeFields = new Set(['taxAddress'] as const);

  beforeEach(() => {
    dbStub = {
      deleteFrom: sinon.stub().returnsThis(),
      where: sinon.stub().returnsThis(),
      execute: sinon.stub().resolves(),
      updateTable: sinon.stub().returnsThis(),
      set: sinon.stub().returnsThis(),
    };

    cartCleanup = new CartCleanup(
      deleteBefore,
      anonymizeBefore,
      anonymizeFields,
      dbStub as any
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('run', () => {
    it('deletes old carts', async () => {
      await cartCleanup.run();

      expect(dbStub.deleteFrom.calledWith('carts')).toBe(true);
      expect(
        dbStub.where.calledWith('updatedAt', '<', deleteBefore.getTime())
      ).toBe(true);
      expect(dbStub.execute.called).toBe(true);
    });

    it('anonymizes fields within carts', async () => {
      await cartCleanup.run();

      expect(dbStub.updateTable.calledWith('carts')).toBe(true);
      expect(
        dbStub.where.calledWith('updatedAt', '<', anonymizeBefore.getTime())
      ).toBe(true);
      expect(dbStub.set.calledWith('taxAddress', null)).toBe(true);
      expect(dbStub.execute.calledTwice).toBe(true);
    });

    it('does not anonymize if no fields are provided', async () => {
      cartCleanup = new CartCleanup(
        deleteBefore,
        anonymizeBefore,
        new Set(),
        dbStub as any
      );
      await cartCleanup.run();

      expect(dbStub.updateTable.called).toBe(false);
    });

    it('does not anonymize if anonymizeBefore is null', async () => {
      cartCleanup = new CartCleanup(
        deleteBefore,
        null,
        anonymizeFields,
        dbStub as any
      );
      await cartCleanup.run();

      expect(dbStub.updateTable.called).toBe(false);
    });
  });
});
