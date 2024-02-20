/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useNavigate, useLocation } from '@reach/router';
import { useValidatedQueryParams } from '../../../lib/hooks/useValidate';
import { SigninQueryParams } from '../../../models/pages/signin';
import { SigninTotpCode } from './index';
import { useMutation } from '@apollo/client';
import { hardNavigate, hardNavigateToContentServer } from 'fxa-react/lib/utils';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import { currentAccount } from '../../../lib/cache';
import { MozServices } from '../../../lib/types';
import VerificationMethods from '../../../constants/verification-methods';
import VerificationReasons from '../../../constants/verification-reasons';
import { GraphQLError } from 'graphql';
import { VERIFY_TOTP_CODE_MUTATION } from './gql';

export const viewName = 'signin-totp-code';

export type SigninTotpCodeContainerProps = {
  serviceName: MozServices;
};

export const SigninTotpCodeContainer = ({
  serviceName,
}: SigninTotpCodeContainerProps & RouteComponentProps) => {
  const navigate = useNavigate();
  // TODO: FXA-9177, likely use Apollo cache here instead of location state
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: {
      verificationReason: string;
      verificationMethod: string;
    };
  };
  const { verificationReason, verificationMethod } = location.state;
  const storedLocalAccount = currentAccount();
  const { queryParamModel } = useValidatedQueryParams(SigninQueryParams);

  const [verifyTotpCode] = useMutation(VERIFY_TOTP_CODE_MUTATION);

  const handleNavigation = () => {
    if (queryParamModel.redirectTo) {
      hardNavigate(queryParamModel.redirectTo);
    } else if (verificationReason === VerificationReasons.CHANGE_PASSWORD) {
      // TODO: Check if postVerify routes are enabled. When they are, we won't
      // need to hard navigate to content server.
      hardNavigateToContentServer(
        `/post_verify/password/force_password_change${location.search}`
      );
    } else {
      navigate('/settings');
    }
  };

  const submitTotpCode = async (code: string) => {
    try {
      const result = await verifyTotpCode({
        variables: {
          input: {
            code,
            service: queryParamModel.service,
          },
        },
      });

      // Check authentication code
      if (result.data?.verifyTotp.success === true) {
        return { status: true };
      }

      return { status: false };
    } catch (error) {
      const gqlError = processGraphQLError(error);
      return { error: gqlError.error, status: false };
    }
  };

  if (
    !storedLocalAccount ||
    !storedLocalAccount.sessionToken ||
    verificationMethod !== VerificationMethods.TOTP_2FA
  ) {
    navigate(`/signin${location.search}`);
  }

  return (
    <SigninTotpCode {...{ handleNavigation, submitTotpCode, serviceName }} />
  );
};

// TODO: Move to signInUtils.
const processGraphQLError = (error: any) => {
  const graphQLError: GraphQLError = error.graphQLErrors?.[0];
  const errno = graphQLError?.extensions?.errno as number;

  if (errno && AuthUiErrorNos[errno]) {
    if (errno === AuthUiErrors.THROTTLED.errno) {
      const throttledErrorWithRetryAfter = {
        name: AuthUiErrorNos[errno].name,
        message: AuthUiErrorNos[errno].message,
        errno,
        verificationMethod:
          (graphQLError.extensions.verificationMethod as VerificationMethods) ||
          undefined,
        verificationReason:
          (graphQLError.extensions.verificationReason as VerificationReasons) ||
          undefined,
        retryAfter:
          (graphQLError?.extensions?.retryAfter as number) || undefined,
        retryAfterLocalized:
          (graphQLError?.extensions?.retryAfterLocalized as string) ||
          undefined,
      };
      return { error: throttledErrorWithRetryAfter };
    } else {
      return {
        error: {
          name: AuthUiErrorNos[errno].name,
          message: AuthUiErrorNos[errno].message,
          errno,
          verificationMethod:
            (graphQLError.extensions
              .verificationMethod as VerificationMethods) || undefined,
          verificationReason:
            (graphQLError.extensions
              .verificationReason as VerificationReasons) || undefined,
        },
      };
    }
    // if not a graphQLError or if no localizable message available for error
  } else {
    return { error: AuthUiErrors.UNEXPECTED_ERROR };
  }
};

export default SigninTotpCodeContainer;
