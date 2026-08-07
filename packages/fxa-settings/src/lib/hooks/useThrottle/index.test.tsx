/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, renderHook } from '@testing-library/react';
import useThrottle from '.';

describe('useThrottle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts in a not-throttled state', () => {
    const { result } = renderHook(() => useThrottle());
    expect(result.current.isThrottled).toBe(false);
  });

  it('throttles for retryAfter milliseconds, then re-enables', () => {
    const { result } = renderHook(() => useThrottle());

    act(() => {
      result.current.startThrottle({ retryAfter: 3000 });
    });
    expect(result.current.isThrottled).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2999);
    });
    expect(result.current.isThrottled).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.isThrottled).toBe(false);
  });

  it('does not throttle when retryAfter is missing or non-positive', () => {
    const { result } = renderHook(() => useThrottle());

    act(() => {
      result.current.startThrottle({});
    });
    expect(result.current.isThrottled).toBe(false);

    act(() => {
      result.current.startThrottle({ retryAfter: 0 });
    });
    expect(result.current.isThrottled).toBe(false);
  });
});
