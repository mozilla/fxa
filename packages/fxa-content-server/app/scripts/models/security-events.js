/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Security events information
 */

import Backbone from 'backbone';

const SecurityEvent = Backbone.Model.extend({
  defaults: {
    name: null,
    verified: false,
    createdAt: null,
  },
});

export default SecurityEvent;
