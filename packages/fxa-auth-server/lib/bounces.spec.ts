/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppError } from '@fxa/accounts/errors';

const config = require('../config').default.getProperties();
const createBounces = require('./bounces');

const EMAIL = Math.random() + '@example.test';
const BOUNCE_TYPE_HARD = 1;
const BOUNCE_TYPE_COMPLAINT = 3;

const NOW = Date.now();

describe('bounces', () => {
  it('succeeds if bounces not over limit', async () => {
    const db = {
      emailBounces: jest.fn().mockResolvedValue([]),
    };
    const aliasCheckEnabled = !!config.smtp?.bounces?.aliasCheckEnabled;
    const expectedCallCount = aliasCheckEnabled ? 2 : 1;
    await createBounces(config, db).check(EMAIL);
    expect(db.emailBounces).toHaveBeenCalledTimes(expectedCallCount);
  });

  it('error if complaints over limit', async () => {
    const conf = {
      ...config,
      smtp: {
        bounces: {
          enabled: true,
          complaint: {
            0: Infinity,
          },
        },
      },
    };
    const db = {
      emailBounces: jest.fn().mockResolvedValue([
        {
          bounceType: BOUNCE_TYPE_COMPLAINT,
          createdAt: NOW,
        },
      ]),
    };
    try {
      await createBounces(conf, db).check(EMAIL);
      throw new Error('should have thrown');
    } catch (e: any) {
      expect(db.emailBounces).toHaveBeenCalledTimes(1);
      expect(e.errno).toBe(AppError.ERRNO.BOUNCE_COMPLAINT);
    }
  });

  it('error if hard bounces over limit', async () => {
    const conf = {
      ...config,
      smtp: {
        bounces: {
          enabled: true,
          hard: {
            0: 100,
            1: 5000,
          },
        },
      },
    };
    const DATE = Date.now() - 1000;
    const db = {
      emailBounces: jest.fn().mockResolvedValue([
        {
          bounceType: BOUNCE_TYPE_HARD,
          createdAt: DATE,
        },
        {
          bounceType: BOUNCE_TYPE_HARD,
          createdAt: DATE - 1000,
        },
      ]),
    };
    try {
      await createBounces(conf, db).check(EMAIL);
      throw new Error('should have thrown');
    } catch (e: any) {
      expect(db.emailBounces).toHaveBeenCalledTimes(1);
      expect(e.errno).toBe(AppError.ERRNO.BOUNCE_HARD);
      expect(e.output.payload.bouncedAt).toBe(DATE);
    }
  });

  it('does not error if not enough bounces in duration', async () => {
    const conf = {
      ...config,
      smtp: {
        bounces: {
          enabled: true,
          hard: {
            0: 5000,
            1: 50000,
          },
        },
      },
    };
    const db = {
      emailBounces: jest.fn().mockResolvedValue([
        {
          bounceType: BOUNCE_TYPE_HARD,
          createdAt: Date.now() - 20000,
        },
      ]),
    };
    await createBounces(conf, db).check(EMAIL);
    expect(db.emailBounces).toHaveBeenCalledTimes(1);
  });

  it('does not error if not enough complaints in duration', async () => {
    const conf = {
      ...config,
      smtp: {
        bounces: {
          enabled: true,
          complaint: {
            0: 5000,
            1: 50000,
          },
        },
      },
    };
    const db = {
      emailBounces: jest.fn().mockResolvedValue([
        {
          bounceType: BOUNCE_TYPE_COMPLAINT,
          createdAt: Date.now() - 20000,
        },
      ]),
    };
    await createBounces(conf, db).check(EMAIL);
    expect(db.emailBounces).toHaveBeenCalledTimes(1);
  });

  describe('disabled', () => {
    it('does not call bounces.check if disabled', async () => {
      const conf = {
        ...config,
        smtp: {
          bounces: {
            enabled: false,
          },
        },
      };
      const db = {
        emailBounces: jest.fn().mockResolvedValue([
          {
            bounceType: BOUNCE_TYPE_HARD,
            createdAt: Date.now() - 20000,
          },
        ]),
      };
      expect(db.emailBounces).toHaveBeenCalledTimes(0);
      await createBounces(conf, db).check(EMAIL);
      expect(db.emailBounces).toHaveBeenCalledTimes(0);
    });
  });

  it('ignores bounce for a specific email template', async () => {
    const db = {
      emailBounces: jest.fn().mockResolvedValue([]),
    };
    const bounces = createBounces(config, db);
    await bounces.check(EMAIL, 'recovery');
    expect(db.emailBounces).toHaveBeenCalledTimes(0);
  });

  it('get results from bounce checks', async () => {
    const latestBounce = Date.now() - 20000;
    const conf = {
      ...config,
      smtp: {
        bounces: {
          enabled: true,
          complaint: {
            0: 5000,
            1: 50000,
          },
        },
      },
    };
    const db = {
      emailBounces: jest.fn().mockResolvedValue([
        {
          bounceType: BOUNCE_TYPE_COMPLAINT,
          createdAt: latestBounce,
        },
      ]),
    };
    const tallies = await createBounces(conf, db).check(EMAIL);
    expect(tallies[BOUNCE_TYPE_COMPLAINT].count).toBe(1);
    expect(tallies[BOUNCE_TYPE_COMPLAINT].latest).toBe(latestBounce);
  });
});
