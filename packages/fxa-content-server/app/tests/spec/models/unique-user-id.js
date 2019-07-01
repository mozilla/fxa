/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import chai from 'chai';
import ResumeToken from 'models/resume-token';
import Storage from 'lib/storage';
import UniqueUserId from 'models/unique-user-id';
import Url from 'lib/url';
import WindowMock from '../../mocks/window';

var assert = chai.assert;

describe('models/unique-user-id', function() {
  var uniqueUserId;
  var windowMock;

  function createUniqueUserId() {
    uniqueUserId = new UniqueUserId({
      window: windowMock,
    });
  }

  beforeEach(function() {
    windowMock = new WindowMock();
  });

  afterEach(function() {
    uniqueUserId = null;
  });

  it('fetches from the `resume` search parameter, if available', function() {
    windowMock.location.search = Url.objToSearchString({
      resume: ResumeToken.stringify({
        uniqueUserId: 'uniqueUserId from resume token',
      }),
    });

    createUniqueUserId();

    assert.equal(
      uniqueUserId.get('uniqueUserId'),
      'uniqueUserId from resume token'
    );
  });

  it('fetches from localStorage if not available in the `resume` token', function() {
    windowMock.location.search = Url.objToSearchString({
      resume: ResumeToken.stringify({ campaign: 'spring2015' }),
    });

    var storage = Storage.factory('localStorage', windowMock);
    storage.set('uniqueUserId', 'uniqueUserId from localStorage');

    createUniqueUserId();

    assert.equal(
      uniqueUserId.get('uniqueUserId'),
      'uniqueUserId from localStorage'
    );
  });

  it('falls back to creating a new token otherwise', function() {
    createUniqueUserId();

    assert.ok(uniqueUserId.get('uniqueUserId'), 'fallback to creating an id');
  });

  it('persists to & loads from localStorage', function() {
    var storage = Storage.factory('localStorage', windowMock);
    createUniqueUserId();

    // saves to localStorage
    assert.equal(storage.get('uniqueUserId'), uniqueUserId.get('uniqueUserId'));

    // load from localStorage
    storage.set('uniqueUserId', 'stored in uniqueUserId');

    createUniqueUserId();
    assert.equal(uniqueUserId.get('uniqueUserId'), 'stored in uniqueUserId');
  });

  it('does not migrates data stored in `localStorage.uuid` to `localStorage.uniqueUserId`', function() {
    var storage = Storage.factory('localStorage', windowMock);
    var uniqueUserId = 'originally stored in uuid';
    storage.set('uuid', uniqueUserId);

    createUniqueUserId();

    assert.equal(storage.get('uuid'), uniqueUserId);
    assert.notEqual(storage.get('uuid'), storage.get('uniqueUserId'));
    assert.ok(storage.get('uniqueUserId'));
  });
});
