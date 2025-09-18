/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MfaErrorBoundary } from './error-boundary';
import { JwtTokenCache, MfaOtpRequestCache } from '../../../lib/cache';

const mockScope = 'test';
const mockSessionToken = 'session-xyz';
const mockJwt = 'jwt-123';

describe('MfaErrorBoundary', () => {
  let removeJwtSpy: jest.SpyInstance;
  let removeOtpSpy: jest.SpyInstance;

  beforeEach(() => {
    removeJwtSpy = jest.spyOn(JwtTokenCache, 'removeToken');
    removeOtpSpy = jest.spyOn(MfaOtpRequestCache, 'remove');
  });

  afterEach(() => {
    removeJwtSpy.mockReset();
  });

  it('renders children when no error occurs', () => {
    render(
      <MfaErrorBoundary
        requiredScope={mockScope}
        sessionToken={mockSessionToken}
        jwt={mockJwt}
        fallback={<div>fallback</div>}
      >
        <div>child</div>
      </MfaErrorBoundary>
    );

    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('renders fallback and removes JWT on auth error (401/110)', () => {
    const ref = React.createRef<MfaErrorBoundary>();
    const { rerender } = render(
      <MfaErrorBoundary
        ref={ref}
        requiredScope={mockScope}
        sessionToken={mockSessionToken}
        jwt="jwt-2"
        fallback={<div>fallback</div>}
      >
        <div>child</div>
      </MfaErrorBoundary>
    );

    const authError: any = new Error('Unauthorized for route');
    authError.code = 401;
    authError.errno = 110;

    // Simulate boundary catching the error
    ref.current?.componentDidCatch(authError, {} as any);

    // Trigger a render so updated state is reflected in output
    rerender(
      <MfaErrorBoundary
        ref={ref}
        requiredScope={mockScope}
        sessionToken={mockSessionToken}
        jwt="jwt-2"
        fallback={<div>fallback</div>}
      >
        <div>child</div>
      </MfaErrorBoundary>
    );

    expect(screen.getByText('fallback')).toBeInTheDocument();
    expect(removeJwtSpy).toHaveBeenCalledWith(mockSessionToken, mockScope);
    expect(removeOtpSpy).toHaveBeenCalledWith(mockSessionToken, mockScope);
  });
});
