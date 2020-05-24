/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import SecurityEvent from 'models/security-events';

describe('models/security-events', () => {
  let securityEvent;
  const events = [
    {
      name: 'account.login',
      verified: true,
      createdAt: new Date().getTime(),
    },
    {
      name: 'account.create',
      verified: false,
      createdAt: new Date().getTime(),
    },
  ];

  beforeEach(() => {
    securityEvent = events.map((event) => {
      return new SecurityEvent(event);
    });
  });

  describe('create', () => {
    it('correctly sets model properties', () => {
      assert.deepEqual(securityEvent[0].attributes, events[0]);
      assert.deepEqual(securityEvent[1].attributes, events[1]);
    });
  });
});
