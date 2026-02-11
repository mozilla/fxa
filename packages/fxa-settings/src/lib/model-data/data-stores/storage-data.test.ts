/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReachRouterWindow } from '../../window';
import { RawData } from '../model-data-store';
import { StorageData } from './storage-data';

describe('storage-data', () => {
  const window = new ReachRouterWindow();

  it('creates', () => {
    const data = new StorageData(window);
    expect(data).toBeDefined();
  });

  it('sets and gets', () => {
    const data = new StorageData(window);
    data.set('foo', 'bar');
    expect(data.get('foo')).toEqual('bar');
  });

  it('does require sync', () => {
    const data = new StorageData(window);
    expect(data.requiresSync()).toBeTruthy();
  });

  it('persists and loads state', () => {
    const data1 = new StorageData(window);
    data1.set('foo', 'bar');

    // Requires persist
    const data2 = new StorageData(window);
    expect(data2.get('foo')).toBeUndefined();

    // Loads after persists
    data1.persist();
    data2.load();
    expect(data2.get('foo')).toEqual('bar');

    // Load by default
    const data3 = new StorageData(window);
    expect(data3.get('foo')).toEqual('bar');
  });

  it('protects against legacy state', () => {
    const data1 = new StorageData(window);

    // Side step type safety to mimic legacy state. Content server may
    // have written data akin to this.
    data1.set('foo', { x: { bar: 'baz' } } as unknown as RawData);

    const value = data1.get('foo');

    expect(value).toEqual(JSON.stringify({ x: { bar: 'baz' } }));
  });
});
