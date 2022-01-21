/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import FormView from '../../form';
// import Url from '../../../lib/url';
import Template from '../../../templates/post_verify/third_party_auth/callback.mustache';

class ThirdPartyAuthCallback extends FormView {
  template = Template;

  initialize(options) {
    // const searchParams = Url.searchParams(this.window.location.search);
  }
}

export default ThirdPartyAuthCallback;
