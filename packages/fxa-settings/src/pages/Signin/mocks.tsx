/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Signin from '.';
import VerificationMethods from '../../constants/verification-methods';
import VerificationReasons from '../../constants/verification-reasons';
import { MozServices } from '../../lib/types';
import { IntegrationType } from '../../models';
import {
  MOCK_AUTH_AT,
  MOCK_EMAIL,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
  MOCK_AVATAR_NON_DEFAULT,
  MOCK_UNWRAP_BKEY,
  mockFinishOAuthFlowHandler,
  MOCK_CLIENT_ID,
  MOCK_AVATAR_DEFAULT,
  MOCK_AUTH_PW,
  MOCK_CLIENT_SALT,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_PASSWORD_CHANGE_TOKEN,
  MOCK_WRAP_KB,
  MOCK_AUTH_PW_V2,
  MOCK_WRAP_KB_V2,
  MOCK_KA,
  MOCK_KEY_FETCH_TOKEN_2,
} from '../mocks';
import {
  BeginSigninError,
  BeginSigninHandler,
  BeginSigninResponse,
  CachedSigninHandler,
  SendUnblockEmailHandler,
  SendUnblockEmailHandlerResponse,
  SigninIntegration,
  SigninOAuthIntegration,
  SigninProps,
} from './interfaces';
import { LocationProvider } from '@reach/router';
import {
  AuthUiError,
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../lib/auth-errors/auth-errors';
import {
  AVATAR_QUERY,
  BEGIN_SIGNIN_MUTATION,
  CREDENTIAL_STATUS_MUTATION,
  GET_ACCOUNT_KEYS_MUTATION,
  PASSWORD_CHANGE_FINISH_MUTATION,
  PASSWORD_CHANGE_START_MUTATION,
} from './gql';
import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';

// Extend base mocks
export * from '../mocks';

// TODO: There's some sharing opportunity with other parts of the codebase
// probably move these or a version of these to pages/mocks and share
export const MOCK_TOTP_STATUS_VERIFIED = {
  account: {
    totp: {
      exists: true,
      verified: true,
    },
  },
};

export const MOCK_TOTP_STATUS = {
  account: {
    totp: {
      exists: true,
      verified: false,
    },
  },
};

export const MOCK_NO_TOTP = {
  account: {
    totp: {
      exists: false,
      verified: false,
    },
  },
};

export function createMockSigninWebIntegration(): SigninIntegration {
  return {
    type: IntegrationType.Web,
    isSync: () => false,
    getService: () => MozServices.Default,
  };
}

export function createMockSigninSyncIntegration(): SigninIntegration {
  return {
    type: IntegrationType.OAuth,
    isSync: () => true,
    wantsKeys: () => true,
    getService: () => MozServices.FirefoxSync,
  };
}

export function createMockSigninOAuthIntegration(
  clientId?: string,
  wantsKeys: boolean = true
): SigninOAuthIntegration {
  return {
    type: IntegrationType.OAuth,
    getService: () => clientId || MOCK_CLIENT_ID,
    isSync: () => false,
    wantsKeys: () => wantsKeys,
    wantsLogin: () => false,
    wantsTwoStepAuthentication: () => false,
  };
}

export function mockGqlAvatarUseQuery() {
  return {
    request: { query: AVATAR_QUERY },
    result: {
      data: {
        account: {
          avatar: MOCK_AVATAR_DEFAULT,
        },
      },
    },
  };
}

export function mockGqlBeginSigninMutation(opts: { keys: boolean }) {
  const result = opts.keys
    ? createBeginSigninResponse({
        keyFetchToken: MOCK_KEY_FETCH_TOKEN,
        unwrapBKey: MOCK_UNWRAP_BKEY,
      })
    : createBeginSigninResponse();

  return {
    request: {
      query: BEGIN_SIGNIN_MUTATION,
      variables: {
        input: {
          email: MOCK_EMAIL,
          authPW: MOCK_AUTH_PW,
          options: {
            ...opts,
            verificationMethod: VerificationMethods.EMAIL_OTP,
          },
        },
      },
    },
    result,
  };
}

export function mockGqlCredentialStatusMutation() {
  return {
    request: {
      query: CREDENTIAL_STATUS_MUTATION,
      variables: {
        input: 'johndope@example.com',
      },
    },
    result: {
      data: {
        credentialStatus: {
          upgradeNeeded: true,
          version: 2,
          clientSalt: MOCK_CLIENT_SALT,
        },
      },
    },
  };
}

export function mockGqlPasswordChangeStartMutation() {
  return {
    request: {
      query: PASSWORD_CHANGE_START_MUTATION,
      variables: {
        input: {
          email: MOCK_EMAIL,
          oldAuthPW: MOCK_AUTH_PW,
        },
      },
    },
    result: {
      data: {
        passwordChangeStart: {
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
          passwordChangeToken: MOCK_PASSWORD_CHANGE_TOKEN,
        },
      },
    },
  };
}

export function mockGqlGetAccountKeysMutation() {
  return {
    request: {
      query: GET_ACCOUNT_KEYS_MUTATION,
      variables: {
        input: MOCK_KEY_FETCH_TOKEN,
      },
    },
    result: {
      data: {
        wrappedAccountKeys: {
          kA: MOCK_KA,
          wrapKB: MOCK_WRAP_KB,
        },
      },
    },
  };
}

export function mockGqlPasswordChangeFinishMutation() {
  return {
    request: {
      query: PASSWORD_CHANGE_FINISH_MUTATION,
      variables: {
        input: {
          passwordChangeToken: MOCK_PASSWORD_CHANGE_TOKEN,
          authPW: MOCK_AUTH_PW,
          wrapKb: MOCK_WRAP_KB,
          authPWVersion2: MOCK_AUTH_PW_V2,
          wrapKbVersion2: MOCK_WRAP_KB_V2,
          clientSalt: MOCK_CLIENT_SALT,
        },
      },
    },
    result: {
      data: {
        passwordChangeFinish: {
          uid: MOCK_UID,
          sessionToken: MOCK_SESSION_TOKEN,
          verified: true,
          authAt: 'foo',
          keyFetchToken: MOCK_KEY_FETCH_TOKEN,
          keyFetchToken2: MOCK_KEY_FETCH_TOKEN_2,
        },
      },
    },
  };
}

export function mockBeginSigninMutationWithV2Password() {
  return {
    request: {
      query: BEGIN_SIGNIN_MUTATION,
      variables: {
        input: {
          email: MOCK_EMAIL,
          authPW: MOCK_AUTH_PW_V2,
          options: {
            verificationMethod: VerificationMethods.EMAIL_OTP,
            keys: false,
          },
        },
      },
    },
    result: createBeginSigninResponse(),
  };
}

export function mockGqlError(
  error: AuthUiError = AuthUiErrors.UNEXPECTED_ERROR
) {
  return new ApolloError({
    graphQLErrors: [
      new GraphQLError(error.message, {
        extensions: {
          errno: error.errno,
        },
      }),
    ],
  });
}

export const MOCK_VERIFICATION = {
  verificationMethod: VerificationMethods.EMAIL_OTP,
  verificationReason: VerificationReasons.SIGN_IN,
};

export function createBeginSigninResponse({
  uid = MOCK_UID,
  sessionToken = MOCK_SESSION_TOKEN,
  authAt = MOCK_AUTH_AT,
  metricsEnabled = true,
  verified = true,
  verificationMethod = MOCK_VERIFICATION.verificationMethod,
  verificationReason = MOCK_VERIFICATION.verificationReason,
  unwrapBKey = undefined,
  keyFetchToken = undefined,
}: Partial<BeginSigninResponse['signIn']> & { unwrapBKey?: string } = {}): {
  data: BeginSigninResponse;
} {
  return {
    data: {
      signIn: {
        uid,
        sessionToken,
        authAt,
        metricsEnabled,
        verified,
        verificationMethod,
        verificationReason,
        keyFetchToken,
      },
      unwrapBKey,
    },
  };
}

export function createBeginSigninResponseError({
  errno = AuthUiErrors.INCORRECT_PASSWORD.errno!,
  verificationMethod,
  verificationReason,
}: Partial<BeginSigninError> = {}): {
  error: BeginSigninError;
} {
  const message = AuthUiErrorNos[errno].message;
  return {
    error: {
      errno,
      verificationMethod,
      verificationReason,
      message,
    },
  };
}

export function createCachedSigninResponseError({
  errno = AuthUiErrors.SESSION_EXPIRED.errno!,
} = {}): {
  error: AuthUiError;
} {
  const message = AuthUiErrorNos[errno].message;
  return {
    error: {
      name: '',
      errno,
      message,
    },
  };
}

export const CACHED_SIGNIN_HANDLER_RESPONSE = {
  data: {
    verified: true,
    sessionVerified: true,
    emailVerified: true,
    uid: MOCK_UID,
    ...MOCK_VERIFICATION,
  },
};

export const SEND_UNBLOCK_EMAIL_HANDLER_RESPONSE: SendUnblockEmailHandlerResponse =
  {};

export const mockBeginSigninHandler: BeginSigninHandler = () =>
  Promise.resolve(createBeginSigninResponse());

export const mockBeginSigninHandlerWithKeys: BeginSigninHandler = () =>
  Promise.resolve(
    createBeginSigninResponse({ keyFetchToken: MOCK_KEY_FETCH_TOKEN })
  );

export const mockCachedSigninHandler: CachedSigninHandler = () =>
  Promise.resolve(CACHED_SIGNIN_HANDLER_RESPONSE);

export const mockSendUnblockEmailHandler: SendUnblockEmailHandler = () =>
  Promise.resolve(SEND_UNBLOCK_EMAIL_HANDLER_RESPONSE);

export const Subject = ({
  integration = createMockSigninWebIntegration(),
  sessionToken = undefined,
  serviceName = MozServices.Default,
  hasLinkedAccount = false,
  hasPassword = true,
  avatarData = { account: { avatar: { ...MOCK_AVATAR_NON_DEFAULT } } },
  avatarLoading = false,
  email = MOCK_EMAIL,
  beginSigninHandler = mockBeginSigninHandler,
  cachedSigninHandler = mockCachedSigninHandler,
  sendUnblockEmailHandler = mockSendUnblockEmailHandler,
  finishOAuthFlowHandler = mockFinishOAuthFlowHandler,
  ...props // overrides
}: Partial<SigninProps> = {}) => {
  return (
    <LocationProvider>
      <Signin
        {...{
          integration,
          email,
          sessionToken,
          serviceName,
          hasLinkedAccount,
          finishOAuthFlowHandler,
          beginSigninHandler,
          cachedSigninHandler,
          sendUnblockEmailHandler,
          hasPassword,
          avatarData,
          avatarLoading,
          ...props,
        }}
      />
    </LocationProvider>
  );
};
