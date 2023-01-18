/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import guid from './guid';
import NavigationTiming from './navigation-timing';
import Timers from './timers';
import Events from './events';
import { getPerformanceApi } from './performance-factory';

var SpeedTrap = {
  init: function (options) {
    options = options || {};

    // This will provide the browser's performance API, or a fallback version which has
    // reduced functionality. The exact performance API can also be passed in as option
    // for testing purposes.
    this.performance = options.performance || getPerformanceApi();
    this.baseTime = parseInt(this.performance.timeOrigin);

    this.navigationTiming = Object.create(NavigationTiming);
    this.navigationTiming.init({
      performance: this.performance,
      useL1Timings: options.useL1Timings,
    });

    this.timers = Object.create(Timers);
    this.timers.init({ performance: this.performance });

    this.events = Object.create(Events);
    this.events.init({ performance: this.performance });

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

    const navigationTiming = this.navigationTiming.diff();

    return {
      uuid: this.uuid,
      puuid: previousPageUUID,
      navigationTiming,
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
      // The performance API keeps track of the current duration. The exact way this is done
      // may vary depending on the browser's implementation. We will assume that as long as we
      // stay within the confines of the browser's implementation, this value is reasonable.
      // What is not reasonable is assuming the that we can Subtract Date.now() from
      // performance.timeOrigin or performance.timings.navigationStart and get a valid value.
      // It's very likely the performance API is using a monotonic clock that does not match our
      // current system clock.
      duration: parseInt(this.performance.now()),
      timers: this.timers.get(),
      events: this.events.get(),
    };
  },

  /**
   * Return the current time using speed trap's clock. If the performance api is available
   * its monotonic clock will be used. Otherwise the system clock is used (ie Date.now()).
   *
   * Note: The system clock is susceptible to edge cases were a machine sleeps during a load
   * operation. In this case we may result produce a very large metric.
   *
   * Note: performance.now() will likely differ from Date.now() and is not expected to be the real
   * time. Please be aware of what underlying implementation is in use when calling this function.
   */
  now: function () {
    // Chrome's performance api returns floats, but our API requires integers.
    return parseInt(this.performance.timeOrigin + this.performance.now());
  },

  /**
   * Legacy browsers can end up in suspect states when a machine is put into sleep mode during
   * metrics collection. This flag indicates the machine is likely in an invalid state.
   */
  isInSuspectState: function () {
    if (this.performance.unreliable === true) {
      return this.performance.isInSuspectState();
    }
    return false;
  },
};

export default Object.create(SpeedTrap);
