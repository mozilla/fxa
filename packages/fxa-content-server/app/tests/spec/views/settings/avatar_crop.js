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
  'models/user',
  'models/cropper-image',
  'lib/promise',
  'lib/constants',
  'lib/ephemeral-messages',
  'lib/auth-errors'
],
function (chai, _, $, ui, sinon, View, RouterMock, ProfileMock, User, CropperImage,
    p, Constants, EphemeralMessages, AuthErrors) {
  var assert = chai.assert;
  var pngSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

  describe('views/settings/avatar/crop', function () {
    var view;
    var routerMock;
    var profileClientMock;
    var ephemeralMessages;
    var user;
    var account;

    beforeEach(function () {
      routerMock = new RouterMock();
      user = new User();
      ephemeralMessages = new EphemeralMessages();

      view = new View({
        user: user,
        ephemeralMessages: ephemeralMessages,
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
      beforeEach(function () {
        view.isUserAuthorized = function () {
          return true;
        };
        account = user.initAccount({
          email: 'a@a.com',
          accessToken: 'abc123',
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
            src: pngSrc,
            type: 'image/png',
            width: 1,
            height: 1
          });

          profileClientMock = new ProfileMock();
          ephemeralMessages.set('data', {
            cropImg: cropImg
          });

          view = new View({
            router: routerMock,
            ephemeralMessages: ephemeralMessages,
            user: user
          });
          view.isUserAuthorized = function () {
            return true;
          };
          sinon.stub(view, 'getSignedInAccount', function () {
            return account;
          });
          sinon.stub(account, 'profileClient', function () {
            return p(profileClientMock);
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
            .then(function (result) {
              assert.equal(result.url, 'test');
              assert.equal(result.id, 'foo');
              assert.equal(routerMock.page, 'settings');
            });
        });
      });
    });
  });
});


