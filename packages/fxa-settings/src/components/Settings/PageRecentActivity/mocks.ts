/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const MOCK_SECURITY_EVENTS = [
  {
    name: 'account.create',
    createdAt: Date.now(),
    verified: true,
  },
  {
    name: 'account.disable',
    createdAt: Date.now(),
    verified: true,
  },
  {
    name: 'account.enable',
    createdAt: Date.now(),
    verified: true,
  },
  {
    name: 'account.login',
    createdAt: Date.now(),
    verified: true,
  },
  {
    name: 'account.reset',
    createdAt: Date.now(),
    verified: true,
  },
  {
    name: 'emails.clearBounces',
    createdAt: Date.now(),
    verified: true,
  },
];
