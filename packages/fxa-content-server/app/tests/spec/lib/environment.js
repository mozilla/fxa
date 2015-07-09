/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  'lib/environment',
  '../../mocks/window'
], function (chai, sinon, Environment, WindowMock) {
  'use strict';

  var assert = chai.assert;

  describe('lib/environment', function () {
    var environment;
    var windowMock;

    beforeEach(function () {
      windowMock = new WindowMock();
      environment = new Environment(windowMock);
    });

    describe('hasTouchEvents', function () {
      it('return `true` if the UA supports touch events', function () {
        windowMock.ontouchstart = true;
        windowMock.DocumentTouch = windowMock.document;

        assert.isTrue(environment.hasTouchEvents());
      });

      it('returns `false` if the UA does not support touch events', function () {
        assert.isFalse(environment.hasTouchEvents());
      });
    });

    describe('hasPasswordRevealer', function () {
      it('returns `true` if the UA has its own password revealer (IE >= 10)', function () {
        windowMock.document.documentMode = 10;

        assert.isTrue(environment.hasPasswordRevealer());
      });

      it('returns `false` if UA has no password revealer', function () {
        assert.isFalse(environment.hasPasswordRevealer());
      });
    });

    describe('hasGetUserMedia', function () {
      beforeEach(function () {
        windowMock.navigator.getUserMedia = null;
        delete windowMock.navigator.getUserMedia;
      });


      it('adds `getusermedia` if UA supports getUserMedia', function () {
        windowMock.navigator.getUserMedia = sinon.spy();

        assert.isTrue(environment.hasGetUserMedia());
      });

      it('adds `getusermedia` if UA supports webkitGetUserMedia', function () {
        windowMock.navigator.webkitGetUserMedia = sinon.spy();

        assert.isTrue(environment.hasGetUserMedia());
      });

      it('adds `getusermedia` if UA supports mozGetUserMedia', function () {
        windowMock.navigator.mozGetUserMedia = sinon.spy();

        assert.isTrue(environment.hasGetUserMedia());
      });

      it('adds `getusermedia` if UA supports msGetUserMedia', function () {
        windowMock.navigator.msGetUserMedia = sinon.spy();

        assert.isTrue(environment.hasGetUserMedia());
      });

      it('adds `no-getusermedia` if UA does not support getUserMedia', function () {
        assert.isFalse(environment.hasGetUserMedia());
      });
    });

    describe('isFramed', function () {
      it('returns `true` if window is iframed', function () {
        windowMock.top = new WindowMock();

        assert.isTrue(environment.isFramed());
      });

      it('returns `false` if window is not iframed', function () {
        assert.isFalse(environment.isFramed());
      });

      it('returns `false` if the window\'s name is `remote`', function () {
        // `name=remote` is used by `about:accounts` by Fx Desktop. Do not
        // consider this framed.
        windowMock.top = new WindowMock();
        windowMock.name = 'remote';
        assert.isFalse(environment.isFramed());
      });

      it('returns `false` if the window\'s name is `payflow`', function () {
        // `name=payflow` is used by Marketplace on Fx for Android during
        // the Reset PIN flow. Do not consider this framed.
        windowMock.top = new WindowMock();
        windowMock.name = 'payflow';
        assert.isFalse(environment.isFramed());
      });
    });

    describe('isFxiOS', function () {
      it('returns `true` if on Fx for iOS', function () {
        windowMock.navigator.userAgent = 'FxiOS/1.0';

        assert.isTrue(environment.isFxiOS());
      });

      it('returns `false` if not on Fx for iOS', function () {
        windowMock.navigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:40.0) Gecko/20100101 Firefox/40.0';

        assert.isFalse(environment.isFxiOS());
      });
    });

    describe('hasSendBeacon', function () {
      it('returns `true` if sendBeacon function exists', function () {
        windowMock.navigator.sendBeacon = function () {};
        assert.isTrue(environment.hasSendBeacon());
      });

      it('returns `false` if sendBeacon is undefined', function () {
        windowMock.navigator.sendBeacon = undefined;
        assert.isFalse(environment.hasSendBeacon());
      });
    });
  });
});

