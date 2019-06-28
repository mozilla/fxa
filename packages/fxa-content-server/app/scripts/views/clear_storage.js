/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This is a very small view to allow selenium tests
 * to clear browser storage state between tests.
 */

import BaseView from './base';
import Template from 'templates/clear_storage.mustache';

var View = BaseView.extend({
  template: Template,

  beforeRender() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = 'tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
    } catch (e) {
      // if cookies are disabled, this will blow up some browsers.
    }
  },
});

export default View;
