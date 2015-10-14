/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'lib/environment',
  '../../mocks/router',
  '../../mocks/window',
  'sinon',
  'views/app'
], function (chai, Environment, RouterMock, WindowMock, sinon, AppView) {
  'use strict';

  var assert = chai.assert;

  describe('views/app', function () {
    var environment;
    var router;
    var view;
    var windowMock;

    describe('onAnchorClick', function () {
      var event;

      beforeEach(function () {
        router = new RouterMock();
        windowMock = new WindowMock();
        environment = new Environment(windowMock);

        view = new AppView({
          environment: environment,
          router: router,
          window: windowMock
        });

        $('#container').empty().append('<a href="/signup">Sign up</a>');

        event = $.Event('click');
        event.currentTarget = $('a[href="/signup"]');
        sinon.spy(router, 'navigate');
      });

      function testNoNavigation() {
        view.onAnchorClick(event);
        assert.isFalse(router.navigate.called);
      }

      function setUpIFrameLink() {
        sinon.stub(environment, 'isFramed', function () {
          return true;
        });
        event.currentTarget = $('<a href="/legal/xyz">Legal Pages</a>');
      }

      it('does nothing if the event\'s default is prevented', function () {
        sinon.stub(event, 'isDefaultPrevented', function () {
          return true;
        });

        testNoNavigation();
      });

      it('does nothing if the the alt key is depressed during click', function () {
        event.altKey = true;

        testNoNavigation();
      });

      it('does nothing if the the ctrl key is depressed during click', function () {
        event.ctrlKey = true;

        testNoNavigation();
      });

      it('does nothing if the the meta key is depressed during click', function () {
        event.metaKey = true;

        testNoNavigation();
      });

      it('does nothing if the the shift key is depressed during click', function () {
        event.shiftKey = true;

        testNoNavigation();
      });

      it('does not call navigate if inside an iframe', function () {
        setUpIFrameLink();

        testNoNavigation();
      });

      it('opens a new window if inside an iframe', function () {
        setUpIFrameLink();

        sinon.spy(windowMock, 'open');
        view.onAnchorClick(event);
        assert.isTrue(windowMock.open.called);
      });

      it('navigates otherwise', function () {
        view.onAnchorClick(event);

        assert.isTrue(router.navigate.calledWith('signup'));
      });
    });
  });
});
