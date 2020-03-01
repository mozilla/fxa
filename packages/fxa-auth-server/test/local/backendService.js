/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const nock = require('nock');
const Joi = require('@hapi/joi');
const { assert } = require('chai');
const { mockLog } = require('../mocks');
const sinon = require('sinon');

const error = require('../../lib/error');
const createBackendServiceAPI = require('../../lib/backendService');

const mockConfig = {};

const mockServiceURL = 'http://mock.service';
const mockService = nock(mockServiceURL);

describe('createBackendServiceAPI', () => {
  let Service, api, log;

  beforeEach(() => {
    log = mockLog();
    Service = createBackendServiceAPI(log, mockConfig, 'mock-service', {
      testSimpleGet: {
        method: 'GET',
        path: '/test_get/:first/:second',
      },

      testSimplePost: {
        method: 'POST',
        path: '/test_post/:id',
        validate: {
          payload: {
            foo: Joi.string().required(),
          },
        },
      },

      testGetWithValidation: {
        method: 'GET',
        path: '/test_get/:first/:second',
        validate: {
          params: {
            first: Joi.string()
              .regex(/[a-z]+/)
              .required(),
            second: Joi.string().required(),
          },
          query: {
            foo: Joi.string().optional(),
          },
          response: {
            status: Joi.number().required(),
            message: Joi.string().required(),
          },
        },
      },

      testPostWithValidation: {
        method: 'POST',
        path: '/test_post/:id',
        validate: {
          params: {
            id: Joi.string()
              .regex(/[a-z]+/)
              .required(),
          },
          query: {
            bar: Joi.string().optional(),
          },
          payload: {
            foo: Joi.string().required(),
          },
          response: {
            status: Joi.number().required(),
            message: Joi.string().required(),
          },
        },
      },

      testGetWithHeaders: {
        method: 'GET',
        path: '/test_get_with_headers',
        validate: {
          headers: {
            foo: Joi.string().required(),
          },
        },
      },
    });
    api = new Service(mockServiceURL);
  });

  afterEach(() => {
    assert.ok(
      nock.isDone(),
      'there should be no pending request mocks at the end of a test'
    );
  });

  it('can make a simple GET request and return the response', async () => {
    mockService.get('/test_get/one/two', '').reply(200, {
      hello: 'world',
    });
    const resp = await api.testSimpleGet('one', 'two');
    assert.deepEqual(resp, {
      hello: 'world',
    });
  });

  it('can make a simple POST request and return the response', async () => {
    mockService.post('/test_post/abc', { foo: 'bar' }).reply(200, {
      hello: 'world',
    });
    const resp = await api.testSimplePost('abc', { foo: 'bar' });
    assert.deepEqual(resp, {
      hello: 'world',
    });
  });

  it('requires that a body be provided for POST requests', async () => {
    try {
      await api.testSimplePost('abc');
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(
        err.message,
        'mock-service.testSimplePost must be called with 2 arguments (1 given)'
      );
    }
  });

  it('validates the request body', async () => {
    try {
      await api.testSimplePost('abc', { foo: 123 });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
      assert.equal(err.output.payload.op, 'mock-service.testSimplePost');
      assert.deepEqual(err.output.payload.data, {
        location: 'request',
        value: {
          foo: 123,
        },
      });
      assert.equal(log.error.callCount, 1, 'an error was logged');
      assert.equal(log.error.getCall(0).args[0], 'mock-service.testSimplePost');
      assert.equal(
        log.error.getCall(0).args[1].error,
        'request schema validation failed'
      );
      assert.ok(
        /"foo" must be a string/.test(log.error.getCall(0).args[1].message)
      );
    }
  });

  it('validates path parameters', async () => {
    try {
      await api.testGetWithValidation('ABC', '123', {});
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
      assert.equal(err.output.payload.op, 'mock-service.testGetWithValidation');
      assert.deepEqual(err.output.payload.data, {
        location: 'params',
        value: {
          first: 'ABC',
          second: '123',
        },
      });
      assert.equal(log.error.callCount, 1, 'an error was logged');
      assert.equal(
        log.error.getCall(0).args[0],
        'mock-service.testGetWithValidation'
      );
      assert.equal(
        log.error.getCall(0).args[1].error,
        'params schema validation failed'
      );
      assert.ok(
        /fails to match the required pattern/.test(
          log.error.getCall(0).args[1].message
        )
      );
    }
    log.error.resetHistory();
    try {
      await api.testGetWithValidation('abc', 123, {});
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
      assert.equal(log.error.callCount, 1, 'an error was logged');
      assert.equal(
        log.error.getCall(0).args[0],
        'mock-service.testGetWithValidation'
      );
      assert.equal(
        log.error.getCall(0).args[1].error,
        'params schema validation failed'
      );
      assert.ok(
        /"second" must be a string/.test(log.error.getCall(0).args[1].message)
      );
    }
  });

  it('rejects unsafe path parameters', async () => {
    try {
      await api.testSimpleGet('abc\n', '123');
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
      assert.equal(log.error.callCount, 1, 'an error was logged');
      assert.equal(log.error.getCall(0).args[0], 'safeUrl.unsafe');
      assert.equal(log.error.getCall(0).args[1].key, 'first');
    }
  });

  it('validates query paramters', async () => {
    try {
      await api.testGetWithValidation('abc', '123', { foo: 123 });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
      assert.equal(err.output.payload.op, 'mock-service.testGetWithValidation');
      assert.deepEqual(err.output.payload.data, {
        location: 'query',
        value: {
          foo: 123,
        },
      });
      assert.equal(log.error.callCount, 1, 'an error was logged');
      assert.equal(
        log.error.getCall(0).args[0],
        'mock-service.testGetWithValidation'
      );
      assert.equal(
        log.error.getCall(0).args[1].error,
        'query schema validation failed'
      );
      assert.ok(
        /"foo" must be a string/.test(log.error.getCall(0).args[1].message)
      );
    }
  });

  it('rejects unsafe query parameters', async () => {
    try {
      await api.testGetWithValidation('abc', '123', { foo: '123\n' });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
      assert.equal(log.error.callCount, 1, 'an error was logged');
      assert.equal(log.error.getCall(0).args[0], 'safeUrl.unsafe');
      assert.equal(log.error.getCall(0).args[1].key, 'foo');
    }
  });

  it('requires that query parameters be present if  schema is declared', async () => {
    try {
      await api.testGetWithValidation('abc', '123');
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(
        err.message,
        'mock-service.testGetWithValidation must be called with 3 arguments (2 given)'
      );
    }
  });

  it('validates headers', async () => {
    try {
      // inalid header type
      await api.testGetWithHeaders({ foo: 1 });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
    }

    try {
      // missing header
      await api.testGetWithHeaders({});
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
    }

    try {
      // no headers
      await api.testGetWithHeaders();
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(
        err.message,
        'mock-service.testGetWithHeaders must be called with 1 arguments (0 given)'
      );
    }

    mockService
      .get('/test_get_with_headers', body => true)
      .reply(200, {
        status: 200,
        message: 'ok',
      });

    await api.testGetWithHeaders({ foo: 'buz' });
  });

  it('validates response body', async () => {
    let requestBody;
    mockService
      .post('/test_post/abc', body => {
        requestBody = body;
        return true;
      })
      .query({ bar: 'baz' })
      .reply(200, {
        status: 200,
        message: 'ok',
      });
    const resp = await api.testPostWithValidation(
      'abc',
      { bar: 'baz' },
      { foo: 'bar' }
    );
    assert.deepEqual(requestBody, {
      foo: 'bar',
    });
    assert.deepEqual(resp, {
      status: 200,
      message: 'ok',
    });

    mockService
      .post('/test_post/abc', () => true)
      .query({ bar: 'baz' })
      .reply(200, {
        status: 'whoops',
        message: 'whoops',
      });
    try {
      await api.testPostWithValidation('abc', { bar: 'baz' }, { foo: 'bar' });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
      assert.equal(log.error.callCount, 1, 'an error was logged');
      assert.equal(
        log.error.getCall(0).args[0],
        'mock-service.testPostWithValidation'
      );
      assert.equal(
        log.error.getCall(0).args[1].error,
        'response schema validation failed'
      );
      assert.ok(
        /"status" must be a number/.test(log.error.getCall(0).args[1].message)
      );
    }
  });

  it('strips unknown keys from response body', async () => {
    let requestBody;
    mockService
      .post('/test_post/abc', body => {
        requestBody = body;
        return true;
      })
      .query({ bar: 'baz' })
      .reply(200, {
        status: 200,
        message: 'ok',
        something: 'extra',
      });
    const resp = await api.testPostWithValidation(
      'abc',
      { bar: 'baz' },
      { foo: 'bar' }
    );
    assert.deepEqual(requestBody, {
      foo: 'bar',
    });
    assert.deepEqual(resp, {
      status: 200,
      message: 'ok',
    });
  });

  it('re-throws 400-level errors returned by the service', async () => {
    mockService
      .post('/test_post/abc', body => true)
      .reply(400, {
        message: 'invalid frobble',
      });
    try {
      await api.testPostWithValidation('abc', {}, { foo: 'bar' });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.statusCode, 400);
      assert.equal(err.message, 'invalid frobble');
    }
  });

  it('logs 500-level errors and returns backendServiceFailure', async () => {
    mockService
      .post('/test_post/abc', body => true)
      .reply(500, {
        message: 'invalid frobble',
      });
    try {
      await api.testPostWithValidation('abc', {}, { foo: 'bar' });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
      assert.equal(log.error.callCount, 1, 'an error was logged');
      assert.equal(
        log.error.getCall(0).args[0],
        'mock-service.testPostWithValidation.1'
      );
      assert.deepEqual(log.error.getCall(0).args[1].params, { id: 'abc' });
      assert.deepEqual(log.error.getCall(0).args[1].query, {});
      assert.deepEqual(log.error.getCall(0).args[1].payload, { foo: 'bar' });
      assert.deepEqual(
        log.error.getCall(0).args[1].err.message,
        'invalid frobble'
      );
    }
  });

  it('logs connection errors and returns backendServiceFailure', async () => {
    mockService.post('/test_post/abc', body => true).replyWithError('ruh-roh!');
    try {
      await api.testPostWithValidation('abc', {}, { foo: 'bar' });
      assert.fail('should have thrown');
    } catch (err) {
      assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
      assert.equal(log.error.callCount, 1, 'an error was logged');
      assert.equal(
        log.error.getCall(0).args[0],
        'mock-service.testPostWithValidation.1'
      );
      assert.deepEqual(log.error.getCall(0).args[1].params, { id: 'abc' });
      assert.deepEqual(log.error.getCall(0).args[1].query, {});
      assert.deepEqual(log.error.getCall(0).args[1].payload, { foo: 'bar' });
      assert.ok(
        log.error.getCall(0).args[1].err.message.indexOf('ruh-roh!') >= 0
      );
    }
  });

  it('collects performance stats when StatsD is present', async () => {
    const statsd = { timing: sinon.stub() };
    Service = createBackendServiceAPI(
      log,
      mockConfig,
      's',
      {
        testSimpleGet: {
          method: 'GET',
          path: '/test_get/:first/:second',
        },
      },
      statsd
    );
    api = new Service(mockServiceURL);
    mockService.get('/test_get/one/two', '').reply(200, {
      hello: 'world',
    });
    await api.testSimpleGet('one', 'two');
    assert.equal(statsd.timing.calledOnce, true, 'statsd.timing was called');
    assert.equal(
      statsd.timing.args[0][0],
      's.testSimpleGet.success',
      'timing stat name is apiName.methodName.success'
    );
    assert.equal(
      typeof statsd.timing.args[0][1],
      'number',
      'timing stat value is a number'
    );

    statsd.timing.resetHistory();
    mockService.get('/test_get/one/two', '').reply(400);
    try {
      await api.testSimpleGet('one', 'two');
    } catch (err) {
      // NOOP
    }
    assert.equal(statsd.timing.calledOnce, true, 'statsd.timing was called');
    assert.equal(
      statsd.timing.args[0][0],
      's.testSimpleGet.failure',
      'timing stat name is apiName.methodName.failure'
    );
    assert.equal(
      typeof statsd.timing.args[0][1],
      'number',
      'timing stat value is a number'
    );
  });
});
