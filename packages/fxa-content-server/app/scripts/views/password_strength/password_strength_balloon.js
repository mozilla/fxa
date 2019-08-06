/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Display a password strength balloon. Component automatically
 * updates whenever changes are made to the underlying model.
 *
 * @export
 * @class PasswordStrengthBalloonView
 * @extends {BaseView}
 */

import AuthErrors from '../../lib/auth-errors';
import BaseView from '../base';
import Cocktail from 'cocktail';
import OneVisibleOfTypeMixin from '../mixins/one-visible-of-type-mixin';
import Template from '../../templates/partial/password-strength-balloon.mustache';
import XSS from '../../lib/xss';

// Allow the balloon to stay visible for a bit so that
// the user can see all the criteria were met.
const DELAY_BEFORE_HIDE_MS = 750;

const DELAY_BEFORE_HIDE_BALLOON_EL_MS = 500;

const PASSWORD_STRENGTH_BALLOON_SELECTOR = '.password-strength-balloon';
const ESCAPED_SUMO_ARTICLE_HREF = XSS.href(
  'https://support.mozilla.org/kb/password-strength'
);

class PasswordStrengthBalloonView extends BaseView {
  template = Template;

  initialize(config = {}) {
    this.delayBeforeHideMS = config.delayBeforeHideMS || DELAY_BEFORE_HIDE_MS;

    this.listenTo(this.model, 'change:password', this.update);
  }

  setInitialContext(context) {
    const validationError = this.model.validationError;

    context.set({
      escapedCommonPasswordLinkAttrs: `href="${ESCAPED_SUMO_ARTICLE_HREF}" target="_blank" tabindex="-1"`,
      isCommon:
        validationError &&
        AuthErrors.is(validationError, 'PASSWORD_TOO_COMMON'),
      isSameAsEmail:
        validationError &&
        AuthErrors.is(validationError, 'PASSWORD_SAME_AS_EMAIL'),
      isTooShort:
        validationError &&
        (AuthErrors.is(validationError, 'PASSWORD_REQUIRED') ||
          AuthErrors.is(validationError, 'PASSWORD_TOO_SHORT')),
    });
  }

  afterRender() {
    if (this.model.validationError) {
      // OneVisibleOfTypeMixin uses 'show' to destroy any other
      // tooltip-like views.
      this.show();
    }
  }

  update() {
    this.clearTimeouts();
    return this.render().then(() => {
      if (!this.model.validationError) {
        return this.hideAfterDelay();
      }
    });
  }

  clearTimeouts() {
    this.clearTimeout(this._hideTimeout);
    this.clearTimeout(this._hideBalloonElTimeout);
  }

  show() {
    this.$(PASSWORD_STRENGTH_BALLOON_SELECTOR)
      .show()
      .css('opacity', '1');
  }

  hide() {
    const $balloonEl = this.$(PASSWORD_STRENGTH_BALLOON_SELECTOR);
    $balloonEl.css('opacity', '0');
    this._hideBalloonElTimeout = this.setTimeout(() => {
      // In addition to the opacity, the element must be hidden
      // or else it overlays the subsequent input elements making
      // them impossible to click or tap into.
      // `transitionend` is not fired for an unknown reason.
      $balloonEl.hide();
    }, DELAY_BEFORE_HIDE_BALLOON_EL_MS);
  }

  hideAfterDelay() {
    this._hideTimeout = this.setTimeout(() => {
      this.hide();
    }, this.delayBeforeHideMS);
  }
}

Cocktail.mixin(
  PasswordStrengthBalloonView,
  OneVisibleOfTypeMixin({
    hideMethod: 'hide',
    showMethod: 'show',
    viewType: 'tooltip',
  })
);

export default PasswordStrengthBalloonView;
