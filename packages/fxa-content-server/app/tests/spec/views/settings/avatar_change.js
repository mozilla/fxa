/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var AuthErrors = require('lib/auth-errors');
  var chai = require('chai');
  var FileReaderMock = require('../../../mocks/file-reader');
  var Metrics = require('lib/metrics');
  var Notifier = require('lib/channels/notifier');
  var p = require('lib/promise');
  var ProfileClient = require('lib/profile-client');
  var ProfileMock = require('../../../mocks/profile');
  var Relier = require('models/reliers/relier');
  var sinon = require('sinon');
  var TestHelpers = require('../../../lib/helpers');
  var User = require('models/user');
  var View = require('views/settings/avatar_change');
  var WindowMock = require('../../../mocks/window');
  var wrapAssertion = TestHelpers.wrapAssertion;

  var assert = chai.assert;
  var pngSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACZJREFUeNrtwQEBAAAAgiD' +
               '/r25IQAEAAAAAAAAAAAAAAAAAAADvBkCAAAEehacTAAAAAElFTkSuQmCC';

  describe('views/settings/avatar_change', function () {
    var account;
    var metrics;
    var notifier;
    var profileClientMock;
    var relier;
    var user;
    var view;
    var windowMock;

    beforeEach(function () {
      metrics = new Metrics();
      notifier = new Notifier();
      profileClientMock = new ProfileMock();
      relier = new Relier();
      user = new User();
      windowMock = new WindowMock();

      view = new View({
        metrics: metrics,
        notifier: notifier,
        relier: relier,
        user: user,
        window: windowMock
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      profileClientMock = null;
    });

    describe('with session', function () {
      var accessToken = 'token';
      beforeEach(function () {
        view = new View({
          metrics: metrics,
          notifier: notifier,
          relier: relier,
          user: user,
          window: windowMock
        });

        view.isUserAuthorized = function () {
          return p(true);
        };
        account = user.initAccount({
          accessToken: accessToken,
          email: 'a@a.com',
          verified: true
        });
        sinon.stub(account, 'getAvatar', function () {
          return p({ avatar: pngSrc, id: 'foo' });
        });
        sinon.stub(account, 'profileClient', function () {
          return p(profileClientMock);
        });
        sinon.stub(view, 'getSignedInAccount', function () {
          return account;
        });

        return view.render();
      });

      it('hides the file picker', function () {
        assert.isFalse(view.$(':file').is(':visible'));
      });

      it('can remove the avatar', function () {
        sinon.stub(view, 'deleteDisplayedAccountProfileImage', function () {
          return p();
        });

        sinon.spy(view, 'navigate');
        return view.afterVisible()
          .then(function () {
            assert.equal(view.$('.avatar-wrapper img').length, 1);
            return view.removeAvatar();
          })
          .then(function () {
            assert.isTrue(view.deleteDisplayedAccountProfileImage.called);
            assert.isTrue(view.navigate.calledWith('settings'));
          });
      });

      it('shows error if delete fails', function () {
        sinon.stub(profileClientMock, 'deleteAvatar', function () {
          return p.reject(ProfileClient.Errors.toError('IMAGE_PROCESSING_ERROR'));
        });

        sinon.spy(view, 'navigate');
        return view.afterVisible()
          .then(function () {
            assert.equal(view.$('.avatar-wrapper img').length, 1);
            return view.removeAvatar();
          })
          .then(function () {
            assert.fail('unexpected success');
          }, function (err) {
            assert.isTrue(ProfileClient.Errors.is(err, 'IMAGE_PROCESSING_ERROR'));
            assert.isTrue(view.isErrorVisible(), 'error is visible');
            assert.isFalse(view.navigate.calledWith('settings'));
          });
      });

      describe('with a file selected', function () {
        it('errors on an unsupported file', function () {
          return view.afterVisible()
            .then(function () {
              var ev = FileReaderMock._mockTextEvent();
              view.fileSet(ev);

              assert.equal(view.$('.error').text(), AuthErrors.toMessage('UNUSABLE_IMAGE'));
              assert.isTrue(view.isErrorVisible());
            });
        });

        it('errors on a bad image', function () {
          view.FileReader = FileReaderMock;

          return view.afterVisible()
            .then(function () {
              var ev = FileReaderMock._mockBadPngEvent();
              return view.fileSet(ev)
                .then(function () {
                  assert.fail('unexpected success');
                }, function () {
                  assert.equal(view.$('.error').text(), AuthErrors.toMessage('UNUSABLE_IMAGE'));
                  assert.isTrue(view.isErrorVisible());
                });
            });
        });

        it('errors on an undersized image', function () {
          view.FileReader = FileReaderMock;

          return view.afterVisible()
            .then(function () {
              var ev = FileReaderMock._mockTinyPngEvent();
              return view.fileSet(ev)
                .then(function () {
                  assert.fail('unexpected success');
                }, function () {
                  assert.equal(view.$('.error').text(), AuthErrors.toMessage('INVALID_IMAGE_SIZE'));
                  assert.isTrue(view.isErrorVisible());
                });
            });
        });

        it('loads a supported file', function (done) {
          view.FileReader = FileReaderMock;

          view.afterVisible()
            .then(function () {
              var ev = FileReaderMock._mockPngEvent();


              sinon.stub(view, 'navigate', function (url, options) {
                wrapAssertion(function () {
                  assert.equal(url, 'settings/avatar/crop');
                  var cropImg = options.data.cropImg;
                  assert.equal(cropImg.get('src'), pngSrc);
                }, done);
              });

              view.fileSet(ev);
            })
            .fail(done);
        });
      });

      it('properly tracks avatar change events', function (done) {
        view.FileReader = FileReaderMock;

        view.afterVisible()
          .then(function () {
            var ev = FileReaderMock._mockPngEvent();

            sinon.stub(view, 'navigate', function () {
              wrapAssertion(function () {
                assert.isFalse(TestHelpers.isEventLogged(metrics, 'settings.avatar.change.submit.new'));
                assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.avatar.change.submit.change'));
              }, done);
            });

            view.fileSet(ev);
          })
          .fail(done);
      });

      it('properly tracks avatar new events', function (done) {
        view.FileReader = FileReaderMock;

        account.getAvatar.restore();
        sinon.stub(account, 'getAvatar', function () {
          return p({ avatar: pngSrc, id: null });
        });

        view.afterVisible()
          .then(function () {
            var ev = FileReaderMock._mockPngEvent();

            sinon.stub(view, 'navigate', function () {
              wrapAssertion(function () {
                assert.isTrue(TestHelpers.isEventLogged(metrics, 'settings.avatar.change.submit.new'));
                assert.isFalse(TestHelpers.isEventLogged(metrics, 'settings.avatar.change.submit.change'));
              }, done);
            });

            account.set('hadProfileImageSetBefore', false);
            view.fileSet(ev);
          })
          .fail(done);
      });

      it('clears setting param if set to avatar', function () {
        relier.set('setting', 'avatar');
        return view.render()
          .then(function () {
            assert.isUndefined(relier.get('setting'));
          });
      });
    });
  });
});
