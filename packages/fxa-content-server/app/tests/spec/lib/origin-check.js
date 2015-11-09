/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var OriginCheck = require('lib/origin-check');
  var sinon = require('sinon');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('lib/origin-check', function () {
    var originCheck;
    var windowMock;
    var parentMock;

    function dispatchMessageEvent(target, message, origin) {
      target.trigger('message', {
        data: message,
        origin: origin
      });
    }

    beforeEach(function () {
      windowMock = new WindowMock();
      parentMock = new WindowMock();

      windowMock.parent = parentMock;

      originCheck = new OriginCheck({
        responseTimeoutMS: 100,
        window: windowMock
      });
    });

    describe('getOrigin', function () {
      it('queries all channels, returns `null` if no response', function () {
        sinon.spy(parentMock, 'postMessage');

        return originCheck.getOrigin(parentMock, ['http://origin1.org', 'http://origin2.org'])
          .then(function (origin) {
            assert.equal(parentMock.postMessage.callCount, 2);

            assert.equal(parentMock.postMessage.args[0][0], OriginCheck.stringify('ping'));
            assert.equal(parentMock.postMessage.args[0][1], 'http://origin1.org');
            assert.equal(parentMock.postMessage.args[1][1], 'http://origin2.org');

            assert.isNull(origin);
          });
      });

      it('returns `null` response received from non-allowed origin', function () {
        // synthesize a random origin sending a ping.
        setTimeout(function () {
          dispatchMessageEvent(
            windowMock,
            OriginCheck.stringify('ping'),
            'http://not-allowed.org'
          );
        }, 10);

        return originCheck.getOrigin(parentMock, ['http://origin1.org', 'http://origin2.org'])
          .then(function (origin) {
            assert.isNull(origin);
          });
      });

      it('returns origin of allowed origin', function () {
        sinon.stub(parentMock, 'postMessage', function (message, origin) {
          if (origin === 'http://origin2.org') {
            dispatchMessageEvent(
              windowMock,
              message,
              origin
            );
          }
        });

        return originCheck.getOrigin(parentMock, ['http://origin1.org', 'http://origin2.org'])
          .then(function (origin) {
            assert.equal(origin, 'http://origin2.org');
          });
      });
    });
  });
});

