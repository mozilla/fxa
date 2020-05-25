/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthErrors from '../lib/auth-errors';
import BackMixin from './mixins/back-mixin';
import BaseView from './base';
import Cocktail from 'cocktail';
import Storage from '../lib/storage';
import Template from 'templates/cookies_disabled.mustache';

var View = BaseView.extend({
  constructor: function (options) {
    BaseView.call(this, options);

    this._Storage = options.Storage || Storage;
  },

  template: Template,
  className: 'cookies-disabled',

  events: {
    'click #submit-btn': 'backIfLocalStorageEnabled',
  },

  backIfLocalStorageEnabled() {
    if (!this._Storage.isLocalStorageEnabled()) {
      return this.displayError(AuthErrors.toError('COOKIES_STILL_DISABLED'));
    }

    this.back();
  },
});

Cocktail.mixin(View, BackMixin);

export default View;
