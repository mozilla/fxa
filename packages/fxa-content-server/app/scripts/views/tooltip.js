/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// It's a tooltip!

import $ from 'jquery';
import _ from 'underscore';
import BaseView from './base';
import Cocktail from 'cocktail';
import KeyCodes from '../lib/key-codes';
import OneVisibleOfTypeMixin from './mixins/one-visible-of-type-mixin';
import ScreenInfo from '../lib/screen-info';

const PADDING_BELOW_TOOLTIP_PX = 2;
const PADDING_ABOVE_TOOLTIP_PX = 4;

// These values should be the same as
// https://github.com/mozilla/fxa/blob/master/packages/fxa-content-server/app/styles/_breakpoints.scss#L8
const MIN_HEIGHT_TO_SHOW_TOOLTIP_BELOW = 480;
const MIN_WIDTH_TO_SHOW_TOOLTIP_BELOW = 960;

const proto = BaseView.prototype;
const Tooltip = BaseView.extend({
  tagName: 'aside',
  className: 'tooltip',
  // tracks the type of a tooltip, used for metrics purposes
  type: 'generic',

  initialize(options = {}) {
    this.message = options.message || '';
    this.unsafeMessage = options.unsafeMessage || '';

    this.dismissible = options.dismissible || false;
    this.extraClassNames = options.extraClassNames || '';

    // the tooltip has to be attached to an element.
    // By default, the tooltip is displayed just above the
    // element. If the element has the 'tooltip-below' class, the
    // tooltip is displayed just below it.
    this.invalidEl = $(options.invalidEl);
  },

  template() {
    // If both `message` and `unsafeMessage` are set, prefer `message`
    // since it'll be HTML escaped.
    if (this.message) {
      return this.translate(this.message);
    } else if (this.unsafeMessage) {
      return this.unsafeTranslate(this.unsafeMessage);
    }

    return '';
  },

  afterRender() {
    const tooltipContainer = this.invalidEl.closest('.input-row');

    this.$el.addClass(this.extraClassNames);
    this.$el.appendTo(tooltipContainer);

    this.setPosition();

    if (this.dismissible) {
      this.$el.append('<span class="dismiss" tabindex="2">&#10005;</span>');
    }

    this.bindDOMEvents();

    return proto.afterRender.call(this);
  },

  removeAndDestroy() {
    this.destroy(true);
  },

  beforeDestroy() {
    // ditch the events we manually added to reduce interference
    // between tooltips.
    const invalidEl = this.invalidEl;
    invalidEl.off('keyup change', this._destroy);
    invalidEl.find('option').off('click', this._destroy);
  },

  canShowTooltipBelow() {
    // Virtual keyboards on phones can obscure a tooltip.
    // To avoid hidden tooltips, tooltips on phones are displayed above
    // the input element. Tablets show tooltips in their default
    // locations.
    // While this heuristic isn't foolproof, it should be good enough.
    // See issue #6188
    const screenInfo = new ScreenInfo(this.window);
    return (
      screenInfo.clientHeight >= MIN_HEIGHT_TO_SHOW_TOOLTIP_BELOW &&
      screenInfo.clientWidth >= MIN_WIDTH_TO_SHOW_TOOLTIP_BELOW
    );
  },

  setPosition() {
    // by default, the position is above the input/select element
    // to show the tooltip below the element, we use JS to set
    // the top of the tooltip to be just below the element it is
    // attached to.
    const tooltipEl = this.$el;
    const invalidEl = this.invalidEl;
    if (invalidEl.hasClass('tooltip-below') && this.canShowTooltipBelow()) {
      tooltipEl.addClass('tooltip-below fade-up-tt');
      tooltipEl.css({
        top: invalidEl.outerHeight() + PADDING_ABOVE_TOOLTIP_PX,
      });
    } else {
      tooltipEl.css({
        top: -tooltipEl.outerHeight() - PADDING_BELOW_TOOLTIP_PX,
      });
      tooltipEl.addClass('fade-down-tt');
    }
  },

  bindDOMEvents() {
    const invalidEl = this.invalidEl;

    // destroy the tooltip any time the user
    // interacts with the invalid element.
    this._destroy = _.bind(this.destroy, this, true);
    // keyboard input for input/select elements.
    invalidEl.one('change', this._destroy);

    // destroy the tooltip only if it's value has changed.
    const originalValue = $(invalidEl).val().trim();
    const closeIfInvalidElementValueHasChanged = function () {
      const currValue = $(invalidEl).val().trim();
      if (currValue !== originalValue) {
        this._destroy();
      } else {
        invalidEl.one('keyup', closeIfInvalidElementValueHasChanged);
      }
    }.bind(this);

    invalidEl.one('keyup', closeIfInvalidElementValueHasChanged);
    // handle selecting an option with the mouse for select elements
    invalidEl.find('option').one('click', this._destroy);

    // destroy when dismissed
    this.$el.find('.dismiss').one(
      'click keypress',
      function (e) {
        if (e.type === 'click' || e.which === KeyCodes.ENTER) {
          const metricsEvent = 'tooltip.' + this.type + '-dismissed';
          this.logEvent(metricsEvent);
          this._destroy();
        }
      }.bind(this)
    );
  },
});

Cocktail.mixin(
  Tooltip,
  OneVisibleOfTypeMixin({
    hideMethod: 'removeAndDestroy',
    showMethod: 'afterRender',
    viewType: 'tooltip',
  })
);

export default Tooltip;
