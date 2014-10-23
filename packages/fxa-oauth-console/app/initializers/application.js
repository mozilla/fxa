/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ember from 'ember';

export var initialize = function(container, application) {
  Ember.A(['adapter', 'controller', 'route']).forEach(function(component) {
    application.inject(component, 'session', 'simple-auth-session:main');
  });
};

export default {
  name: 'application',

  initialize: initialize
};
