/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Backbone from 'backbone';

const SupportForm = Backbone.Model.extend({
  validate: function(attrs) {
    if (
      attrs.message !== '' &&
      attrs.plan !== '' &&
      attrs.planId &&
      attrs.topic !== ''
    ) {
      return;
    }

    // This is not an error message used anywhere. It's just that Backbone wants
    // a string to indicate an invalid state.
    return 'Missing required field.';
  },
});

export default SupportForm;
