/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const path = require('path');
const proxyquire = require('proxyquire').noPreserveCache();
const sinon = require('sinon');

function mockModule(mocks) {
  return proxyquire(path.join(process.cwd(), 'server', 'lib', 'routes', 'get-verify-email'), mocks)();
}

let logger;
let mocks;
let ravenMock;
let gotMock;
let res;

registerSuite('verify_email', {
  beforeEach() {
    gotMock = {
      post: sinon.spy()
    };
    logger = {
      error: sinon.spy()
    };
    ravenMock = {
      ravenMiddleware: {
        captureError: sinon.spy(),
        captureMessage: sinon.spy()
      }
    };
    mocks = {
      '../../lib/raven': ravenMock,
      '../logging/log': () => {
        return logger;
      },
      'got': gotMock
    };
    res = {
      json: () => {},
      redirect: (url) => url
    };
  },
  tests: {
    'logs error without query params': function () {
      const dfd = this.async(10000);
      const req = {
        query: {
          code: '',
          uid: ''
        },
        url: '/verify_email'
      };

      mockModule(mocks).process(req, res, () => {
        var c = ravenMock.ravenMiddleware.captureMessage;
        var arg = c.args[0];
        assert.equal(c.calledOnce, true);
        assert.equal(arg[0], 'VerificationValidationError');
        assert.equal(arg[1].extra.details[0].message, '"code" is not allowed to be empty');
        dfd.resolve();
      });

      return dfd;
    },

    'no errors logged if successful, only Sentry messages': function () {
      const dfd = this.async(10000);
      mocks.got = {
        post: (req, res, next) => {
          return new Promise((resolve, reject) => {
            resolve({
              'statusCode': 200,
              'statusMessage': 'OK'
            });
          });
        }
      };

      const req = {
        query: {
          code: '12345678912345678912345678912312',
          uid: '12345678912345678912345678912312'
        },
        url: '/verify_email'
      };

      res.redirect = () => {
        assert.equal(logger.error.callCount, 0);
        assert.equal(ravenMock.ravenMiddleware.captureMessage.callCount, 0);
        assert.equal(ravenMock.ravenMiddleware.captureError.callCount, 0);

        res.redirect = () => {
          // calling with `req.query.something` captures a message to Sentry
          assert.equal(logger.error.callCount, 0);
          assert.equal(ravenMock.ravenMiddleware.captureMessage.callCount, 1);
          assert.equal(ravenMock.ravenMiddleware.captureError.callCount, 0);
          dfd.resolve();
        };
        req.query.something = 'else';
        mockModule(mocks).process(req, res);
      };

      mockModule(mocks).process(req, res);


      return dfd;
    },

    'logs errors when post fails': function () {
      const dfd = this.async(10000);
      mocks.got = {
        post: (req, res, next) => {
          return new Promise((resolve, reject) => {
            reject({
              'host': '127.0.0.1:9000',
              'hostname': '127.0.0.1',
              'message': 'Response code 400 (Bad Request)',
              'method': 'POST',
              'path': '/v1/recovery_email/verify_code',
              'statusCode': 400,
              'statusMessage': 'Bad Request'
            });
          });
        }
      };

      const req = {
        query: {
          code: '12345678912345678912345678912312',
          uid: '12345678912345678912345678912312'
        },
        url: '/verify_email'
      };

      mockModule(mocks).process(req, res, () => {
        assert.equal(logger.error.callCount, 1, 'calls error on bad request');
        assert.equal(ravenMock.ravenMiddleware.captureMessage.callCount, 0);
        assert.equal(ravenMock.ravenMiddleware.captureError.callCount, 1);
        const result = ravenMock.ravenMiddleware.captureError.args[0][0];
        assert.equal(result.statusCode, 400);
        assert.equal(result.statusMessage, 'Bad Request');

        dfd.resolve();
      });

      return dfd;
    },

    'logs error with invalid utm param': function () {
      const dfd = this.async(1000);
      const req = {
        query: {
          /*eslint-disable camelcase*/
          code: '12345678912345678912345678912312',
          uid: '12345678912345678912345678912312',
          utm_campaign: '!'
          /*eslint-enable camelcase*/
        },
        url: '/verify_email'
      };

      mocks.got = {
        post: () => {
          return new Promise((resolve) => {
            resolve({});
          });
        }
      };

      res.redirect = () => {
        const c = ravenMock.ravenMiddleware.captureMessage;
        const arg = c.args[0];
        assert.equal(c.calledOnce, true);
        assert.equal(arg[0], 'VerificationValidationInfo');
        const errorMessage = '"utm_campaign" with value "&#x21;" fails to match the required pattern: /^[\\w\\/.%-]+/';
        assert.equal(arg[1].extra.details[0].message, errorMessage);
        dfd.resolve();
      };

      mockModule(mocks).process(req, res);

      return dfd.promise;
    },

    'no logs with valid resume param': function () {
      const dfd = this.async(1000);
      const req = {
        query: {
          code: '12345678912345678912345678912312',
          resume: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=', // All possible base64 characters
          uid: '12345678912345678912345678912312'
        },
        url: '/verify_email'
      };

      mocks.got = {
        post: () => {
          return new Promise((resolve) => {
            resolve({});
          });
        }
      };

      res.redirect = () => {
        const c = ravenMock.ravenMiddleware.captureMessage;
        assert.equal(c.callCount, 0);
        dfd.resolve();
      };

      mockModule(mocks).process(req, res);

      return dfd.promise;
    }
  }
});
