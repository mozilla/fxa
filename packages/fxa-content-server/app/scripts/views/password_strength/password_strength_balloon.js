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

import BaseView from '../base';
import Cocktail from 'cocktail';
import OneVisibleOfTypeMixin from '../mixins/one-visible-of-type-mixin';
import Template from '../../templates/partial/password-strength-balloon.mustache';
import XSS from '../../lib/xss';

const DELAY_BEFORE_UPDATE_MS = 1000;
// Allow the balloon to stay visible for a bit so that
// the user can see all the criteria were met.
const DELAY_BEFORE_HIDE_MS = DELAY_BEFORE_UPDATE_MS + 750;

const DELAY_BEFORE_HIDE_BALLOON_EL_MS = 500;

const PASSWORD_STRENGTH_BALLOON_SELECTOR = '.password-strength-balloon';
const ESCAPED_SUMO_ARTICLE_HREF = XSS.href('https://support.mozilla.org/kb/password-strength');

class PasswordStrengthBalloonView extends BaseView {
  template = Template;

  initialize (config = {}) {
    this.delayBeforeUpdateMS = config.delayBeforeUpdateMS || DELAY_BEFORE_UPDATE_MS;
    this.delayBeforeHideMS = config.delayBeforeHideMS || DELAY_BEFORE_HIDE_MS;

    this.listenTo(this.model, 'change:hasEnteredPassword', () => this.update());
    this.listenTo(this.model, 'change:isCommon', () => this.update());
    this.listenTo(this.model, 'change:isSameAsEmail', () => this.update());
    this.listenTo(this.model, 'change:isTooShort', () => this.update());

    this.listenTo(this.model, 'change:isValid', () => this.hideIfValid());
  }

  setInitialContext (context) {
    context.set({
      escapedCommonPasswordLinkAttrs: `href="${ESCAPED_SUMO_ARTICLE_HREF}" target="_blank"`
    });
  }

  afterRender () {
    // Show the balloon if the model is already invalid.
    if (this.model.validate()) {
      this.show();
    }
  }

  hideIfValid () {
    if (this.model.get('isValid')) {
      this.clearTimeouts();
      return this.hideAfterDelay();
    }
  }

  update () {
    // Render immediately if submitting so the user sees immediate
    // feedback, otherwise introduce a short delay to reduce jank.
    if (this.model.get('isSubmitting')) {
      return this.render();
    } else {
      return this.renderAfterDelay();
    }
  }

  clearTimeouts () {
    this.clearTimeout(this._hideTimeout);
    this.clearTimeout(this._hideBalloonElTimeout);
    this.clearTimeout(this._renderTimeout);
  }

  renderAfterDelay () {
    this.clearTimeouts();

    this._renderTimeout = this.setTimeout(() => {
      this.render();
    }, this.delayBeforeUpdateMS);
  }

  show () {
    this.model.set('isVisible', true);
    this.$(PASSWORD_STRENGTH_BALLOON_SELECTOR).show().css('opacity', '1');
  }

  hide () {
    const $balloonEl = this.$(PASSWORD_STRENGTH_BALLOON_SELECTOR);
    this.model.set('isVisible', false);
    $balloonEl.css('opacity', '0');
    this._hideBalloonElTimeout = this.setTimeout(() => {
      // In addition to the opacity, the element must be hidden
      // or else it overlays the subsequent input elements making
      // them impossible to click or tap into.
      // `transitionend` is not fired for an unknown reason.
      $balloonEl.hide();
    }, DELAY_BEFORE_HIDE_BALLOON_EL_MS);
  }

  hideAfterDelay () {
    // Only hide if already visible. This helps to prevent
    // jank if the bubble goes away, the user removes
    // one character to make the password invalid, then
    // they immediately type a character again making the
    // password valid again.
    if (this.model.get('isVisible')) {
      // force a re-render so that the list-item icons
      // update just before hiding
      this.renderAfterDelay();

      this._hideTimeout = this.setTimeout(() => {
        this.hide();
      }, this.delayBeforeHideMS);
    }
  }
}

Cocktail.mixin(
  PasswordStrengthBalloonView,
  OneVisibleOfTypeMixin({
    hideMethod: 'hide',
    showMethod: 'show',
    viewType: 'tooltip'
  })
);

export default PasswordStrengthBalloonView;
