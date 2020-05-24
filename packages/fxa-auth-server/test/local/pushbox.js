/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const nock = require('nock');
const pushboxModule = require('../../lib/pushbox');
const error = require('../../lib/error');
const { mockLog } = require('../mocks');

const mockConfig = {
  publicUrl: 'https://accounts.example.com',
  pushbox: {
    enabled: true,
    url: 'https://foo.bar',
    key: 'foo',
    maxTTL: 123456000,
  },
};
const mockDeviceIds = ['AAAA11', 'BBBB22', 'CCCC33'];
const mockData = 'eyJmb28iOiAiYmFyIn0';
const mockUid = 'ABCDEF';

const mockPushboxServer = nock(mockConfig.pushbox.url, {
  reqheaders: { Authorization: `FxA-Server-Key ${mockConfig.pushbox.key}` },
}).defaultReplyHeaders({
  'Content-Type': 'application/json',
});

describe('pushbox', () => {
  afterEach(() => {
    assert.ok(
      nock.isDone(),
      'there should be no pending request mocks at the end of a test'
    );
  });

  it('retrieve', () => {
    mockPushboxServer
      .get(`/v1/store/${mockUid}/${mockDeviceIds[0]}`)
      .query({ limit: 50, index: 10 })
      .reply(200, {
        status: 200,
        last: true,
        index: '15',
        messages: [
          {
            index: '15',
            // This is { foo: "bar", bar: "bar" }, encoded.
            data: 'eyJmb28iOiJiYXIiLCAiYmFyIjogImJhciJ9',
          },
        ],
      });
    const pushbox = pushboxModule(mockLog(), mockConfig);
    return pushbox.retrieve(mockUid, mockDeviceIds[0], 50, 10).then((resp) => {
      assert.deepEqual(resp, {
        last: true,
        index: 15,
        messages: [
          {
            index: 15,
            data: { foo: 'bar', bar: 'bar' },
          },
        ],
      });
    });
  });

  it('retrieve validates the pushbox server response', () => {
    mockPushboxServer
      .get(`/v1/store/${mockUid}/${mockDeviceIds[0]}`)
      .query({ limit: 50, index: 10 })
      .reply(200, {
        bogus: 'object',
      });
    const log = mockLog();
    const pushbox = pushboxModule(log, mockConfig);
    return pushbox.retrieve(mockUid, mockDeviceIds[0], 50, 10).then(
      () => assert.ok(false, 'should not happen'),
      (err) => {
        assert.ok(err);
        assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'pushbox.retrieve');
        assert.equal(
          log.error.getCall(0).args[1].error,
          'response schema validation failed'
        );
      }
    );
  });

  it('retrieve throws on error response', () => {
    mockPushboxServer
      .get(`/v1/store/${mockUid}/${mockDeviceIds[0]}`)
      .query({ limit: 50, index: 10 })
      .reply(200, {
        error: 'lamentably, an error hath occurred',
        status: 1234,
      });
    const log = mockLog();
    const pushbox = pushboxModule(log, mockConfig);
    return pushbox.retrieve(mockUid, mockDeviceIds[0], 50, 10).then(
      () => assert.ok(false, 'should not happen'),
      (err) => {
        assert.ok(err);
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'pushbox.retrieve');
        assert.equal(
          log.error.getCall(0).args[1].error,
          'lamentably, an error hath occurred'
        );
        assert.equal(log.error.getCall(0).args[1].status, 1234);
      }
    );
  });

  it('store', () => {
    let requestBody;
    mockPushboxServer
      .post(`/v1/store/${mockUid}/${mockDeviceIds[0]}`, (body) => {
        requestBody = body;
        return true;
      })
      .reply(200, {
        status: 200,
        index: '12',
      });
    const pushbox = pushboxModule(mockLog(), mockConfig);
    return pushbox
      .store(mockUid, mockDeviceIds[0], { test: 'data' })
      .then(({ index }) => {
        assert.deepEqual(requestBody, {
          data: 'eyJ0ZXN0IjoiZGF0YSJ9',
          ttl: 123456,
        });
        assert.equal(index, '12');
      });
  });

  it('store with custom ttl', () => {
    let requestBody;
    mockPushboxServer
      .post(`/v1/store/${mockUid}/${mockDeviceIds[0]}`, (body) => {
        requestBody = body;
        return true;
      })
      .reply(200, {
        status: 200,
        index: '12',
      });
    const pushbox = pushboxModule(mockLog(), mockConfig);
    return pushbox
      .store(mockUid, mockDeviceIds[0], { test: 'data' }, 42)
      .then(({ index }) => {
        assert.deepEqual(requestBody, {
          data: 'eyJ0ZXN0IjoiZGF0YSJ9',
          ttl: 42,
        });
        assert.equal(index, '12');
      });
  });

  it('store caps ttl at configured maximum', () => {
    let requestBody;
    mockPushboxServer
      .post(`/v1/store/${mockUid}/${mockDeviceIds[0]}`, (body) => {
        requestBody = body;
        return true;
      })
      .reply(200, {
        status: 200,
        index: '12',
      });
    const pushbox = pushboxModule(mockLog(), mockConfig);
    return pushbox
      .store(mockUid, mockDeviceIds[0], { test: 'data' }, 999999999)
      .then(({ index }) => {
        assert.deepEqual(requestBody, {
          data: 'eyJ0ZXN0IjoiZGF0YSJ9',
          ttl: 123456,
        });
        assert.equal(index, '12');
      });
  });

  it('store validates the pushbox server response', () => {
    mockPushboxServer
      .post(`/v1/store/${mockUid}/${mockDeviceIds[0]}`)
      .reply(200, {
        bogus: 'object',
      });
    const log = mockLog();
    const pushbox = pushboxModule(log, mockConfig);
    return pushbox.store(mockUid, mockDeviceIds[0], { test: 'data' }).then(
      () => assert.ok(false, 'should not happen'),
      (err) => {
        assert.ok(err);
        assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'pushbox.store');
        assert.equal(
          log.error.getCall(0).args[1].error,
          'response schema validation failed'
        );
      }
    );
  });

  it('retrieve throws on error response', () => {
    mockPushboxServer
      .post(`/v1/store/${mockUid}/${mockDeviceIds[0]}`)
      .reply(200, {
        error: 'Alas, an error! I knew it, Horatio.',
        status: 789,
      });
    const log = mockLog();
    const pushbox = pushboxModule(log, mockConfig);
    return pushbox.store(mockUid, mockDeviceIds[0], { test: 'data' }).then(
      () => assert.ok(false, 'should not happen'),
      (err) => {
        assert.ok(err);
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'pushbox.store');
        assert.equal(
          log.error.getCall(0).args[1].error,
          'Alas, an error! I knew it, Horatio.'
        );
        assert.equal(log.error.getCall(0).args[1].status, 789);
      }
    );
  });

  it('feature disabled', () => {
    const config = Object.assign({}, mockConfig, {
      pushbox: { enabled: false },
    });
    const pushbox = pushboxModule(mockLog(), config);
    return pushbox
      .store(mockUid, mockDeviceIds[0], 'sendtab', mockData)
      .then(
        () => assert.ok(false, 'should not happen'),
        (err) => {
          assert.ok(err);
          assert.equal(err.message, 'Feature not enabled');
        }
      )
      .then(() => pushbox.retrieve(mockUid, mockDeviceIds[0], 50, 10))
      .then(
        () => assert.ok(false, 'should not happen'),
        (err) => {
          assert.ok(err);
          assert.equal(err.message, 'Feature not enabled');
        }
      );
  });
});
