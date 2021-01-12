import React, { useContext } from 'react';
import { useAsyncCallback } from 'react-async-hook';
import AuthClient, {
  AuthServerError,
  generateRecoveryKey,
} from 'fxa-auth-client/browser';

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

type AccountDestroyResponse = Resolved<
  ReturnType<typeof AuthClient.prototype.accountDestroy>
>;

export function useAccountDestroyer({
  onSuccess,
  onError,
}: {
  onSuccess?: (r: AccountDestroyResponse) => void;
  onError?: (e: AuthServerError) => void;
} = {}) {
  const auth = useAuth();
  return useAsyncCallback(
    async (email: string, password: string, sessionToken: hexstring) => {
      const response = await auth.accountDestroy(
        email,
        password,
        {},
        sessionToken
      );
      return response;
    },
    {
      onSuccess,
      onError,
    }
  );
}

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

export function useRecoveryKeyMaker({
  onSuccess,
  onError,
}: {
  onSuccess?: (recoveryKey: Uint8Array) => void;
  onError?: (e: AuthServerError) => void;
}) {
  const auth = useAuth();
  return useAsyncCallback(
    async (
      email: string,
      password: string,
      uid: hexstring,
      sessionToken: hexstring
    ) => {
      const reauth = await auth.sessionReauth(sessionToken, email, password, {
        keys: true,
        reason: 'recovery_key',
      });
      const keys = await auth.accountKeys(
        reauth.keyFetchToken!,
        reauth.unwrapBKey!
      );
      const {
        recoveryKey,
        recoveryKeyId,
        recoveryData,
      } = await generateRecoveryKey(uid, keys);
      await auth.createRecoveryKey(
        sessionToken,
        recoveryKeyId,
        recoveryData,
        true
      );
      return recoveryKey;
    },
    {
      onSuccess,
      onError,
    }
  );
}
