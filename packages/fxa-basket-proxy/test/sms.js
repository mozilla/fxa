/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var assert = require('assert');
var request = require('supertest');

var app = require('../lib/app')();

var mocks = require('./lib/mocks');

var UID = 'abcdef123456';

describe('/sms', function() {
  it('forwards properly-authenticated requests through to basket', function(done) {
    var PHONE_NUMBER = '15555551234';
    var MSG_ID = 'SMS_Android';
    var OPTIN = 'N';
    mocks.mockOAuthResponse().reply(200, {
      user: UID,
      scope: ['basket'],
    });
    mocks.mockProfileResponse().reply(200, {
      email: 'dont@ca.re',
    });
    mocks
      .mockBasketResponse()
      .post('/subscribe_sms/', function(body) {
        assert.deepEqual(body, {
          /*eslint-disable camelcase*/
          mobile_number: PHONE_NUMBER,
          msg_id: MSG_ID,
          /*eslint-enable camelcase*/
          optin: OPTIN,
        });
        return true;
      })
      .reply(200, {
        status: 'ok',
      });
    request(app)
      .post('/subscribe_sms')
      .set('authorization', 'Bearer TOKEN')
      .send({
        /*eslint-disable camelcase*/
        mobile_number: PHONE_NUMBER,
        msg_id: MSG_ID,
        /*eslint-enable camelcase*/
        optin: OPTIN,
      })
      .expect(200, {
        status: 'ok',
      })
      .end(done);
  });

  it('returns an error if no credentials are provided', function(done) {
    request(app)
      .post('/subscribe_sms')
      .expect('Content-Type', /json/)
      .expect(400, {
        status: 'error',
        code: 5,
        desc: 'missing authorization header',
      })
      .end(done);
  });

  it('returns an error if the basket server request errors out', function(done) {
    var PHONE_NUMBER = '15555551234';
    var MSG_ID = 'SMS_Android';
    var OPTIN = 'N';
    mocks.mockOAuthResponse().reply(200, {
      user: UID,
      scope: ['basket'],
    });
    mocks.mockProfileResponse().reply(200, {
      email: 'dont@ca.re',
    });
    mocks
      .mockBasketResponse()
      .post('/subscribe_sms/', function(body) {
        assert.deepEqual(body, {
          /*eslint-disable camelcase*/
          mobile_number: PHONE_NUMBER,
          msg_id: MSG_ID,
          /*eslint-enable camelcase*/
          optin: OPTIN,
        });
        return true;
      })
      .replyWithError('ruh-roh!');
    request(app)
      .post('/subscribe_sms')
      .set('authorization', 'Bearer TOKEN')
      .send({
        /*eslint-disable camelcase*/
        mobile_number: PHONE_NUMBER,
        msg_id: MSG_ID,
        /*eslint-enable camelcase*/
        optin: OPTIN,
      })
      .expect(500, {
        status: 'error',
        code: 99,
        desc: 'Error: ruh-roh!',
      })
      .end(done);
  });
});
