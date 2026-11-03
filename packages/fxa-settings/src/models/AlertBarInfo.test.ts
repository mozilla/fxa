/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AlertBarInfo, alertGleanId } from './AlertBarInfo';

describe('AlertBarInfo', () => {
  const alertBar = new AlertBarInfo();

  beforeEach(() => {
    alertBar.error('message', undefined, 'previous_id');
  });

  it('sets the gleanId passed to error()', () => {
    alertBar.error('message', undefined, 'account_pref_passkey_unsupported');
    expect(alertGleanId()).toBe('account_pref_passkey_unsupported');
  });

  it.each([
    ['error() without a gleanId', () => alertBar.error('message')],
    ['success()', () => alertBar.success('message')],
    ['info()', () => alertBar.info('message')],
  ])('clears an earlier gleanId on %s', (_, show) => {
    show();
    expect(alertGleanId()).toBeUndefined();
  });
});
