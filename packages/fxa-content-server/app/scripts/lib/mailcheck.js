/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A ux utility to suggest correct spelling of email domains

/* exceptsPaths: mailcheck */
define([
  'views/tooltip',
  'mailcheck'
],
function (Tooltip) {
  'use strict';

  var DOMAINS = [];
  var SECOND_LEVEL_DOMAINS = [ // domains that get suggested, i.e gnail => gmail
    'gmail', 'qq', 'yandex', 'o2', 'rambler', 'googlemail', 't-online', 'mail', 'web',
    'sbcglobal', 'msn', 'hotmail', 'me', 'aol', 'seznam', 'comcast', 'orange',
    'gmx', 'ymail', 'outlook', 'live', 'yahoo'
  ];
  var TOP_LEVEL_DOMAINS = [];
  var MIN_CHARS = 5; // start suggesting email correction after MIN_CHARS
  var SUGGEST_DIV_CLASS = 'tooltip-suggest';

  function t(str, params, translator) {
    return translator.interpolate(translator.get(str), params);
  }

  /**
   * @param {Object} target DOM input node to target with mailcheck
   * @param {Object} metrics Metrics logger
   * @param {Object} translator Translator object passed by the view
   * @param {Object} view View mailcheck is used with
   */
  return function checkMailInput(target, metrics, translator, view) {
    var element = $(target);
    if (! element.length || ! view) {
      return;
    }

    // check if the text value was changed before showing the tooltip
    if (element.data('previousValue') !== element.val() && element.val().length > MIN_CHARS) {
      view.experimentTrigger('mailcheck.triggered');

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
          view.experimentTrigger('mailcheck.suggested');
          if (view.isInExperimentGroup('mailcheck', 'treatment')) {
            var tooltip = new Tooltip({
              message: t('Did you mean <span tabindex="1">%(domain)s</span>?', suggestion, translator),
              invalidEl: target,
              type: 'mailcheck',
              extraClassNames: SUGGEST_DIV_CLASS,
              dismissible: true
            });

            tooltip.render();
            // set that this value was suggested, user might not click on the tooltip
            // but still take the suggestion
            element.data('mailcheckValue', suggestion.full);

            tooltip.$el.on('click keypress', 'span', function (e) {
              // if a click event is triggered or an enter key is pressed, destroy
              // the tooltip.
              if (e.type === 'click' || e.which === 13) {
                element.val(suggestion.full);
                // the user has used the suggestion
                view.experimentTrigger('mailcheck.clicked');
                tooltip._destroy();
              }
            });
          }
        }
      });
    }
    element.data('previousValue', element.val());
  };
});
