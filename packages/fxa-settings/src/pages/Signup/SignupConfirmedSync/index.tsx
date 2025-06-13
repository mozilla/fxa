/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import AppLayout from '../../../components/AppLayout';
import Banner from '../../../components/Banner';
import { useFtlMsgResolver } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import { hardNavigate } from 'fxa-react/lib/utils';
import { firefox } from '../../../lib/channels/firefox';
import { LocationState, SignupConfirmedSyncProps } from './interfaces';
import { SyncCloudsImage } from '../../../components/images';
import { checkPaymentMethodsWillSync } from '../../../lib/sync-engines';

const SignupConfirmedSync = ({
  integration,
  offeredSyncEngines,
}: SignupConfirmedSyncProps & RouteComponentProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const paymentMethodsSynced = checkPaymentMethodsWillSync(offeredSyncEngines);

  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: LocationState;
  };
  const originPostVerifySetPassword =
    location?.state?.origin === 'post-verify-set-password';

  // Currently, this page will only be shown to Sync Desktop users because once
  // mobile users are signed in, the web view automatically closes; see FXA-10865.
  // Once FxA operations in mobile are done in a normal tab (bz 1840491), this will
  // be a non-issue, and support for the "manage sync" web channel message in mobile
  // will have had time to roll out (FF 140+). When mobile _does_ show this page, we
  // will want to look at the UX again, but for now we just won't show the pair flow link.
  const showPairLink = integration.isDesktopSync();

  return (
    <AppLayout>
      {originPostVerifySetPassword ? (
        <Banner
          type="success"
          textAlignClassName="text-center"
          content={{
            localizedHeading: ftlMsgResolver.getMsg(
              'signup-confirmed-sync-set-password-success-banner',
              'Sync password created'
            ),
          }}
        />
      ) : (
        <Banner
          type="success"
          textAlignClassName="text-center"
          content={{
            localizedHeading: ftlMsgResolver.getMsg(
              'signup-confirmed-sync-success-banner',
              'Mozilla account confirmed'
            ),
          }}
        />
      )}

      <SyncCloudsImage className="mx-auto mt-4 max-h-44" />

      <FtlMsg id="signup-confirmed-sync-header">
        <h1 className="card-header">Sync is turned on</h1>
      </FtlMsg>
      {paymentMethodsSynced ? (
        <FtlMsg id="signup-confirmed-sync-description-with-payment-v2">
          <p className="mt-2 mb-7">
            Your passwords, payment methods, addresses, bookmarks, history, and
            more can sync everywhere you use Firefox.
          </p>
        </FtlMsg>
      ) : (
        <FtlMsg id="signup-confirmed-sync-description-v2">
          <p className="mt-2 mb-7">
            Your passwords, addresses, bookmarks, history, and more can sync
            everywhere you use Firefox.
          </p>
        </FtlMsg>
      )}

      {showPairLink && (
        <div className="flex mb-5">
          <FtlMsg id="signup-confirmed-sync-add-device-link">
            {/* TODO: once Pair is converted to React, use `<Link>` instead */}
            <a
              href="/"
              className="cta-primary cta-xl"
              data-glean-id="signup_confirmed_sync_pair_link"
              onClick={(e) => {
                e.preventDefault();
                hardNavigate('/pair', {}, true);
              }}
            >
              Add another device
            </a>
          </FtlMsg>
        </div>
      )}

      <div className="text-center">
        <FtlMsg id="signup-confirmed-sync-manage-sync-button">
          <button
            type="button"
            className="text-sm link-blue mx-auto tablet:mx-0"
            data-glean-id="signup_confirmed_sync_manage_sync_button"
            onClick={() => {
              firefox.fxaOpenSyncPreferences();
            }}
          >
            Manage sync
          </button>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default SignupConfirmedSync;
