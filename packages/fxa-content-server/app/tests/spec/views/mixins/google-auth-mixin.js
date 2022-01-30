/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import BaseView from 'views/base';
import Cocktail from 'cocktail';
import GoogleAuthMixin from 'views/mixins/google-auth-mixin';

const View = BaseView.extend({
  template: () => '<div><div class="views"></div></div>',
});

Cocktail.mixin(View, GoogleAuthMixin);

describe('views/mixins/google-auth-mixin', function () {
  // TODO
});
