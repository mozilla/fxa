/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { expect } from 'chai';
import 'mocha';
import sinon from 'sinon';

import { BaseModel } from '../../../../db/models/base';
import { BaseAuthModel, Proc } from '../../../../db/models/auth/base-auth';

// Unit tests (no DB): stub BaseAuthModel.knex so callProcedure runs against a
// fake query, and assert the db.proc.duration timing behavior.
describe('BaseAuthModel proc timing', () => {
  const sandbox = sinon.createSandbox();
  let timing: sinon.SinonSpy;

  // A fake knex whose raw() returns the supplied (resolving/rejecting) query
  // and whose select().first() resolves, mirroring callProcedureWithOutputs.
  function fakeKnex(query: Promise<any>) {
    return {
      raw: sandbox.stub().returns(query),
      select: sandbox.stub().returns({
        first: sandbox.stub().resolves({ out: 1 }),
      }),
    } as any;
  }

  beforeEach(() => {
    timing = sandbox.spy();
    BaseModel.metrics = { timing } as any;
  });

  afterEach(() => {
    sandbox.restore();
    BaseModel.metrics = undefined;
  });

  it('emits db.proc.duration with a success result on resolve', async () => {
    sandbox
      .stub(BaseAuthModel, 'knex')
      .returns(fakeKnex(Promise.resolve([{ affectedRows: 1 }])));

    await BaseAuthModel.callProcedure(Proc.AccountRecord, 'uid');

    sinon.assert.calledOnceWithExactly(
      timing,
      'db.proc.duration',
      sinon.match.number,
      undefined,
      { operation: Proc.AccountRecord, result: 'success' }
    );
  });

  it('emits an error result and rethrows the original error on reject', async () => {
    const boom = new Error('boom');
    sandbox
      .stub(BaseAuthModel, 'knex')
      .returns(fakeKnex(Promise.reject(boom)));

    let caught: Error | undefined;
    try {
      await BaseAuthModel.callProcedure(Proc.CreateAccount, 'uid');
    } catch (err) {
      caught = err as Error;
    }

    expect(caught).to.equal(boom);
    sinon.assert.calledOnceWithExactly(
      timing,
      'db.proc.duration',
      sinon.match.number,
      undefined,
      { operation: Proc.CreateAccount, result: 'error' }
    );
  });

  it('is a no-op when no metrics client is set', async () => {
    BaseModel.metrics = undefined;
    sandbox
      .stub(BaseAuthModel, 'knex')
      .returns(fakeKnex(Promise.resolve([{ affectedRows: 1 }])));

    const result = await BaseAuthModel.callProcedure(Proc.AccountRecord, 'uid');
    expect(result).to.exist;
  });

  it('times only the proc call, not the follow-up outputs query', async () => {
    sandbox
      .stub(BaseAuthModel, 'knex')
      .returns(fakeKnex(Promise.resolve([{ affectedRows: 1 }])));

    await BaseAuthModel.callProcedureWithOutputs(
      Proc.CreateSessionToken,
      ['uid'],
      ['@out']
    );

    sinon.assert.calledOnceWithExactly(
      timing,
      'db.proc.duration',
      sinon.match.number,
      undefined,
      { operation: Proc.CreateSessionToken, result: 'success' }
    );
  });
});
