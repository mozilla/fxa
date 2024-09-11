/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import LinkExternal from 'fxa-react/components/LinkExternal';
import Switch from '../Switch';
import React, { forwardRef, useCallback, useState } from 'react';
import { useAlertBar, useFtlMsgResolver } from '../../../models';
import { useAccount } from '../../../models';
import { setEnabled } from '../../../lib/metrics';
import UnitRow from '../UnitRow';
import { FtlMsg } from 'fxa-react/lib/utils';

export const DataCollection = forwardRef<HTMLDivElement>((_, ref) => {
  const account = useAccount();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();

  const localizedHeader = (
    <FtlMsg id="dc-heading">Data Collection and Use</FtlMsg>
  );

  const handleMetricsOptOutToggle = useCallback(async () => {
    setIsSubmitting(true);

    try {
      await account.metricsOpt(account.metricsEnabled ? 'out' : 'in');
      setEnabled(account.metricsEnabled);

      const alertArgs: [string, string] = account.metricsEnabled
        ? [
            'dc-opt-in-success-2',
            'Thanks! Sharing this data helps us improve Mozilla accounts.',
          ]
        : [
            'dc-opt-out-success-2',
            'Opt out successful. Mozilla accounts won’t send technical or interaction data to Mozilla.',
          ];
      alertBar.success(ftlMsgResolver.getMsg.apply(ftlMsgResolver, alertArgs));
    } catch (err) {
      alertBar.error(
        ftlMsgResolver.getMsg(
          'dc-opt-in-out-error-2',
          'Sorry, there was a problem changing your data collection preference'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [account, alertBar, ftlMsgResolver, setIsSubmitting]);

  return (
    <section
      data-testid="settings-data-collection"
      id="data-collection-section"
      {...{ ref }}
    >
      <h2 className="font-header font-bold mobileLandscape:ms-6 ms-4 mb-4 relative">
        <span id="data-collection" className="nav-anchor" />
        {localizedHeader}
      </h2>
      <div className="bg-white tablet:rounded-xl shadow">
        <UnitRow
          header={ftlMsgResolver.getMsg(
            'dc-subheader-moz-accounts',
            'Mozilla accounts'
          )}
          hideHeaderValue
          actionContent={
            <Switch
              {...{
                isSubmitting,
                isOn: account.metricsEnabled,
                id: 'metrics-opt-out',
                handler: handleMetricsOptOutToggle,
                localizedLabel: localizedHeader,
              }}
            />
          }
        >
          <p className="mb-4">
            <FtlMsg id="dc-subheader-content-2">
              Allow Mozilla accounts to send technical and interaction data to
              Mozilla.
            </FtlMsg>{' '}
            <LinkExternal
              href="https://www.mozilla.org/privacy/mozilla-accounts/"
              className="link-blue"
              data-testid="link-external-telemetry-opt-out"
            >
              <FtlMsg id="dc-learn-more">Learn more</FtlMsg>
            </LinkExternal>
          </p>
        </UnitRow>

        <hr className="unit-row-hr" />

        <UnitRow
          header={ftlMsgResolver.getMsg(
            'dc-subheader-ff-browser',
            'Firefox browser'
          )}
          hideHeaderValue
        >
          <p>
            <FtlMsg id="dc-subheader-ff-content">
              To review or update your Firefox browser technical and interaction
              data settings, open Firefox settings and navigate to Privacy and
              Security.
            </FtlMsg>{' '}
            <LinkExternal
              href="https://support.mozilla.org/kb/telemetry-clientid"
              className="link-blue"
              data-testid="link-external-firefox-telemetry"
            >
              <FtlMsg id="dc-learn-more">Learn more</FtlMsg>
            </LinkExternal>
          </p>
        </UnitRow>
      </div>
    </section>
  );
});

export default DataCollection;
