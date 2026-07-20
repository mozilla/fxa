/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getStoredTheme, setStoredTheme } from './theme-storage';

describe('theme-storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns light when localStorage is unavailable', () => {
    jest.isolateModules(() => {
      jest.doMock('./storage', () => ({
        __esModule: true,
        default: {
          factory: () => ({
            get: () => {
              throw new Error('localStorage is disabled');
            },
            set: jest.fn(),
          }),
        },
      }));

      const { getStoredTheme } = require('./theme-storage');
      expect(getStoredTheme()).toBe('light');
    });
  });

  it('does not throw on setStoredTheme when localStorage is unavailable', () => {
    jest.isolateModules(() => {
      jest.doMock('./storage', () => ({
        __esModule: true,
        default: {
          factory: () => ({
            get: jest.fn(),
            set: () => {
              throw new Error('localStorage is disabled');
            },
          }),
        },
      }));

      const { setStoredTheme } = require('./theme-storage');
      expect(() => setStoredTheme('dark')).not.toThrow();
    });
  });

  it('round-trips a stored theme', () => {
    setStoredTheme('dark');
    expect(getStoredTheme()).toBe('dark');
  });

  it('returns light for unknown stored values', () => {
    expect(getStoredTheme()).toBe('light');
  });
});
