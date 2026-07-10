/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import sinon from 'sinon';

import { assertSecurityHeaders } from './lib/util';
const db = require('../lib/db');
const P = require('../lib/promise');
const testServer = require('./lib/server');
const Static = require('./lib/static');
const img = require('../lib/img');
const eventsFactory = require('../lib/events');
const mockFactory = require('./lib/mock');

const UID = crypto.randomBytes(16).toString('hex');

const imagePath = path.join(__dirname, 'lib', 'firefox.png');
const imageData = fs.readFileSync(imagePath);

const SIZES = img.SIZES;
const SIZE_SUFFIXES = Object.keys(SIZES).map(function (val) {
  if (val === 'default') {
    return '';
  }
  return '_' + val;
});

describe('#integration - events', () => {
  let Server: any;
  let mock: any;
  let events: any;

  beforeAll(async () => {
    Server = await testServer.create();
    events = eventsFactory(Server.server);

    return Server;
  });

  afterAll(async () => {
    try {
      await db._teardown();
    } catch (_e) {
      // _clear may not be available depending on db backend
    }
    return Server.server.stop();
  });

  beforeEach(async () => {
    await Server.server.initialize();
    mock = await mockFactory({ userid: UID });
  });

  afterEach(() => {
    mock.done();
  });

  describe('onDeleteMessage', () => {
    var tok = crypto.randomBytes(32).toString('hex');
    function Message(type: any, onDel?: Function) {
      if (typeof type === 'function') {
        onDel = type;
        type = 'delete';
      }
      return {
        event: type,
        uid: UID,
        del: onDel,
      };
    }

    describe('avatar', () => {
      beforeEach(async () => {
        mock.token({
          user: UID,
          email: 'user@example.domain',
          scope: ['profile:avatar:write'],
        });
        mock.image(imageData.length);
        const res = await Server.api.post({
          url: '/avatar/upload',
          payload: imageData,
          headers: {
            authorization: 'Bearer ' + tok,
            'content-type': 'image/png',
            'content-length': imageData.length,
          },
        });
        expect(res.statusCode).toBe(201);
        expect(res.result.url).toBeTruthy();
        expect(res.result.id).toBeTruthy();
        assertSecurityHeaders(res);

        const s3url = res.result.url;
        const responses = await P.all(SIZE_SUFFIXES).map(function (
          suffix: string
        ) {
          return Static.get(s3url + suffix);
        });
        expect(responses.length).toBe(SIZE_SUFFIXES.length);
        responses.forEach(function (res: any) {
          expect(res.statusCode).toBe(200);
        });
        mock.done();
      });

      it('should delete avatars', (done) => {
        mock.deleteImage();
        events.onData(
          Message(function () {
            db.getSelectedAvatar(UID)
              .then(function (avatar: any) {
                expect(avatar).toBeUndefined();
              })
              .done(done, done);
          })
        );
      });

      it('should not delete message on error', (done) => {
        mock.workerFailure('delete', 0);
        events.onData(
          Message(function () {
            expect(false).toBe(true); // message.del() should not be called
          })
        );
        mock.log('events', function (record: any) {
          if (record.levelname === 'ERROR' && record.args[0] === 'delete') {
            setTimeout(function () {
              done();
            }, 1);
            return true;
          }
          return false;
        });
      });
    });

    it('should ignore unknown messages', (done) => {
      db.setDisplayName(UID, 'foo bar').then(function () {
        events.onData(
          Message('baz', function () {
            db.getDisplayName(UID)
              .then(function (profile: any) {
                expect(profile.displayName).toBe('foo bar');
              })
              .done(done, done);
          })
        );
      });
    });
  });

  describe('onPrimaryEmailChangedMessage', () => {
    describe('should invalidate user cache', () => {
      function Message(type: any, onDel?: Function) {
        if (typeof type === 'function') {
          onDel = type;
          type = 'primaryEmailChanged';
        }
        return {
          event: type,
          uid: UID,
          del: onDel,
        };
      }
      beforeEach(() => {
        Server.server.methods.profileCache.drop = sinon.spy(function (
          _uid: string
        ) {
          return P.resolve([]);
        });
      });

      it('invalidate cache', (done) => {
        events.onData(
          Message(function () {
            var args =
              Server.server.methods.profileCache.drop.getCall(0).args;
            var callCount =
              Server.server.methods.profileCache.drop.callCount;
            expect(callCount).toBe(1);
            expect(args).toHaveLength(1);
            expect(args[0]).toBe(UID);
            done();
          })
        );
      });
    });

    describe('should delete message on invalid uid', () => {
      function Message(type: any, onDel?: Function) {
        if (typeof type === 'function') {
          onDel = type;
          type = 'primaryEmailChanged';
        }
        return {
          event: type,
          uid: 'notahexuid',
          del: onDel,
        };
      }

      it('invalid uid', (done) => {
        events.onData(
          Message(function () {
            expect(true).toBe(true); // message.del() should be called
          })
        );

        mock.log('events', function (record: any) {
          if (
            record.levelname === 'WARN' &&
            record.args[0] === 'getUserId'
          ) {
            expect(record.args[1].userId).toBe('notahexuid');
            setTimeout(function () {
              done();
            }, 1);
            return true;
          }
          return false;
        });
      });
    });
  });

  describe('onProfileDataChanged', () => {
    describe('should invalidate user cache', () => {
      function Message(type: any, onDel?: Function) {
        if (typeof type === 'function') {
          onDel = type;
          type = 'profileDataChange';
        }
        return {
          event: type,
          uid: UID,
          del: onDel,
        };
      }
      beforeEach(() => {
        Server.server.methods.profileCache.drop = sinon.spy(function (
          _uid: string
        ) {
          return P.resolve([]);
        });
      });

      it('invalidate cache', (done) => {
        events.onData(
          Message(function () {
            var args =
              Server.server.methods.profileCache.drop.getCall(0).args;
            var callCount =
              Server.server.methods.profileCache.drop.callCount;
            expect(callCount).toBe(1);
            expect(args).toHaveLength(1);
            expect(args[0]).toBe(UID);
            done();
          })
        );
      });
    });

    describe('should delete message on invalid uid', () => {
      function Message(type: any, onDel?: Function) {
        if (typeof type === 'function') {
          onDel = type;
          type = 'profileDataChange';
        }
        return {
          event: type,
          uid: 'notahexuid',
          del: onDel,
        };
      }

      it('invalid uid', (done) => {
        events.onData(
          Message(function () {
            expect(true).toBe(true); // message.del() should be called
          })
        );

        mock.log('events', function (record: any) {
          if (
            record.levelname === 'WARN' &&
            record.args[0] === 'getUserId'
          ) {
            expect(record.args[1].userId).toBe('notahexuid');
            setTimeout(function () {
              done();
            }, 1);
            return true;
          }
          return false;
        });
      });
    });
  });
});
