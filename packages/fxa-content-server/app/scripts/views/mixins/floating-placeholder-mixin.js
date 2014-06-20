/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// FormView plugin to convert a placeholder into a
// floating label if the input changes.

'use strict';

define([
  'jquery'
], function ($) {
  return {
    //when a user begins typing in an input, grab the placeholder,
    // put it in a label and then unbind the event
    // this is done to prevent user confustion about multiple password inputs
    togglePlaceholderPattern: function (el) {
      var self = this;
      var input = el || this.$('input');

      input.one('keyup', function () {
        // if values haven't changed, reattach the event listener for
        // just this element
        if (! self.detectFormValueChanges()) {
          self.togglePlaceholderPattern($(this));
          return true;
        }
        var placeholder = $(this).attr('placeholder');
        if (placeholder !== '') {
          $(this).removeAttr('placeholder');
          $(this).prev('.label-helper').text(placeholder).animate( {'top': '-17px'}, 400);
        }
      });
    },

    /**
     * Initialize fields with placeholder text that can toggle position.
     */
    initializePlaceholderFields: function () {
      this.updateFormValueChanges();
      this.togglePlaceholderPattern();
    }
  };
});
