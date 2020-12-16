/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { AuthHeaderGuard } from './auth-header.guard';

describe('AuthHeaderGuard', () => {
  let guard: AuthHeaderGuard;
  let mockConfig: any;

  beforeEach(() => {
    mockConfig = {
      get: jest.fn().mockReturnValue({ authHeader: 'test' }),
    };
    guard = new AuthHeaderGuard(mockConfig as any);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('returns true in dev', async () => {
    (guard as any).dev = true;
    expect(await guard.canActivate({} as any)).toBe(true);
  });

  it('returns false with no username', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          get: jest.fn().mockReturnValue(undefined),
        }),
      }),
    };
    expect(await guard.canActivate(mockContext as any)).toBe(false);
  });

  it('sets the username on the request', async () => {
    const mockRequest = {
      user: null,
      get: jest.fn().mockReturnValue('testuser'),
    };
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    };
    expect(await guard.canActivate(mockContext as any)).toBe(true);
    expect(mockRequest.user).toBe('testuser');
  });
});
