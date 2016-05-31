/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable camelcase */

var assert = require('assert');

var events = require('../lib/events');

var mocks = require('./lib/mocks');


var UID = 'foobar';
var EMAIL = 'foobar@example.com';
var LOCALE = 'en-AU';
var USER_AGENT = 'a fake testing browser (like Gecko)';
var SERVICE = 'sync';


describe('the handleEvent() function', function () {

  it('calls /fxa-register for account verification events', function (done) {
    mocks.mockBasketResponse({
      reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
    }).post('/fxa-register/', function (body) {
      assert.deepEqual(body, {
        fxa_id: UID,
        email: EMAIL,
        accept_lang: LOCALE
      });
      return true;
    }).reply(200, {
      status: 'ok'
    });
    events.handleEvent({
      event: 'verified',
      uid: UID,
      email: EMAIL,
      locale: LOCALE,
      del: function () {
        done();
      }
    });
  });

  it('calls /fxa-activity for device login events', function (done) {
    mocks.mockBasketResponse({
      reqheaders: { 'content-type': 'application/json' }
    }).post('/fxa-activity/', function (body) {
      assert.deepEqual(body, {
        activity: 'account.login',
        service: SERVICE,
        fxa_id: UID,
        first_device: true,
        user_agent: USER_AGENT,
        metrics_context: {}
      });
      return true;
    }).reply(200, {
      status: 'ok'
    });
    events.handleEvent({
      event: 'login',
      service: SERVICE,
      uid: UID,
      email: EMAIL,
      deviceCount: 1,
      userAgent: USER_AGENT,
      del: function () {
        done();
      }
    });
  });

  it('calls /fxa-activity with a correct `first_device` value', function (done) {
    mocks.mockBasketResponse({
      reqheaders: { 'content-type': 'application/json' }
    }).post('/fxa-activity/', function (body) {
      assert.deepEqual(body, {
        activity: 'account.login',
        service: SERVICE,
        fxa_id: UID,
        first_device: false,
        user_agent: USER_AGENT,
        metrics_context: {}
      });
      return true;
    }).reply(200, {
      status: 'ok'
    });
    events.handleEvent({
      event: 'login',
      service: SERVICE,
      uid: UID,
      email: EMAIL,
      deviceCount: 2,
      userAgent: USER_AGENT,
      del: function () {
        done();
      }
    });
  });

  it('calls /fxa-activity with metrics context data', function (done) {
    mocks.mockBasketResponse({
      reqheaders: { 'content-type': 'application/json' }
    }).post('/fxa-activity/', function (body) {
      assert.deepEqual(body, {
        activity: 'account.login',
        service: SERVICE,
        fxa_id: UID,
        first_device: false,
        user_agent: USER_AGENT,
        metrics_context: {
          utm_campaign: 'test-campaign',
          utm_source: 'firstrun'
        }
      });
      return true;
    }).reply(200, {
      status: 'ok'
    });
    events.handleEvent({
      event: 'login',
      service: SERVICE,
      uid: UID,
      email: EMAIL,
      deviceCount: 2,
      userAgent: USER_AGENT,
      metricsContext: {
        utm_campaign: 'test-campaign',
        utm_source: 'firstrun'
      },
      del: function () {
        done();
      }
    });
  });

  it('ignores unrecognized event types', function (done) {
    events.handleEvent({
      event: 'unknownEvent',
      del: function () {
        // This is reached without trying to hit the basket server.
        done();
      }
    });
  });

  it('ignores "verified" events from dev email addresses', function (done) {
    events.handleEvent({
      event: 'verified',
      uid: UID,
      email: 'foo@restmail.net',
      locale: LOCALE,
      del: function () {
        // This is reached without trying to hit the basket server.
        done();
      }
    });
  });

  it('ignores "login" events from dev email addresses', function (done) {
    events.handleEvent({
      event: 'login',
      service: SERVICE,
      uid: UID,
      email: 'bar@restmail.lcip.org',
      deviceCount: 1,
      userAgent: USER_AGENT,
      del: function () {
        // This is reached without trying to hit the basket server.
        done();
      }
    });
  });

  it('uses "en-US" as the default locale is none is provided', function (done) {
    mocks.mockBasketResponse({
      reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
    }).post('/fxa-register/', function (body) {
      assert.deepEqual(body, {
        fxa_id: UID,
        email: EMAIL,
        accept_lang: 'en-US'
      });
      return true;
    }).reply(200, {
      status: 'ok'
    });
    events.handleEvent({
      event: 'verified',
      uid: UID,
      email: EMAIL,
      del: function () {
        done();
      }
    });
  });

  it('does not delete events if a network-level error occurs', function (done) {
    mocks.mockBasketResponse({
      reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
    }).post('/fxa-register/', function (body) {
      assert.deepEqual(body, {
        fxa_id: UID,
        email: EMAIL,
        accept_lang: LOCALE
      });
      return true;
    }).replyWithError('ruh-roh!');
    events.handleEvent({
      event: 'verified',
      uid: UID,
      email: EMAIL,
      locale: LOCALE,
      del: function () {
        assert.fail('should not delete the message from the queue');
      }
    }).then(done, function () { assert.fail('unhandled error'); });
  });

  it('does delete events if a HTTP-level error occurs', function (done) {
    mocks.mockBasketResponse({
      reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
    }).post('/fxa-register/', function (body) {
      assert.deepEqual(body, {
        fxa_id: UID,
        email: EMAIL,
        accept_lang: LOCALE
      });
      return true;
    }).reply(500, {
      status: 'error',
      code: 99,
      desc: 'Error: ruh-roh!'
    });
    events.handleEvent({
      event: 'verified',
      uid: UID,
      email: EMAIL,
      locale: LOCALE,
      del: function () {
        done();
      }
    });
  });

});
