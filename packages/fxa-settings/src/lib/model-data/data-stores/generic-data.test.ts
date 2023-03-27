/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GenericData } from './generic-data';

describe('generic-data', () => {
  it('creates', () => {
    const data = new GenericData({});
    expect(data).toBeDefined();
  });

  it('sets and gets', () => {
    const data = new GenericData({});
    data.set('foo', 'bar');
    expect(data.get('foo')).toEqual('bar');
  });

  it('does not require sync', () => {
    const data = new GenericData({});
    expect(data.requiresSync()).toBeFalsy();
  });
});
