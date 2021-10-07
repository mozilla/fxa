/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized, useLocalization } from '@fluent/react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import Switch from '../Switch';
import React, { useState } from 'react';
import { useAlertBar } from '../../models';
// import { useAccount } from '../../models';

export const DataCollection = () => {
  // TODO: grab actual value here, FXA-4106
  // const { metricsOptOut }  = useAccount();
  const [metricsOptOut, setMetricsOptOut] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const alertBar = useAlertBar();
  const { l10n } = useLocalization();

  const handleMetricsOptOutToggle = () => {
    setIsSubmitting(true);
    // TODO: remove this & replace with gql mutation, FXA-4106
    setTimeout(() => {
      if (metricsOptOut) {
        alertBar.success(
          l10n.getString(
            'dc-opt-out-success',
            null,
            'You’ve successfully opted out from Firefox Accounts sending technical and interaction data to Mozilla.'
          )
        );
      } else {
        alertBar.success(
          l10n.getString(
            'dc-opt-in-success',
            null,
            'You’ve successfully opted in to Firefox Accounts sending technical and interaction data to Mozilla. Thank you!'
          )
        );
      }
      setMetricsOptOut(!metricsOptOut);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="mt-11" data-testid="settings-data-collection">
      <h2 className="font-header font-bold ltr:ml-4 rtl:mr-4 mb-4">
        <span id="data-collection" className="nav-anchor" />
        <Localized id="dc-heading">Data Collection and Use</Localized>
      </h2>
      <div className="bg-white tablet:rounded-xl shadow px-4 tablet:px-6 pt-7 pb-5">
        <div className="flex mb-4">
          <div className="flex-5 tablet:flex-7 pr-6 tablet:pr-12">
            <Localized id="dc-subheader">
              <h3 className="font-header mb-4">Analytics and Improvements</h3>
            </Localized>

            <p className="text-sm">
              <Localized id="dc-subheader-content">
                Allow Firefox Accounts to send technical and interaction data to
                Mozilla.
              </Localized>{' '}
              <LinkExternal
                href="https://www.mozilla.org/en-US/privacy/firefox/#firefox-accounts"
                className="link-blue"
                data-testid="link-external-telemetry-opt-out"
              >
                <Localized id="dc-learn-more">Learn more</Localized>
              </LinkExternal>
            </p>
          </div>

          <div className="flex-1 text-center tablet:pt-1">
            <form>
              <Switch
                {...{
                  isSubmitting,
                  isOn: metricsOptOut,
                  id: 'metrics-opt-out',
                  handler: handleMetricsOptOutToggle,
                  localizedLabel: (
                    <Localized id="dc-subheader">
                      Analytics and Improvements
                    </Localized>
                  ),
                }}
              />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataCollection;
