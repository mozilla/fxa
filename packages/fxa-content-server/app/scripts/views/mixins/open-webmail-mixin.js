/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A view mixin that helps confirm views show a redirect button
 * directly from FxA.
 */
import _ from 'underscore';

const t = (msg) => msg;

const WEBMAIL_SERVICES = [
  {
    buttonName: t('Open Gmail'),
    link: 'https://mail.google.com/mail/u/?authuser=',
    regex: /@gmail\.com$/,
    webmailType: 'gmail',
  },
  {
    buttonName: t('Open Hotmail'),
    link: 'https://outlook.live.com/',
    regex: /@hotmail\.com$/,
    webmailType: 'hotmail',
  },
  {
    buttonName: t('Open Yahoo'),
    link: 'https://mail.yahoo.com',
    regex: /@yahoo\.com$/,
    webmailType: 'yahoo',
  },
  {
    buttonName: t('Open Outlook'),
    link: 'https://outlook.live.com/',
    regex: /@outlook\.com$/,
    webmailType: 'outlook',
  },
  {
    buttonName: t('Open Restmail'),
    link: 'http://restmail.net/mail/',
    regex: /@restmail\.net/,
    webmailType: 'restmail',
  },
];

export default {
  events: {
    'click #open-webmail': '_webmailTabOpened',
  },

  addUserInfo(providerLink, email) {
    var mailType = this.getWebmailType(email);

    if (mailType === 'gmail') {
      providerLink = providerLink.concat(encodeURIComponent(email));
    } else if (mailType === 'restmail') {
      providerLink = providerLink.concat(email);
    }

    return providerLink;
  },

  _getService(email) {
    return _.find(WEBMAIL_SERVICES, function (service) {
      return service.regex.test(email);
    });
  },

  setInitialContext(context) {
    const email = context.get('email');
    const isOpenWebmailButtonVisible = this.isOpenWebmailButtonVisible(email);

    context.set('isOpenWebmailButtonVisible', isOpenWebmailButtonVisible);

    if (email && isOpenWebmailButtonVisible) {
      context.set({
        escapedWebmailLink: encodeURI(this.getWebmailLink(email)),
        // function.bind is used to avoid infinite recursion.
        // getWebmailButtonText calls this.translate which calls
        // this.context, which will call this.getContext since context is
        // not yet set. Mustache will call the helper function to get the
        // button text, context will be set, and getContext will not be called
        // again. We should fix our l10n.
        webmailButtonText: this.getWebmailButtonText.bind(this, email),
        webmailType: this.getWebmailType(email),
      });
    }
  },

  getWebmailLink(email) {
    var providerLink = this._getService(email).link;
    return this.addUserInfo(providerLink, email);
  },

  /**
   * Check if the `Open Webmail` button should be visible
   *
   * @param {String} email
   * @returns {Boolean}
   */
  isOpenWebmailButtonVisible(email) {
    // The "Open webmail" button is only visible in certain contexts
    // we do not show it in mobile context because it performs worse
    return (
      this.broker.hasCapability('openWebmailButtonVisible') &&
      !!this._getService(email)
    );
  },

  getWebmailButtonText(email) {
    return this.translate(this._getService(email).buttonName);
  },

  getWebmailType(email) {
    return this._getService(email).webmailType;
  },

  _webmailTabOpened(event) {
    var webmailType = this.$el.find(event.target).data('webmailType');
    this.logViewEvent(webmailType + '_clicked');
  },
};
