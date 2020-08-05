import React, { useContext } from 'react';
import AuthClient from 'fxa-auth-client/browser';

export interface AuthContextValue {
  auth?: AuthClient;
}

export const AuthContext = React.createContext<AuthContextValue>({});
export { AuthClient };

export function useAuth() {
  const { auth } = useContext(AuthContext);
  if (!auth) {
    throw new Error('Are you forgetting an AuthContext.Provider?');
  }
  return auth!;
}

// NOTE for future self
// In cases where the sessionToken changes we should also flush the session { verified } value from apollo cache
