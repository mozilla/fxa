/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Handle signed-out notifications.

'use strict';

const Notifier = require('../../lib/channels/notifier');
const Session = require('../../lib/session');
const Url = require('../../lib/url');

var Mixin = {
  notifications: {
    // populated below using event name aliases
  },

  clearSessionAndNavigateToSignIn () {
    this.user.clearSignedInAccountUid();
    Session.clear();
    this.navigateToSignIn();
  },

  navigateToSignIn () {
    const queryString = Url.objToSearchString({
      context: this.relier.get('context'),
      entrypoint: this.relier.get('entrypoint'),
      service: this.relier.get('service'),
      /* eslint-disable camelcase */
      utm_campaign: this.relier.get('utmCampaign'),
      utm_content: this.relier.get('utmContent'),
      utm_medium: this.relier.get('utmMedium'),
      utm_source: this.relier.get('utmSource'),
      utm_term: this.relier.get('utmTerm')
      /* eslint-enable camelcase */
    });
    // Navigate via the back-end in order to regenerate
    // flow id and flow begin time for the next session.
    this.navigateAway(`/signin${queryString}`);
  }
};

Mixin.notifications[Notifier.SIGNED_OUT] =
            'clearSessionAndNavigateToSignIn';

module.exports = Mixin;
