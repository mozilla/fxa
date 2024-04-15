/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AuthError } from '../../lib/oauth';
import AppLayout from '../AppLayout';
import Banner, { BannerType } from '../Banner';
import CardHeader from '../CardHeader';

const OAuthDataError = ({ error }: { error: AuthError }) => {
  return (
    <AppLayout>
      <CardHeader
        headingText="Bad Request"
        headingTextFtlId="error-bad-request"
      />
      {/* TODO Localize this, FXA-9502, and account for potential errno
        overlaps with AuthErrors (see ticket). */}
      <Banner type={BannerType.error}>{error.message}</Banner>
    </AppLayout>
  );
};

export default OAuthDataError;
