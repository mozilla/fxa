/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AppLayout from '../../components/AppLayout';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { FtlMsg } from 'fxa-react/lib/utils';
import { usePageViewEvent } from '../../lib/metrics';
import {
  MOZILLA_ACCOUNTS_PRIVACY_URL,
  MOZILLA_ACCOUNTS_TOS_URL,
  REACT_ENTRYPOINT,
} from '../../constants';

export const viewName = 'legal';

const Legal = () => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  return (
    <AppLayout>
      <FtlMsg id="legal-header">
        <h1 className="card-header text-center mb-4">Legal</h1>
      </FtlMsg>

      <div className="flex mobileLandscape:justify-between gap-x-10 text-sm">
        <LinkExternal className="link-blue" href={MOZILLA_ACCOUNTS_TOS_URL}>
          <FtlMsg id="legal-terms-of-service-link">Terms of Service</FtlMsg>
        </LinkExternal>
        <LinkExternal className="link-blue" href={MOZILLA_ACCOUNTS_PRIVACY_URL}>
          <FtlMsg id="legal-privacy-link">Privacy Notice</FtlMsg>
        </LinkExternal>
      </div>
    </AppLayout>
  );
};

export default Legal;
