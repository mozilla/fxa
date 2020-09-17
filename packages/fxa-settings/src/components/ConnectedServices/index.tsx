/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { AlertBar } from '../AlertBar';
import { ButtonIconReload } from '../ButtonIcon';
import { useAlertBar } from 'fxa-settings/src/lib/hooks';
import { useAccount, useLazyAccount } from '../../models';
import { LinkExternal } from 'fxa-react/components/LinkExternal';

const UTM_PARAMS =
  '?utm_source=accounts.firefox.com&utm_medium=referral&utm_campaign=fxa-devices';
const DEVICES_SUPPORT_URL =
  'https://support.mozilla.org/kb/fxa-managing-devices' + UTM_PARAMS;

export const Service = () => {
  return (
    <div className="my-1" id="service" data-testid="settings-connected-service">
      <div className="border-2 border-solid border-grey-100 rounded flex justify-around items-center">
        <span>icon</span>

        <div className="flex flex-col">
          <h2>Service Name</h2>
          <p className="text-sm">location</p>
        </div>

        <p>Active Now</p>

        <button
          className="cta-neutral cta-base disabled:cursor-wait whitespace-no-wrap"
          data-testid="connected-service-sign-out"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export const ConnectedServices = () => {
  const alertBar = useAlertBar();
  const [errorText, setErrorText] = useState<string>();
  const onError = (e: Error) => {
    setErrorText(e.message);
    alertBar.show();
  };
  const [getAccount, { accountLoading }] = useLazyAccount((error) => {
    setErrorText('Sorry, there was a problem refreshing the recovery key.');
    alertBar.show();
  });

  return (
    <section
      className="mt-11"
      id="connected-services"
      data-testid="settings-connected-services"
    >
      <h2 className="font-header font-bold ml-4 mb-4">Connected Services</h2>
      <div className="bg-white tablet:rounded-xl shadow px-6 pt-7 pb-9">
        <div className="flex justify-between mb-4">
          <p>Everything you are using and signed into.</p>
          <ButtonIconReload
            title="Refresh connected services"
            classNames="hidden mobileLandscape:inline-block"
            testId="connected-services-refresh"
            disabled={accountLoading}
            onClick={getAccount}
          />
        </div>

        <Service />
        <Service />
        <Service />
        <Service />
        <Service />

        <div className="mt-5">
          <LinkExternal
            href={DEVICES_SUPPORT_URL}
            className="link-blue text-sm"
          >
            Missing or duplicate items?
          </LinkExternal>
        </div>

        {alertBar.visible && (
          <AlertBar
            onDismiss={alertBar.hide}
            type={errorText ? 'error' : 'success'}
          >
            {errorText ? (
              <p data-testid="delete-recovery-key-error">
                Error text TBD. {errorText}
              </p>
            ) : (
              <p data-testid="delete-recovery-key-success">
                Account recovery key removed
              </p>
            )}
          </AlertBar>
        )}
      </div>
    </section>
  );
};

export default ConnectedServices;
