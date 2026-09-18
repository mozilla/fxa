/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import { aggregateNameValuePairs } from '../../db/transformers';

const id = Buffer.from('01', 'hex');

function aggregate(rows: object[]) {
  return aggregateNameValuePairs(
    rows,
    'id',
    'commandName',
    'commandData',
    'availableCommands'
  ) as any[];
}

describe('aggregateNameValuePairs', () => {
  it('aggregates rows into a null prototype object', () => {
    const [item] = aggregate([
      { id, commandName: 'send-tab', commandData: 'data' },
    ]);

    assert.deepEqual(item.availableCommands, { 'send-tab': 'data' });
    assert.isNull(Object.getPrototypeOf(item.availableCommands));
    assert.equal(JSON.stringify(item.availableCommands), '{"send-tab":"data"}');
  });

  it('leaves the result NULL when the id is NULL', () => {
    const [item] = aggregate([
      { id: null, commandName: null, commandData: null },
    ]);

    assert.isNull(item.availableCommands);
  });

  it('skips names that reach Object.prototype', () => {
    const [item] = aggregate([
      { id, commandName: '__proto__', commandData: 'polluted' },
      { id, commandName: 'constructor', commandData: 'polluted' },
      { id, commandName: 'prototype', commandData: 'polluted' },
      { id, commandName: 'send-tab', commandData: 'data' },
    ]);

    assert.deepEqual(Object.keys(item.availableCommands), ['send-tab']);
  });
});
