/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { expect } from 'chai';
import { EventEmitter } from 'events';
import 'mocha';
import sinon from 'sinon';

import { instrumentKnexQueryTiming } from '../../db';

// The listener only touches db.client's query lifecycle events, so a bare
// EventEmitter stands in for the knex client — no real DB needed.
describe('instrumentKnexQueryTiming', () => {
  const sandbox = sinon.createSandbox();
  let client: EventEmitter;
  let timing: sinon.SinonSpy;

  beforeEach(() => {
    client = new EventEmitter();
    timing = sandbox.spy();
    instrumentKnexQueryTiming({ client } as any, { timing } as any);
  });

  afterEach(() => sandbox.restore());

  it('times a successful query tagged by table and operation', () => {
    const obj = {
      __knexQueryUid: 'q1',
      sql: 'SELECT id FROM emails WHERE uid = ?',
    };
    client.emit('query', obj);
    client.emit('query-response', [], obj);

    sinon.assert.calledOnceWithExactly(
      timing,
      'db.query.duration',
      sinon.match.number,
      undefined,
      { table: 'emails', operation: 'select', result: 'success' }
    );
  });

  it('captures raw knex.raw() inserts (the objection-bypassing path)', () => {
    const obj = {
      __knexQueryUid: 'q2',
      sql: 'INSERT INTO sentEmails (uid, emailTypeId) VALUES (?, ?)',
    };
    client.emit('query', obj);
    client.emit('query-response', [], obj);

    sinon.assert.calledOnceWithExactly(
      timing,
      'db.query.duration',
      sinon.match.number,
      undefined,
      { table: 'sentEmails', operation: 'insert', result: 'success' }
    );
  });

  it('times a failed query with an error result', () => {
    const obj = { __knexQueryUid: 'q3', sql: 'UPDATE devices SET x = 1' };
    client.emit('query', obj);
    client.emit('query-error', new Error('nope'), obj);

    sinon.assert.calledOnceWithExactly(
      timing,
      'db.query.duration',
      sinon.match.number,
      undefined,
      { table: 'devices', operation: 'update', result: 'error' }
    );
  });

  it('skips stored-procedure calls (timed separately by BaseAuthModel)', () => {
    const obj = { __knexQueryUid: 'q4', sql: 'Call accountRecord_10(?)' };
    client.emit('query', obj);
    client.emit('query-response', [], obj);

    expect(timing.called).to.be.false;
  });

  it('does not emit for a response without a recorded start', () => {
    client.emit('query-response', [], { __knexQueryUid: 'unknown', sql: 'x' });
    expect(timing.called).to.be.false;
  });
});
