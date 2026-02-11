/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Receive a message over postMessage.
 */

import _ from 'underscore';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import Logger from 'lib/logger';

function PostMessageReceiver() {
  // nothing to do
}
_.extend(PostMessageReceiver.prototype, Backbone.Events, {
  initialize(options) {
    options = options || {};

    this._origin = options.origin;
    this._window = options.window;

    this._boundReceiveEvent = this.receiveEvent.bind(this);
    this._window.addEventListener('message', this._boundReceiveEvent, false);
    this._logger = new Logger(this._window);
  },

  isOriginIgnored(origin) {
    // A lot of messages are sent with the origin `chrome://browser`, whether
    // these are from Firefox or addons, we are not sure. Completely ignore
    // these messages. See #3465
    return origin === 'chrome://browser';
  },

  isOriginTrusted(origin) {
    // `message` events that come from the Fx Desktop browser have an
    // origin of the string constant 'null'. See
    // https://developer.mozilla.org/docs/Web/API/Window/postMessage#Using_win.postMessage_in_extensions
    // and
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1040257
    // These messages are trusted by default.
    //
    // Messages from the functional tests come from the page itself.
    if (origin === 'null') {
      return true;
    }

    return this._origin === origin;
  },

  receiveEvent(event) {
    if (event.type !== 'message') {
      return; // not an expected type of event
    }

    var origin = event.origin;
    if (this.isOriginIgnored(origin)) {
      this._logger.error('postMessage received from %s, ignoring', origin);
    } else if (!this.isOriginTrusted(origin)) {
      this._logger.error(
        'postMessage received from %s, expected %s',
        origin,
        this._origin
      );

      // from an unexpected origin, drop it on the ground.
      var err = AuthErrors.toError('UNEXPECTED_POSTMESSAGE_ORIGIN');
      // set the unexpected origin as the context, this will be logged.
      err.context = origin;

      this.trigger('error', { error: err });
    } else if (!event.data) {
      this.trigger('error', { error: new Error('malformed event') });
    } else {
      this.trigger('message', event.data);
    }
  },

  teardown() {
    this._window.removeEventListener('message', this._boundReceiveEvent, false);
  },
});

export default PostMessageReceiver;
