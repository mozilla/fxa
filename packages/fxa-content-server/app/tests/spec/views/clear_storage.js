/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import View from 'views/clear_storage';

var assert = chai.assert;

describe('views/clear_storage', function() {
  var view;

  beforeEach(function() {
    view = new View({});
  });

  afterEach(function() {
    view.remove();
    view.destroy();
    view = null;
  });

  it('clears localStorage and sessionStorage on render', function() {
    localStorage.setItem('hey', 'ho');
    sessionStorage.setItem("let's", 'go');

    return view.render().then(function() {
      assert.notOk(localStorage.length);
      assert.notOk(sessionStorage.length);
    });
  });
});
