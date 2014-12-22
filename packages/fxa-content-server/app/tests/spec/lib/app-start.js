/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'lib/app-start',
  'lib/session',
  'lib/constants',
  'lib/promise',
  'models/auth_brokers/base',
  'models/user',
  '../../mocks/window',
  '../../mocks/router',
  '../../mocks/history'
],
function (chai, sinon, AppStart, Session, Constants, p,
      NullBroker, User, WindowMock, RouterMock, HistoryMock) {
  /*global describe, beforeEach, it*/
  var assert = chai.assert;

  describe('lib/app-start', function () {
    var windowMock;
    var routerMock;
    var historyMock;
    var brokerMock;
    var userMock;
    var appStart;

    beforeEach(function () {
      windowMock = new WindowMock();
      routerMock = new RouterMock();
      historyMock = new HistoryMock();
      brokerMock = new NullBroker();
      userMock = new User();

      appStart = new AppStart({
        window: windowMock,
        router: routerMock,
        history: historyMock,
        user: userMock,
        broker: brokerMock
      });
    });

    describe('startApp', function () {
      it('starts the app', function () {
        return appStart.startApp()
                    .then(function () {
                      // translator is put on the global object.
                      assert.ok(windowMock.translator);
                    });
      });

      it('redirects to /cookies_disabled if localStorage is disabled', function () {
        appStart.useConfig({
          localStorageEnabled: false,
          i18n: {
            supportedLanguages: ['en'],
            defaultLang: 'en'
          }
        });

        return appStart.startApp()
            .then(function () {
              assert.equal(routerMock.page, 'cookies_disabled');
            });
      });

      it('does not redirect if at /cookies_disabled and cookies are disabled', function () {
        windowMock.location.pathname = '/cookies_disabled';
        appStart.useConfig({
          localStorageEnabled: false,
          i18n: {
            supportedLanguages: ['en'],
            defaultLang: 'en'
          }
        });

        sinon.spy(routerMock, 'navigate');

        return appStart.startApp()
          .then(function () {
            assert.isFalse(routerMock.navigate.called);
          });
      });

      it('redirects to the start page specified by the broker', function () {
        sinon.stub(brokerMock, 'selectStartPage', function () {
          return p('settings');
        });

        return appStart.startApp()
            .then(function () {
              assert.equal(routerMock.page, 'settings');
            });
      });

      it('does not redirect if the broker does not return a start page', function () {
        sinon.stub(brokerMock, 'selectStartPage', function () {
          return p();
        });

        routerMock.page = 'signup';
        return appStart.startApp()
            .then(function () {
              assert.equal(routerMock.page, 'signup');
            });
      });

      it('redirects to the `INTERNAL_ERROR_PAGE` if an error occurs', function () {
        sinon.stub(brokerMock, 'selectStartPage', function () {
          return p.reject(new Error('boom!'));
        });

        return appStart.startApp()
            .then(function () {
              assert.equal(windowMock.location.href, Constants.INTERNAL_ERROR_PAGE);
            });
      });

      it('updates old sessions', function () {
        sinon.stub(userMock, 'upgradeFromSession', function () {
        });

        return appStart.startApp()
                    .then(function () {
                      assert.ok(userMock.upgradeFromSession.calledOnce);
                    });
      });
    });
  });
});


