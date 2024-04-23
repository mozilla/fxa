/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized, useLocalization } from '@fluent/react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import Switch from '../Switch';
import React, { forwardRef, useCallback, useState } from 'react';
import { useAlertBar } from '../../../models';
import { useAccount } from '../../../models';
import { setEnabled } from '../../../lib/metrics';

export const DataCollection = forwardRef<HTMLDivElement>((_, ref) => {
  const account = useAccount();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const alertBar = useAlertBar();
  const { l10n } = useLocalization();

  const localizedHeader = (
    <Localized id="dc-heading">Data Collection and Use</Localized>
  );

  const handleMetricsOptOutToggle = useCallback(async () => {
    setIsSubmitting(true);

    try {
      await account.metricsOpt(account.metricsEnabled ? 'out' : 'in');
      setEnabled(account.metricsEnabled);

      const alertArgs: [string, null, string] = account.metricsEnabled
        ? [
            'dc-opt-in-success-2',
            null,
            'Thanks! Sharing this data helps us improve Mozilla accounts.',
          ]
        : [
            'dc-opt-out-success-2',
            null,
            'Opt out successful. Mozilla accounts won’t send technical or interaction data to Mozilla.',
          ];
      alertBar.success(l10n.getString.apply(l10n, alertArgs));
    } catch (err) {
      alertBar.error(
        l10n.getString(
          'dc-opt-in-out-error-2',
          null,
          'Sorry, there was a problem changing your data collection preference'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [account, alertBar, l10n, setIsSubmitting]);

  return (
    <section
      className="mt-11"
      data-testid="settings-data-collection"
      id="data-collection-section"
      {...{ ref }}
    >
      <h2 className="font-header font-bold mobileLandscape:ltr:ml-6 mobileLandscape:rtl:ml-6 ltr:ml-4 rtl:mr-4 mb-4 relative">
        <span id="data-collection" className="nav-anchor" />
        {localizedHeader}
      </h2>
      <div className="bg-white tablet:rounded-xl shadow px-4 tablet:px-6 pt-7 pb-5">
        <div className="flex mb-4">
          <div className="flex-5 tablet:flex-7 ltr:pr-6 tablet:ltr:pr-12 rtl:pl-6 tablet:rtl:pl-12">
            <Localized id="dc-subheader-2">
              <h3 className="font-header mb-4">
                Help improve Mozilla accounts
              </h3>
            </Localized>

            <p className="text-sm">
              <Localized id="dc-subheader-content-2">
                Allow Mozilla accounts to send technical and interaction data to
                Mozilla.
              </Localized>{' '}
              <LinkExternal
                href="https://www.mozilla.org/privacy/mozilla-accounts/"
                className="link-blue"
                data-testid="link-external-telemetry-opt-out"
              >
                <Localized id="dc-learn-more">Learn more</Localized>
              </LinkExternal>
            </p>
          </div>

          <div className="flex-1 flex justify-center tablet:justify-end tablet:pr-4 tablet:pt-1">
            <Switch
              {...{
                isSubmitting,
                isOn: account.metricsEnabled,
                id: 'metrics-opt-out',
                handler: handleMetricsOptOutToggle,
                localizedLabel: localizedHeader,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
});

export default DataCollection;
