/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'draggable',
  'sinon',
  'views/settings/avatar_crop',
  '../../../mocks/router',
  '../../../mocks/profile',
  'lib/promise',
  'lib/session',
  'lib/constants',
  'lib/auth-errors'
],
function (chai, _, $, ui, sinon, View, RouterMock, ProfileMock, p, Session, Constants, AuthErrors) {
  var assert = chai.assert;
  var pngSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

  describe('views/settings/avatar/crop', function () {
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
        view.isUserAuthorized = function () {
          return true;
        };
      });

      it('has no cropper image', function () {
        Session.clear('cropImgSrc');

        return view.render()
          .then(function () {
            assert.equal(routerMock.page, 'settings/avatar/change');
            assert.equal(view.ephemeralMessages.get('error'), AuthErrors.toMessage('UNUSABLE_IMAGE'));
          });
      });

      describe('with an image', function () {

        beforeEach(function () {
          Session.set('cropImgSrc', pngSrc);
          Session.set('cropImgType', 'image/png');
          Session.set('cropImgWidth', 1);
          Session.set('cropImgHeight', 1);

          profileClientMock = new ProfileMock();

          view = new View({
            router: routerMock,
            profileClient: profileClientMock
          });
          view.isUserAuthorized = function () {
            return true;
          };
        });

        it('has a cropper image', function () {
          assert.equal(view.imgSrc, pngSrc);
          assert.equal(view.imgType, 'image/png');

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
              url: 'test',
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
              assert.equal(Session.avatar, 'test');
              assert.equal(Session.avatarId, 'foo');
              assert.equal(routerMock.page, 'settings/avatar');
            });
        });
      });
    });
  });
});


