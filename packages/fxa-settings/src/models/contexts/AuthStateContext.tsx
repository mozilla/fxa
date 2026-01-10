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

const defaultAuthState: AuthState = {
  isSignedIn: false,
  sessionToken: null,
  sessionVerified: false,
};

export const AuthStateContext = createContext<AuthStateContextValue>({
  ...defaultAuthState,
  setSignedIn: () => {},
  setSessionVerified: () => {},
  setSessionToken: () => {},
  signOut: () => {},
});

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

  const setSignedIn = useCallback((signedIn: boolean) => {
    setIsSignedIn(signedIn);
  }, []);

  const setSessionVerified = useCallback((verified: boolean) => {
    setSessionVerifiedState(verified);
  }, []);

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
      setSignedIn,
      setSessionVerified,
      setSessionToken,
      signOut,
    }),
    [
      isSignedIn,
      sessionToken,
      sessionVerified,
      setSignedIn,
      setSessionVerified,
      setSessionToken,
      signOut,
    ]
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

export function useIsSignedIn(): boolean {
  return useAuthState().isSignedIn;
}

export function useSessionToken(): string | null {
  return useAuthState().sessionToken;
}

export function useSessionVerified(): boolean {
  return useAuthState().sessionVerified;
}
