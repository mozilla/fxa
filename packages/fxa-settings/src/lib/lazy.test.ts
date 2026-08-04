/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { lazy } from './lazy';

describe('lazy', () => {
  it('calls the factory only once', () => {
    const factory = jest.fn(() => 42);
    const get = lazy(factory);

    expect(get()).toBe(42);
    expect(get()).toBe(42);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('returns the same instance on repeated calls', () => {
    const obj = { key: 'value' };
    const get = lazy(() => obj);

    expect(get()).toBe(obj);
    expect(get()).toBe(obj);
  });

  it('calls the factory only once when it returns undefined', () => {
    const factory = jest.fn(() => undefined);
    const get = lazy(factory);

    expect(get()).toBeUndefined();
    expect(get()).toBeUndefined();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('calls the factory only once when it returns null', () => {
    const factory = jest.fn(() => null);
    const get = lazy(factory);

    expect(get()).toBeNull();
    expect(get()).toBeNull();
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
