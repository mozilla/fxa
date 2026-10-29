/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';

const PageNotFound = () => (
  <AppLayout>
    <CardHeader
      headingTextFtlId="page-not-found-heading"
      headingText="Page not found"
    />

    <FtlMsg id="page-not-found-description">
      <p className="mt-2 text-sm">
        The page you requested is not found. We’ve been notified and will fix
        any links that may be broken.
      </p>
    </FtlMsg>

    <div className="flex mt-6">
      <FtlMsg id="page-not-found-home-button">
        <a className="cta-primary cta-xl" href="/">
          Home
        </a>
      </FtlMsg>
    </div>
  </AppLayout>
);

export default PageNotFound;
