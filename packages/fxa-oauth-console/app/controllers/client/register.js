/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ember from 'ember';
import config from '../../config/environment';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  registrationSuccess: false,
  oauth_uri: config.servers.oauthUriParsed.href, //eslint-disable-line camelcase
  profile_uri: config.servers.profileUriParsed.href, //eslint-disable-line camelcase
});
