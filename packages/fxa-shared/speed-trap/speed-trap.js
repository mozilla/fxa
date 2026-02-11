/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import guid from './guid';
import Timers from './timers';
import Events from './events';

var SpeedTrap = {
  init: function (options) {
    options = options || {};

    // This will provide the browser's performance API, or a fallback version which has
    // reduced functionality. The exact performance API can also be passed in as option
    // for testing purposes.
    this.baseTime = Date.now();

    this.timers = Object.create(Timers);
    this.timers.init();

    this.events = Object.create(Events);
    this.events.init();

    this.uuid = guid();

    this.tags = options.tags || [];

    // store a bit with the site being tracked to avoid sending cookies to
    // rum-diary.org. This bit keeps track whether the user has visited
    // this site before. Since localStorage is scoped to a particular
    // domain, it is not shared with other sites.
    try {
      // eslint-disable-next-line no-undef
      this.returning = !!localStorage.getItem('_st');
      // eslint-disable-next-line no-undef
      localStorage.setItem('_st', '1');
    } catch (e) {
      // if cookies are disabled, localStorage access will blow up.
    }
  },

  /**
   * Data to send on page load.
   */
  getLoad: function () {
    // puuid is saved for users who visit another page on the same
    // site. The current page will be updated to set its is_exit flag
    // to false as well as update which page the user goes to next.
    var previousPageUUID;
    try {
      // eslint-disable-next-line no-undef
      previousPageUUID = sessionStorage.getItem('_puuid');
      // eslint-disable-next-line no-undef
      sessionStorage.removeItem('_puuid');
    } catch (e) {
      // if cookies are disabled, sessionStorage access will blow up.
    }

    return {
      uuid: this.uuid,
      puuid: previousPageUUID,
      // eslint-disable-next-line no-undef
      referrer: document.referrer || '',
      tags: this.tags,
      returning: this.returning,
      screen: {
        // eslint-disable-next-line no-undef
        width: window.screen.width,
        // eslint-disable-next-line no-undef
        height: window.screen.height,
      },
    };
  },

  /**
   * Data to send on page unload
   */
  getUnload: function () {
    // puuid is saved for users who visit another page on the same
    // site. The current page will be updated to set its is_exit flag
    // to false as well as update which page the user goes to next.
    try {
      // eslint-disable-next-line no-undef
      sessionStorage.setItem('_puuid', this.uuid);
    } catch (e) {
      // if cookies are disabled, sessionStorage access will blow up.
    }

    return {
      uuid: this.uuid,
      duration: Date.now() - this.baseTime,
      timers: this.timers.get(),
      events: this.events.get(),
    };
  },

  /**
   * Return the current time. We used to performance api's clock, but this proved unreliable due to variations between browsers.
   *
   * Note: We used to use performance.now(), which is a monotonic clock, but this proved problematic due to unreliable implementations
   * on some systems.
   */
  now: function () {
    return Date.now();
  },
};

export default Object.create(SpeedTrap);
