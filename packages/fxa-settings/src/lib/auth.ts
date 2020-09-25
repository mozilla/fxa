import React, { useContext } from 'react';
import { useAsyncCallback } from 'react-async-hook';
import AuthClient, { AuthServerError } from 'fxa-auth-client/browser';

export interface AuthContextValue {
  auth?: AuthClient;
}

export const AuthContext = React.createContext<AuthContextValue>({});

export function createAuthClient(authServerUri: string) {
  return new AuthClient(authServerUri);
}

export function useAuth() {
  const { auth } = useContext(AuthContext);
  if (!auth) {
    throw new Error('Are you forgetting an AuthContext.Provider?');
  }
  return auth!;
}

type PasswordChangeResponse = Resolved<
  ReturnType<typeof AuthClient.prototype.passwordChange>
>;

export function usePasswordChanger({
  onSuccess,
  onError,
}: {
  onSuccess?: (r: PasswordChangeResponse) => void;
  onError?: (e: AuthServerError) => void;
} = {}) {
  const auth = useAuth();
  return useAsyncCallback(
    async (
      email: string,
      oldPassword: string,
      newPassword: string,
      sessionToken: hexstring
    ) => {
      const response = await auth.passwordChange(
        email,
        oldPassword,
        newPassword,
        {
          sessionToken,
        }
      );
      return response;
    },
    {
      onSuccess,
      onError,
    }
  );
}
