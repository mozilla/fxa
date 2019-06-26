/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A view to fetch and render legal copy. Sub-classes must provide
 * a `copyUrl` where the copy template can be fetched, as well a
 * `fetchError`, which is an error to display if there is a
 * problem fetching the copy template.
 */

import BackMixin from './mixins/back-mixin';
import BaseView from './base';
import Cocktail from 'cocktail';
import xhr from '../lib/xhr';

const proto = BaseView.prototype;
const View = BaseView.extend({
  initialize(options = {}) {
    this._xhr = options.xhr || xhr;
  },

  afterRender() {
    return this._xhr
      .ajax({
        accepts: { text: 'text/partial' },
        dataType: 'text',
        url: this.copyUrl,
      })
      .then(template => {
        this.$('#legal-copy').html(template);
        this.$('.hidden').removeClass('hidden');

        // Set a session cookie that informs the server
        // the user can go back if they refresh the page.
        // If the user can go back, the browser will not
        // render the statically generated TOS/PP page,
        // but will let the app render the page.
        // The cookie is cleared whenever the user
        // restarts the browser. See #2044
        //
        // The cookie is scoped to the page to avoid sending
        // it on other requests, and to ensure the server
        // only sends the user back to the app if the user in fact
        // came from this page.
        this.window.document.cookie =
          'canGoBack=1; path=' + this.window.location.pathname;
        return proto.afterRender.call(this);
      })
      .catch(() => {
        this.displayError(this.fetchError);
        this.$('.hidden').removeClass('hidden');
      });
  },

  afterVisible() {
    this.$('.hidden').removeClass('hidden');

    // The `data-shown` attribute is searched for by the functional
    // tests. The legal copy HTML has unstable markup, so the functional
    // tests need some stable identifier to look for to know the copy is
    // ready.
    this.$('#legal-copy').attr('data-shown', 'true');

    return proto.afterVisible.call(this);
  },
});

Cocktail.mixin(View, BackMixin);

export default View;
