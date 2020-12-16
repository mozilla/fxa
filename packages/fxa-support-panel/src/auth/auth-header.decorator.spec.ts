/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { CurrentUser } from './auth-header.decorator';

class Test {
  public test(@CurrentUser() user: string) {}
}

describe('CurrentUser', () => {
  it('returns the user', () => {
    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
    const factory = args[Object.keys(args)[0]].factory;
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: 'testuser' }),
      }),
    };
    const result = factory(null, mockContext);
    expect(result).toBe('testuser');
  });
});
