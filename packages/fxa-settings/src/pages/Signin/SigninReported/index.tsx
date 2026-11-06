/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { usePageViewEvent } from '../../../lib/metrics';
import { FtlMsg } from 'fxa-react/lib/utils';

import { REACT_ENTRYPOINT } from '../../../constants';
import CardHeader from '../../../components/CardHeader';
import AppLayout from '../../../components/AppLayout';
import { useFtlMsgResolver } from '../../../models';

export const viewName = 'signin-reported';

const SigninReported = () => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedPageTitle = ftlMsgResolver.getMsg(
    'signin-reported-page-title',
    'Sign-in reported'
  );

  return (
    <AppLayout title={localizedPageTitle}>
      <CardHeader
        headingText="Thank you for your vigilance"
        headingTextFtlId="signin-reported-header"
      />
      <FtlMsg id="signin-reported-message">
        <p className="text-sm">
          Our team has been notified. Reports like this help us fend off
          intruders.
        </p>
      </FtlMsg>
    </AppLayout>
  );
};

export default SigninReported;
