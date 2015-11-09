/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var EphemeralMessages = require('lib/ephemeral-messages');
  var View = require('views/unexpected_error');
  var WindowMock = require('../../mocks/window');

  var assert = chai.assert;

  describe('views/unexpected_error', function () {
    var view, windowMock, ephemeralMessages;

    beforeEach(function () {
      ephemeralMessages = new EphemeralMessages();
      windowMock = new WindowMock();
      view = new View({
        ephemeralMessages: ephemeralMessages,
        window: windowMock
      });
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      view = null;
    });

    it('shows error', function () {
      ephemeralMessages.set('error', 'boom');

      return view.render()
          .then(function () {
            assert.equal(view.$('.error').text(), 'boom');
          });
    });
  });
});
