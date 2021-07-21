/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createResumeToken } from './resume-token';
import { DEFAULTS, parse, ResumeToken } from 'fxa-shared/lib/resume-token';

it('should include the default values', () => {
  const t = createResumeToken({});
  const tokenVal = parse(t);
  expect(tokenVal).toEqual(DEFAULTS);
});

it('should exclude properties that are not in the allowed list', () => {
  const t = createResumeToken({ productId: 'dabest', dmr: 'chrono' });
  const tokenVal = parse(t) as ResumeToken;
  expect(tokenVal['productId']).toBe('dabest');
  expect(tokenVal['dmr']).toBeUndefined();
});

it('should overwrite the default values', () => {
  const t = createResumeToken({
    productId: 'dabest',
    utmCampaign: 'wibble',
    utmContent: 'quux',
  });
  const tokenVal = parse(t) as ResumeToken;
  expect(tokenVal).toEqual({
    ...DEFAULTS,
    productId: 'dabest',
    utmCampaign: 'wibble',
    utmContent: 'quux',
  });
});
