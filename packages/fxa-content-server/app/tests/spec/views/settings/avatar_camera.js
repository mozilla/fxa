/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'views/settings/avatar_camera',
  '../../../mocks/router',
  '../../../mocks/window',
  '../../../mocks/canvas',
  'lib/session',
  'lib/constants',
  'lib/auth-errors',
  'lib/fxa-client',
  'models/reliers/relier'
],
function (chai, _, $, View, RouterMock, WindowMock, CanvasMock, Session,
      Constants, AuthErrors, FxaClient, Relier) {
  var assert = chai.assert;

  describe('views/settings/avatar/camera', function () {
    var view;
    var routerMock;
    var windowMock;
    var fxaClient;
    var relier;

    beforeEach(function () {
      routerMock = new RouterMock();
      windowMock = new WindowMock();
      relier = new Relier();
      fxaClient = new FxaClient({
        relier: relier
      });

      view = new View({
        router: routerMock,
        window: windowMock,
        fxaClient: fxaClient,
        relier: relier
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      routerMock = null;
    });

    describe('with no session', function () {
      it('redirects to signin', function() {
        return view.render()
            .then(function () {
              assert.equal(routerMock.page, 'signin');
            });
      });
    });

    describe('with session', function () {
      beforeEach(function () {
        view.isUserAuthorized = function () {
          return true;
        };
      });

      it('initializes', function () {
        return view.render()
          .then(function () {
            assert.equal(view.video.length, 1);
            assert.equal(view.img.length, 1);
            assert.ok(view.canvas);
            assert.isFalse(view.streaming);
          });
      });

      it('error getting stream', function (done) {
        windowMock.navigator._error = true;
        view.render()
          .then(function () {
            windowMock.on('stream', function () {
              assert.isTrue(view._isErrorVisible);
              done();
            });
          })
          .fail(done);
      });

      it('no browser support', function () {
        delete windowMock.navigator.getUserMedia;
        return view.render()
          .then(function () {
            assert.isTrue(view._isErrorVisible);
          });
      });

      it('starts streaming', function (done) {
        view.render()
          .then(function () {
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent('canplay', true, true);

            windowMock.on('stream', function () {
              view.video[0].dispatchEvent(ev);
              assert.ok(view.stream, 'stream is set');
              assert.isTrue(view.streaming, 'is streaming');
              done();
            });
          })
          .fail(done);
      });

      it('centered position is accurate', function () {
        var pos = view.centeredPos(600, 300, 200);
        assert.equal(pos.left, -200);
        assert.equal(pos.top, 0);
      });

      it('centered position is accurate for portrait', function () {
        var pos = view.centeredPos(300, 600, 200);
        assert.equal(pos.top, -200);
        assert.equal(pos.left, 0);
      });

      it('submits', function (done) {
        view = new View({
          router: routerMock,
          window: windowMock,
          displayLength: 240,
          exportLength: 600,
          fxaClient: fxaClient,
          relier: relier
        });

        view.isUserAuthorized = function () {
          return true;
        };

        view.render()
          .then(function () {
            view.canvas = new CanvasMock();

            var ev = document.createEvent('HTMLEvents');
            ev.initEvent('canplay', true, true);

            windowMock.on('stream', function () {
              var stopped = false;

              view.video[0].dispatchEvent(ev);
              assert.ok(view.stream, 'stream is set');

              view.stream.stop = function () {
                stopped = true;
              };

              view.submit();

              assert.isTrue(stopped);
              assert.ok(! view.stream);
              assert.ok(Session.avatar, 'avatar is set');

              // check canvas drawImage args
              assert.equal(view.canvas._context._args[0], view.video[0]);
              assert.equal(view.canvas._context._args[7], view.exportLength);
              assert.equal(view.canvas._context._args[8], view.exportLength);
            });

            routerMock.on('navigate', function () {
              assert.equal(routerMock.page, 'settings/avatar');
              done();
            });
          })
          .fail(done);
      });

    });
  });
});


