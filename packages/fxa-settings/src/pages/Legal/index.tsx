/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppLayout from '../../components/AppLayout';
import { Link, RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { usePageViewEvent } from '../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../constants';

export const viewName = 'legal';

const Legal = (_: RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  return (
    <AppLayout>
      <FtlMsg id="legal-header">
        <h1 className="card-header text-center mb-4">Legal</h1>
      </FtlMsg>

      <div className="flex mobileLandscape:justify-between gap-x-10 text-sm">
        <Link className="link-blue" to="/legal/terms">
          <FtlMsg id="legal-terms-of-service-link">Terms of Service</FtlMsg>
        </Link>
        <Link className="link-blue" to="/legal/privacy">
          <FtlMsg id="legal-privacy-link">Privacy Notice</FtlMsg>
        </Link>
      </div>
    </AppLayout>
  );
};

export default Legal;
