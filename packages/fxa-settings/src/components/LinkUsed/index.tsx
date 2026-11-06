/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsg } from 'fxa-react/lib/utils';
import CardHeader from '../CardHeader';
import AppLayout from '../AppLayout';
import { useFtlMsgResolver } from '../../models';

type LinkUsedProps = {
  isForPrimaryEmail: boolean;
};

const getTemplateValues = (isPrimaryEmail: boolean) => {
  if (isPrimaryEmail) {
    return {
      headerText: 'Primary email already confirmed',
      headerId: 'primary-email-confirmation-link-reused',
    };
  }
  return {
    headerText: 'Sign-in already confirmed',
    headerId: 'signin-confirmation-link-reused',
  };
};

const LinkUsed = ({ isForPrimaryEmail }: LinkUsedProps) => {
  // TODO : Metric event(s) for expired link

  const ftlMsgResolver = useFtlMsgResolver();
  const templateValues = getTemplateValues(isForPrimaryEmail);
  const localizedPageTitle = ftlMsgResolver.getMsg(
    templateValues.headerId,
    templateValues.headerText
  );

  return (
    <AppLayout title={localizedPageTitle}>
      <CardHeader
        headingText={templateValues.headerText}
        headingTextFtlId={templateValues.headerId}
      />

      <FtlMsg id="confirmation-link-reused-message">
        <p className="mt-4 text-sm">
          That confirmation link was already used, and can only be used once.
        </p>
      </FtlMsg>
    </AppLayout>
  );
};

export default LinkUsed;
