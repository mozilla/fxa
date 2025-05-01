/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { useValidatedQueryParams } from '../../../lib/hooks/useValidate';
import { useAuthClient, useFtlMsgResolver } from '../../../models';
import { ReportSigninQueryParams } from '../../../models/pages/signin';
import { ReportSigninLinkDamaged } from '../../../components/LinkDamaged';
import { ReportSignin } from './index';

const ReportSigninContainer = (_: RouteComponentProps) => {
  const authClient = useAuthClient();
  const ftlMsg = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { queryParamModel, validationError } = useValidatedQueryParams(
    ReportSigninQueryParams
  );

  const submitReport = async () => {
    try {
      await authClient.rejectUnblockCode(
        queryParamModel.uid,
        queryParamModel.unblockCode
      );
      navigateWithQuery('/signin_reported');
    } catch (e) {
      // TODO verify error message to display
      setErrorMessage(
        ftlMsg.getMsg(
          'report-signin-error',
          'Sorry, there was a problem submitting the report.'
        )
      );
    }
  };

  if (validationError) {
    return <ReportSigninLinkDamaged />;
  }

  return <ReportSignin {...{ errorMessage, submitReport }} />;
};

export default ReportSigninContainer;
