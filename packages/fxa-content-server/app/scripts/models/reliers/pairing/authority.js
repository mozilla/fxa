/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import OAuthErrors from '../../../lib/oauth-errors';
import OAuthRelier from '../oauth';
import Vat from '../../../lib/vat';

/*eslint-disable camelcase, sorting/sort-object-props*/

const AUTHORITY_QUERY_PARAM_SCHEMA = {
  channel_id: Vat.channelId()
    .required()
    .renameTo('channelId'),
};

/*eslint-enable camelcase, sorting/sort-object-props*/

export default class AuthorityRelier extends OAuthRelier {
  name = 'pairing-authority';

  fetch() {
    return Promise.resolve().then(() => {
      this.importSearchParamsUsingSchema(
        AUTHORITY_QUERY_PARAM_SCHEMA,
        OAuthErrors
      );
      return super.fetch();
    });
  }
}
