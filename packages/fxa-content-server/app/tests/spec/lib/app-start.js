/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'lib/app-start',
  'lib/session',
  '../../mocks/window',
  '../../mocks/router',
  '../../mocks/history'
],
function (chai, AppStart, Session, WindowMock, RouterMock, HistoryMock) {
  /*global describe, beforeEach, it*/
  var assert = chai.assert;

  describe('lib/start-app', function () {
    var windowMock;
    var routerMock;
    var historyMock;
    var appStart;

    beforeEach(function () {
      windowMock = new WindowMock();
      routerMock = new RouterMock();
      historyMock = new HistoryMock();

      appStart = new AppStart({
        window: windowMock,
        router: routerMock,
        history: historyMock
      });
    });

    describe('start', function () {
      it('start starts the app', function () {
        return appStart.startApp()
                    .then(function () {
                      assert.equal(Session.language, 'en-US');
                      assert.ok(Session.config);
                      assert.ok(Session.channel);

                      // translator is put on the global object.
                      assert.ok(windowMock.translator);
                    });
      });

      it('redirects to /cookies_disabled if cookies are disabled', function () {
        appStart.useConfig({
          cookiesEnabled: false,
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
    });
  });
});


