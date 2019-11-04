/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A ux utility to suggest correct spelling of email domains

import _ from 'underscore';
import KeyCodes from './key-codes';
import mailcheck from 'mailcheck';
import Tooltip from '../views/tooltip';
const t = msg => msg;

const DOMAINS = [];
const SECOND_LEVEL_DOMAINS = [
  // domains that get suggested, i.e gnail => gmail
  'gmail',
  'qq',
  'yandex',
  'o2',
  'rambler',
  'googlemail',
  't-online',
  'mail',
  'web',
  'sbcglobal',
  'msn',
  'hotmail',
  'me',
  'aol',
  'seznam',
  'comcast',
  'orange',
  'gmx',
  'ymail',
  'outlook',
  'live',
  'yahoo',
];
const TOP_LEVEL_DOMAINS = [];
const MIN_CHARS = 5; // start suggesting email correction after MIN_CHARS

const DID_YOU_MEAN_TEXT = t(
  'Did you mean <span %(escapedEmailSuggestionAttrs)s>%(escapedDomain)s</span>?'
);

/**
 * @param {Object} target DOM input node to target with mailcheck
 * @param {Object} view View mailcheck is used with
 * @returns {Boolean} true if domain name contains a common error, false otw.
 */
export default function checkMailInput(target, view) {
  var $element = view.$(target);
  if (!$element.length || !view) {
    return false;
  }
  const email = $element.val();
  // only show the tooltip if the previous value is not the same as the current value.
  if ($element.data('previousValue') === email || email.length <= MIN_CHARS) {
    return false;
  }

  view.logEvent('mailcheck.triggered');

  const suggestion = mailcheck.run({
    email,
    domains: DOMAINS,
    secondLevelDomains: SECOND_LEVEL_DOMAINS,
    topLevelDomains: TOP_LEVEL_DOMAINS,
  });

  // avoid suggesting empty or incomplete domains
  if (
    !suggestion ||
    !suggestion.full ||
    !suggestion.domain ||
    suggestion.domain.indexOf('.') === -1
  ) {
    return false;
  }

  $element.data('previousValue', email);

  // user got a suggestion to check their email input
  view.logEvent('mailcheck.suggested');
  const message = view.unsafeTranslate(DID_YOU_MEAN_TEXT, {
    escapedDomain: _.escape(suggestion.domain),
    escapedEmailSuggestionAttrs: 'id="email-suggestion" tabindex="1"',
  });

  let tooltip = new Tooltip({
    dismissible: true,
    extraClassNames: 'tooltip-suggest tooltip-error',
    invalidEl: target,
    type: 'mailcheck',
    unsafeMessage: message,
  });

  tooltip.render();
  // set that this value was suggested, user might not click on the tooltip
  // but still take the suggestion
  $element.data('mailcheckValue', suggestion.full);

  tooltip.$el.on('click keypress', 'span', e => {
    // if a click event is triggered or an enter key is pressed, destroy
    // the tooltip.
    if (e.type === 'click' || e.which === KeyCodes.ENTER) {
      $element.val(suggestion.full);
      // the user has used the suggestion
      view.logEvent('mailcheck.clicked');
      tooltip._destroy();
      tooltip = null;
    }
  });

  return true;
}
