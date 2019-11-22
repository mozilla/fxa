/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A mixin to autocomplete common domains from `datalist option` `value`s.
 */
import Template from 'templates/partial/email-autocomplete-domains.mustache';
import UserAgentMixin from '../../lib/user-agent-mixin';

export const EMAIL_SELECTOR = 'input[type=email]';
export const DATALIST_OPTIONS_SELECTOR = '#autocomplete-domain option';
export const FOCUS_HACK_SELECTOR = '#focus-hack';

export const DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'qq.com',
  'web.de',
  'aol.com',
  'mail.ru',
  'icloud.com',
  'gmx.de',
  't-online.de',
  'orange.fr',
  'yandex.ru',
  'yahoo.fr',
  'live.com',
  '163.com',
  'msn.com',
  'comcast.net',
  'hotmail.co.uk',
  'hotmail.fr',
];

export default {
  events: {
    [`keyup ${EMAIL_SELECTOR}`]: '_toggleDomainAutocomplete',
  },
  dependsOn: [UserAgentMixin],

  setInitialContext(context) {
    const unsafeEmailAutocompleteDomainsHTML = this.renderTemplate(Template, {
      options: DOMAINS,
    });
    context.set({
      unsafeEmailAutocompleteDomainsHTML,
    });
  },

  afterRender() {
    this.isAndroid = this.getUserAgent().isAndroid();
    this.isChrome = this.getUserAgent().isChrome();
    this.isEdge = this.getUserAgent().isEdge();
    this.input = this.$(EMAIL_SELECTOR);
    this.datalistOptions = this.$(DATALIST_OPTIONS_SELECTOR);
    this.focusHack = this.$(FOCUS_HACK_SELECTOR);
    this.previousUsername = null;
  },

  /**
   * A catch-most-browsers hack when datalist options are modified.
   * Chrome otherwise shows all options when '@' is typed,
   * Safari immediately goes to the dropdown preventing users
   * from typing further, and FF will not update the dropdown on `keyup`
   * and has a known bug with dynamic datalists
   * https://bugzilla.mozilla.org/show_bug.cgi?id=1474137
   */
  _focusHack() {
    this.focusHack.focus();
    this.input.focus();
  },

  _toggleDomainAutocomplete() {
    const inputValue = this.input.val();
    const [username] = inputValue.split('@');

    if (
      inputValue.length >= 2 &&
      inputValue.includes('@') &&
      (username !== this.previousUsername || !this.input.attr('list'))
    ) {
      // Chrome, Android browsers,a nd Edge show all options when '@' is typed.
      // Non-Android Chrome is covered in `_focusHack` but if the device is
      // Android we must wait until there is one additional character.
      if ((!this.isAndroid && !this.isEdge) || !inputValue.endsWith('@')) {
        // Trigger _before_ datalist option mods here because Chrome
        // looks janky if text entered pulls up the autocomplete list, but
        // NOT in Chrome Android because it _causes_ jankiness
        if (!this.isAndroid && this.isChrome) {
          this._focusHack();
        }
        // Dynamically add/remove `list` attr because it makes conditionals
        // easier and Chrome otherwise shows all options on focus
        this.input.attr('list', 'autocomplete-domain');
        this.datalistOptions.each((index, option) => {
          option.setAttribute('value', `${username}@${DOMAINS[index]}`);
        });

        // Causes jankiness in Chrome Android, needed in other cases
        if (!this.isAndroid || (this.isAndroid && !this.isChrome)) {
          this._focusHack();
        }
      }
    } else if (!inputValue.includes('@') && this.input.attr('list')) {
      this.input.removeAttr('list');
      this.datalistOptions.each((_, option) => {
        option.removeAttribute('value');
      });
      this._focusHack();
    }

    this.previousUsername = username;
  },
};
