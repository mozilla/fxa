/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useNavigate, useLocation } from '@reach/router';
import { useValidatedQueryParams } from '../../../lib/hooks/useValidate';
import { SigninQueryParams } from '../../../models/pages/signin';
import { SigninTotpCode } from './index';
import { useMutation } from '@apollo/client';
import { hardNavigate, hardNavigateToContentServer } from 'fxa-react/lib/utils';
import { currentAccount } from '../../../lib/cache';
import { MozServices } from '../../../lib/types';
import VerificationMethods from '../../../constants/verification-methods';
import VerificationReasons from '../../../constants/verification-reasons';
import { VERIFY_TOTP_CODE_MUTATION } from './gql';
import { handleGQLError } from '../utils';

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
      const gqlError = handleGQLError(error);
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

export default SigninTotpCodeContainer;
