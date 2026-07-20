/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { expect } from 'chai';
import 'mocha';
import { Knex } from 'knex';

import { setupDatabase } from '../../db';
import { BaseModel } from '../../db/models/base';

// Minimal opts; knex does not connect until a query runs, so no DB is needed.
const opts: any = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test',
  connectionLimitMin: 1,
  connectionLimitMax: 1,
  acquireTimeoutMillis: 1000,
};

const fakeStatsd: any = { increment() {}, timing() {} };

describe('setupDatabase query-timing kill switch', () => {
  let knex: Knex | undefined;

  afterEach(async () => {
    BaseModel.metrics = undefined;
    if (knex) {
      await knex.destroy();
      knex = undefined;
    }
  });

  it('wires BaseModel.metrics when queryTiming is true', () => {
    knex = setupDatabase(opts, undefined, fakeStatsd, true);
    expect(BaseModel.metrics).to.equal(fakeStatsd);
  });

  it('leaves BaseModel.metrics unset when queryTiming is false', () => {
    BaseModel.metrics = undefined;
    knex = setupDatabase(opts, undefined, fakeStatsd, false);
    expect(BaseModel.metrics).to.be.undefined;
  });

  it('leaves BaseModel.metrics unset when no client is provided', () => {
    BaseModel.metrics = undefined;
    knex = setupDatabase(opts, undefined, undefined, true);
    expect(BaseModel.metrics).to.be.undefined;
  });
});
