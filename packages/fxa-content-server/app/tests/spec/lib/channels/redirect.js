/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'lib/channels/redirect',
  '../../../mocks/window',
  '../../../lib/helpers'
],
function (chai, RedirectChannel, WindowMock, TestHelpers) {
  var assert = chai.assert;

  describe('lib/channel/redirect', function () {
    var channel, windowMock;

    beforeEach(function() {
      windowMock = new WindowMock();

      channel = new RedirectChannel();
      channel.init({
        window: windowMock
      });
    });

    describe('send with `oauth_complete`', function () {
      describe('without an error', function () {
        it('redirects the user to the correct url', function () {
          channel.send('oauth_complete', {
            redirect: 'http://destination.org'
          });

          assert.equal(windowMock.location.href, 'http://destination.org');
        });
      });

      describe('with an error', function () {
        it('redirects the user to the correct url', function () {
          channel.send('oauth_complete', {
            redirect: 'http://destination.org',
            error: 'oops'
          });

          assert.equal(windowMock.location.href, 'http://destination.org?error=oops');
        });
      });

      describe('with an error when redirect already contains a search parameter', function () {
        it('correctly adds the error to the end', function () {
          channel.send('oauth_complete', {
            redirect: 'http://destination.org?search',
            error: 'oops'
          });

          assert.equal(windowMock.location.href, 'http://destination.org?search&error=oops');
        });
      });

    });

    describe('oauth auto-verification', function () {
      it('is not supported', function (done) {
        channel.send('should_auto_complete_after_email_verification', {}, function (err, response) {
          TestHelpers.wrapAssertion(function () {
            assert.isNull(err);
            assert.isFalse(response.should_auto_complete_after_email_verification);//jshint ignore: line
          }, done);
        });
      });
    });
  });
});


