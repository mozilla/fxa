/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { ClickHouseError } from './metering.error';
import { SweepCandidateFactory } from './metering.factories';
import { MeteringSweepManager } from './metering-sweep.manager';
import { notificationKey } from './utils/notificationKey';
import { MeteringSweepRepository } from './metering-sweep.repository';

describe('MeteringSweepManager', () => {
  let manager: MeteringSweepManager;
  let meteringSweepRepository: jest.Mocked<
    Pick<
      MeteringSweepRepository,
      | 'findWindowCandidates'
      | 'findSessionCandidates'
      | 'findLastNotifications'
      | 'findSessionStarts'
      | 'findNewSessionStarts'
      | 'findWatermark'
      | 'advanceWatermark'
      | 'recordNotifications'
      | 'recordSessionStarts'
    >
  >;

  const scope = { clientId: 'vpn', slug: 'tokens' };

  const candidateParams = {
    ...scope,
    from: new Date('2026-05-01T00:00:00.000Z'),
    to: new Date('2026-06-01T00:00:00.000Z'),
    ingestedSince: new Date('2026-05-15T11:58:30.000Z'),
    eventTimeFloor: new Date('2026-05-13T11:58:30.000Z'),
    minUsage: 80,
  };

  beforeEach(async () => {
    meteringSweepRepository = {
      findWindowCandidates: jest.fn().mockResolvedValue([]),
      findSessionCandidates: jest.fn().mockResolvedValue([]),
      findLastNotifications: jest.fn().mockResolvedValue([]),
      findSessionStarts: jest.fn().mockResolvedValue([]),
      findNewSessionStarts: jest.fn().mockResolvedValue([]),
      findWatermark: jest.fn().mockResolvedValue(null),
      advanceWatermark: jest.fn().mockResolvedValue(undefined),
      recordNotifications: jest.fn().mockResolvedValue(undefined),
      recordSessionStarts: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringSweepManager,
        { provide: MeteringSweepRepository, useValue: meteringSweepRepository },
      ],
    }).compile();

    manager = moduleRef.get(MeteringSweepManager);
  });

  describe('findWindowCandidates', () => {
    it('returns the candidates from the repository', async () => {
      const candidates = [
        SweepCandidateFactory({ subject: 'user-1', usage: 90 }),
        SweepCandidateFactory({ subject: 'user-2', usage: 100 }),
      ];
      meteringSweepRepository.findWindowCandidates.mockResolvedValue(
        candidates
      );

      await expect(
        manager.findWindowCandidates(candidateParams)
      ).resolves.toEqual(candidates);
    });

    it('propagates a repository failure', async () => {
      meteringSweepRepository.findWindowCandidates.mockRejectedValue(
        new ClickHouseError('query', new Error('timeout'))
      );

      await expect(
        manager.findWindowCandidates(candidateParams)
      ).rejects.toThrow(ClickHouseError);
    });
  });

  describe('findSessionCandidates', () => {
    const params = {
      ...scope,
      expiredBefore: new Date('2026-05-15T07:00:00.000Z'),
      to: new Date('2026-05-15T12:00:00.000Z'),
      minUsage: 80,
    };

    it('returns the session candidates from the repository', async () => {
      const candidates = [SweepCandidateFactory({ subject: 'user-1' })];
      meteringSweepRepository.findSessionCandidates.mockResolvedValue(
        candidates
      );

      await expect(manager.findSessionCandidates(params)).resolves.toEqual(
        candidates
      );
    });

    it('propagates a repository failure', async () => {
      meteringSweepRepository.findSessionCandidates.mockRejectedValue(
        new ClickHouseError('query', new Error('timeout'))
      );

      await expect(manager.findSessionCandidates(params)).rejects.toThrow(
        ClickHouseError
      );
    });
  });

  describe('findLastNotifications', () => {
    it('keys results by subject, threshold and signing client', async () => {
      meteringSweepRepository.findLastNotifications.mockResolvedValue([
        {
          subject: 'user-1',
          threshold: 80,
          signing_client_id: 'vpn',
          last_window_id: '2026-05-01T00:00:00.000Z',
          last_sent_at: '2026-05-10T00:00:00.000Z',
        },
      ]);

      const result = await manager.findLastNotifications({
        ...scope,
        subjects: ['user-1'],
      });

      expect(result.get(notificationKey('user-1', 80, 'vpn'))).toEqual({
        windowId: '2026-05-01T00:00:00.000Z',
        sentAt: new Date('2026-05-10T00:00:00.000Z'),
      });
    });

    it('maps an empty stored window id back to null', async () => {
      meteringSweepRepository.findLastNotifications.mockResolvedValue([
        {
          subject: 'user-1',
          threshold: 80,
          signing_client_id: 'vpn',
          last_window_id: '',
          last_sent_at: '2026-05-10T00:00:00.000Z',
        },
      ]);

      const result = await manager.findLastNotifications({
        ...scope,
        subjects: ['user-1'],
      });

      expect(
        result.get(notificationKey('user-1', 80, 'vpn'))?.windowId
      ).toBeNull();
    });

    it('makes no query for an empty subject list', async () => {
      const result = await manager.findLastNotifications({
        ...scope,
        subjects: [],
      });

      expect(result.size).toBe(0);
      expect(
        meteringSweepRepository.findLastNotifications
      ).not.toHaveBeenCalled();
    });

    it('queries in chunks of at most 1000 subjects', async () => {
      const subjects = Array.from({ length: 1500 }, (_, i) => `user-${i}`);

      await manager.findLastNotifications({ ...scope, subjects });

      expect(
        meteringSweepRepository.findLastNotifications
      ).toHaveBeenCalledTimes(2);
      expect(
        meteringSweepRepository.findLastNotifications.mock.calls[0][0].subjects
      ).toHaveLength(1000);
      expect(
        meteringSweepRepository.findLastNotifications.mock.calls[1][0].subjects
      ).toHaveLength(500);
    });

    it('propagates a repository failure', async () => {
      meteringSweepRepository.findLastNotifications.mockRejectedValue(
        new ClickHouseError('query', new Error('timeout'))
      );

      await expect(
        manager.findLastNotifications({ ...scope, subjects: ['user-1'] })
      ).rejects.toThrow(ClickHouseError);
    });
  });

  describe('findSessionStarts', () => {
    it('returns the latest session start per subject as a Date', async () => {
      meteringSweepRepository.findSessionStarts.mockResolvedValue([
        { subject: 'user-1', started_at: '2026-05-15T09:00:00.000Z' },
      ]);

      const result = await manager.findSessionStarts({
        ...scope,
        subjects: ['user-1'],
      });

      expect(result.get('user-1')).toEqual(
        new Date('2026-05-15T09:00:00.000Z')
      );
    });

    it('makes no query for an empty subject list', async () => {
      const result = await manager.findSessionStarts({
        ...scope,
        subjects: [],
      });

      expect(result.size).toBe(0);
      expect(meteringSweepRepository.findSessionStarts).not.toHaveBeenCalled();
    });
  });

  describe('findNewSessionStarts', () => {
    const params = {
      ...scope,
      ingestedSince: new Date('2026-05-15T11:58:30.000Z'),
      eventTimeFloor: new Date('2026-05-15T07:00:00.000Z'),
      to: new Date('2026-05-15T12:00:00.000Z'),
      durationMs: 5 * 60 * 60 * 1000,
    };

    it('maps rows onto session start records', async () => {
      meteringSweepRepository.findNewSessionStarts.mockResolvedValue([
        { subject: 'user-1', started_at: '2026-05-15T09:00:00.000Z' },
      ]);

      await expect(manager.findNewSessionStarts(params)).resolves.toEqual([
        {
          clientId: 'vpn',
          slug: 'tokens',
          subject: 'user-1',
          sessionStart: new Date('2026-05-15T09:00:00.000Z'),
        },
      ]);
    });

    it('propagates a repository failure', async () => {
      meteringSweepRepository.findNewSessionStarts.mockRejectedValue(
        new ClickHouseError('query', new Error('timeout'))
      );

      await expect(manager.findNewSessionStarts(params)).rejects.toThrow(
        ClickHouseError
      );
    });
  });

  describe('findWatermark', () => {
    it('returns the stored watermark as a Date', async () => {
      meteringSweepRepository.findWatermark.mockResolvedValue(
        '2026-05-15T11:58:30.000Z'
      );

      await expect(manager.findWatermark(scope)).resolves.toEqual(
        new Date('2026-05-15T11:58:30.000Z')
      );
    });

    it('returns null when no watermark is stored', async () => {
      await expect(manager.findWatermark(scope)).resolves.toBeNull();
    });

    it('propagates a repository failure', async () => {
      meteringSweepRepository.findWatermark.mockRejectedValue(
        new ClickHouseError('query', new Error('timeout'))
      );

      await expect(manager.findWatermark(scope)).rejects.toThrow(
        ClickHouseError
      );
    });
  });
});
