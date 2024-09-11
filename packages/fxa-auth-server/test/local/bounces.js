/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import assert from 'assert';
import configModule from "../../config";
const config = configModule.getProperties();
import createBounces from '../../lib/bounces';
import error from '../../lib/error';
import sinon from 'sinon';

const EMAIL = Math.random() + '@example.test';
const BOUNCE_TYPE_HARD = 1;
const BOUNCE_TYPE_COMPLAINT = 3;

const NOW = Date.now();

describe('bounces', () => {
  it('succeeds if bounces not over limit', () => {
    const db = {
      emailBounces: sinon.spy(() => Promise.resolve([])),
    };
    return createBounces(config, db)
      .check(EMAIL)
      .then(() => {
        assert.equal(db.emailBounces.callCount, 1);
      });
  });

  it('error if complaints over limit', () => {
    const conf = Object.assign({}, config);
    conf.smtp = {
      bounces: {
        enabled: true,
        complaint: {
          0: Infinity,
        },
      },
    };
    const db = {
      emailBounces: sinon.spy(() =>
        Promise.resolve([
          {
            bounceType: BOUNCE_TYPE_COMPLAINT,
            createdAt: NOW,
          },
        ])
      ),
    };
    return createBounces(conf, db)
      .check(EMAIL)
      .then(
        () => assert(false),
        (e) => {
          assert.equal(db.emailBounces.callCount, 1);
          assert.equal(e.errno, error.ERRNO.BOUNCE_COMPLAINT);
        }
      );
  });

  it('error if hard bounces over limit', () => {
    const conf = Object.assign({}, config);
    conf.smtp = {
      bounces: {
        enabled: true,
        hard: {
          0: 100,
          1: 5000,
        },
      },
    };
    const DATE = Date.now() - 1000;
    const db = {
      emailBounces: sinon.spy(() =>
        Promise.resolve([
          {
            bounceType: BOUNCE_TYPE_HARD,
            createdAt: DATE,
          },
          {
            bounceType: BOUNCE_TYPE_HARD,
            createdAt: DATE - 1000,
          },
        ])
      ),
    };
    return createBounces(conf, db)
      .check(EMAIL)
      .then(
        () => assert(false),
        (e) => {
          assert.equal(db.emailBounces.callCount, 1);
          assert.equal(e.errno, error.ERRNO.BOUNCE_HARD);
          assert.equal(e.output.payload.bouncedAt, DATE);
        }
      );
  });

  it('does not error if not enough bounces in duration', () => {
    const conf = Object.assign({}, config);
    conf.smtp = {
      bounces: {
        enabled: true,
        hard: {
          0: 5000,
          1: 50000,
        },
      },
    };
    const db = {
      emailBounces: sinon.spy(() =>
        Promise.resolve([
          {
            bounceType: BOUNCE_TYPE_HARD,
            createdAt: Date.now() - 20000,
          },
        ])
      ),
    };
    return createBounces(conf, db)
      .check(EMAIL)
      .then(() => {
        assert.equal(db.emailBounces.callCount, 1);
      });
  });

  it('does not error if not enough complaints in duration', () => {
    const conf = Object.assign({}, config);
    conf.smtp = {
      bounces: {
        enabled: true,
        complaint: {
          0: 5000,
          1: 50000,
        },
      },
    };
    const db = {
      emailBounces: sinon.spy(() =>
        Promise.resolve([
          {
            bounceType: BOUNCE_TYPE_COMPLAINT,
            createdAt: Date.now() - 20000,
          },
        ])
      ),
    };
    return createBounces(conf, db)
      .check(EMAIL)
      .then(() => {
        assert.equal(db.emailBounces.callCount, 1);
      });
  });

  describe('disabled', () => {
    it('does not call bounces.check if disabled', () => {
      const conf = Object.assign({}, config);
      conf.smtp = {
        bounces: {
          enabled: false,
        },
      };
      const db = {
        emailBounces: sinon.spy(() =>
          Promise.resolve([
            {
              bounceType: BOUNCE_TYPE_HARD,
              createdAt: Date.now() - 20000,
            },
          ])
        ),
      };
      assert.equal(db.emailBounces.callCount, 0);
      return createBounces(conf, db)
        .check(EMAIL)
        .then(() => {
          assert.equal(db.emailBounces.callCount, 0);
        });
    });
  });

  it('ignores bounce for a specific email template', async () => {
    const db = {
      emailBounces: sinon.spy(() => Promise.resolve([])),
    };
    const bounces = createBounces(config, db);
    await bounces.check(EMAIL, 'recovery');
    assert.equal(db.emailBounces.callCount, 0);
  });
});
