/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { notificationKey } from './notificationKey';

describe('notificationKey', () => {
  it('builds one key per subject, threshold and signing client', () => {
    expect(notificationKey('user-1', 80, 'vpn')).toBe(
      'user-1\u000080\u0000vpn'
    );
  });

  it('separates fields so a subject containing spaces cannot collide', () => {
    expect(notificationKey('user 1', 80, 'vpn')).not.toBe(
      notificationKey('user', 180, 'vpn')
    );
  });
});
