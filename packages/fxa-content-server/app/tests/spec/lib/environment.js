/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const chai = require('chai');
  const Environment = require('lib/environment');
  const sinon = require('sinon');
  const WindowMock = require('../../mocks/window');

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
        windowMock.navigator.mediaDevices = null;
        delete windowMock.navigator.mediaDevices;

        windowMock.navigator.getUserMedia = null;
        delete windowMock.navigator.getUserMedia;
      });


      it('returns `true` if UA supports mediaDevices', function () {
        windowMock.navigator.mediaDevices = {
          getUserMedia: sinon.spy()
        };

        assert.isTrue(environment.hasGetUserMedia());
      });

      it('returns `true` if UA supports getUserMedia', function () {
        windowMock.navigator.getUserMedia = sinon.spy();

        assert.isTrue(environment.hasGetUserMedia());
      });

      it('returns `true` if UA supports webkitGetUserMedia', function () {
        windowMock.navigator.webkitGetUserMedia = sinon.spy();

        assert.isTrue(environment.hasGetUserMedia());
      });

      it('returns `true` if UA supports mozGetUserMedia', function () {
        windowMock.navigator.mozGetUserMedia = sinon.spy();

        assert.isTrue(environment.hasGetUserMedia());
      });

      it('returns `true` if UA supports msGetUserMedia', function () {
        windowMock.navigator.msGetUserMedia = sinon.spy();

        assert.isTrue(environment.hasGetUserMedia());
      });

      it('returns false otw', function () {
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

    describe('isAboutAccounts', function () {
      it('returns `true` if `remote` framed', function () {
        windowMock.top = new WindowMock();
        windowMock.name = 'remote';
        assert.isTrue(environment.isAboutAccounts());
      });

      it('returns `false` if name is not remote', function () {
        windowMock.top = new WindowMock();
        windowMock.name = undefined;
        assert.isFalse(environment.isAboutAccounts());

        windowMock.name = '';
        assert.isFalse(environment.isAboutAccounts());
      });

      it('returns `true` if query param used', function () {
        windowMock.top = new WindowMock();
        windowMock.name = undefined;
        windowMock.location.search = '?service=sync&forceAboutAccounts=true';
        assert.isTrue(environment.isAboutAccounts());
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

    describe('isFxiOS10OrAbove', function () {
      it('returns `false` if on Fx 10 or above, false otw', function () {
        assert.isFalse(environment.isFxiOS10OrAbove('FxiOS/9.0'));
        assert.isTrue(environment.isFxiOS10OrAbove('FxiOS/10.0'));
        assert.isTrue(environment.isFxiOS10OrAbove('FxiOS/11.0'));
        assert.isFalse(environment.isFxiOS('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:40.0) Gecko/20100101 Firefox/40.0'));
      });
    });

    describe('isFx57OrAbove', () => {
      it('returns `true` if Fx Desktop 57 or above', () => {
        assert.isTrue(environment.isFx57OrAbove('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:57.0) Gecko/20100101 Firefox/57.0'));
        assert.isTrue(environment.isFx57OrAbove('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:58.0) Gecko/20100101 Firefox/58.0'));
        assert.isTrue(environment.isFx57OrAbove('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:101.0) Gecko/20100101 Firefox/101.0'));
        assert.isTrue(environment.isFx57OrAbove('Mozilla/5.0 (Windows NT x.y; WOW64; rv:101.0) Gecko/20100101 Firefox/101.0'));
      });

      it('returns `true` if Fx for Android 57 or above', () => {
        assert.isTrue(environment.isFx57OrAbove('Mozilla/5.0 (Android 4.4; Mobile; rv:57.0) Gecko/57.0 Firefox/57.0'));
        assert.isTrue(environment.isFx57OrAbove('Mozilla/5.0 (Android 4.4; Mobile; rv:57.0) Gecko/58.0 Firefox/58.0'));
        assert.isTrue(environment.isFx57OrAbove('Mozilla/5.0 (Android 4.4; Mobile; rv:57.0) Gecko/999.0 Firefox/999.0'));
      });

      it('returns `false` otw', () => {
        assert.isFalse(environment.isFx57OrAbove('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:40.0) Gecko/20100101 Firefox/40.0'));
        assert.isFalse(environment.isFx57OrAbove('Mozilla/5.0 (Windows NT x.y; WOW64; rv:10.0) Gecko/20100101 Firefox/10.0'));
        assert.isFalse(environment.isFx57OrAbove('Mozilla/5.0 (Android; Mobile; rv:40.0) Gecko/40.0 Firefox/40.0'));
        assert.isFalse(environment.isFx57OrAbove('Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0'));
        assert.isFalse(environment.isFx57OrAbove('Mozilla/5.0 (Android 4.4; Mobile; rv:56.0) Gecko/56.0 Firefox/56.0'));
        assert.isFalse(environment.isFx57OrAbove(
          'Mozilla/5.0 (iPod touch; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4'));
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

