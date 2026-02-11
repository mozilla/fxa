/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Mocks a Backbone view file for router testing
 */

import BaseView from '../../scripts/views/base';
import Template from './template.mustache';

const View = BaseView.extend(
  {
    template: Template,
    initialize(options = {}) {},

    events: {},

    setInitialContext(context) {
      context.set({});
    },

    afterRender() {},
  },
  {}
);

export default View;
