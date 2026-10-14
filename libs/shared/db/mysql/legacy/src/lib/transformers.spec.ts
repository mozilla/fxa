/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { aggregateNameValuePairs } from './transformers';

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

    expect(item.availableCommands).toEqual({ 'send-tab': 'data' });
    expect(Object.getPrototypeOf(item.availableCommands)).toBeNull();
    expect(JSON.stringify(item.availableCommands)).toBe('{"send-tab":"data"}');
  });

  it('leaves the result NULL when the id is NULL', () => {
    const [item] = aggregate([
      { id: null, commandName: null, commandData: null },
    ]);

    expect(item.availableCommands).toBeNull();
  });

  it('skips names that reach Object.prototype', () => {
    const [item] = aggregate([
      { id, commandName: '__proto__', commandData: 'polluted' },
      { id, commandName: 'constructor', commandData: 'polluted' },
      { id, commandName: 'prototype', commandData: 'polluted' },
      { id, commandName: 'send-tab', commandData: 'data' },
    ]);

    expect(Object.keys(item.availableCommands)).toEqual(['send-tab']);
  });
});
