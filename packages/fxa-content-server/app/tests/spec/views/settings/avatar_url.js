/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'p-promise',
  'sinon',
  'views/settings/avatar_url',
  '../../../mocks/router',
  'lib/session',
  'lib/assertion',
  'lib/constants',
  'lib/auth-errors'
],
function (chai, _, $, p, sinon, View, RouterMock, Session, Assertion, Constants, AuthErrors) {
  var assert = chai.assert;
  // 1x1 jpeg
var jpgSrcData = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBA' +
'MFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMD' +
'AwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEB' +
'AxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQ' +
'RBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVF' +
'VWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx' +
'8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcI' +
'CQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChY' +
'kNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkp' +
'OUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==';

  // These URLs don't depend on our actual configuration; the servers are mocked out.
  var PROFILE_URL = 'http://127.0.0.1:1111';
  var OAUTH_URL = 'http://127.0.0.1:9010';

  describe('views/settings/avatar/url', function () {
    var view, routerMock, server;

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

      describe('isValid', function () {
        beforeEach(function () {
          return view.render();
        });

        it('returns false if url is blank', function () {
          view.$('.url').val('');
          assert.isFalse(view.isValid());
        });

        it('returns false if url is not valid', function () {
          view.$('.url').val('not a url');
          assert.isFalse(view.isValid());
        });

        it('returns true if url is valid', function () {
          view.$('.url').val('http://example.com/logo.jpg');
          assert.isTrue(view.isValid());
        });
      });

      describe('when submitting a url', function () {
        beforeEach(function () {
          Session.set('config', {
            oauthClientId: 'client_id',
            oauthUrl: OAUTH_URL,
            profileUrl: PROFILE_URL
          });

          // mocks
          server = sinon.fakeServer.create();
          server.autoRespond = true;

          server.respondWith('POST', OAUTH_URL + '/v1/authorization',
            [200, { 'Content-Type': 'application/json' },
              '{ "scope": "profile", "token_type": "bearer", "access_token": "token" }']);


          Assertion.generate = function () {
            return p('assertion');
          };
        });

        afterEach(function () {
          // The Assertion module aliases Assertion() to Assertion.generate().
          // We reset it here since it was overwritten in beforeEach.
          Assertion.generate = Assertion;

          server.restore();
          Session.clear();
        });

        it('errors on a bad image', function (done) {
          var src = encodeURIComponent('http://example.com/logo.jpg');

          server.respondWith('GET', PROFILE_URL + '/v1/remote_image/' + src,
            [200, { 'Content-Type': 'text/plain' },
              'data:image/jpeg;base64,']);

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

               view.$('.url').val('http://example.com/logo.jpg');
               view.submit();
             })
             .fail(done);
        });

        it('submits', function (done) {
          var src = encodeURIComponent('http://example.com/logo.jpg');

          server.respondWith('GET', PROFILE_URL + '/v1/remote_image/' + src,
            [200, { 'Content-Type': 'text/plain' },
                  jpgSrcData]);

           view.render()
             .then(function () {
               view.router.on('navigate', function () {
                 try {
                   assert.equal(routerMock.page, 'settings/avatar/crop');
                   assert.include(Session.cropImgSrc, jpgSrcData);
                   assert.equal(Session.cropImgWidth, 1);
                   assert.equal(Session.cropImgHeight, 1);
                   done();
                 } catch (e) {
                   return done(e);
                 }
               });

               view.$('.url').val('http://example.com/logo.jpg');
               view.submit();
             })
             .fail(done);
        });
      });

    });

  });
});


