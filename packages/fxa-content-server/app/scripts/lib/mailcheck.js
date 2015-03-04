/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A ux utility to suggest correct spelling of email domains
'use strict';

define([
  'views/tooltip',
  'lib/url',
  'mailcheck'
],
function (Tooltip, Url) {

  var DOMAINS = [ // domains that get suggested, i.e gnail.com => gmail.com
    'gmail.com', 'qq.com', 'yandex.ru', 'o2.pl', 'rambler.ru', 'googlemail.com', 't-online.de', 'mail.ru', 'web.de',
    'sbcglobal.net', 'msn.com', 'me.com', 'aol.de', 'aol.com', 'seznam.cz', 'comcast.net', 'orange.fr',
    'gmx.de', 'ymail.com', 'outlook.com', 'live.com', 'yahoo.com', 'yahoo.fr', 'yahoo.co.id'
  ];
  var SECOND_LEVEL_DOMAINS = [];
  var TOP_LEVEL_DOMAINS = [ // TLD suggestion, i.e some.cpm => some.com
    'com', 'net', 'org', 'ru', 'jp', 'de', 'fr', 'pl', 'es', 'co.uk', 'bg', 'co.id', 'cz'
  ];
  var MIN_CHARS = 5; // start suggesting email correction after MIN_CHARS
  var SUGGEST_DIV_CLASS = 'tooltip-suggest';

  function t(str, params, translator) {
    return translator.interpolate(translator.get(str), params);
  }

  /**
   * @param {Object} target DOM input node to target with mailcheck
   * @param {Object} metrics Metrics logger
   * @param {Object} translator Translator object passed by the view
   * @param {String} queryParams Window query params
   */
  return function checkMailInput(target, metrics, translator, queryParams) {
    var element = $(target);
    var enabled = false;

    // Url param flag 'mailcheck' to disable the feature unless the flag is set
    if (Url.searchParam('mailcheck', queryParams) === '1') {
      enabled = true;
    }

    if (element.val().length > MIN_CHARS && enabled) {
      element.mailcheck({
        domains: DOMAINS,
        secondLevelDomains: SECOND_LEVEL_DOMAINS,
        topLevelDomains: TOP_LEVEL_DOMAINS,
        suggested: function (element, suggestion) {
          // avoid suggesting empty or incomplete domains
          var incompleteDomain = ! suggestion || ! suggestion.domain ||
            suggestion.domain.indexOf('.') === -1;

          if (incompleteDomain) {
            return;
          }

          // user got a suggestion to check their email input
          metrics.logEvent('tooltip.mailcheck-suggested');
          var tooltip = new Tooltip({
            message: t('Did you mean <span>%(domain)s</span>?', suggestion, translator),
            invalidEl: target,
            type: 'mailcheck',
            extraClassNames: SUGGEST_DIV_CLASS,
            dismissible: true
          });

          tooltip.render();

          tooltip.$el.on('click', 'span', function () {
            element.val(suggestion.full);
            // the user has used the suggestion
            metrics.logEvent('tooltip.mailcheck-used');
            tooltip._destroy();
          });
        }
      });
    }
  };
});
