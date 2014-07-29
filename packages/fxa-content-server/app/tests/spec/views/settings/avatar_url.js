/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'views/settings/avatar_url',
  '../../../mocks/router',
  'lib/session',
  'lib/constants',
  'lib/auth-errors'
],
function (chai, _, $, View, RouterMock, Session, Constants, AuthErrors) {
  var assert = chai.assert;
  // 1x1 png
  var pngSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

  describe('views/settings/avatar/url', function () {
    var view, routerMock;

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

      it('errors on a bad image', function (done) {

         view.render()
           .then(function () {
             view.router.on('navigate', function () {
               try {
                 assert.equal(routerMock.page, 'settings/avatar');
                 assert.equal(view.ephemeralMessages.get('error'), AuthErrors.toMessage('UNUSABLE_IMAGE'));
                 done();
               } catch (e) {
                 return done(e);
               }
             });

             view.$('.url').val('data:image/png;base64,');
             view.submit();
           })
           .fail(done);
      });

      it('submits', function (done) {

         view.render()
           .then(function () {
             view.router.on('navigate', function () {
               try {
                 assert.equal(routerMock.page, 'settings/avatar/crop');
                 assert.equal(Session.cropImgSrc, pngSrc);
                 assert.equal(Session.cropImgWidth, 1);
                 assert.equal(Session.cropImgHeight, 1);
                 done();
               } catch (e) {
                 return done(e);
               }
             });

             view.$('.url').val(pngSrc);
             view.submit();
           })
           .fail(done);
      });
    });
  });
});


