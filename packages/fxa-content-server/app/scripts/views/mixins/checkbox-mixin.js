/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Log when checkbox values are changed, if the checkbox has an id.
 */

define([
  'fxaCheckbox',
  'jquery',
  'lib/strings'
], function (FxaCheckbox, $, Strings) {
  'use strict';

  return {
    events: {
      'change input[type=checkbox]': 'logCheckboxChange'
    },

    afterRender: function () {
      this.$el.find('.fxa-checkbox').get().forEach(function (el) {
        // FxaCheckbox enhances the native checkbox and provides custom styling
        new FxaCheckbox(el).init();
      });
    },

    logCheckboxChange: function (event) {
      var target = $(event.currentTarget);
      var isChecked = target.is(':checked');
      var checkedText = isChecked ? 'checked' : 'unchecked';
      var id = target.attr('id');

      // if no id, doesn't really make sense to log it.
      if (id) {
        this.logScreenEvent(
          Strings.interpolate('checkbox.change.%s.%s', [id, checkedText]));
      }
    }
  };
});

