/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Populates the flow model and initialises flow event handlers.

import $ from 'jquery';
import KEYS from '../../lib/key-codes';

export default {
  afterRender() {
    this.notifier.trigger('flow.initialize');
  },

  events: {
    'click a': '_clickFlowEventsLink',
    'click input': '_engageFlowEventsForm',
    'input input': '_engageFlowEventsForm',
    'change select': '_engageFlowEventsForm',
    'keyup input': '_keyupFlowEventsInput',
    'keyup textarea': '_keyupFlowEventsInput',
    submit: '_submitFlowEventsForm',
  },

  _clickFlowEventsLink(event) {
    if (event && event.currentTarget) {
      const flowEvent = $(event.currentTarget).data('flowEvent');
      if (flowEvent) {
        this.logFlowEvent(flowEvent, this.viewName);
      }
    }
  },

  _engageFlowEventsForm() {
    this.logFlowEventOnce('engage', this.viewName);
  },

  _keyupFlowEventsInput(event) {
    if (
      event.which === KEYS.TAB &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey
    ) {
      this._engageFlowEventsForm();
    }
  },

  _submitFlowEventsForm() {
    if (this.isFormEnabled()) {
      this.logFlowEvent('submit', this.viewName);
    }
  },
};
