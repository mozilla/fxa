/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const EventEmitter = require('events');
const proxyquire = require('proxyquire');
const crypto = require('crypto');
const sinon = require('sinon');

const UID = crypto.randomBytes(16).toString('hex');

let ev;
let mockConfig;
let mockDb;
let Msg;

class SinkEmitter extends EventEmitter {}

describe('events', function() {
  beforeEach(() => {
    mockDb = {
      removePublicAndCanGrantTokens: sinon.stub(),
      removeUser: sinon.stub(),
    };

    mockConfig = {
      getProperties: () => {
        return {
          events: {
            region: 'foo',
            queueUrl: 'bar',
          },
        };
      },
    };

    ev = proxyquire('../lib/events', {
      './db': mockDb,
      './config': mockConfig,
      'fxa-notifier-aws': {
        Sink: SinkEmitter,
      },
    });

    Msg = function Message(type, onDel) {
      return {
        event: type,
        uid: UID,
        del: onDel,
      };
    };
  });

  it('is disabled when config is not', () => {
    mockConfig.getProperties = () => {
      return {
        events: {},
      };
    };

    const mockLog = {
      warn: sinon.stub(),
    };

    ev = proxyquire('../lib/events', {
      './config': mockConfig,
      './logging': () => {
        return mockLog;
      },
    });

    sinon.spy(ev.start);
    ev.start();
    assert.ok(mockLog.warn.calledOnce);
    assert.ok(mockLog.warn.args[0][0], 'accountEvent.unconfigured');
  });

  it('handles passwordChange event', done => {
    ev.emit(
      'data',
      new Msg('passwordChange', () => {
        const revokeCall = mockDb.removePublicAndCanGrantTokens;
        assert.ok(revokeCall.calledOnce);
        assert.equal(revokeCall.args[0][0].length, 32, 'called with uid');
        done();
      })
    );
  });

  it('handles reset event', done => {
    ev.emit(
      'data',
      new Msg('reset', () => {
        const revokeCall = mockDb.removePublicAndCanGrantTokens;
        assert.ok(revokeCall.calledOnce);
        assert.equal(revokeCall.args[0][0].length, 32, 'called with uid');
        done();
      })
    );
  });

  it('handles delete event', done => {
    ev.emit(
      'data',
      new Msg('delete', () => {
        const revokeCall = mockDb.removeUser;
        assert.ok(revokeCall.calledOnce);
        assert.equal(revokeCall.args[0][0].length, 32, 'called with uid');
        done();
      })
    );
  });
});
