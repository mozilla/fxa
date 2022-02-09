/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import BaseView from '../../base';
import Template from '../../../templates/post_verify/third_party_auth/callback.mustache';
import GoogleAuthMixin from '../../mixins/google-auth-mixin';
import Cocktail from 'cocktail';

class ThirdPartyAuthCallback extends BaseView {
  template = Template;

  async afterVisible() {
    this.handleOauthResponse();
  }
}

Cocktail.mixin(ThirdPartyAuthCallback, GoogleAuthMixin);

export default ThirdPartyAuthCallback;
