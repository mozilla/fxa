/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../components/AppLayout';
import CardHeader from '../../../components/CardHeader';
import Banner from '../../../components/Banner';
import { useFtlMsgResolver } from '../../../models';

export type CompleteSigninProps = { errorMessage?: string };

const CompleteSignin = ({ errorMessage }: CompleteSigninProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedErrorPageTitle = ftlMsgResolver.getMsg(
    'complete-signin-error-page-title',
    'Sign-in confirmation error'
  );
  const localizedValidatingPageTitle = ftlMsgResolver.getMsg(
    'complete-signin-validating-page-title',
    'Confirming sign-in'
  );

  if (errorMessage) {
    return (
      <AppLayout title={localizedErrorPageTitle}>
        <CardHeader
          headingText="Confirmation error"
          headingTextFtlId="complete-signin-error-header"
        />
        <Banner type="error" content={{ localizedHeading: errorMessage }} />
      </AppLayout>
    );
  } else {
    return (
      <AppLayout title={localizedValidatingPageTitle}>
        <FtlMsg id="validating-signin">
          <p className="text-base">Validating sign-in…</p>
        </FtlMsg>
        <LoadingSpinner className="flex justify-center mt-6" />
      </AppLayout>
    );
  }
};

export default CompleteSignin;
