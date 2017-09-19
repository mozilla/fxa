/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A mixin for common COPPA functionality
 */
define(function (require, exports, module) {
  'use strict';

  const FloatingPlaceholderMixin = require('./floating-placeholder-mixin');
  const FormPrefillMixin = require('./form-prefill-mixin');
  const KeyCodes = require('../../lib/key-codes');
  const Template = require('stache!templates/partial/coppa-age-input');

  const AGE_ELEMENT = '#age';
  const AGE_SIZE_LIMIT = 3;
  const CUTOFF_AGE = 13;

  const CANNOT_CREATE_ACCOUNT_PATHNAME = 'cannot_create_account';

  /**
   * Creates the CoppaMixin.
   *
   * @param {Object} [config={}]
   *   @param {Boolean} [config.required=false] Is the input field required on form submit?
   * @returns {Function}
   */
  module.exports = function (config = {}) {
    return {
      dependsOn: [ FloatingPlaceholderMixin, FormPrefillMixin ],

      events: {
        [`input ${AGE_ELEMENT}`]: 'onCoppaInput',
        [`keydown ${AGE_ELEMENT}`]: 'onCoppaKeyDown',
        [`keyup ${AGE_ELEMENT}`]: 'onCoppaInput'
      },

      beforeRender () {
        if (this.window.document.cookie.indexOf('tooyoung') > -1) {
          this.navigate(CANNOT_CREATE_ACCOUNT_PATHNAME);
        }
      },

      setInitialContext (context) {
        const coppaHTML = this.renderTemplate(Template, { required: config.required });

        context.set({
          coppaHTML
        });
      },

      /**
       * Is the user old enough to sign up?
       *
       * @returns {Boolean}
       */
      isUserOldEnough () {
        return this._getAge() >= CUTOFF_AGE;
      },

      /**
       * Mark the user as too young. Navigates to
       * a page informing the user they are unable
       * to sign up.
       */
      tooYoung () {
        this.notifier.trigger('signup.tooyoung');

        // this is a session cookie. It will go away once:
        // 1. the user closes the tab
        // and
        // 2. the user closes the browser
        // Both of these have to happen or else the cookie
        // hangs around like a bad smell.
        this.window.document.cookie = 'tooyoung=1;';

        this.navigate(CANNOT_CREATE_ACCOUNT_PATHNAME);
      },

      onCoppaInput () {
        // limit age to only 3 characters
        var age = this.$(AGE_ELEMENT);
        if (age.val().length > AGE_SIZE_LIMIT) {
          age.val(age.val().substr(0, AGE_SIZE_LIMIT));
        }
      },

      onCoppaKeyDown (event) {
        // helper function to check for digits and special keys
        function isKeyADigitOrSpecialCharacter (keyCode) {
          return (
            (keyCode === KeyCodes.BACKSPACE) ||
            (keyCode === KeyCodes.TAB) ||
            (keyCode === KeyCodes.LEFT_ARROW) ||
            (keyCode === KeyCodes.RIGHT_ARROW) ||
            (keyCode === KeyCodes.ENTER) ||
            (keyCode >= KeyCodes.NUM_0 && keyCode <= KeyCodes.NUM_9) ||
            (keyCode >= KeyCodes.NUMPAD_0 && keyCode <= KeyCodes.NUMPAD_9)
          );
        }

        // force digit input
        if (! isKeyADigitOrSpecialCharacter(event.which)) {
          event.preventDefault();
        }
      },

      /**
       * Has the user filled out the COPPA input element?
       *
       * @returns {Boolean}
       */
      coppaHasValue () {
        return !! this._getCoppaValue();
      },

      _getCoppaValue () {
        return this.getElementValue(AGE_ELEMENT);
      },

      _getAge () {
        return parseInt(this._getCoppaValue(), 10);
      },
    };
  };
});
