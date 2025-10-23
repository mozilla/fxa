/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Link, RouteComponentProps } from '@reach/router';
import { useEffect, useRef, useState } from 'react';
import ConnectedServices from '../ConnectedServices';
import LinkedAccounts from '../LinkedAccounts';
import { Profile } from '../Profile';
import Security from '../Security';

import { Localized } from '@fluent/react';
import Head from 'fxa-react/components/Head';
import { SETTINGS_PATH } from 'fxa-settings/src/constants';
import GleanMetrics from '../../../lib/glean';
import * as Metrics from '../../../lib/metrics';
import {
  isRecoveryKeyPromoDismissed,
  isRecoveryPhonePromoDismissed,
} from '../../../lib/promo-dismissal';
import { useAccount, useAlertBar, useFtlMsgResolver } from '../../../models';
import {
  AccountRecoveryKeyPromoBanner,
  RecoveryPhonePromoBanner,
} from '../../PromotionBanner';
import DataCollection from '../DataCollection';
import { SettingsIntegration } from '../interfaces';
import ProductPromo, {
  getProductPromoData,
  MonitorPromoData,
} from '../ProductPromo';
import SideBar from '../Sidebar';

export const PageSettings = ({
  integration,
}: RouteComponentProps & {
  integration?: SettingsIntegration;
}) => {
  const account = useAccount();
  const {
    uid,
    recoveryKey,
    attachedClients,
    subscriptions,
    totp,
    recoveryPhone,
  } = account;

  const ftlMsgResolver = useFtlMsgResolver();
  const alertBar = useAlertBar();

  Metrics.setProperties({
    lang: document.querySelector('html')?.getAttribute('lang'),
    uid,
  });
  Metrics.usePageViewEvent(Metrics.settingsViewName);

  useEffect(() => {
    GleanMetrics.accountPref.view();
  }, []);

  const [monitorPromo, setMonitorPromo] = useState<MonitorPromoData | null>(
    null
  );
  const [productPromoGleanEventSent, setProductPromoGleanEventSent] =
    useState(false);

  useEffect(() => {
    function showInactiveVerifiedBanner() {
      const emailCampaigns = [
        'fx-account-inactive-reminder-first',
        'fx-account-inactive-reminder-second',
        'fx-account-inactive-reminder-third',
      ];
      if (!emailCampaigns.some((e) => integration?.data?.utmCampaign === e)) {
        return false;
      }
      if (
        integration?.data?.utmContent !== 'fx-account-deletion' ||
        integration?.data?.utmMedium !== 'email'
      ) {
        return false;
      }
      return true;
    }

    if (showInactiveVerifiedBanner()) {
      GleanMetrics.accountBanner.reactivationSuccessView();
      alertBar.success(
        ftlMsgResolver.getMsg(
          'inactive-update-status-success-alert',
          'Signed in successfully. Your Mozilla account and data will stay active.'
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      if (monitorPromo !== null) {
        return;
      }

      const promoData = getProductPromoData(account.attachedClients);

      setMonitorPromo(promoData);
    })();
  }, [account, monitorPromo]);

  // -- Relying party promotion checks --
  useEffect(() => {
    if (!monitorPromo) return;
    // We want this view event to fire whenever the account settings page view
    // event fires, if the user is shown the promo.
    if (!monitorPromo.hidePromo && !productPromoGleanEventSent) {
      GleanMetrics.accountPref.promoMonitorView(monitorPromo.gleanEvent);
      // Keep track of this because `attachedClients` can change on disconnect
      setProductPromoGleanEventSent(true);
    }
  }, [
    attachedClients,
    monitorPromo,
    subscriptions,
    productPromoGleanEventSent,
  ]);

  useEffect(() => {
    const targetEmail = (() => {
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get('email');
      } catch {}
      return null;
    })();

    // RPs might want to link to settings and specify a target account. If the
    // current account email doesn't match the requested email, sign in the user
    // in with this email.
    if (targetEmail && targetEmail !== account.email) {
      window.location.replace(`/signin${window.location.search}`);
    }
  }, [account]);

  // -- Account feature promotion checks --

  // The estimated Sync devices is optionally returned by the auth-server,
  // if it is not present, we default to 0.
  let estimatedSyncDeviceCount = 0;
  if (recoveryKey.estimatedSyncDeviceCount) {
    estimatedSyncDeviceCount = recoveryKey.estimatedSyncDeviceCount;
  }

  const dismissedRecoveryPhonePromo = isRecoveryPhonePromoDismissed();
  const dismissedRecoveryKeyPromo = isRecoveryKeyPromoDismissed();

  // Recovery phone promo is prioritized if user is eligible for both
  const eligibleForRecoveryPhonePromo =
    !dismissedRecoveryPhonePromo &&
    totp.exists &&
    totp.verified &&
    !recoveryPhone.exists &&
    recoveryPhone.available;

  const eligibleForRecoveryKeyPromo =
    (!eligibleForRecoveryPhonePromo || dismissedRecoveryPhonePromo) &&
    !dismissedRecoveryKeyPromo &&
    estimatedSyncDeviceCount > 0 &&
    !recoveryKey.exists;

  // Scroll to effect
  const profileRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);
  const connectedServicesRef = useRef<HTMLDivElement>(null);
  const linkedAccountsRef = useRef<HTMLDivElement>(null);
  const dataCollectionRef = useRef<HTMLDivElement>(null);

  return (
    <div id="fxa-settings" className="flex">
      <Head />
      <div className="hidden desktop:block desktop:flex-2">
        <SideBar
          {...{
            profileRef,
            securityRef,
            connectedServicesRef,
            linkedAccountsRef,
            dataCollectionRef,
            monitorPromo,
          }}
        />
      </div>
      <div className="flex flex-col flex-7 max-w-full gap-8 mt-10">
        {eligibleForRecoveryPhonePromo && <RecoveryPhonePromoBanner />}
        {eligibleForRecoveryKeyPromo && <AccountRecoveryKeyPromoBanner />}
        <Profile ref={profileRef} />
        <Security ref={securityRef} />
        <ConnectedServices ref={connectedServicesRef} />
        <LinkedAccounts ref={linkedAccountsRef} />
        <DataCollection ref={dataCollectionRef} />
        <div className="flex mx-4 tablet:mx-0" id="delete-account">
          <Localized id="delete-account-link">
            <Link
              data-testid="settings-delete-account"
              className="cta-caution text-sm transition-standard mt-2 py-2 px-5 mobileLandscape:py-1"
              to={SETTINGS_PATH + '/delete_account'}
              onClick={() => GleanMetrics.deleteAccount.settingsSubmit()}
            >
              Delete account
            </Link>
          </Localized>
        </div>
        {monitorPromo && !monitorPromo.hidePromo && (
          <ProductPromo type="settings" {...{ monitorPromo }} />
        )}
      </div>
    </div>
  );
};

export default PageSettings;
