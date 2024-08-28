/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef } from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import Security from '../Security';
import { Profile } from '../Profile';
import ConnectedServices from '../ConnectedServices';
import LinkedAccounts from '../LinkedAccounts';

import * as Metrics from '../../../lib/metrics';
import { useAccount } from '../../../models';
import { SETTINGS_PATH } from 'fxa-settings/src/constants';
import { Localized } from '@fluent/react';
import DataCollection from '../DataCollection';
import GleanMetrics from '../../../lib/glean';
import ProductPromo, { ProductPromoType } from '../ProductPromo';
import SideBar from '../Sidebar';
import { MozServices } from '../../../lib/types';

export const PageSettings = (_: RouteComponentProps) => {
  const { attachedClients, uid } = useAccount();

  Metrics.setProperties({
    lang: document.querySelector('html')?.getAttribute('lang'),
    uid,
  });
  Metrics.usePageViewEvent(Metrics.settingsViewName);

  const hasMonitor = attachedClients.some(
    ({ name }) => name === MozServices.Monitor
  );

  // Will be needed once UX is sorted out for the MonitorPlus promo.
  // const { subscriptions } = useAccount();
  // const hasMonitorPlus = subscriptions.some(
  //   ({ productName }) => productName === MozServices.MonitorPlus
  // );

  // False by default until UX is sorted out.
  // Can be enabled for tests and storybook by passing true to the ProductPromo component.
  // Once ready, this should be set to: hasMonitor && !hasMonitorPlus;
  const showMonitorPlusPromo = false;

  const showMonitorPromo = !hasMonitor || showMonitorPlusPromo;

  const gleanEvent = showMonitorPlusPromo
    ? { event: { reason: 'plus' } }
    : { event: { reason: 'free' } };

  useEffect(() => {
    GleanMetrics.accountPref.view();
    if (showMonitorPromo) {
      const gleanPingMetrics = showMonitorPlusPromo
        ? { event: { reason: 'plus' } }
        : { event: { reason: 'free' } };
      GleanMetrics.accountPref.promoMonitorView(gleanPingMetrics);
    }
  }, [showMonitorPromo, showMonitorPlusPromo]);

  // Scroll to effect
  const profileRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);
  const connectedServicesRef = useRef<HTMLDivElement>(null);
  const linkedAccountsRef = useRef<HTMLDivElement>(null);
  const dataCollectionRef = useRef<HTMLDivElement>(null);

  return (
    <div id="fxa-settings" className="flex">
      <div className="hidden desktop:block desktop:flex-2">
        <SideBar
          {...{
            profileRef,
            securityRef,
            connectedServicesRef,
            linkedAccountsRef,
            dataCollectionRef,
            gleanEvent,
            showMonitorPromo,
            showMonitorPlusPromo,
          }}
        />
      </div>
      <div className="flex-7 max-w-full">
        <Profile ref={profileRef} />
        <Security ref={securityRef} />
        <ConnectedServices ref={connectedServicesRef} />
        <LinkedAccounts ref={linkedAccountsRef} />
        <DataCollection ref={dataCollectionRef} />
        <div className="flex mx-4 tablet:mx-0" id="delete-account">
          <Localized id="delete-account-link">
            <Link
              data-testid="settings-delete-account"
              className="cta-caution text-sm transition-standard mt-12 py-2 px-5 mobileLandscape:py-1"
              to={SETTINGS_PATH + '/delete_account'}
              onClick={() => GleanMetrics.deleteAccount.settingsSubmit()}
            >
              Delete account
            </Link>
          </Localized>
        </div>
        {!showMonitorPromo && (
          <ProductPromo
            type={ProductPromoType.Settings}
            {...{ gleanEvent, showMonitorPlusPromo }}
          />
        )}
      </div>
    </div>
  );
};

export default PageSettings;
