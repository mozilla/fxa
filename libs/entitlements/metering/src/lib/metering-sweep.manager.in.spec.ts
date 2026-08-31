/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ClickHouseClient } from './clickhouse.client';
import {
  anchoredClock,
  DAY_MS,
  HOUR_MS,
  integrationClickHouseClient,
  optimizeFinal,
  truncateMeteringTables,
} from '../testing';
import { MeteringEventsManager } from './metering-events.manager';
import { MeteringEventsRepository } from './metering-events.repository';
import { MeteringSweepManager } from './metering-sweep.manager';
import { notificationKey } from './utils/notificationKey';
import { MeteringSweepRepository } from './metering-sweep.repository';
import { hashEventId } from './utils/hashEventId';

const { at } = anchoredClock();

const CLIENT_ID = 'vpn';
const SLUG = 'tokens';
const NOW = at(0);
const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

describe('MeteringSweepManager against a real ClickHouse', () => {
  let client: ClickHouseClient;
  let manager: MeteringSweepManager;
  let events: MeteringEventsManager;

  function event(id: string, subject: string, amount: number, at: Date) {
    return {
      eventIdHash: hashEventId(id),
      clientId: CLIENT_ID,
      slug: SLUG,
      subject,
      amount,
      eventTime: at,
      ingestedAt: at,
    };
  }

  function candidateParams(override: Record<string, unknown> = {}) {
    return {
      clientId: CLIENT_ID,
      slug: SLUG,
      from: at(-14.5 * DAY_MS),
      to: at(16.5 * DAY_MS),
      ingestedSince: new Date(NOW.getTime() - 90_000),
      eventTimeFloor: at(-14.5 * DAY_MS),
      minUsage: 80,
      ...override,
    };
  }

  beforeAll(() => {
    client = integrationClickHouseClient();
    manager = new MeteringSweepManager(new MeteringSweepRepository(client));
    events = new MeteringEventsManager(new MeteringEventsRepository(client));
  });

  beforeEach(async () => {
    await truncateMeteringTables(client);
  });

  describe('findWindowCandidates', () => {
    it('returns nobody when the table is empty', async () => {
      await expect(
        manager.findWindowCandidates(candidateParams())
      ).resolves.toEqual([]);
    });

    it('returns a subject whose windowed usage meets the prefilter', async () => {
      await events.insertEvents([event('e1', 'user-1', 90, at(-30000))]);

      await expect(
        manager.findWindowCandidates(candidateParams())
      ).resolves.toEqual([{ subject: 'user-1', usage: 90 }]);
    });

    it('excludes a subject below the prefilter', async () => {
      await events.insertEvents([event('e1', 'user-1', 10, at(-30000))]);

      await expect(
        manager.findWindowCandidates(candidateParams())
      ).resolves.toEqual([]);
    });

    it('excludes a subject with no activity inside the lookback', async () => {
      await events.insertEvents([event('e1', 'user-1', 90, at(-2 * HOUR_MS))]);

      await expect(
        manager.findWindowCandidates(candidateParams())
      ).resolves.toEqual([]);
    });

    it('sums the whole window even when only the tail is inside the lookback', async () => {
      await events.insertEvents([
        event('e1', 'user-1', 70, at(-13.5 * DAY_MS)),
        event('e2', 'user-1', 20, at(-30000)),
      ]);

      await expect(
        manager.findWindowCandidates(candidateParams())
      ).resolves.toEqual([{ subject: 'user-1', usage: 90 }]);
    });

    it('counts a duplicate row once after the ReplacingMergeTree backstop merges', async () => {
      const dup = event('e1', 'user-1', 90, at(-30000));
      await events.insertEvents([dup]);
      await events.insertEvents([dup]);
      await optimizeFinal(client, 'events');

      await expect(
        manager.findWindowCandidates(candidateParams())
      ).resolves.toEqual([{ subject: 'user-1', usage: 90 }]);
    });

    it('scopes candidates to the requested client', async () => {
      await events.insertEvents([
        {
          ...event('e1', 'user-1', 90, at(-30000)),
          clientId: 'relay',
        },
      ]);

      await expect(
        manager.findWindowCandidates(candidateParams())
      ).resolves.toEqual([]);
    });
  });

  describe('findSessionCandidates', () => {
    const sessionParams = {
      clientId: CLIENT_ID,
      slug: SLUG,
      expiredBefore: new Date(NOW.getTime() - FIVE_HOURS_MS),
      to: NOW,
      minUsage: 80,
    };

    it('returns nobody when no session is open', async () => {
      await events.insertEvents([event('e1', 'user-1', 90, at(-1 * HOUR_MS))]);

      await expect(
        manager.findSessionCandidates(sessionParams)
      ).resolves.toEqual([]);
    });

    it('measures usage from the open session start', async () => {
      await manager.recordSessionStarts([
        {
          clientId: CLIENT_ID,
          slug: SLUG,
          subject: 'user-1',
          sessionStart: at(-2 * HOUR_MS),
        },
      ]);
      await events.insertEvents([
        event('before', 'user-1', 500, at(-3 * HOUR_MS)),
        event('inside', 'user-1', 90, at(-1 * HOUR_MS)),
      ]);

      await expect(
        manager.findSessionCandidates(sessionParams)
      ).resolves.toEqual([{ subject: 'user-1', usage: 90 }]);
    });

    it('ignores a session that expired exactly at the boundary', async () => {
      await manager.recordSessionStarts([
        {
          clientId: CLIENT_ID,
          slug: SLUG,
          subject: 'user-1',
          sessionStart: new Date(NOW.getTime() - FIVE_HOURS_MS),
        },
      ]);
      await events.insertEvents([event('e1', 'user-1', 90, at(-1 * HOUR_MS))]);

      await expect(
        manager.findSessionCandidates(sessionParams)
      ).resolves.toEqual([]);
    });

    it('keeps a session open one millisecond inside the boundary', async () => {
      await manager.recordSessionStarts([
        {
          clientId: CLIENT_ID,
          slug: SLUG,
          subject: 'user-1',
          sessionStart: new Date(NOW.getTime() - FIVE_HOURS_MS + 1),
        },
      ]);
      await events.insertEvents([event('e1', 'user-1', 90, at(-1 * HOUR_MS))]);

      await expect(
        manager.findSessionCandidates(sessionParams)
      ).resolves.toEqual([{ subject: 'user-1', usage: 90 }]);
    });
  });

  describe('notifications round-trip', () => {
    it('reads back a recorded notification', async () => {
      await manager.recordNotifications([
        {
          clientId: CLIENT_ID,
          slug: SLUG,
          subject: 'user-1',
          threshold: 80,
          signingClientId: 'vpn',
          windowId: '2026-05-01T00:00:00.000Z',
          sentAt: at(0),
        },
      ]);

      const result = await manager.findLastNotifications({
        clientId: CLIENT_ID,
        slug: SLUG,
        subjects: ['user-1'],
      });

      expect(result.get(notificationKey('user-1', 80, 'vpn'))).toEqual({
        windowId: '2026-05-01T00:00:00.000Z',
        sentAt: at(0),
      });
    });

    it('round-trips a null window id through the empty-string encoding', async () => {
      await manager.recordNotifications([
        {
          clientId: CLIENT_ID,
          slug: SLUG,
          subject: 'user-1',
          threshold: 80,
          signingClientId: 'vpn',
          windowId: null,
          sentAt: at(0),
        },
      ]);

      const result = await manager.findLastNotifications({
        clientId: CLIENT_ID,
        slug: SLUG,
        subjects: ['user-1'],
      });

      expect(
        result.get(notificationKey('user-1', 80, 'vpn'))?.windowId
      ).toBeNull();
    });

    it('keeps only the most recent notification per subject and threshold', async () => {
      const base = {
        clientId: CLIENT_ID,
        slug: SLUG,
        subject: 'user-1',
        threshold: 80,
        signingClientId: 'vpn',
      };
      await manager.recordNotifications([
        {
          ...base,
          windowId: 'older',
          sentAt: at(-5.5 * DAY_MS),
        },
      ]);
      await manager.recordNotifications([
        {
          ...base,
          windowId: 'newer',
          sentAt: at(-1.5 * DAY_MS),
        },
      ]);

      const result = await manager.findLastNotifications({
        clientId: CLIENT_ID,
        slug: SLUG,
        subjects: ['user-1'],
      });

      expect(result.get(notificationKey('user-1', 80, 'vpn'))).toEqual({
        windowId: 'newer',
        sentAt: at(-1.5 * DAY_MS),
      });
    });

    it('survives a subject containing SQL quoting characters', async () => {
      const subject = "o'brien\\x";
      await manager.recordNotifications([
        {
          clientId: CLIENT_ID,
          slug: SLUG,
          subject,
          threshold: 80,
          signingClientId: 'vpn',
          windowId: 'w1',
          sentAt: at(0),
        },
      ]);

      const result = await manager.findLastNotifications({
        clientId: CLIENT_ID,
        slug: SLUG,
        subjects: [subject],
      });

      expect(result.get(notificationKey(subject, 80, 'vpn'))?.windowId).toBe(
        'w1'
      );
    });

    it('separates notifications by client', async () => {
      const base = {
        slug: SLUG,
        subject: 'user-1',
        threshold: 80,
        signingClientId: 'vpn',
        windowId: 'w1',
        sentAt: at(0),
      };
      await manager.recordNotifications([{ ...base, clientId: 'relay' }]);

      const result = await manager.findLastNotifications({
        clientId: CLIENT_ID,
        slug: SLUG,
        subjects: ['user-1'],
      });

      expect(result.size).toBe(0);
    });
  });

  describe('sessions round-trip', () => {
    it('reads back the latest recorded session start', async () => {
      await manager.recordSessionStarts([
        {
          clientId: CLIENT_ID,
          slug: SLUG,
          subject: 'user-1',
          sessionStart: at(-3 * HOUR_MS),
        },
      ]);

      const result = await manager.findSessionStarts({
        clientId: CLIENT_ID,
        slug: SLUG,
        subjects: ['user-1'],
      });

      expect(result.get('user-1')).toEqual(at(-3 * HOUR_MS));
    });
  });

  describe('watermark round-trip', () => {
    it('returns null before any sweep has run', async () => {
      await expect(
        manager.findWatermark({ clientId: CLIENT_ID, slug: SLUG })
      ).resolves.toBeNull();
    });

    it('reads back an advanced watermark', async () => {
      await manager.advanceWatermark({
        clientId: CLIENT_ID,
        slug: SLUG,
        watermark: at(-300000),
        updatedAt: at(0),
      });

      await expect(
        manager.findWatermark({ clientId: CLIENT_ID, slug: SLUG })
      ).resolves.toEqual(at(-300000));
    });

    it('keeps the latest write when the watermark advances twice', async () => {
      await manager.advanceWatermark({
        clientId: CLIENT_ID,
        slug: SLUG,
        watermark: at(-300000),
        updatedAt: at(0),
      });
      await manager.advanceWatermark({
        clientId: CLIENT_ID,
        slug: SLUG,
        watermark: at(300000),
        updatedAt: at(600000),
      });

      await expect(
        manager.findWatermark({ clientId: CLIENT_ID, slug: SLUG })
      ).resolves.toEqual(at(300000));
    });

    it('keeps watermarks separate per client', async () => {
      await manager.advanceWatermark({
        clientId: 'relay',
        slug: SLUG,
        watermark: at(-300000),
        updatedAt: at(0),
      });

      await expect(
        manager.findWatermark({ clientId: CLIENT_ID, slug: SLUG })
      ).resolves.toBeNull();
    });
  });

  describe('activity gate on ingested_at', () => {
    it('finds a subject whose event is old but was ingested after the watermark', async () => {
      await events.insertEvents([
        {
          ...event('late', 'user-1', 90, at(-1.5 * DAY_MS)),
          ingestedAt: at(-60000),
        },
      ]);

      await expect(
        manager.findWindowCandidates(
          candidateParams({
            ingestedSince: at(-300000),
            eventTimeFloor: at(-2.5 * DAY_MS),
          })
        )
      ).resolves.toEqual([{ subject: 'user-1', usage: 90 }]);
    });

    it('excludes a subject ingested before the watermark', async () => {
      await events.insertEvents([
        {
          ...event('early', 'user-1', 90, at(-1.5 * DAY_MS)),
          ingestedAt: at(-1 * HOUR_MS),
        },
      ]);

      await expect(
        manager.findWindowCandidates(
          candidateParams({
            ingestedSince: at(-300000),
            eventTimeFloor: at(-2.5 * DAY_MS),
          })
        )
      ).resolves.toEqual([]);
    });
  });

  describe('session start detection', () => {
    const detectParams = (override: Record<string, unknown> = {}) => ({
      clientId: CLIENT_ID,
      slug: SLUG,
      ingestedSince: at(-300000),
      eventTimeFloor: new Date(NOW.getTime() - FIVE_HOURS_MS),
      to: NOW,
      durationMs: FIVE_HOURS_MS,
      ...override,
    });

    it('opens a session at the first event when the subject has none', async () => {
      await events.insertEvents([
        event('e1', 'user-1', 5, at(-240000)),
        event('e2', 'user-1', 5, at(-120000)),
      ]);

      await expect(
        manager.findNewSessionStarts(detectParams())
      ).resolves.toEqual([
        expect.objectContaining({
          subject: 'user-1',
          sessionStart: at(-240000),
        }),
      ]);
    });

    it('does not re-open a session that is already open', async () => {
      await manager.recordSessionStarts([
        {
          clientId: CLIENT_ID,
          slug: SLUG,
          subject: 'user-1',
          sessionStart: at(-2 * HOUR_MS),
        },
      ]);
      await events.insertEvents([event('e1', 'user-1', 5, at(-240000))]);

      await expect(
        manager.findNewSessionStarts(detectParams())
      ).resolves.toEqual([]);
    });

    it('does not open a session for an event inside an expired session span', async () => {
      await manager.recordSessionStarts([
        {
          clientId: CLIENT_ID,
          slug: SLUG,
          subject: 'user-1',
          sessionStart: at(-6 * HOUR_MS),
        },
      ]);
      await events.insertEvents([event('e1', 'user-1', 5, at(-3 * HOUR_MS))]);

      await expect(
        manager.findNewSessionStarts(detectParams())
      ).resolves.toEqual([]);
    });

    it('opens a new session for the first event after the previous one expired', async () => {
      await manager.recordSessionStarts([
        {
          clientId: CLIENT_ID,
          slug: SLUG,
          subject: 'user-1',
          sessionStart: at(-6 * HOUR_MS),
        },
      ]);
      await events.insertEvents([event('e1', 'user-1', 5, at(-240000))]);

      await expect(
        manager.findNewSessionStarts(detectParams())
      ).resolves.toEqual([
        expect.objectContaining({
          sessionStart: at(-240000),
        }),
      ]);
    });

    it('ignores a subject with no newly ingested events', async () => {
      await events.insertEvents([
        {
          ...event('e1', 'user-1', 5, at(-240000)),
          ingestedAt: at(-1 * HOUR_MS),
        },
      ]);

      await expect(
        manager.findNewSessionStarts(detectParams())
      ).resolves.toEqual([]);
    });

    it('returns a subject as a session candidate once its detected session is recorded', async () => {
      await events.insertEvents([event('e1', 'user-1', 90, at(-240000))]);

      const opened = await manager.findNewSessionStarts(detectParams());
      await manager.recordSessionStarts(opened);

      await expect(
        manager.findSessionCandidates({
          clientId: CLIENT_ID,
          slug: SLUG,
          expiredBefore: new Date(NOW.getTime() - FIVE_HOURS_MS),
          to: NOW,
          minUsage: 80,
        })
      ).resolves.toEqual([{ subject: 'user-1', usage: 90 }]);
    });
  });
});
