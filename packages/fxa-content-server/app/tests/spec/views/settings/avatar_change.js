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
  'lib/promise',
  'lib/session',
  'lib/auth-errors'
],
function (chai, _, $, sinon, View, RouterMock, FileReaderMock, ProfileMock,
            p, Session, AuthErrors) {
  var assert = chai.assert;
  var pngSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

  describe('views/settings/avatar/change', function () {
    var view;
    var routerMock;
    var profileClientMock;

    beforeEach(function () {
      routerMock = new RouterMock();

      view = new View({
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
        view.isUserAuthorized = function () {
          return false;
        };
        return view.render()
            .then(function () {
              assert.equal(routerMock.page, 'signin');
            });
      });
    });

    describe('with session', function () {
      beforeEach(function () {
        profileClientMock = new ProfileMock();
        sinon.stub(profileClientMock, 'getAvatar', function () {
          return p({ avatar: pngSrc, id: 'foo' });
        });

        view = new View({
          router: routerMock,
          profileClient: profileClientMock
        });
        view.isUserAuthorized = function () {
          return true;
        };
      });

      it('hides the file picker', function () {
        return view.render()
          .then(function () {
            assert.isFalse(view.$(':file').is(':visible'));
          });
      });

      it('can remove the avatar', function () {
        sinon.stub(profileClientMock, 'deleteAvatar', function (id) {
          assert.equal(id, 'foo');
          return p('');
        });

        return view.render()
          .then(function () {
            assert.equal(view.$('.avatar-wrapper img').length, 1);

            return view.remove()
              .then(function () {
                assert.equal(routerMock.page, 'settings/avatar');
              });
          });
      });

      describe('with a file selected', function () {
        it('errors on an unsupported file', function () {
          return view.render()
            .then(function () {
              var ev = FileReaderMock._mockTextEvent();
              view.fileSet(ev);

              assert.equal(routerMock.page, 'settings/avatar');
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
                  assert.equal(routerMock.page, 'settings/avatar');
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
                  assert.equal(routerMock.page, 'settings/avatar/crop');
                  assert.equal(Session.cropImgSrc, pngSrc);
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

    });

  });
});


