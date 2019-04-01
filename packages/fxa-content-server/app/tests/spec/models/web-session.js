/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('chai').assert;
const WebSession = require('models/web-session');
const sinon = require('sinon');

describe('models/web-session', () => {
  var session;

  beforeEach(() => {
    session = new WebSession();
  });

  describe('destroy', () => {
    beforeEach(() => {
      sinon.spy(session, 'trigger');

      session.destroy();
    });

    it('triggers a `destroy` message', () => {
      assert.isTrue(session.trigger.calledWith('destroy'));
    });
  });
});
