/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/* eslint-disable camelcase */

const assert = require('assert');
const moment = require('moment');

const events = require('../lib/events');

const mocks = require('./lib/mocks');
const utils = require('./lib/utils');

const UID = 'foobar';
const EMAIL = 'foobar@example.com';
const LOCALE = 'en-AU';
const USER_AGENT = 'a fake testing browser (like Gecko)';
const SERVICE = 'sync';

const CAMPAIGN_NEWSLETTER_SLUG = 'mozilla-welcome';
const CAMPAIGN_NEWSLETTER_CONTEXT = {
  utm_campaign: 'fxa-embedded-form-moz',
  utm_source: 'firstrun',
};
const CAMPAIGN_NEWSLETTER_SOURCE_URL =
  'https://accounts.firefox.com/?utm_campaign=fxa-embedded-form-moz&utm_source=firstrun';

const NEWSLETTER_ID_REGISTER = 'firefox-accounts-journey';
const SOURCE_URL_REGISTER = 'https://accounts.firefox.com/';

const MAYBE_NEXT_TICK = cb => {
  if (cb) {
    process.nextTick(cb);
  }
};

describe('the handleEvent() function', function() {
  it('calls /fxa-register for account verification events', function(done) {
    mocks
      .mockBasketResponse({
        reqheaders: { 'content-type': 'application/x-www-form-urlencoded' },
      })
      .post('/fxa-register/', function(body) {
        assert.deepEqual(body, {
          fxa_id: UID,
          email: EMAIL,
          accept_lang: LOCALE,
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    events.handleEvent({
      event: 'verified',
      ts: Date.now() / 1000,
      uid: UID,
      email: EMAIL,
      locale: LOCALE,
      del: function() {
        done();
      },
    });
  });

  it('calls /subscribe for verifications events when user opts in', function(done) {
    const subscribe = mocks
      .mockBasketResponse()
      .post('/subscribe/', function(body) {
        assert.deepEqual(body, {
          email: EMAIL,
          newsletters: NEWSLETTER_ID_REGISTER,
          source_url: SOURCE_URL_REGISTER,
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    const register = mocks
      .mockBasketResponse({
        reqheaders: { 'content-type': 'application/x-www-form-urlencoded' },
      })
      .post('/fxa-register/', function(body) {
        assert.deepEqual(body, {
          fxa_id: UID,
          email: EMAIL,
          accept_lang: LOCALE,
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    events.handleEvent({
      event: 'verified',
      ts: Date.now() / 1000,
      uid: UID,
      email: EMAIL,
      locale: LOCALE,
      marketingOptIn: true,
      del: function() {
        subscribe.done();
        register.done();
        done();
      },
    });
  });

  it('calls /fxa-activity for device login events', function(done) {
    mocks
      .mockBasketResponse({
        reqheaders: { 'content-type': 'application/json' },
      })
      .post('/fxa-activity/', function(body) {
        assert.deepEqual(body, {
          activity: 'account.login',
          service: SERVICE,
          fxa_id: UID,
          first_device: true,
          user_agent: USER_AGENT,
          metrics_context: {},
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    events.handleEvent({
      event: 'login',
      ts: Date.now() / 1000,
      service: SERVICE,
      uid: UID,
      email: EMAIL,
      deviceCount: 1,
      userAgent: USER_AGENT,
      del: function() {
        done();
      },
    });
  });

  it('calls /fxa-activity with a correct `first_device` value', function(done) {
    mocks
      .mockBasketResponse({
        reqheaders: { 'content-type': 'application/json' },
      })
      .post('/fxa-activity/', function(body) {
        assert.deepEqual(body, {
          activity: 'account.login',
          service: SERVICE,
          fxa_id: UID,
          first_device: false,
          user_agent: USER_AGENT,
          metrics_context: {},
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    events.handleEvent({
      event: 'login',
      ts: Date.now() / 1000,
      service: SERVICE,
      uid: UID,
      email: EMAIL,
      deviceCount: 2,
      userAgent: USER_AGENT,
      del: function() {
        done();
      },
    });
  });

  it('calls /fxa-activity with metrics context data', function(done) {
    mocks
      .mockBasketResponse({
        reqheaders: { 'content-type': 'application/json' },
      })
      .post('/fxa-activity/', function(body) {
        assert.deepEqual(body, {
          activity: 'account.login',
          service: SERVICE,
          fxa_id: UID,
          first_device: false,
          user_agent: USER_AGENT,
          metrics_context: {
            utm_campaign: 'test-campaign',
            utm_source: 'firstrun',
          },
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    events.handleEvent({
      event: 'login',
      ts: Date.now() / 1000,
      service: SERVICE,
      uid: UID,
      email: EMAIL,
      deviceCount: 2,
      userAgent: USER_AGENT,
      metricsContext: {
        utm_campaign: 'test-campaign',
        utm_source: 'firstrun',
      },
      del: function() {
        done();
      },
    });
  });

  it('ignores unrecognized event types', function(done) {
    events.handleEvent({
      event: 'unknownEvent',
      del: function() {
        // This is reached without trying to hit the basket server.
        done();
      },
    });
  });

  it('ignores "verified" events from dev email addresses', function(done) {
    events.handleEvent({
      event: 'verified',
      ts: Date.now() / 1000,
      uid: UID,
      email: 'foo@restmail.net',
      locale: LOCALE,
      del: function() {
        // This is reached without trying to hit the basket server.
        done();
      },
    });
  });

  it('ignores "login" events from dev email addresses', function(done) {
    events.handleEvent({
      event: 'login',
      ts: Date.now() / 1000,
      service: SERVICE,
      uid: UID,
      email: 'bar@restmail.lcip.org',
      deviceCount: 1,
      userAgent: USER_AGENT,
      del: function() {
        // This is reached without trying to hit the basket server.
        done();
      },
    });
  });

  it('uses "en-US" as the default locale is none is provided', function(done) {
    mocks
      .mockBasketResponse({
        reqheaders: { 'content-type': 'application/x-www-form-urlencoded' },
      })
      .post('/fxa-register/', function(body) {
        assert.deepEqual(body, {
          fxa_id: UID,
          email: EMAIL,
          accept_lang: 'en-US',
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    events.handleEvent({
      event: 'verified',
      ts: Date.now() / 1000,
      uid: UID,
      email: EMAIL,
      del: function() {
        done();
      },
    });
  });

  it('does not delete events if a network-level error occurs', function(done) {
    mocks
      .mockBasketResponse({
        reqheaders: { 'content-type': 'application/x-www-form-urlencoded' },
      })
      .post('/fxa-register/', function(body) {
        assert.deepEqual(body, {
          fxa_id: UID,
          email: EMAIL,
          accept_lang: LOCALE,
        });
        return true;
      })
      .replyWithError('ruh-roh!');
    events
      .handleEvent({
        event: 'verified',
        ts: Date.now() / 1000,
        uid: UID,
        email: EMAIL,
        locale: LOCALE,
        del: function() {
          assert.fail('should not delete the message from the queue');
        },
      })
      .catch(function(err) {
        assert.equal(err.message, 'ruh-roh!');
        done();
      });
  });

  it('does delete events if a HTTP-level error occurs', function(done) {
    mocks
      .mockBasketResponse({
        reqheaders: { 'content-type': 'application/x-www-form-urlencoded' },
      })
      .post('/fxa-register/', function(body) {
        assert.deepEqual(body, {
          fxa_id: UID,
          email: EMAIL,
          accept_lang: LOCALE,
        });
        return true;
      })
      .reply(500, {
        status: 'error',
        code: 99,
        desc: 'Error: ruh-roh!',
      });
    events.handleEvent({
      event: 'verified',
      ts: Date.now() / 1000,
      uid: UID,
      email: EMAIL,
      locale: LOCALE,
      del: function() {
        done();
      },
    });
  });

  it('subscribes to newsletters when given specific utm params', function(done) {
    mocks
      .mockBasketResponse()
      .post('/subscribe/', function(body) {
        assert.deepEqual(body, {
          email: EMAIL,
          newsletters: CAMPAIGN_NEWSLETTER_SLUG,
          source_url: CAMPAIGN_NEWSLETTER_SOURCE_URL,
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    mocks
      .mockBasketResponse({
        reqheaders: { 'content-type': 'application/json' },
      })
      .post('/fxa-activity/', function(body) {
        assert.deepEqual(body, {
          activity: 'account.login',
          service: SERVICE,
          fxa_id: UID,
          first_device: false,
          user_agent: USER_AGENT,
          metrics_context: CAMPAIGN_NEWSLETTER_CONTEXT,
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    events.handleEvent({
      event: 'login',
      ts: Date.now() / 1000,
      service: SERVICE,
      uid: UID,
      email: EMAIL,
      deviceCount: 2,
      userAgent: USER_AGENT,
      metricsContext: CAMPAIGN_NEWSLETTER_CONTEXT,
      del: function() {
        done();
      },
    });
  });

  it('does not delete events on network-level error in campaign subscription', function(done) {
    mocks
      .mockBasketResponse({
        reqheaders: { 'content-type': 'application/x-www-form-urlencoded' },
      })
      .post('/subscribe/', function(body) {
        assert.deepEqual(body, {
          email: EMAIL,
          newsletters: CAMPAIGN_NEWSLETTER_SLUG,
          source_url: CAMPAIGN_NEWSLETTER_SOURCE_URL,
        });
        return true;
      })
      .replyWithError('ruh-roh!');
    events
      .handleEvent({
        event: 'login',
        ts: Date.now() / 1000,
        service: SERVICE,
        uid: UID,
        email: EMAIL,
        deviceCount: 2,
        userAgent: USER_AGENT,
        metricsContext: CAMPAIGN_NEWSLETTER_CONTEXT,
        del: function() {
          assert.fail('should not delete the message from the queue');
        },
      })
      .catch(function(err) {
        assert.equal(err.message, 'ruh-roh!');
        done();
      });
  });

  it('does delete events on HTTP-level error in campaign subscription', function(done) {
    mocks
      .mockBasketResponse({
        reqheaders: { 'content-type': 'application/x-www-form-urlencoded' },
      })
      .post('/subscribe/', function(body) {
        assert.deepEqual(body, {
          email: EMAIL,
          newsletters: CAMPAIGN_NEWSLETTER_SLUG,
          source_url: CAMPAIGN_NEWSLETTER_SOURCE_URL,
        });
        return true;
      })
      .reply(500, {
        status: 'error',
        code: 99,
        desc: 'Error: ruh-roh!',
      });
    mocks
      .mockBasketResponse({
        reqheaders: { 'content-type': 'application/json' },
      })
      .post('/fxa-activity/', function(body) {
        assert.deepEqual(body, {
          activity: 'account.login',
          service: SERVICE,
          fxa_id: UID,
          first_device: false,
          user_agent: USER_AGENT,
          metrics_context: CAMPAIGN_NEWSLETTER_CONTEXT,
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    events.handleEvent({
      event: 'login',
      ts: Date.now() / 1000,
      service: SERVICE,
      uid: UID,
      email: EMAIL,
      deviceCount: 2,
      userAgent: USER_AGENT,
      metricsContext: CAMPAIGN_NEWSLETTER_CONTEXT,
      del: function() {
        done();
      },
    });
  });

  it('correctly processes events without a `ts` property when $BASKET_SQS_DISABLED_AFTER_TIMESTAMP is not set', () => {
    mocks
      .mockBasketResponse({
        reqheaders: { 'content-type': 'application/json' },
      })
      .post('/fxa-activity/', function(body) {
        assert.deepEqual(body, {
          activity: 'account.login',
          service: SERVICE,
          fxa_id: UID,
          first_device: true,
          user_agent: USER_AGENT,
          metrics_context: {},
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    return events.handleEvent({
      event: 'login',
      service: SERVICE,
      uid: UID,
      email: EMAIL,
      deviceCount: 1,
      userAgent: USER_AGENT,
      del: MAYBE_NEXT_TICK,
    });
  });

  it('correctly processes events without a `ts` property when $BASKET_SQS_DISABLED_AFTER_TIMESTAMP is set', () => {
    mocks
      .mockBasketResponse({
        reqheaders: { 'content-type': 'application/json' },
      })
      .post('/fxa-activity/', function(body) {
        assert.deepEqual(body, {
          activity: 'account.login',
          service: SERVICE,
          fxa_id: UID,
          first_device: true,
          user_agent: USER_AGENT,
          metrics_context: {},
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    return utils.withEnviron(
      { BASKET_SQS_DISABLED_AFTER_TIMESTAMP: '2016-01-02 03:14:15' },
      () => {
        return utils.withFreshModules(
          require,
          ['../lib/events', '../lib/config'],
          () => {
            const events = require('../lib/events');
            return events.handleEvent({
              event: 'login',
              service: SERVICE,
              uid: UID,
              email: EMAIL,
              deviceCount: 1,
              userAgent: USER_AGENT,
              del: MAYBE_NEXT_TICK,
            });
          }
        );
      }
    );
  });

  it('correctly processes events with `ts` less than $BASKET_SQS_DISABLED_AFTER_TIMESTAMP', () => {
    mocks
      .mockBasketResponse({
        reqheaders: { 'content-type': 'application/json' },
      })
      .post('/fxa-activity/', function(body) {
        assert.deepEqual(body, {
          activity: 'account.login',
          service: SERVICE,
          fxa_id: UID,
          first_device: true,
          user_agent: USER_AGENT,
          metrics_context: {},
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    const cutover = '2016-01-02 03:14:15';
    return utils.withEnviron(
      { BASKET_SQS_DISABLED_AFTER_TIMESTAMP: cutover },
      () => {
        return utils.withFreshModules(
          require,
          ['../lib/events', '../lib/config'],
          () => {
            const events = require('../lib/events');
            return events.handleEvent({
              event: 'login',
              ts:
                moment(cutover)
                  .subtract(1, 'second')
                  .valueOf() / 1000,
              service: SERVICE,
              uid: UID,
              email: EMAIL,
              deviceCount: 1,
              userAgent: USER_AGENT,
              del: MAYBE_NEXT_TICK,
            });
          }
        );
      }
    );
  });

  it('discards events with `ts` greater than $BASKET_SQS_DISABLED_AFTER_TIMESTAMP', () => {
    // Since we don't set up any mocks,
    // the below will fail if it attempts to process the event.
    const cutover = '2016-01-02 03:14:15';
    return utils.withEnviron(
      { BASKET_SQS_DISABLED_AFTER_TIMESTAMP: cutover },
      () => {
        return utils.withFreshModules(
          require,
          ['../lib/events', '../lib/config'],
          () => {
            const events = require('../lib/events');
            return events.handleEvent({
              event: 'login',
              ts:
                moment(cutover)
                  .add(1, 'second')
                  .valueOf() / 1000,
              service: SERVICE,
              uid: UID,
              email: EMAIL,
              deviceCount: 1,
              userAgent: USER_AGENT,
              del: MAYBE_NEXT_TICK,
            });
          }
        );
      }
    );
  });

  it('discards events with `ts` equal to $BASKET_SQS_DISABLED_AFTER_TIMESTAMP', () => {
    // Since we don't set up any mocks,
    // the below will fail if it attempts to process the event.
    const cutover = '2016-01-02 03:14:15';
    return utils.withEnviron(
      { BASKET_SQS_DISABLED_AFTER_TIMESTAMP: cutover },
      () => {
        return utils.withFreshModules(
          require,
          ['../lib/events', '../lib/config'],
          () => {
            const events = require('../lib/events');
            return events.handleEvent({
              event: 'login',
              ts: moment(cutover).valueOf() / 1000,
              service: SERVICE,
              uid: UID,
              email: EMAIL,
              deviceCount: 1,
              userAgent: USER_AGENT,
              del: MAYBE_NEXT_TICK,
            });
          }
        );
      }
    );
  });
});

describe('the set of message handler functions', () => {
  it('defaults to "verified" and "login"', () => {
    const handlers = Object.keys(events._messageHandlers);
    assert.deepEqual(handlers.sort(), ['login', 'verified']);
  });

  it('excludes events listed in $BASKET_SQS_DISABLED_EVENT_TYPES', () => {
    return utils.withEnviron(
      { BASKET_SQS_DISABLED_EVENT_TYPES: 'verified,some_other_event' },
      () => {
        return utils.withFreshModules(
          require,
          ['../lib/events', '../lib/config'],
          () => {
            const events = require('../lib/events');
            const handlers = Object.keys(events._messageHandlers);
            assert.deepEqual(handlers.sort(), ['login']);
            return events.handleEvent({
              event: 'verified',
              ts: Date.now() / 1000,
              uid: UID,
              email: EMAIL,
              locale: LOCALE,
              // This gets executed without attempting any HTTP requests.
              // If HTTP requests are attempted they'll fail, and fail the test.
              del: MAYBE_NEXT_TICK,
            });
          }
        );
      }
    );
  });
});
