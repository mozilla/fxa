/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'sinon',
  'views/settings/avatar_change',
  '../../../mocks/router',
  '../../../mocks/file-reader',
  '../../../mocks/profile',
  'models/user',
  'models/reliers/relier',
  'lib/profile-client',
  'lib/promise',
  'lib/auth-errors'
],
function (chai, _, $, sinon, View, RouterMock, FileReaderMock, ProfileMock,
            User, Relier, ProfileClient, p, AuthErrors) {
  var assert = chai.assert;
  var pngSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

  describe('views/settings/avatar/change', function () {
    var view;
    var routerMock;
    var profileClientMock;
    var user;
    var account;
    var relier;

    beforeEach(function () {
      routerMock = new RouterMock();
      user = new User();
      profileClientMock = new ProfileMock();
      relier = new Relier();

      view = new View({
        user: user,
        relier: relier,
        router: routerMock
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      routerMock = null;
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
      var accessToken = 'token';
      beforeEach(function () {
        view = new View({
          router: routerMock,
          relier: relier,
          user: user
        });
        view.isUserAuthorized = function () {
          return true;
        };
        account = user.initAccount({
          email: 'a@a.com',
          verified: true,
          accessToken: accessToken
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
      });

      it('hides the file picker', function () {
        return view.render()
          .then(function () {
            assert.isFalse(view.$(':file').is(':visible'));
          });
      });

      it('can remove the avatar', function () {
        sinon.stub(profileClientMock, 'deleteAvatar', function () {
          return p('');
        });

        sinon.stub(view, 'updateAvatarUrl', function () { });

        return view.render()
          .then(function () {
            assert.equal(view.$('.avatar-wrapper img').length, 1);
            return view.remove();
          })
          .then(function () {
            assert.isTrue(profileClientMock.deleteAvatar.calledWith(
              accessToken, 'foo'));
            assert.isTrue(view.updateAvatarUrl.calledWith(null));
            assert.equal(routerMock.page, 'settings');
          });
      });

      it('shows error if delete fails', function () {
        sinon.stub(profileClientMock, 'deleteAvatar', function () {
          return p.reject(ProfileClient.Errors.toError('IMAGE_PROCESSING_ERROR'));
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.avatar-wrapper img').length, 1);
            return view.remove();
          })
          .then(function () {
            assert.fail('unexpected success');
          }, function (err) {
            assert.isTrue(ProfileClient.Errors.is(err, 'IMAGE_PROCESSING_ERROR'));
            assert.isTrue(view.isErrorVisible());
            assert.notEqual(routerMock.page, 'settings');
          });
      });

      describe('with a file selected', function () {
        it('errors on an unsupported file', function () {
          return view.render()
            .then(function () {
              var ev = FileReaderMock._mockTextEvent();
              view.fileSet(ev);

              assert.equal(routerMock.page, 'settings');
              assert.equal(view.ephemeralMessages.get('error'), AuthErrors.toMessage('UNUSABLE_IMAGE'));
            });
        });

        it('errors on a bad image', function (done) {
          view.FileReader = FileReaderMock;

          view.render()
            .then(function () {
              var ev = FileReaderMock._mockBadPngEvent();

              view.router.on('navigate', function () {
                try {
                  assert.equal(routerMock.page, 'settings');
                  assert.equal(view.ephemeralMessages.get('error'), AuthErrors.toMessage('UNUSABLE_IMAGE'));
                  done();
                } catch (e) {
                  return done(e);
                }
              });

              view.fileSet(ev);
            })
            .fail(done);
        });

        it('loads a supported file', function (done) {
          view.FileReader = FileReaderMock;

          view.render()
            .then(function () {
              var ev = FileReaderMock._mockPngEvent();

              view.router.on('navigate', function () {
                try {
                  var cropImg = view.ephemeralMessages.get('data').cropImg;
                  assert.equal(routerMock.page, 'settings/avatar/crop');
                  assert.equal(cropImg.get('src'), pngSrc);
                  done();
                } catch (e) {
                  return done(e);
                }
              });

              view.fileSet(ev);
            })
            .fail(done);
        });
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


