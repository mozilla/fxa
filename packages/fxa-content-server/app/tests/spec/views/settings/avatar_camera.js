/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'jquery',
  'sinon',
  'views/settings/avatar_camera',
  '../../../mocks/router',
  '../../../mocks/window',
  '../../../mocks/canvas',
  '../../../mocks/profile',
  '../../../lib/helpers',
  'models/user',
  'models/reliers/relier',
  'models/auth_brokers/base',
  'lib/promise',
  'lib/metrics'
],
function (chai, $, sinon, View, RouterMock, WindowMock, CanvasMock,
    ProfileMock, TestHelpers, User, Relier, AuthBroker, p, Metrics) {
  'use strict';

  var assert = chai.assert;
  var SCREEN_NAME = 'settings.avatar.camera';

  describe('views/settings/avatar/camera', function () {
    var view;
    var routerMock;
    var windowMock;
    var profileClientMock;
    var user;
    var account;
    var relier;
    var broker;
    var metrics;

    beforeEach(function () {
      routerMock = new RouterMock();
      windowMock = new WindowMock();
      user = new User();
      relier = new Relier();
      broker = new AuthBroker({
        relier: relier
      });
      metrics = new Metrics();

      view = new View({
        router: routerMock,
        user: user,
        window: windowMock,
        relier: relier,
        broker: broker,
        metrics: metrics,
        screenName: SCREEN_NAME
      });

      account = user.initAccount({
        email: 'a@a.com',
        accessToken: 'abc123',
        verified: true
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      routerMock = null;
      windowMock = null;
      profileClientMock = null;
    });

    describe('with no session', function () {
      it('redirects to signin', function () {
        return view.render()
            .then(function () {
              assert.equal(routerMock.page, 'signin');
            });
      });
    });

    describe('with session', function () {
      beforeEach(function () {
        view.isUserAuthorized = function () {
          return p(true);
        };
        sinon.stub(view, 'getSignedInAccount', function () {
          return account;
        });
      });

      it('initializes', function () {
        return view.render()
          .then(function () {
            assert.equal(view.video.length, 1);
            assert.isFalse(view.streaming);
          });
      });

      it('error getting stream', function (done) {
        windowMock.navigator._error = true;
        view.render()
          .then(function () {
            windowMock.on('stream', function () {
              assert.isTrue(view.isErrorVisible());
              done();
            });
          })
          .fail(done);
      });

      it('no browser support', function () {
        windowMock.navigator.getUserMedia = null;

        sinon.spy(view, 'navigate');

        return view.render()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('settings/avatar/change'));
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
        profileClientMock = new ProfileMock();

        view = new View({
          router: routerMock,
          user: user,
          window: windowMock,
          relier: relier,
          broker: broker,
          metrics: metrics,
          screenName: SCREEN_NAME,
          displayLength: 240,
          exportLength: 600
        });

        view.isUserAuthorized = function () {
          return p(true);
        };

        sinon.stub(view, 'getSignedInAccount', function () {
          return account;
        });

        sinon.stub(account, 'profileClient', function () {
          return p(profileClientMock);
        });

        sinon.stub(profileClientMock, 'uploadAvatar', function () {
          return p({
            url: 'test',
            id: 'foo'
          });
        });

        sinon.stub(view, 'updateProfileImage', function () {
          return p();
        });

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
              view.submit()
                .done(function (result) {
                  assert.isTrue(stopped, 'stream stopped');
                  assert.ok(! view.stream, 'stream is gone');
                  assert.equal(result.url, 'test');
                  assert.equal(result.id, 'foo');
                  assert.isTrue(view.updateProfileImage.called);
                  assert.equal(view.updateProfileImage.args[0][0].get('url'), result.url);
                  assert.equal(view.updateProfileImage.args[0][1], account);
                  assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.avatar.camera.submit.new'));

                  // check canvas drawImage args
                  assert.equal(view.canvas._context._args[0], view.video[0]);
                  assert.equal(view.canvas._context._args[7], view.exportLength);
                  assert.equal(view.canvas._context._args[8], view.exportLength);

                  assert.equal(routerMock.page, 'settings');
                  done();
                }, done);
            });

          })
          .fail(done);
      });

      it('tracks new and change events for avatars', function (done) {
        profileClientMock = new ProfileMock();

        sinon.stub(account, 'profileClient', function () {
          return p(profileClientMock);
        });

        sinon.stub(view, 'updateProfileImage', function () {
          return p();
        });

        function mockStream() {
          view.stream = {
            stop: function () {}
          };
        }

        view.render()
          .then(function () {
            mockStream();
            return view.submit();
          })
          .then(function () {
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.avatar.camera.submit.new'));
            assert.isFalse(TestHelpers.isEventLogged(metrics, 'settings.avatar.camera.submit.change'));
            mockStream();
            account.set('hadProfileImageSetBefore', true);

            return view.submit();
          })
          .done(function () {
            assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.avatar.camera.submit.change'));
            done();
          }, done);
      });

    });
  });
});
