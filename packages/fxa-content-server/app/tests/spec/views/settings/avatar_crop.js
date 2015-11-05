/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* exceptsPaths: draggable, jquery-simulate */
define([
  'chai',
  'jquery',
  'draggable',
  'sinon',
  'jquery-simulate',
  'views/settings/avatar_crop',
  '../../../mocks/router',
  '../../../mocks/profile',
  'lib/channels/notifier',
  'models/user',
  'models/cropper-image',
  'models/reliers/relier',
  'models/auth_brokers/base',
  'lib/promise',
  'lib/ephemeral-messages',
  'lib/auth-errors',
  'lib/metrics',
  '../../../lib/helpers'
],
function (chai, $, ui, sinon, jQuerySimulate, View, RouterMock, ProfileMock,
  Notifier, User, CropperImage, Relier, AuthBroker, p,
  EphemeralMessages, AuthErrors, Metrics, TestHelpers) {
  'use strict';

  var assert = chai.assert;
  var pngSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACZJREFUeNrtwQEBAAAAgiD' +
               '/r25IQAEAAAAAAAAAAAAAAAAAAADvBkCAAAEehacTAAAAAElFTkSuQmCC';

  describe('views/settings/avatar/crop', function () {
    var account;
    var broker;
    var ephemeralMessages;
    var metrics;
    var notifier;
    var profileClientMock;
    var relier;
    var routerMock;
    var user;
    var view;

    beforeEach(function () {
      ephemeralMessages = new EphemeralMessages();
      metrics = new Metrics();
      notifier = new Notifier();
      relier = new Relier();
      routerMock = new RouterMock();
      user = new User();

      broker = new AuthBroker({
        relier: relier
      });

      view = new View({
        broker: broker,
        ephemeralMessages: ephemeralMessages,
        notifier: notifier,
        relier: relier,
        router: routerMock,
        user: user
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      metrics.destroy();
      view = null;
      routerMock = null;
      profileClientMock = null;
      metrics = null;
    });

    describe('with session', function () {
      beforeEach(function () {
        view.isUserAuthorized = function () {
          return p(true);
        };
        account = user.initAccount({
          accessToken: 'abc123',
          email: 'a@a.com',
          verified: true
        });
        sinon.stub(view, 'getSignedInAccount', function () {
          return account;
        });
      });

      it('has no cropper image', function () {
        return view.render()
          .then(function () {
            assert.equal(routerMock.page, 'settings/avatar/change');
            assert.equal(ephemeralMessages.get('error'), AuthErrors.toMessage('UNUSABLE_IMAGE'));
          });
      });

      describe('with an image', function () {

        beforeEach(function () {
          var cropImg = new CropperImage({
            height: 100,
            src: pngSrc,
            type: 'image/png',
            width: 100
          });

          profileClientMock = new ProfileMock();
          ephemeralMessages.set('data', {
            cropImg: cropImg
          });

          view = new View({
            ephemeralMessages: ephemeralMessages,
            metrics: metrics,
            notifier: notifier,
            relier: relier,
            router: routerMock,
            user: user
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
          sinon.stub(view, 'updateProfileImage', function () {
            return p();
          });
        });

        it('has a cropper image', function () {
          return view.render()
            .then(function (rendered) {
              assert.isTrue(rendered);

              view.afterVisible();

              assert.equal(view.$('.cropper img').attr('src'), pngSrc);
            });
        });

        it('submits an image', function () {
          sinon.stub(profileClientMock, 'uploadAvatar', function () {
            return p({
              id: 'foo',
              url: 'test'
            });
          });

          return view.render()
            .then(function () {
              return view.afterVisible();
            })
            .then(function () {
              return view.submit();
            })
            .then(function (result) {
              assert.equal(view.updateProfileImage.args[0][0].get('url'), result.url);
              assert.equal(view.updateProfileImage.args[0][1], account);
              assert.equal(result.url, 'test');
              assert.equal(result.id, 'foo');
              assert.equal(routerMock.page, 'settings');
              assert.isTrue(TestHelpers.isEventLogged(metrics,
                'settings.avatar.crop.submit.new'));
              assert.isFalse(TestHelpers.isEventLogged(metrics,
                'settings.avatar.gravatar.submit.change'));
            });
        });

        it('properly tracks avatar change events', function () {
          // set the account to have an existing profile image id
          account.set('hadProfileImageSetBefore', true);
          sinon.stub(profileClientMock, 'uploadAvatar', function () {
            return p({
              id: 'foo'
            });
          });

          return view.render()
            .then(function () {
              return view.afterVisible();
            })
            .then(function () {
              return view.submit();
            })
            .then(function () {
              assert.isTrue(TestHelpers.isEventLogged(metrics,
                'settings.avatar.crop.submit.change'));
              assert.isFalse(TestHelpers.isEventLogged(metrics,
                'settings.avatar.crop.submit.new'));
            });

        });

        it('logs a metric event on rotation', function () {
          return view.render()
            .then(function () {
              return view.afterVisible();
            })
            .then(function () {
              view.$('.controls > .rotate').click();
              assert.isTrue(TestHelpers.isEventLogged(metrics,
                'settings.avatar.crop.rotate.cw'));
            });
        });

        it('logs a metric event on translation', function () {
          return view.render()
            .then(function () {
              return view.afterVisible();
            })
            .then(function () {
              view.$('.cropper .ui-draggable').simulate('drag', { dx: 50, dy: 50 });
              assert.isTrue(TestHelpers.isEventLogged(metrics,
                'settings.avatar.crop.translate'));
            });
        });

        it('logs a metric event on zoom in', function () {
          return view.render()
            .then(function () {
              return view.afterVisible();
            })
            .then(function () {
              view.$('.controls > .zoom-in').click();
              assert.isTrue(TestHelpers.isEventLogged(metrics,
                'settings.avatar.crop.zoom.in'));
            });
        });

        it('logs a metric event on zoom out', function () {
          return view.render()
            .then(function () {
              return view.afterVisible();
            })
            .then(function () {
              view.$('.controls > .zoom-out').click();
              assert.isTrue(TestHelpers.isEventLogged(metrics,
                'settings.avatar.crop.zoom.out'));
            });
        });

        it('logs a metric event on zoom range change', function () {
          return view.render()
            .then(function () {
              return view.afterVisible();
            })
            .then(function () {
              view.$('.controls > .slider').change();
              assert.isTrue(TestHelpers.isEventLogged(metrics,
                'settings.avatar.crop.zoom.range'));
            });
        });
      });
    });
  });
});
