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

const DELAY_BEFORE_HIDE_BALLOON_EL_MS = 500;

const PASSWORD_STRENGTH_BALLOON_SELECTOR = '.password-strength-balloon';
const ESCAPED_SUMO_ARTICLE_HREF = XSS.href(
  'https://support.mozilla.org/kb/password-strength'
);

class PasswordStrengthBalloonView extends BaseView {
  template = Template;

  initialize(config = {}) {
    this.listenTo(this.model, 'change:password', this.update);
    this.listenTo(this.model, 'change:inputFocused', this.hideOrShow);
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

  hideOrShow() {
    if (!this.model.validationError && !this.model.get('inputFocused')) {
      return this.hide();
    }
    // OneVisibleOfTypeMixin uses 'show' to destroy any other
    // tooltip-like views.
    return this.show();
  }

  afterRender() {
    // We want to conditionally hide after rendering because
    // users can type an invalid password, and then type a valid
    // password and quickly change focus to beat the debounce
    // on the password change event. This allows the model to
    // update but hides the balloon in that scenario. Ref #3750
    this.hideOrShow();
  }

  update() {
    this.clearTimeout(this._hideBalloonElTimeout);
    return this.render();
  }

  show() {
    this.$(PASSWORD_STRENGTH_BALLOON_SELECTOR).show().css('opacity', '1');
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
