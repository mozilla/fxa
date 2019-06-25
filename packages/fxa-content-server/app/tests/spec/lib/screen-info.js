/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the screen-info module

import chai from 'chai';
import ScreenInfo from 'lib/screen-info';
import WindowMock from '../../mocks/window';

var assert = chai.assert;

describe('lib/screen-info', function() {
  var windowMock;
  var screenInfo;

  beforeEach(function() {
    windowMock = new WindowMock();
  });

  afterEach(function() {
    screenInfo = null;
  });

  describe('devicePixelRatio', function() {
    it('is set to the device pixel ration, if supported', function() {
      windowMock.devicePixelRatio = 2;
      screenInfo = new ScreenInfo(windowMock);

      assert.equal(screenInfo.devicePixelRatio, 2);
    });

    it('is set to `none` if not supported', function() {
      delete windowMock.devicePixelRatio;
      screenInfo = new ScreenInfo(windowMock);

      assert.equal(screenInfo.devicePixelRatio, 'none');
    });
  });

  describe('clientWidth', function() {
    it("is set to the documentElement's clientWidth, if supported", function() {
      windowMock.document.documentElement = {
        clientWidth: 1033,
      };
      screenInfo = new ScreenInfo(windowMock);

      assert.equal(screenInfo.clientWidth, 1033);
    });

    it('is set to `none` if not supported', function() {
      delete windowMock.document.documentElement;
      screenInfo = new ScreenInfo(windowMock);

      assert.equal(screenInfo.clientWidth, 'none');
    });
  });

  describe('clientHeight', function() {
    it("is set to the documentElement's clientHeight, if supported", function() {
      windowMock.document.documentElement = {
        clientHeight: 966,
      };
      screenInfo = new ScreenInfo(windowMock);

      assert.equal(screenInfo.clientHeight, 966);
    });

    it('is set to `none` if not supported', function() {
      delete windowMock.document.documentElement;
      screenInfo = new ScreenInfo(windowMock);

      assert.equal(screenInfo.clientHeight, 'none');
    });
  });

  describe('screenWidth', function() {
    it("is set to the screen's width, if supported", function() {
      windowMock.screen = {
        width: 1033,
      };
      screenInfo = new ScreenInfo(windowMock);

      assert.equal(screenInfo.screenWidth, 1033);
    });

    it('is set to `none` if not supported', function() {
      delete windowMock.screen;
      screenInfo = new ScreenInfo(windowMock);

      assert.equal(screenInfo.screenWidth, 'none');
    });
  });

  describe('screenHeight', function() {
    it("is set to the screen's height, if supported", function() {
      windowMock.screen = {
        height: 966,
      };
      screenInfo = new ScreenInfo(windowMock);

      assert.equal(screenInfo.screenHeight, 966);
    });

    it('is set to `none` if not supported', function() {
      delete windowMock.screen;
      screenInfo = new ScreenInfo(windowMock);

      assert.equal(screenInfo.screenHeight, 'none');
    });
  });
});
