/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  BounceDb,
  Bounces,
  BouncesConfig,
  BOUNCE_TYPE_HARD,
  BOUNCE_TYPE_COMPLAINT,
  BOUNCE_TYPE_SOFT,
} from './bounces';
import { AppError } from '@fxa/accounts/errors';

/**
 * Converts number of days to milliseconds for human readability in tests.
 * @param days
 * @returns
 */
const daysInMs = (days: number) => days * 24 * 60 * 60 * 1000;
/**
 * Fixed "now" timestamp for consistent testing of time-based logic.
 */
const mockNow = 100_000_000_000_000;

describe('Bounces', () => {
  const defaultBouncesConfig: BouncesConfig = {
    enabled: true,
    hard: { 1: daysInMs(30) }, // 2 allowed hard bounces in the last 30 days
    soft: { 2: daysInMs(30) }, // 3 allowed soft bounces in the last 30 days
    complaint: { 3: daysInMs(30) }, // 4 allowed complaints in the last 30 days
    ignoreTemplates: [],
  };

  beforeEach(() => {
    // Mock Date.now() to return a consistent value for time-based tests
    jest.spyOn(Date, 'now').mockReturnValue(mockNow);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('check', () => {
    it('does nothing if bounces are disabled', async () => {
      const config: BouncesConfig = {
        ...defaultBouncesConfig,
        enabled: false,
      };
      const db: BounceDb = {
        emailBounces: {
          findByEmail: jest
            .fn()
            .mockResolvedValue([{ bounceType: 1, createdAt: mockNow }]),
        },
      };
      const bounces = new Bounces(config, db);

      const checkResult = await bounces.check(
        'test@example.com',
        'verifyEmail'
      );

      expect(db.emailBounces.findByEmail).not.toHaveBeenCalled();
      expect(checkResult).toBeUndefined();
    });

    it('returns tallies if bounces are enabled', async () => {});

    it('returns void if template is in ignoreTemplates', async () => {
      const config: BouncesConfig = {
        ...defaultBouncesConfig,
        ignoreTemplates: ['passwordReset', 'verifyEmail'],
      };
      const db: BounceDb = {
        emailBounces: {
          findByEmail: jest.fn().mockResolvedValue([]),
        },
      };
      const bounces = new Bounces(config, db);

      const check = await bounces.check('test@example.com', 'verifyEmail');

      // DB should NOT be called when template is ignored (early return)
      expect(db.emailBounces.findByEmail).not.toHaveBeenCalled();
      expect(check).toBeUndefined();
    });

    it('does not throw when no bounces exist', async () => {
      const db: BounceDb = {
        emailBounces: {
          findByEmail: jest.fn().mockResolvedValue([]),
        },
      };
      const bounces = new Bounces(defaultBouncesConfig, db);

      await expect(
        bounces.check('test@example.com', 'verifyEmail')
      ).resolves.not.toThrow();
    });
  });

  describe('checkBounces', () => {
    it('throws emailBounceHard error when hard bounce over threshold', async () => {
      const config: BouncesConfig = {
        ...defaultBouncesConfig,
        hard: { 0: daysInMs(30) },
      };
      const bouncedAt = mockNow - daysInMs(10);
      const db: BounceDb = {
        emailBounces: {
          findByEmail: jest.fn().mockResolvedValue([
            {
              bounceType: BOUNCE_TYPE_HARD,
              createdAt: bouncedAt,
            },
          ]),
        },
      };

      const bounces = new Bounces(config, db);
      await expect(
        bounces.check('test@example.com', 'verifyEmail')
      ).rejects.toMatchObject(AppError.emailBouncedHard(bouncedAt));
    });

    it('throws emailComplaint error when complaint bounce over threshold', async () => {
      const config: BouncesConfig = {
        ...defaultBouncesConfig,
        complaint: { 0: daysInMs(30) },
      };
      const bouncedAt = mockNow - daysInMs(10);
      const db: BounceDb = {
        emailBounces: {
          findByEmail: jest.fn().mockResolvedValue([
            {
              bounceType: BOUNCE_TYPE_COMPLAINT,
              createdAt: bouncedAt,
            },
          ]),
        },
      };
      const bounces = new Bounces(config, db);
      await expect(
        bounces.check('test@example.com', 'verifyEmail')
      ).rejects.toMatchObject(AppError.emailComplaint(bouncedAt));
    });

    it('throws emailBouncedSoft error when soft bounce over threshold', async () => {
      const config: BouncesConfig = {
        ...defaultBouncesConfig,
        soft: { 0: daysInMs(30) },
      };
      const bouncedAt = mockNow - daysInMs(10);
      const db: BounceDb = {
        emailBounces: {
          findByEmail: jest.fn().mockResolvedValue([
            {
              bounceType: BOUNCE_TYPE_SOFT,
              createdAt: bouncedAt,
            },
          ]),
        },
      };
      const bounces = new Bounces(config, db);

      await expect(
        bounces.check('test@example.com', 'verifyEmail')
      ).rejects.toMatchObject(AppError.emailBouncedSoft(bouncedAt));
    });

    it('sorts multiple bounces to descending order', async () => {
      const config: BouncesConfig = {
        ...defaultBouncesConfig,
        // first bounce will throw if newer than 2 days ago
        hard: { 0: daysInMs(2) },
      };
      const latestBouncedAt = mockNow - daysInMs(1);
      const olderBouncedAt = mockNow - daysInMs(10);
      const db: BounceDb = {
        emailBounces: {
          findByEmail: jest.fn().mockResolvedValue([
            // First bounce - 10 days ago, but sorted to last in the array
            {
              bounceType: BOUNCE_TYPE_HARD,
              createdAt: olderBouncedAt,
            },
            // Second bounce is sorted first, and it's createdAt is in the thrown error
            {
              bounceType: BOUNCE_TYPE_HARD,
              createdAt: latestBouncedAt,
            },
          ]),
        },
      };
      const bounces = new Bounces(config, db);

      await expect(
        bounces.check('test@example.com', 'verifyEmail')
      ).rejects.toMatchObject(AppError.emailBouncedHard(latestBouncedAt));
    });

    it('handles multiple rules for the same bounce type', async () => {
      const config: BouncesConfig = {
        ...defaultBouncesConfig,
        hard: {
          0: daysInMs(1),
          1: daysInMs(30),
        },
      };
      const latestBouncedAt = mockNow - daysInMs(10);
      const olderBouncedAt = mockNow - daysInMs(20);
      const db: BounceDb = {
        emailBounces: {
          findByEmail: jest.fn().mockResolvedValue([
            {
              bounceType: BOUNCE_TYPE_HARD,
              createdAt: latestBouncedAt,
            },
            {
              bounceType: BOUNCE_TYPE_HARD,
              createdAt: olderBouncedAt, // 20 days, trips the "1 in 30 days" rule
            },
          ]),
        },
      };
      const bounces = new Bounces(config, db);

      await expect(
        bounces.check('test@example.com', 'verifyEmail')
      ).rejects.toMatchObject(AppError.emailBouncedHard(latestBouncedAt));
    });

    it('returns tallies when bounces are outside the windows', async () => {
      const timestamps = {
        oldHard: mockNow - daysInMs(40),
        oldSoft: mockNow - daysInMs(40),
        oldComplaint: mockNow - daysInMs(40),
      };
      const config: BouncesConfig = {
        ...defaultBouncesConfig,
        // Rule: 1st hard bounce must be within 30 days
        hard: { 0: daysInMs(30) },
        soft: { 0: daysInMs(30) },
        complaint: { 0: daysInMs(30) },
      };
      const db: BounceDb = {
        emailBounces: {
          findByEmail: jest.fn().mockResolvedValue([
            // First bounce - 40 days ago
            {
              bounceType: BOUNCE_TYPE_HARD,
              createdAt: timestamps.oldHard,
            },
            {
              bounceType: BOUNCE_TYPE_SOFT,
              createdAt: timestamps.oldSoft,
            },
            {
              bounceType: BOUNCE_TYPE_COMPLAINT,
              createdAt: timestamps.oldComplaint,
            },
          ]),
        },
      };
      const bounces = new Bounces(config, db);

      const result = await bounces.checkBounces(
        'test@example.com',
        'verifyEmail'
      );
      expect(result).toEqual({
        [BOUNCE_TYPE_HARD]: { count: 1, latest: timestamps.oldHard },
        [BOUNCE_TYPE_SOFT]: { count: 1, latest: timestamps.oldSoft },
        [BOUNCE_TYPE_COMPLAINT]: { count: 1, latest: timestamps.oldComplaint },
      });
    });

    it('returns tallies for mixed bounce types outside the windows', async () => {
      const timestamps = {
        oldSoft: mockNow - daysInMs(10),
        recentSoft: mockNow - daysInMs(1),
        recentHard: mockNow - daysInMs(2),
        oldComplaint: mockNow - daysInMs(40),
      };

      const config: BouncesConfig = {
        ...defaultBouncesConfig,
        hard: { 0: daysInMs(1) },
        soft: { 1: daysInMs(1) },
        complaint: { 0: daysInMs(30) },
      };

      const db: BounceDb = {
        emailBounces: {
          findByEmail: jest.fn().mockResolvedValue([
            {
              bounceType: BOUNCE_TYPE_SOFT,
              createdAt: timestamps.recentSoft,
            },
            {
              bounceType: BOUNCE_TYPE_SOFT,
              createdAt: timestamps.oldSoft,
            },
            {
              bounceType: BOUNCE_TYPE_HARD,
              createdAt: timestamps.recentHard,
            },
            {
              bounceType: BOUNCE_TYPE_COMPLAINT,
              createdAt: timestamps.oldComplaint,
            },
          ]),
        },
      };

      const bounces = new Bounces(config, db);
      const result = await bounces.checkBounces(
        'test@example.com',
        'verifyEmail'
      );

      expect(result).toEqual({
        [BOUNCE_TYPE_HARD]: { count: 1, latest: timestamps.recentHard },
        [BOUNCE_TYPE_SOFT]: { count: 2, latest: timestamps.recentSoft }, // count of 2 is important, we had two soft bounces checked
        [BOUNCE_TYPE_COMPLAINT]: { count: 1, latest: timestamps.oldComplaint },
      });
    });
  });

  describe('checkBouncesWithAliases', () => {
    const aliasNormalizationConfig = JSON.stringify([
      { domain: 'example.com', regex: '\\+.*', replace: '' },
    ]);

    it('uses regular check when aliasCheckEnabled is false', async () => {
      const config: BouncesConfig = {
        ...defaultBouncesConfig,
        aliasCheckEnabled: false,
        emailAliasNormalization: aliasNormalizationConfig,
      };
      const db: BounceDb = {
        emailBounces: {
          findByEmail: jest.fn().mockResolvedValue([]),
        },
      };
      const bounces = new Bounces(config, db);

      await bounces.check('test+alias@example.com', 'verifyEmail');

      // Should only call once with the original email
      expect(db.emailBounces.findByEmail).toHaveBeenCalledTimes(1);
      expect(db.emailBounces.findByEmail).toHaveBeenCalledWith(
        'test+alias@example.com'
      );
    });

    it('queries both normalized and wildcard emails when aliasCheckEnabled is true', async () => {
      const config: BouncesConfig = {
        ...defaultBouncesConfig,
        aliasCheckEnabled: true,
        emailAliasNormalization: aliasNormalizationConfig,
      };
      const db: BounceDb = {
        emailBounces: {
          findByEmail: jest.fn().mockResolvedValue([]),
        },
      };
      const bounces = new Bounces(config, db);

      await bounces.check('test+alias@example.com', 'verifyEmail');

      // Should call twice: once for normalized, once for wildcard
      expect(db.emailBounces.findByEmail).toHaveBeenCalledTimes(2);
      expect(db.emailBounces.findByEmail).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(db.emailBounces.findByEmail).toHaveBeenCalledWith(
        'test+%@example.com'
      );
    });

    it('throws error when alias bounces exceed threshold', async () => {
      const config: BouncesConfig = {
        ...defaultBouncesConfig,
        aliasCheckEnabled: true,
        emailAliasNormalization: aliasNormalizationConfig,
        hard: { 0: daysInMs(30) },
      };
      const bouncedAt = mockNow - daysInMs(10);
      const db: BounceDb = {
        emailBounces: {
          findByEmail: jest.fn().mockImplementation((email: string) => {
            if (email === 'test@example.com') {
              return Promise.resolve([
                {
                  email: 'test@example.com',
                  bounceType: BOUNCE_TYPE_HARD,
                  createdAt: bouncedAt,
                },
              ]);
            }
            return Promise.resolve([]);
          }),
        },
      };
      const bounces = new Bounces(config, db);

      // Email with alias should fail because root email has a bounce
      await expect(
        bounces.check('test+alias@example.com', 'verifyEmail')
      ).rejects.toMatchObject(AppError.emailBouncedHard(bouncedAt));
    });

    it('merges and deduplicates bounces from both queries', async () => {
      const config: BouncesConfig = {
        ...defaultBouncesConfig,
        aliasCheckEnabled: true,
        emailAliasNormalization: aliasNormalizationConfig,
        hard: { 2: daysInMs(30) }, // Allow 2 bounces before throwing
      };
      const bounce1At = mockNow - daysInMs(5);
      const bounce2At = mockNow - daysInMs(10);
      const duplicateBounceAt = mockNow - daysInMs(15);

      const db: BounceDb = {
        emailBounces: {
          findByEmail: jest.fn().mockImplementation((email: string) => {
            if (email === 'test@example.com') {
              return Promise.resolve([
                {
                  email: 'test@example.com',
                  bounceType: BOUNCE_TYPE_HARD,
                  createdAt: bounce1At,
                },
                {
                  email: 'test@example.com',
                  bounceType: BOUNCE_TYPE_HARD,
                  createdAt: duplicateBounceAt,
                },
              ]);
            }
            if (email === 'test+%@example.com') {
              return Promise.resolve([
                {
                  email: 'test+alias@example.com',
                  bounceType: BOUNCE_TYPE_HARD,
                  createdAt: bounce2At,
                },
                // Duplicate entry (same email and createdAt as normalized query)
                {
                  email: 'test@example.com',
                  bounceType: BOUNCE_TYPE_HARD,
                  createdAt: duplicateBounceAt,
                },
              ]);
            }
            return Promise.resolve([]);
          }),
        },
      };
      const bounces = new Bounces(config, db);

      // Should throw because we have 3 unique hard bounces (one duplicate removed)
      await expect(
        bounces.check('test+alias@example.com', 'verifyEmail')
      ).rejects.toMatchObject(AppError.emailBouncedHard(bounce1At));
    });

    it('does not apply alias normalization for domains not in config', async () => {
      const config: BouncesConfig = {
        ...defaultBouncesConfig,
        aliasCheckEnabled: true,
        emailAliasNormalization: aliasNormalizationConfig, // Only example.com configured
      };
      const db: BounceDb = {
        emailBounces: {
          findByEmail: jest.fn().mockResolvedValue([]),
        },
      };
      const bounces = new Bounces(config, db);

      await bounces.check('test+alias@other.com', 'verifyEmail');

      // For non-configured domain, both queries should use the original email
      // (no transformation applied)
      expect(db.emailBounces.findByEmail).toHaveBeenCalledTimes(2);
      expect(db.emailBounces.findByEmail).toHaveBeenNthCalledWith(
        1,
        'test+alias@other.com'
      );
      expect(db.emailBounces.findByEmail).toHaveBeenNthCalledWith(
        2,
        'test+alias@other.com'
      );
    });
  });
});
