/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import { expect } from 'chai';
import { CartCleanup } from '../../scripts/cleanup-old-carts/cleanup-old-carts';
import Sinon from 'sinon';

describe('CartCleanup', () => {
  let cartCleanup: CartCleanup;
  let dbStub: {
    deleteFrom: Sinon.SinonSpy;
    where: Sinon.SinonSpy;
    execute: Sinon.SinonSpy;
    updateTable: Sinon.SinonSpy;
    set: Sinon.SinonSpy;
  };

  const deleteBefore = new Date('2024-01-01T00:00:00Z');
  const anonymizeBefore = new Date('2023-06-01T00:00:00Z');
  const anonymizeFields = new Set(['email', 'taxAddress'] as const);

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
      dbStub
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('run', () => {
    it('deletes old carts', async () => {
      await cartCleanup.run();

      expect(dbStub.deleteFrom.calledWith('carts')).to.be.true;
      expect(dbStub.where.calledWith('updatedAt', '<', deleteBefore.getTime()))
        .to.be.true;
      expect(dbStub.execute.called).to.be.true;
    });

    it('anonymizes fields within carts', async () => {
      await cartCleanup.run();

      expect(dbStub.updateTable.calledWith('carts')).to.be.true;
      expect(
        dbStub.where.calledWith('updatedAt', '<', anonymizeBefore.getTime())
      ).to.be.true;
      expect(dbStub.set.calledWith('email', null)).to.be.true;
      expect(dbStub.set.calledWith('taxAddress', null)).to.be.true;
      expect(dbStub.execute.calledTwice).to.be.true;
    });

    it('does not anonymize if no fields are provided', async () => {
      cartCleanup = new CartCleanup(
        deleteBefore,
        anonymizeBefore,
        new Set(),
        dbStub
      );
      await cartCleanup.run();

      expect(dbStub.updateTable.called).to.be.false;
    });

    it('does not anonymize if anonymizeBefore is null', async () => {
      cartCleanup = new CartCleanup(
        deleteBefore,
        null,
        anonymizeFields,
        dbStub
      );
      await cartCleanup.run();

      expect(dbStub.updateTable.called).to.be.false;
    });
  });
});
