/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Component, ReactNode } from 'react';
import { MfaScope } from '../../../lib/types';
import { JwtTokenCache, MfaOtpRequestCache } from '../../../lib/cache';

/**
 * Error Boundary Implementation.
 *
 * This error boundary's only job is to handle errors that percolate up related to
 * invalid JWTs. This can happen if a user leaves a flow open for a while, and
 * the once-valid JWT expires. In this case, when they submit the JWT an invalid
 * state will be returned, and we should clear the JWT from our cache so the
 * user has an opportunity to get a new one via the MfaModalDialog.
 *
 * This error boundary is specifically tailored to the MfaGuard. Don't try
 * to export it or reuse it!
 */
type MfaErrorBoundaryProps = {
  requiredScope: MfaScope;
  sessionToken: string;
  jwt: string;
  children: ReactNode;
  fallback: ReactNode;
};

type MfaErrorBoundaryState = { hasError: boolean; error: any | null };

export class MfaErrorBoundary extends Component<
  MfaErrorBoundaryProps,
  MfaErrorBoundaryState
> {
  state: MfaErrorBoundaryState;

  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    if (error && error.code === 401 && error.errno === 110) {
      return { hasError: true };
    }

    return undefined;
  }

  componentDidCatch(error: any, info: any) {
    if (error && error.code === 401 && error.errno === 110) {
      this.setState({
        hasError: true,
        error: error,
      });

      JwtTokenCache.removeToken(
        this.props.sessionToken,
        this.props.requiredScope
      );
      MfaOtpRequestCache.remove(
        this.props.sessionToken,
        this.props.requiredScope
      );
    } else {
      // Causes error to bubble up to the next error boundary
      throw error;
    }
  }

  componentDidUpdate(prevProps: MfaErrorBoundaryProps) {
    // Until a new code is provided, consider the error to still be valid.
    if (prevProps.jwt !== this.props.jwt) {
      this.setState({
        hasError: false,
        error: null,
      });
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
