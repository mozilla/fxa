/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { cleanUpQueryParam } from './cleanUpQueryParam';

describe('cleanUpQueryParam', () => {
  it('properly erases sensitive information', () => {
    const fixtureUrl1 =
      'https://accounts.firefox.com/complete_reset_password?token=foo&code=bar&email=some%40restmail.net';
    const expectedUrl1 =
      'https://accounts.firefox.com/complete_reset_password?token=VALUE&code=VALUE&email=VALUE';
    const resultUrl1 = cleanUpQueryParam(fixtureUrl1);

    expect(resultUrl1).toEqual(expectedUrl1);
  });

  it('properly erases sensitive information, keeps allowed fields', () => {
    const fixtureUrl2 =
      'https://accounts.firefox.com/signup?client_id=foo&service=sync';
    const expectedUrl2 =
      'https://accounts.firefox.com/signup?client_id=foo&service=sync';
    const resultUrl2 = cleanUpQueryParam(fixtureUrl2);

    expect(resultUrl2).toEqual(expectedUrl2);
  });

  it('properly returns the url when there is no query', () => {
    const expectedUrl = 'https://accounts.firefox.com/signup';
    const resultUrl = cleanUpQueryParam(expectedUrl);

    expect(resultUrl).toEqual(expectedUrl);
  });
});
