/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { GqlAuthHeaderGuard } from './auth-header.guard';

describe('AuthHeaderGuard', () => {
  it('should be defined', () => {
    const MockConfig = {
      get: jest.fn().mockReturnValue({ authHeader: 'test' }),
    };
    expect(new GqlAuthHeaderGuard(MockConfig as any)).toBeDefined();
  });
});
