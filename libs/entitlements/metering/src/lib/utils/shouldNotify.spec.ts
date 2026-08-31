/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { shouldNotify } from './shouldNotify';

const NOW = new Date('2026-05-07T15:00:00.000Z');
const COOLDOWN_MS = 60 * 60 * 1000;

describe('shouldNotify', () => {
  it('notifies when nothing has been sent before', () => {
    expect(
      shouldNotify({
        windowId: '2026-05-01T00:00:00.000Z',
        now: NOW,
        cooldownMs: COOLDOWN_MS,
      })
    ).toBe(true);
  });

  describe('windows with a stable identity', () => {
    it('does not notify twice within the same window', () => {
      expect(
        shouldNotify({
          windowId: '2026-05-01T00:00:00.000Z',
          lastSent: {
            windowId: '2026-05-01T00:00:00.000Z',
            sentAt: new Date('2026-05-02T00:00:00.000Z'),
          },
          now: NOW,
          cooldownMs: COOLDOWN_MS,
        })
      ).toBe(false);
    });

    it('notifies again once the window has rolled over', () => {
      expect(
        shouldNotify({
          windowId: '2026-06-01T00:00:00.000Z',
          lastSent: {
            windowId: '2026-05-01T00:00:00.000Z',
            sentAt: new Date('2026-05-02T00:00:00.000Z'),
          },
          now: NOW,
          cooldownMs: COOLDOWN_MS,
        })
      ).toBe(true);
    });

    it('ignores the cooldown, so a long-lived window stays suppressed', () => {
      expect(
        shouldNotify({
          windowId: '2026-05-01T00:00:00.000Z',
          lastSent: {
            windowId: '2026-05-01T00:00:00.000Z',
            sentAt: new Date('2020-01-01T00:00:00.000Z'),
          },
          now: NOW,
          cooldownMs: COOLDOWN_MS,
        })
      ).toBe(false);
    });
  });

  describe('sliding windows, which fall back to a cooldown', () => {
    it('does not notify inside the cooldown', () => {
      expect(
        shouldNotify({
          windowId: null,
          lastSent: {
            windowId: null,
            sentAt: new Date('2026-05-07T14:30:00.000Z'),
          },
          now: NOW,
          cooldownMs: COOLDOWN_MS,
        })
      ).toBe(false);
    });

    it('notifies once the cooldown has exactly elapsed', () => {
      expect(
        shouldNotify({
          windowId: null,
          lastSent: {
            windowId: null,
            sentAt: new Date('2026-05-07T14:00:00.000Z'),
          },
          now: NOW,
          cooldownMs: COOLDOWN_MS,
        })
      ).toBe(true);
    });

    it('notifies once the cooldown has passed', () => {
      expect(
        shouldNotify({
          windowId: null,
          lastSent: {
            windowId: null,
            sentAt: new Date('2026-05-07T10:00:00.000Z'),
          },
          now: NOW,
          cooldownMs: COOLDOWN_MS,
        })
      ).toBe(true);
    });

    it('always notifies when the cooldown is zero', () => {
      expect(
        shouldNotify({
          windowId: null,
          lastSent: { windowId: null, sentAt: NOW },
          now: NOW,
          cooldownMs: 0,
        })
      ).toBe(true);
    });
  });
});
