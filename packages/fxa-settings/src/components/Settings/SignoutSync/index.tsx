/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsg } from 'fxa-react/lib/utils';
import CardHeader from '../../CardHeader';
import AppLayout from '../../AppLayout';
import { useFtlMsgResolver } from '../../../models';

export const viewName = 'legal';

const SignoutSync = () => {
  // TODO: Add button to make this more automatic. We need the android signout fix
  //       to be rolled out first though.

  const ftlMsgResolver = useFtlMsgResolver();
  const localizedPageTitle = ftlMsgResolver.getMsg(
    'signout-sync-page-title',
    'Session expired'
  );

  return (
    <AppLayout title={localizedPageTitle}>
      <CardHeader
        headingTextFtlId="signout-sync-header"
        headingText="Session Expired"
      />
      <section className="flex flex-cols items-center">
        <FtlMsg id="signout-sync-session-expired">
          <p className="text-sm">
            Sorry, something went wrong. Please sign out from the browser menu
            and try again.
          </p>
        </FtlMsg>
      </section>
    </AppLayout>
  );
};

export default SignoutSync;
