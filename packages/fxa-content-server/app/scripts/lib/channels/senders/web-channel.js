/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Send a message to the browser over a WebChannel. See
 * https://developer.mozilla.org/docs/Mozilla/JavaScript_code_modules/WebChannel.jsm
 */

import UserAgent from 'lib/user-agent';

const UA_OVERRIDE = 'FxATester';

class WebChannelSender {
  initialize(options = {}) {
    this._window = options.window;
    this._webChannelId = options.webChannelId;
  }

  /**
   * Send a WebChannel message.
   *
   * @param {String} command command name
   * @param {Object} data payload
   * @param {String} messageId messageId browser will respond with.
   * @returns {Promise}
   */
  send(command, data, messageId) {
    return Promise.resolve().then(() => {
      // save command name for testing purposes
      this._saveEventForTests(command, data);
      const eventDetail = createEventDetail(
        this._webChannelId,
        command,
        data,
        messageId
      );
      const event = createEvent(this._window, eventDetail);
      this._window.dispatchEvent(event);
    });
  }

  teardown() {}

  /**
   * Save the name of the event into sessionStorage, used for testing.
   *
   * @param {String} command
   * @private
   */
  _saveEventForTests(command, data) {
    const agent = this._window.navigator.userAgent;
    const isWebDriver = this._window.navigator.webdriver;
    if (!isWebDriver && agent.indexOf(UA_OVERRIDE) === -1) {
      // not running in automated tests, no reason to store this info.
      return;
    }

    let storedEvents;
    try {
      storedEvents =
        JSON.parse(this._window.sessionStorage.getItem('webChannelEvents')) ||
        [];
    } catch (e) {
      storedEvents = [];
    }

    storedEvents.push({ command, data });
    try {
      this._window.sessionStorage.setItem(
        'webChannelEvents',
        JSON.stringify(storedEvents)
      );
    } catch (e) {}
  }
}

/**
 * Create a WebChannelMessageToChrome event with the given `eventDetail`
 *
 * @param {Object} win recipient of the WebChannel event.
 * @param {Object} eventDetail `detail` property of the event.
 * @returns {Event} WebChannelMessageToChrome event.
 */
function createEvent(win, eventDetail) {
  return new win.CustomEvent('WebChannelMessageToChrome', {
    detail: formatEventDetail(win, eventDetail),
  });
}

/**
 * Create an object for the `detail` field of a WebChannelMessageToChrome event.
 *
 * @param {String} webChannelId ID of the receiving WebChannel
 * @param {String} command command name
 * @param {Object} data payload
 * @param {String} messageId messageId browser will respond with.
 * @returns {Object}
 */
function createEventDetail(webChannelId, command, data, messageId) {
  return {
    id: webChannelId,
    message: {
      command,
      data,
      messageId,
    },
  };
}

/**
 * Format the `detail` payload for the current browser.
 *
 * @param {Object} win receiving window
 * @param {Object} eventDetail `detail` payload
 * @returns {String|Object}
 */
function formatEventDetail(win, eventDetail) {
  const userAgent = new UserAgent(win.navigator.userAgent);
  // Firefox Desktop and Fennec >= 50 expect the detail to be
  // sent as a string.
  // See https://bugzilla.mozilla.org/show_bug.cgi?id=1275616 and
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1238128
  if (
    (userAgent.isFirefoxDesktop() || userAgent.isFirefoxAndroid()) &&
    userAgent.browser.version >= 50
  ) {
    return JSON.stringify(eventDetail);
  } else {
    return eventDetail;
  }
}

export default WebChannelSender;
