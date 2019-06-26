/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';

export default {
  /**
   * Write content to the DOM
   *
   * @param {Object} win
   * @param {String | Element} content
   */
  write(win, content) {
    $('#loading-spinner').hide();

    // Two notes:
    // 1. Render the new view while stage is invisible then fade it in
    // using css animations to catch problems with an explicit
    // opacity rule after class is added.
    // 2. The html is written directly into #stage instead
    // of this.$el because overwriting this.$el has a nasty side effect
    // where the view's DOM event handlers do hook up properly.
    $('#stage')
      .html(content)
      .addClass('fade-in-forward')
      .css('opacity', 1);

    // The user may be scrolled part way down the page
    // on view transition. Force them to the top of the page.
    win.scrollTo(0, 0);

    $('#fox-logo')
      .addClass('fade-in-forward')
      .css('opacity', 1);
  },
};
