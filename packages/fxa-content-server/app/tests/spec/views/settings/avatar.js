/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'views/settings/avatar',
  '../../../mocks/router',
  'lib/session',
  'lib/constants',
  'lib/fxa-client'
],
function (chai, _, $, View, RouterMock, Session, Constants, FxaClient) {
  var assert = chai.assert;
  var pngSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

  describe('views/settings/avatar', function () {
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
        view.isUserAuthorized = function () {
          return true;
        };
      });

      it('has no avatar set', function () {
        Session.clear('avatar');

        return view.render()
          .then(function () {
            assert.isTrue(view.$('.avatar-wrapper img.default').length > 0);
          });
      });

      it('has an avatar set', function () {
        Session.set('avatar', pngSrc);

        return view.render()
          .then(function () {
            assert.equal(view.$('.avatar-wrapper img').attr('src'), pngSrc);
          });
      });
    });
  });
});


