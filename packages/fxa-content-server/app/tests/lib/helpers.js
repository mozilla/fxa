/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import Constants from 'lib/constants';
import ProfileMock from '../mocks/profile.js';
import sinon from 'sinon';

function noOp() {}

function ifDocumentFocused(callback, done = noOp) {
  if (document.hasFocus && document.hasFocus()) {
    callback();
  } else {
    const message =
      'Cannot check for focus - document does not have focus.\n' +
      'If this is in CircleCI, or Opera, this is expected.\n' +
      'Otherwise, try focusing the test document instead of \n' +
      'another window or dev tools.';

    console.warn(message);
    done();
  }
}

function requiresFocus(callback, done) {
  // Give the document focus
  window.focus();

  // Remove focus from any focused element
  if (document.activeElement) {
    document.activeElement.blur();
  }

  ifDocumentFocused(callback, done);
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
    if (
      typeof fxaClient[key] === 'function' &&
      typeof fxaClient[key].restore === 'function'
    ) {
      fxaClient[key].restore();
    }
  }
}

function wrapAssertion(fn, done) {
  try {
    fn();
    done();
  } catch (e) {
    done(e);
  }
}

function createRandomString(length, base = 36) {
  let str = '';
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < length; ++i) {
    const indexToUse = Math.floor(Math.random() * base);
    str += alphabet.charAt(indexToUse);
  }

  return str;
}

const createRandomHexString = (length) => createRandomString(length, 16);

function createUid() {
  return createRandomHexString(Constants.UID_LENGTH);
}

function createEmail() {
  return 'signin' + Math.random() + '@restmail.net';
}

function emailToUser(email) {
  return email.split('@')[0];
}

function getValueLabel(value) {
  if (_.isUndefined(value)) {
    return 'not set';
  } else if (value === '') {
    return 'empty';
  } else if (/^\s+$/.test(value)) {
    return 'whitespace only';
  }

  return value;
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

function toSearchString(obj) {
  var searchString = '?';
  var pairs = [];

  for (var key in obj) {
    var value = obj[key];
    if (!_.isUndefined(value)) {
      pairs.push(key + '=' + encodeURIComponent(value));
    }
  }

  return searchString + pairs.join('&');
}

function stubbedProfileClient() {
  var profileClientMock = new ProfileMock();

  sinon.stub(profileClientMock, 'getAvatar').callsFake(function () {
    return Promise.resolve({});
  });

  return profileClientMock;
}

export default {
  addFxaClientSpy,
  createEmail,
  createRandomHexString,
  createRandomString,
  createUid,
  emailToUser,
  getValueLabel,
  ifDocumentFocused,
  indexOfEvent,
  isErrorLogged,
  isEventLogged,
  removeFxaClientSpy,
  requiresFocus,
  stubbedProfileClient,
  toSearchString,
  wrapAssertion,
};
