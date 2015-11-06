/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var Environment = require('lib/environment');
  var sinon = require('sinon');
  var StartupStyles = require('head/startup-styles');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('head/startup-styles', function () {
    var startupStyles;
    var windowMock;
    var environment;

    beforeEach(function () {
      windowMock = new WindowMock();
      environment = new Environment(windowMock);

      startupStyles = new StartupStyles({
        environment: environment,
        window: windowMock
      });
    });

    describe('addTouchEventStyles', function () {
      it('adds `touch` if the UA supports touch events', function () {
        sinon.stub(environment, 'hasTouchEvents', function () {
          return true;
        });

        startupStyles.addTouchEventStyles();
        assert.isTrue(/touch/.test(startupStyles.getClassName()));
        assert.isFalse(/no-touch/.test(startupStyles.getClassName()));
      });

      it('adds `no-touch` if the UA does not support touch events', function () {
        sinon.stub(environment, 'hasTouchEvents', function () {
          return false;
        });

        startupStyles.addTouchEventStyles();
        assert.isTrue(/no-touch/.test(startupStyles.getClassName()));
      });
    });

    describe('addPasswordRevealerStyles', function () {
      it('adds `reveal-pw` if the UA has its own password revealer', function () {
        sinon.stub(environment, 'hasPasswordRevealer', function () {
          return true;
        });

        startupStyles.addPasswordRevealerStyles();
        assert.isTrue(/reveal-pw/.test(startupStyles.getClassName()));
        assert.isFalse(/no-reveal-pw/.test(startupStyles.getClassName()));
      });

      it('adds `no-reveal-pw` if UA has no password revealer', function () {
        sinon.stub(environment, 'hasPasswordRevealer', function () {
          return false;
        });

        startupStyles.addPasswordRevealerStyles();
        assert.isTrue(/no-reveal-pw/.test(startupStyles.getClassName()));
      });
    });

    describe('addIframeStyles', function () {
      it('adds `iframe` if window is iframed and not framed by browser chrome', function () {
        sinon.stub(environment, 'isFramed', function () {
          return true;
        });

        startupStyles.addIframeStyles();
        assert.isTrue(/iframe/.test(startupStyles.getClassName()));
      });

      it('does not add `iframe` if window is not iframed', function () {
        sinon.stub(environment, 'isFramed', function () {
          return false;
        });

        startupStyles.addIframeStyles();
        assert.isFalse(/iframe/.test(startupStyles.getClassName()));
      });
    });

    describe('addSearchParamStyles', function () {
      it('adds the `chromeless` style if service=sync&context=iframe', function () {
        windowMock.location.search = '?style=chromeless&service=sync&context=iframe';

        startupStyles.addSearchParamStyles();
        assert.isTrue(/chromeless/.test(startupStyles.getClassName()));
      });

      it('does not add the `chromeless` style if not allowed', function () {
        windowMock.location.search = '?style=chromeless&service=sync';

        startupStyles.addSearchParamStyles();
        assert.isFalse(/chromeless/.test(startupStyles.getClassName()));
      });

      it('does not add the `chromeless` style if no style specified', function () {
        startupStyles.addSearchParamStyles();
        assert.isFalse(/chromeless/.test(startupStyles.getClassName()));
      });
    });

    describe('addFxiOSSyncStyles', function () {
      it('adds the `fx-ios-sync` style if service=sync and on Fx for iOS', function () {
        windowMock.location.search = '?service=sync';
        sinon.stub(environment, 'isFxiOS', function () {
          return true;
        });

        startupStyles.addFxiOSSyncStyles();
        assert.isTrue(/fx-ios-sync/.test(startupStyles.getClassName()));
      });

      it('does not add `fx-ios-sync` style if service!==sync', function () {
        windowMock.location.search = '?service=not-sync';
        sinon.stub(environment, 'isFxiOS', function () {
          return true;
        });

        startupStyles.addFxiOSSyncStyles();
        assert.isFalse(/fx-ios-sync/.test(startupStyles.getClassName()));
      });

      it('does not add `fx-ios-sync` style if service=sync and not on Fx for iOS', function () {
        windowMock.location.search = '?service=not-sync';
        sinon.stub(environment, 'isFxiOS', function () {
          return false;
        });

        startupStyles.addFxiOSSyncStyles();
        assert.isFalse(/fx-ios-sync/.test(startupStyles.getClassName()));
      });
    });

    describe('addGetUserMediaStyles', function () {
      it('adds `getusermedia` if UA supports getUserMedia', function () {
        sinon.stub(environment, 'hasGetUserMedia', function () {
          return true;
        });

        startupStyles.addGetUserMediaStyles();
        assert.isTrue(/getusermedia/.test(startupStyles.getClassName()));
        assert.isFalse(/no-getusermedia/.test(startupStyles.getClassName()));
      });

      it('adds `no-getusermedia` if UA does not support getUserMedia', function () {
        sinon.stub(environment, 'hasGetUserMedia', function () {
          return false;
        });

        startupStyles.addGetUserMediaStyles();
        assert.isTrue(/no-getusermedia/.test(startupStyles.getClassName()));
      });
    });


    describe('initialize', function () {
      it('runs all the tests', function () {
        startupStyles.initialize();
      });
    });
  });
});

