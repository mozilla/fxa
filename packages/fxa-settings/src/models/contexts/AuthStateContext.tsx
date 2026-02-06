/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { sessionToken as getSessionToken } from '../../lib/cache';

export interface AuthState {
  isSignedIn: boolean;
  sessionToken: string | null;
  sessionVerified: boolean;
}

export interface AuthStateActions {
  setSignedIn: (signedIn: boolean) => void;
  setSessionVerified: (verified: boolean) => void;
  setSessionToken: (token: string | null) => void;
  signOut: () => void;
}

export type AuthStateContextValue = AuthState & AuthStateActions;

export const AuthStateContext =
  createContext<AuthStateContextValue | null>(null);

export interface AuthStateProviderProps {
  children: ReactNode;
  initialState?: Partial<AuthState>;
}

export function AuthStateProvider({
  children,
  initialState,
}: AuthStateProviderProps) {
  const [isSignedIn, setIsSignedIn] = useState(
    initialState?.isSignedIn ?? !!getSessionToken()
  );
  const [sessionToken, setSessionTokenState] = useState<string | null>(
    initialState?.sessionToken ?? getSessionToken() ?? null
  );
  const [sessionVerified, setSessionVerifiedState] = useState(
    initialState?.sessionVerified ?? false
  );

  const setSessionToken = useCallback((token: string | null) => {
    setSessionTokenState(token);
    if (token) {
      setIsSignedIn(true);
    }
  }, []);

  const signOut = useCallback(() => {
    setIsSignedIn(false);
    setSessionTokenState(null);
    setSessionVerifiedState(false);
  }, []);

  const value = useMemo<AuthStateContextValue>(
    () => ({
      isSignedIn,
      sessionToken,
      sessionVerified,
      setSignedIn: setIsSignedIn,
      setSessionVerified: setSessionVerifiedState,
      setSessionToken,
      signOut,
    }),
    [isSignedIn, sessionToken, sessionVerified, setSessionToken, signOut]
  );

  return (
    <AuthStateContext.Provider value={value}>
      {children}
    </AuthStateContext.Provider>
  );
}

export function useAuthState(): AuthStateContextValue {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within an AuthStateProvider');
  }
  return context;
}
