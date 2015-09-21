/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  'views/openid/start',
  '../../../mocks/window'
],
function (chai, sinon, View, WindowMock) {
  'use strict';

  var assert = chai.assert;

  describe('views/openid/start', function () {
    var view;
    var windowMock;

    beforeEach(function () {

      windowMock = new WindowMock();

      view = new View({
        window: windowMock
      });
    });

    afterEach(function () {
      view.remove();
      view.destroy();
    });

    it('redirects to authenticate on submit', function () {
      var form = {
        openid: 'https://test.example.com'
      };
      sinon.stub(view, 'getFormValues', function () {
        return form;
      });

      view.submit();
      assert.equal(
        windowMock.location,
        '/openid/authenticate?identifier=' + encodeURIComponent(form.openid));
    });
  });
});
