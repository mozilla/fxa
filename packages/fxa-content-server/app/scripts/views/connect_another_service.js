/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import BaseView from './base';
import Template from 'templates/connect_another_service.mustache';
import UserAgentMixin from '../lib/user-agent-mixin';
import VerificationReasonMixin from './mixins/verification-reason-mixin';

const SERVICES = [
  {
    description: 'A Secure Notepad App.',
    image: 'notes',
    links: {
      android: 'https://play.google.com/store/apps/details?id=org.mozilla.testpilot.notes&hl=en',
    },
    name: 'Notes',
  },
  {
    description: 'Save articles, videos and stories from any publication, page or app.',
    image: 'pocket',
    links: {
      android: 'https://getpocket.com/ff_signin?s=pocket&t=login',
      ios: 'https://getpocket.com/ff_signin?s=pocket&t=login'
    },
    name: 'Pocket',
  },
  {
    description: 'Take your passwords everywhere with Firefox Lockbox.',
    image: 'lockbox',
    links: {
      ios: 'https://itunes.apple.com/us/app/firefox-lockbox/id1314000270?mt=8',
    },
    name: 'Lockbox',
  },
  {
    description: 'Detects threats against your online accounts.',
    image: 'monitor',
    links: {
      website: 'https://monitor.firefox.com/',
    },
    name: 'Monitor',
  },
  {
    description: 'Screenshots made simple.',
    image: 'screenshots',
    links: {
      website: 'https://screenshots.firefox.com/',
    },
    name: 'Screenshots',
  }
];


const View = BaseView.extend({
  className: 'connect-another-service',
  template: Template,

  events: {
    'click .open-link': '_logLinkMetrics',
  },

  setInitialContext(context) {
    const services = this._filterServices();
    const isSignIn = this.isSignIn();
    const isSignUp = this.isSignUp();
    const showSuccessMessage = this._showSuccessMessage();

    context.set({
      'connect-services': services,
      isSignIn,
      isSignUp,
      showSuccessMessage
    });
  },

  _filterServices() {
    const userAgent = this.getUserAgent();

    const supportedServices = SERVICES.filter((service) => {
      if (service.links.android && (userAgent.isFirefoxAndroid() || userAgent.isAndroid())) {
        service.link = service.links.android;
        return service;
      } else if (service.links.ios && (userAgent.isFirefoxIos() || userAgent.isIos())) {
        service.link = service.links.ios;
        return service;
      } else if (service.links.website) {
        service.link = service.links.website;
        return service;
      }
    });

    return supportedServices;
  },

  _showSuccessMessage() {
    return !! this.model.get('showSuccessMessage') ||
      !! this.getSearchParam('showSuccessMessage');
  },

  _logLinkMetrics(event) {
    const service = this.$(event.currentTarget).attr('data-service');
    this.logViewEvent(`clicked.${service}`);
  },
});


Cocktail.mixin(
  View,
  UserAgentMixin,
  VerificationReasonMixin,
);

module.exports = View;
