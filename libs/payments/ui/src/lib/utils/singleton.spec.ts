/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { singleton } from './singleton';

describe('singleton', () => {
  const yolo = global as any;

  afterEach(() => {
    delete yolo.__singletons;
  });

  it('returns the value on first call', () => {
    const result = singleton('test-key', 42);

    expect(result).toBe(42);
  });

  it('returns the same value on subsequent calls', () => {
    singleton('cached-key', 'first');
    const result = singleton('cached-key', 'second');

    expect(result).toBe('first');
  });

  it('refreshes the value when refresh is true', () => {
    singleton('refresh-key', 'original');
    const result = singleton('refresh-key', 'updated', true);

    expect(result).toBe('updated');
  });

  it('stores different singletons independently', () => {
    singleton('key-a', 'value-a');
    singleton('key-b', 'value-b');

    expect(singleton('key-a', 'ignored')).toBe('value-a');
    expect(singleton('key-b', 'ignored')).toBe('value-b');
  });
});
