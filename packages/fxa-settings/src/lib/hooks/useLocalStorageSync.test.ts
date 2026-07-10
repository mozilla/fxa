/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderHook, act } from '@testing-library/react';
import { useLocalStorageSync } from './useLocalStorageSync';
import Storage from '../storage';

jest.mock('../storage');

const mockStorage = {
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
};

describe('useLocalStorageSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Storage.factory as jest.Mock) = jest.fn(() => mockStorage);
  });

  it('returns value from storage', () => {
    mockStorage.get.mockReturnValue('test-value');
    const { result } = renderHook(() => useLocalStorageSync('test-key'));

    expect(result.current).toBe('test-value');
    expect(mockStorage.get).toHaveBeenCalledWith('test-key');
  });

  it('returns undefined when key does not exist', () => {
    mockStorage.get.mockReturnValue(undefined);
    const { result } = renderHook(() => useLocalStorageSync('non-existent'));

    expect(result.current).toBeUndefined();
  });

  it('subscribes to localStorageChange events', () => {
    mockStorage.get.mockReturnValue('value');
    const { result } = renderHook(() => useLocalStorageSync('test-key'));

    expect(result.current).toBe('value');

    act(() => {
      window.dispatchEvent(
        new CustomEvent('localStorageChange', {
          detail: { key: 'test-key' },
        })
      );
    });

    expect(mockStorage.get).toHaveBeenCalled();
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useLocalStorageSync('test-key'));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'localStorageChange',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });
});
