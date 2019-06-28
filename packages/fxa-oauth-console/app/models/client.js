/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  redirect_uri: DS.attr('string'), //eslint-disable-line camelcase
  secret: DS.attr('string'),
  can_grant: DS.attr('boolean'), //eslint-disable-line camelcase
  trusted: DS.attr('boolean'),
});
