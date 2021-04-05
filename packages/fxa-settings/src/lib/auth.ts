import React, { useContext, useRef } from 'react';
import { useAsyncCallback } from 'react-async-hook';
import AuthClient, {
  AuthServerError,
  generateRecoveryKey,
} from 'fxa-auth-client/browser';
import sentry from 'fxa-shared/lib/sentry';
import { useConfig } from './config';
import { sessionToken } from './cache';

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

export function useAuthClient<T>(
  authFn: (
    auth: AuthClient,
    sessionToken: hexstring
  ) => (...args: any[]) => Promise<T>,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: (r: T) => void;
    onError?: (e: AuthServerError) => void;
  } = {}
) {
  const auth = useAuth();
  const fn = useRef(authFn);
  const callback = useAsyncCallback(fn.current(auth, sessionToken()!), {
    onSuccess: (r) => {
      callback.reset();
      if (onSuccess) {
        onSuccess(r);
      }
    },
    onError: (error) => {
      callback.reset();
      if (onError) {
        try {
          onError(error);
        } catch (e) {
          sentry.captureException(e);
        }
      } else {
        sentry.captureException(error);
      }
    },
  });
  const x = useRef(callback);
  return x.current;
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
          keys: true,
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

export function useAvatarUploader({
  onSuccess,
  onError,
}: {
  onSuccess?: (avatar: { id: string; url: string }) => void;
  onError?: (err: Error) => void;
}) {
  const config = useConfig();
  const auth = useAuth();
  return useAsyncCallback(
    async (sessionToken: hexstring, file: Blob) => {
      const { access_token } = await auth.createOAuthToken(
        sessionToken,
        config.oauth.clientId,
        {
          scope: 'profile:write clients:write',
          ttl: 300,
        }
      );
      const response = await fetch(
        `${config.servers.profile.url}/v1/avatar/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': file.type,
          },
          body: file,
        }
      );
      if (!response.ok) {
        throw new Error(`${response.status}`);
      }
      return await response.json();
    },
    {
      onSuccess,
      onError,
    }
  );
}
