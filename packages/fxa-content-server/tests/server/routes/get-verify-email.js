/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../../server/lib/configuration',
  'intern/dojo/Promise',
  'intern/dojo/node!got',
  'intern/dojo/node!fs',
  'intern/dojo/node!path',
  'intern/dojo/node!proxyquire',
  'intern/dojo/node!sinon',
], function (intern, registerSuite, assert, config, dojoPromise, got, fs, path, proxyquire, sinon) {

  function mockModule(mocks) {
    return proxyquire(path.join(process.cwd(), 'server', 'lib', 'routes', 'get-verify-email'), mocks)();
  }

  let logger;
  let mocks;
  let ravenMock;
  let gotMock;
  const res = {
    json: () => {}
  };

  registerSuite({
    name: 'verify_email',

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
        'got': gotMock,
        mozlog: () => {
          return logger;
        },
      };
    },

    'logs error without query params' () {
      const dfd = new dojoPromise.Deferred();
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

      return dfd.dojoPromise;
    },

    'no logs if successful' () {
      const dfd = new dojoPromise.Deferred();
      mocks.got = {
        post: (req, res, next) =>  {
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

      mockModule(mocks).process(req, res, () => {
        assert.equal(logger.error.callCount, 0);
        assert.equal(ravenMock.ravenMiddleware.captureMessage.callCount, 0);
        assert.equal(ravenMock.ravenMiddleware.captureError.callCount, 0);

        req.query.something = 'else';

        mockModule(mocks).process(req, res, () => {
          assert.equal(logger.error.callCount, 0);
          assert.equal(ravenMock.ravenMiddleware.captureMessage.callCount, 0);
          assert.equal(ravenMock.ravenMiddleware.captureError.callCount, 0);
          dfd.resolve();
        });
      });

      return dfd.dojoPromise;
    },

    'logs errors when post fails' () {
      const dfd = new dojoPromise.Deferred();
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
        assert.equal(logger.error.callCount, 1);
        assert.equal(ravenMock.ravenMiddleware.captureMessage.callCount, 0);
        assert.equal(ravenMock.ravenMiddleware.captureError.callCount, 1);
        const result = ravenMock.ravenMiddleware.captureError.args[0][0];
        assert.equal(result.statusCode, 400);
        assert.equal(result.statusMessage, 'Bad Request');

        dfd.resolve();
      });

      return dfd.dojoPromise;
    }

  });

});
