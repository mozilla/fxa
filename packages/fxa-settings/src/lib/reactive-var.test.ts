/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderHook, act } from '@testing-library/react';
import { makeVar, useReactiveVar } from './reactive-var';

describe('makeVar', () => {
  it('reads initial value and updates on set', () => {
    const rv = makeVar(0);
    expect(rv()).toBe(0);
    expect(rv(42)).toBe(42);
    expect(rv()).toBe(42);
  });

  it('notifies subscribers and supports unsubscribe', () => {
    const rv = makeVar('a');
    const fn = jest.fn();
    const unsub = rv.subscribe(fn);

    rv('b');
    expect(fn).toHaveBeenCalledTimes(1);

    unsub();
    rv('c');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('useReactiveVar', () => {
  it('returns current value and re-renders on change', () => {
    const rv = makeVar(0);
    const { result } = renderHook(() => useReactiveVar(rv));
    expect(result.current).toBe(0);

    act(() => rv(5));
    expect(result.current).toBe(5);
  });
});
