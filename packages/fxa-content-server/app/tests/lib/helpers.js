/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'sinon',
  'lib/promise',
  '../mocks/profile.js'
], function (sinon, p, ProfileMock) {
  'use strict';

  function requiresFocus(callback, done) {
    // Give the document focus
    window.focus();

    // Remove focus from any focused element
    if (document.activeElement) {
      document.activeElement.blur();
    }

    if (document.hasFocus && document.hasFocus()) {
      callback();
    } else {
      var message =
          'Cannot check for focus - document does not have focus.\n' +
          'If this is in Travis-CI, Sauce Labs, or Opera, this is expected.\n' +
          'Otherwise, try focusing the test document instead of \n' +
          'another window or dev tools.';

      console.warn(message);
      if (done) {
        done();
      }
    }
  }

  function addFxaClientSpy(fxaClient) {
    // create spies that can be used to check which parameters
    // are passed to the FxaClient
    for (var key in fxaClient) {
      if (typeof fxaClient[key] === 'function') {
        try {
          sinon.spy(fxaClient, key);
        } catch (e) {
          console.error('error with spy: %s', String(e));
        }
      }
    }
  }

  function removeFxaClientSpy(fxaClient) {
    // return the client to its original state.
    for (var key in fxaClient) {
      if (typeof fxaClient[key] === 'function' &&
          typeof fxaClient[key].restore === 'function') {
        fxaClient[key].restore();
      }
    }
  }

  function wrapAssertion(fn, done) {
    try {
      fn();
    } catch (e) {
      done(e);
    }
    done();
  }

  function createRandomHexString(length) {
    var str = '';
    var lettersToChooseFrom = 'abcdefABCDEF01234567890';
    var numberOfPossibilities = lettersToChooseFrom.length;

    for (var i = 0; i < length; ++i) {
      var indexToUse = Math.floor(Math.random() * numberOfPossibilities);
      str += lettersToChooseFrom.charAt(indexToUse);
    }

    return str;
  }

  function createEmail() {
    return 'signin' + Math.random() + '@restmail.net';
  }

  function emailToUser(email) {
    return email.split('@')[0];
  }

  function indexOfEvent(metrics, eventName) {
    var events = metrics.getFilteredData().events;

    for (var i = 0; i < events.length; ++i) {
      var event = events[i];
      if (event.type === eventName) {
        return i;
      }
    }

    return -1;
  }

  function isEventLogged(metrics, eventName) {
    return indexOfEvent(metrics, eventName) !== -1;
  }

  function isErrorLogged(metrics, error) {
    var eventName = metrics.errorToId(error);
    return isEventLogged(metrics, eventName);
  }

  function isScreenLogged(metrics, screenName) {
    var eventName = metrics.screenToId(screenName);
    return isEventLogged(metrics, eventName);
  }

  function toSearchString(obj) {
    var searchString = '?';
    var pairs = [];

    for (var key in obj) {
      pairs.push(key + '=' + encodeURIComponent(obj[key]));
    }

    return searchString + pairs.join('&');
  }

  function stubbedProfileClient () {
    var profileClientMock = new ProfileMock();

    sinon.stub(profileClientMock, 'getAvatar', function () {
      return p({});
    });

    return profileClientMock;
  }

  return {
    requiresFocus: requiresFocus,
    addFxaClientSpy: addFxaClientSpy,
    removeFxaClientSpy: removeFxaClientSpy,
    wrapAssertion: wrapAssertion,
    createRandomHexString: createRandomHexString,
    createEmail: createEmail,
    emailToUser: emailToUser,
    indexOfEvent: indexOfEvent,
    isEventLogged: isEventLogged,
    isErrorLogged: isErrorLogged,
    isScreenLogged: isScreenLogged,
    toSearchString: toSearchString,
    stubbedProfileClient: stubbedProfileClient
  };
});
