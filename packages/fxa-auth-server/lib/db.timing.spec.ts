/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Prevent the module load from pulling a real DB layer; instrumentDbTiming is
// pure and needs none of it.
jest.mock('fxa-shared/db', () => ({
  setupAuthDatabase: jest.fn(),
}));

import { instrumentDbTiming } from './db';

const boom = new Error('boom');

// Methods live on the prototype (as with the real DB class) so the Proxy wraps
// them; metrics/knex are instance fields.
class FakeDb {
  metrics: any;
  knex: any = null;
  constructor(metrics: any) {
    this.metrics = metrics;
  }
  async add(a: number, b: number) {
    return a + b;
  }
  async fail() {
    throw boom;
  }
  sync() {
    return 'value';
  }
  async inner() {
    return 'inner';
  }
  async outer() {
    return this.inner();
  }
}

describe('instrumentDbTiming', () => {
  let timing: jest.Mock;

  beforeEach(() => {
    timing = jest.fn();
  });

  it('emits db.op.duration with a success result on resolve', async () => {
    const db = instrumentDbTiming(new FakeDb({ timing }));

    await expect(db.add(2, 3)).resolves.toBe(5);
    expect(timing).toHaveBeenCalledTimes(1);
    expect(timing).toHaveBeenCalledWith(
      'db.op.duration',
      expect.any(Number),
      undefined,
      { operation: 'add' }
    );
  });

  it('still times the operation and rethrows on reject (no result tag)', async () => {
    const db = instrumentDbTiming(new FakeDb({ timing }));

    await expect(db.fail()).rejects.toBe(boom);
    expect(timing).toHaveBeenCalledWith(
      'db.op.duration',
      expect.any(Number),
      undefined,
      { operation: 'fail' }
    );
  });

  it('is a no-op when no metrics client is set', async () => {
    const db = instrumentDbTiming(new FakeDb(undefined));

    await expect(db.add(1, 1)).resolves.toBe(2);
    expect(timing).not.toHaveBeenCalled();
  });

  it('passes through non-promise return values untimed', () => {
    const db = instrumentDbTiming(new FakeDb({ timing }));

    expect(db.sync()).toBe('value');
    expect(timing).not.toHaveBeenCalled();
  });

  it('times the facade call once, not nested internal calls', async () => {
    const db = instrumentDbTiming(new FakeDb({ timing }));

    await db.outer();
    expect(timing).toHaveBeenCalledTimes(1);
    expect(timing).toHaveBeenCalledWith(
      'db.op.duration',
      expect.any(Number),
      undefined,
      { operation: 'outer' }
    );
  });

  it('exposes non-function properties unchanged', () => {
    const db = instrumentDbTiming(new FakeDb({ timing }));
    expect(db.knex).toBeNull();
  });
});
