/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';

const ServerError = () => (
  <AppLayout>
    <CardHeader
      headingTextFtlId="server-error-heading"
      headingText="500 Error"
    />

    <FtlMsg id="server-error-description">
      <p className="mt-2 text-sm">
        Oh dear, something went wrong there. We’ve been notified and will get
        working on a fix.
      </p>
    </FtlMsg>

    <div className="flex mt-6">
      <FtlMsg id="server-error-home-button">
        <a className="cta-primary cta-xl" href="/">
          Home
        </a>
      </FtlMsg>
    </div>
  </AppLayout>
);

export default ServerError;
