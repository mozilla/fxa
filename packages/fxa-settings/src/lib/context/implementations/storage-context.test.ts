/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StorageContext } from './storage-context';

describe('storage-context', () => {
  it('creates', () => {
    const context = new StorageContext(window);
    expect(context).toBeDefined();
  });

  it('sets and gets', () => {
    const context = new StorageContext(window);
    context.set('foo', 'bar');
    expect(context.get('foo')).toEqual('bar');
  });

  it('does require sync', () => {
    const context = new StorageContext(window);
    expect(context.requiresSync()).toBeTruthy();
  });

  it('persists and loads state', () => {
    const context1 = new StorageContext(window);
    context1.set('foo', 'bar');

    // Requires persist
    const context2 = new StorageContext(window);
    expect(context2.get('foo')).toBeUndefined();

    // Loads after persists
    context1.persist();
    context2.load();
    expect(context2.get('foo')).toEqual('bar');

    // Load by default
    const context3 = new StorageContext(window);
    expect(context3.get('foo')).toEqual('bar');
  });
});
