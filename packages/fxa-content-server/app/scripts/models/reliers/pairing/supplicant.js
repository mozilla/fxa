/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import OAuthErrors from '../../../lib/oauth-errors';
import OAuthRelier from '../oauth';
import Vat from '../../../lib/vat';

/*eslint-disable camelcase */
const SUPPLICANT_QUERY_PARAM_SCHEMA = {
  access_type: Vat.accessType().renameTo('accessType'),
  client_id: Vat.clientId().required().renameTo('clientId'),
  code_challenge: Vat.codeChallenge().required().renameTo('codeChallenge'),
  code_challenge_method: Vat.codeChallengeMethod()
    .required()
    .renameTo('codeChallengeMethod'),
  keys_jwk: Vat.keysJwk().required().renameTo('keysJwk'),
  redirect_uri: Vat.url()
    // redirect URI is not required for OAuth flows,
    // we only validate it in the OAuth broker if it is provided
    // See `isCorrectRedirect` app/scripts/models/reliers/oauth.js
    .renameTo('redirectUri'),
  scope: Vat.string().required().min(1),
  state: Vat.string().required(),
};

const SUPPLICANT_HASH_PARAMETER_SCHEMA = {
  channel_id: Vat.channelId().required().renameTo('channelId'),
  channel_key: Vat.channelKey().required().renameTo('channelKey'),
};

/*eslint-enable camelcase */

export default class SupplicantRelier extends OAuthRelier {
  name = 'pairing-supplicant';

  fetch() {
    return Promise.resolve().then(() => {
      this.importHashParamsUsingSchema(
        SUPPLICANT_HASH_PARAMETER_SCHEMA,
        OAuthErrors
      );
      this.importSearchParamsUsingSchema(
        SUPPLICANT_QUERY_PARAM_SCHEMA,
        OAuthErrors
      );
      return this._setupOAuthRPInfo();
    });
  }

  getOAuthParams() {
    const scopes = this.scopeStrToArray(this.get('scope')).join(' ');

    return {
      /*eslint-disable camelcase*/
      access_type: this.get('accessType'),
      client_id: this.get('clientId'),
      code_challenge: this.get('codeChallenge'),
      code_challenge_method: this.get('codeChallengeMethod'),
      keys_jwk: this.get('keysJwk'),
      scope: scopes,
      state: this.get('state'),
      /*eslint-enable camelcase*/
    };
  }

  validateApprovalData(approvalData) {
    const { code, state } = approvalData;

    if (Vat.oauthCode().validate(code).error) {
      throw OAuthErrors.toInvalidParameterError('code');
    }

    if (state !== this.get('state')) {
      throw OAuthErrors.toInvalidParameterError('state');
    }
  }
}
