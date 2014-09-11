/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'draggable',
  'views/settings/avatar_crop',
  '../../../mocks/router',
  'lib/session',
  'lib/constants',
  'lib/auth-errors',
  'lib/fxa-client'
],
function (chai, _, $, ui, View, RouterMock, Session, Constants, AuthErrors,
    FxaClient) {
  var assert = chai.assert;
  var pngSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

  describe('views/settings/avatar/crop', function () {
    var view;
    var routerMock;
    var fxaClient;

    beforeEach(function () {
      routerMock = new RouterMock();
      fxaClient = new FxaClient();

      view = new View({
        router: routerMock,
        fxaClient: fxaClient
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
      });

      it('has no cropper image', function () {
        Session.clear('cropImgSrc');

        view = new View({
          router: routerMock
        });
        view.isUserAuthorized = function () {
          return true;
        };

        return view.render()
          .then(function () {
            assert.equal(routerMock.page, 'settings/avatar/change');
            assert.equal(view.ephemeralMessages.get('error'), AuthErrors.toMessage('UNUSABLE_IMAGE'));
          });
      });

      it('has a cropper image', function () {
        Session.set('cropImgSrc', pngSrc);
        Session.set('cropImgWidth', 1);
        Session.set('cropImgHeight', 1);

        view = new View();
        view.isUserAuthorized = function () {
          return true;
        };

        return view.render()
          .then(function () {
            return view.afterVisible();
          })
          .then(function () {
            assert.equal(view.$('.cropper img').attr('src'), pngSrc);
          });
      });

      it('submits an ', function () {
        Session.set('cropImgSrc', pngSrc);
        Session.set('cropImgWidth', 1);
        Session.set('cropImgHeight', 1);

        view = new View({
          router: routerMock
        });
        view.isUserAuthorized = function () {
          return true;
        };

        return view.render()
          .then(function () {
            return view.afterVisible();
          })
          .then(function () {
            return view.submit();
          })
          .then(function () {
            assert.equal(routerMock.page, 'settings/avatar');
          });
      });
    });
  });
});


