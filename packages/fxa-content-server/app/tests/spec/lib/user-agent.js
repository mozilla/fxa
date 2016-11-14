/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const UserAgent = require('lib/user-agent');

  describe('lib/user-agent', () => {
    it('returns the original correct interface', () => {
      const uap = new UserAgent();

      assert.ok(uap.browser);
      assert.ok(uap.os);
      assert.isFunction(uap.isAndroid);
      assert.isFunction(uap.isIos);
      assert.isFunction(uap.isFirefox);
    });

    describe('isAndroid', () => {
      it('returns `true` if on Android', () => {
        const androidUserAgentStrings = [
          // chrome
          'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.35 ' +
          'Mobile Safari/537.36',
          // fx
          'Mozilla/5.0 (Android 4.4; Tablet; rv:46.0) Gecko/46.0 Firefox/46.0',
          // opera
          'Opera/12.02 (Android 4.1; Linux; Opera Mobi/ADR-1111101157; U; ' +
          'en-US) Presto/2.9.201 Version/12.02'
        ];

        androidUserAgentStrings.forEach((userAgentString) => {
          let uap = new UserAgent(userAgentString);
          assert.isTrue(uap.isAndroid());
        });
      });

      it('returns `false` if not on Android', () => {
        const notAndroidUserAgentStrings = [
          // chrome desktop
          'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/55.0.2883.35 Safari/537.36',
          // fx desktop
          'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:46.0) Gecko/20100101 Firefox/46.0',
          // fx ios
          'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) ' +
          'AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4'
        ];

        notAndroidUserAgentStrings.forEach((userAgentString) => {
          let uap = new UserAgent(userAgentString);
          assert.isFalse(uap.isAndroid());
        });
      });
    });

    describe('isIos', () => {
      it('returns `true` if on iOS', () => {
        const iosUserAgentStrings = [
          // fx
          'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) ' +
          'AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4',
          // chrome
          'Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/601.1 ' +
          '(KHTML, like Gecko) CriOS/55.0.2883.35 Mobile/13B143 Safari/601.1.46',
          // safari
          'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) ' +
          'AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B137 Safari/601.1'
        ];

        iosUserAgentStrings.forEach((userAgentString) => {
          let uap = new UserAgent(userAgentString);
          assert.isTrue(uap.isIos());
        });
      });

      it('returns `false` if not on iOS', () => {
        const notIosUserAgentStrings = [
          // chrome desktop
          'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/55.0.2883.35 Safari/537.36',
          // fx desktop
          'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:46.0) Gecko/20100101 Firefox/46.0',
          // fx android
          'Mozilla/5.0 (Android 4.4; Tablet; rv:46.0) Gecko/46.0 Firefox/46.0',
          // edge
          'Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia ' +
          '640 XL LTE) AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/42.0.2311.135 Mobile Safari/537.36 Edge/12.10166'
        ];

        notIosUserAgentStrings.forEach((userAgentString) => {
          let uap = new UserAgent(userAgentString);
          assert.isFalse(uap.isIos());
        });
      });
    });

    describe('isFirefox', () => {
      it('returns `true` if in Firefox', () => {
        const firefoxUserAgentStrings = [
          // android
          'Mozilla/5.0 (Android 4.4; Tablet; rv:46.0) Gecko/46.0 Firefox/46.0',
          // ios
          'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) ' +
          'AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4',
          // linux
          'Mozilla/5.0 (X11; Linux x86_64; rv:46.0) Gecko/20100101 Firefox/46.0',
          // mac
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:46.0) Gecko/20100101 Firefox/46.0',
          // windows
          'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:46.0) Gecko/20100101 Firefox/46.0'
        ];

        firefoxUserAgentStrings.forEach((userAgentString) => {
          let uap = new UserAgent(userAgentString);
          assert.isTrue(uap.isFirefox());
        });
      });

      it('returns `false` if not in Firefox', () => {
        const notFirefoxUserAgentStrings = [
          // Chrome desktop
          'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/55.0.2883.35 Safari/537.36',
          // Edge
          'Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia ' +
          '640 XL LTE) AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/42.0.2311.135 Mobile Safari/537.36 Edge/12.10166',
          // safari
          'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) ' +
          'AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B137 Safari/601.1'
        ];

        notFirefoxUserAgentStrings.forEach((userAgentString) => {
          let uap = new UserAgent(userAgentString);
          assert.isFalse(uap.isFirefox());
        });
      });
    });
  });
});
