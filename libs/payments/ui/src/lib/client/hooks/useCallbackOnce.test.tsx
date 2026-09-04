/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderHook, act } from '@testing-library/react';
import { useCallbackOnce } from './useCallbackOnce';

describe('useCallbackOnce', () => {
  it('calls the callback on the first invocation', () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useCallbackOnce(cb, []));

    act(() => {
      result.current();
    });

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('does not call the callback on subsequent invocations', () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useCallbackOnce(cb, []));

    act(() => {
      result.current();
      result.current();
      result.current();
    });

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('returns a stable function reference across rerenders', () => {
    const cb = jest.fn();
    const { result, rerender } = renderHook(() => useCallbackOnce(cb, []));

    const firstRef = result.current;
    rerender();

    expect(result.current).toBe(firstRef);
  });

  it('does not call the callback after rerender if already called', () => {
    const cb = jest.fn();
    const { result, rerender } = renderHook(() => useCallbackOnce(cb, []));

    act(() => {
      result.current();
    });

    rerender();

    act(() => {
      result.current();
    });

    expect(cb).toHaveBeenCalledTimes(1);
  });
});
