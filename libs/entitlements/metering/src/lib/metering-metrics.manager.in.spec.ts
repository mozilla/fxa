/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ClickHouseClient } from './clickhouse.client';
import {
  anchoredClock,
  DAY_MS,
  HOUR_MS,
  integrationClickHouseClient,
  truncateMeteringTables,
} from '../testing';
import { MeteringEventsManager } from './metering-events.manager';
import { MeteringEventsRepository } from './metering-events.repository';
import { MeteringMetricsManager } from './metering-metrics.manager';
import { MeteringMetricsRepository } from './metering-metrics.repository';
import { MeteringSweepManager } from './metering-sweep.manager';
import { MeteringSweepRepository } from './metering-sweep.repository';
import { hashEventId } from './utils/hashEventId';

const { at } = anchoredClock();

const CLIENT_ID = 'vpn';
const SLUG = 'tokens';

const describeClickHouse =
  process.env['CI'] && !process.env['CLICKHOUSE_INTEGRATION_TESTS']
    ? describe.skip
    : describe;

describeClickHouse('MeteringMetricsManager against a real ClickHouse', () => {
  let client: ClickHouseClient;
  let manager: MeteringMetricsManager;
  let events: MeteringEventsManager;
  let sweep: MeteringSweepManager;

  function event(id: string, subject: string, eventTime: Date, slug = SLUG) {
    return {
      eventIdHash: hashEventId(id),
      clientId: CLIENT_ID,
      slug,
      subject,
      amount: 1,
      eventTime,
      ingestedAt: eventTime,
    };
  }

  function notification(
    subject: string,
    threshold: number,
    sentAt: Date,
    override: { signingClientId?: string; slug?: string } = {}
  ) {
    return {
      clientId: CLIENT_ID,
      slug: override.slug ?? SLUG,
      subject,
      threshold,
      signingClientId: override.signingClientId ?? 'wh-a',
      windowId: null,
      sentAt,
    };
  }

  const range = {
    clientId: CLIENT_ID,
    slug: SLUG,
    from: at(-DAY_MS),
    to: at(DAY_MS),
  };

  beforeAll(() => {
    client = integrationClickHouseClient();
    manager = new MeteringMetricsManager(new MeteringMetricsRepository(client));
    events = new MeteringEventsManager(new MeteringEventsRepository(client));
    sweep = new MeteringSweepManager(new MeteringSweepRepository(client));
  });

  beforeEach(async () => {
    await truncateMeteringTables(client);
  });

  describe('findActiveSubjectCount', () => {
    it('returns zero when there are no events', async () => {
      await expect(manager.findActiveSubjectCount(range)).resolves.toBe(0);
    });

    it('counts each subject once however many events it has', async () => {
      await events.insertEvents([
        event('e1', 'user-1', at(-HOUR_MS)),
        event('e2', 'user-1', at(0)),
        event('e3', 'user-2', at(0)),
      ]);

      await expect(manager.findActiveSubjectCount(range)).resolves.toBe(2);
    });

    it('leaves out events outside the range', async () => {
      await events.insertEvents([
        event('e1', 'user-1', at(-2 * DAY_MS)),
        event('e2', 'user-2', at(2 * DAY_MS)),
      ]);

      await expect(manager.findActiveSubjectCount(range)).resolves.toBe(0);
    });

    it('leaves out events for another meter', async () => {
      await events.insertEvents([event('e1', 'user-1', at(0), 'bandwidth')]);

      await expect(manager.findActiveSubjectCount(range)).resolves.toBe(0);
    });
  });

  describe('findNotifiedSubjectCounts', () => {
    const params = { ...range, thresholds: [80, 100] };

    it('counts the subjects notified at each threshold', async () => {
      await sweep.recordNotifications([
        notification('user-1', 80, at(0)),
        notification('user-2', 80, at(0)),
        notification('user-2', 100, at(0)),
      ]);

      await expect(manager.findNotifiedSubjectCounts(params)).resolves.toEqual([
        { threshold: 80, subjectCount: 2 },
        { threshold: 100, subjectCount: 1 },
      ]);
    });

    it('counts a subject once when several webhooks were notified', async () => {
      await sweep.recordNotifications([
        notification('user-1', 80, at(0), { signingClientId: 'wh-a' }),
        notification('user-1', 80, at(0), { signingClientId: 'wh-b' }),
      ]);

      await expect(manager.findNotifiedSubjectCounts(params)).resolves.toEqual([
        { threshold: 80, subjectCount: 1 },
        { threshold: 100, subjectCount: 0 },
      ]);
    });

    it('leaves out notifications sent outside the range', async () => {
      await sweep.recordNotifications([
        notification('user-1', 80, at(-2 * DAY_MS)),
      ]);

      await expect(manager.findNotifiedSubjectCounts(params)).resolves.toEqual([
        { threshold: 80, subjectCount: 0 },
        { threshold: 100, subjectCount: 0 },
      ]);
    });

    it('leaves out notifications for another meter', async () => {
      await sweep.recordNotifications([
        notification('user-1', 80, at(0), { slug: 'bandwidth' }),
      ]);

      await expect(manager.findNotifiedSubjectCounts(params)).resolves.toEqual([
        { threshold: 80, subjectCount: 0 },
        { threshold: 100, subjectCount: 0 },
      ]);
    });
  });
});
