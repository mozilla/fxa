/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { navigate, RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../constants';
import { HeartsVerifiedImage } from '../../components/images';
import CardHeader from '../CardHeader';
import Banner, { BannerType } from '../Banner';
import { MozServices } from '../../lib/types';
import GleanMetrics from '../../lib/glean';

export type ReadyProps = {
  continueHandler?: Function;
  isSignedIn: boolean;
  serviceName?: string;
  viewName: ViewNameType;
  errorMessage?: string;
};

export type ViewNameType =
  | 'signin-confirmed'
  | 'signin-verified'
  | 'signup-confirmed'
  | 'signup-verified'
  | 'reset-password-confirmed'
  | 'reset-password-verified'
  | 'reset-password-with-recovery-key-verified'
  | 'primary-email-verified';

const getTemplateValues = (viewName: ViewNameType) => {
  let templateValues = {
    headerText: '',
    headerId: '',
  };
  switch (viewName) {
    case 'signin-confirmed':
    case 'signin-verified':
      templateValues.headerId = 'sign-in-complete-header';
      templateValues.headerText = 'Sign-in confirmed';
      break;
    case 'signup-confirmed':
    case 'signup-verified':
      templateValues.headerId = 'sign-up-complete-header';
      templateValues.headerText = 'Account confirmed';
      break;
    case 'reset-password-confirmed':
    case 'reset-password-with-recovery-key-verified':
      templateValues.headerId = 'reset-password-complete-header';
      templateValues.headerText = 'Your password has been reset';
      break;
    case 'primary-email-verified':
      templateValues.headerId = 'primary-email-verified-header';
      templateValues.headerText = 'Primary email confirmed';
      break;
    default:
      throw new Error('Invalid view name submitted to Ready component');
  }
  return templateValues;
};

const Ready = ({
  continueHandler,
  errorMessage,
  isSignedIn,
  serviceName = MozServices.Default,
  viewName,
}: ReadyProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  // TODO: use `integration.isSync()`
  // This component in general could use some clean up...
  const isSync = serviceName === MozServices.FirefoxSync;

  const templateValues = getTemplateValues(viewName);

  const showReadyToUseService =
    !isSync && isSignedIn && serviceName && serviceName !== MozServices.Default;

  const showReadyToUseSettings =
    !isSync &&
    isSignedIn &&
    (!serviceName || serviceName === MozServices.Default);

  const showAccountReady = !isSync && !isSignedIn;

  const startBrowsing = () => {
    const eventName = `${viewName}.start-browsing`;
    logViewEvent(viewName, eventName, REACT_ENTRYPOINT);
    const FXA_PRODUCT_PAGE_URL = 'https://www.mozilla.org/firefox/accounts';
    navigate(FXA_PRODUCT_PAGE_URL, { replace: true });
  };

  useEffect(() => {
    if (viewName === 'reset-password-confirmed') {
      GleanMetrics.passwordReset.createNewSuccess();
    }
  }, [viewName]);

  return (
    <>
      <CardHeader
        headingText={templateValues.headerText}
        headingTextFtlId={templateValues.headerId}
      />
      {errorMessage && (
        <Banner type={BannerType.error}>
          <p>{errorMessage}</p>
        </Banner>
      )}
      <div className="flex justify-center mx-auto">
        <HeartsVerifiedImage className="w-3/5" />
      </div>
      <section>
        {isSync && (
          <>
            <FtlMsg id="ready-complete-set-up-instruction">
              <p className="my-4 text-sm">
                Complete setup by entering your new password on your other
                Firefox devices.
              </p>
            </FtlMsg>
            <div className="flex justify-center mx-auto mt-6">
              <FtlMsg id="ready-start-browsing-button">
                <button className="cta-primary cta-xl" onClick={startBrowsing}>
                  Start browsing
                </button>
              </FtlMsg>
            </div>
          </>
        )}
        {showReadyToUseService && (
          <FtlMsg id="ready-use-service" vars={{ serviceName }}>
            <p className="my-4 text-sm">{`You’re now ready to use ${serviceName}`}</p>
          </FtlMsg>
        )}
        {showReadyToUseSettings && (
          <FtlMsg id="ready-use-service-default">
            <p className="my-4 text-sm">
              You’re now ready to use account settings
            </p>
          </FtlMsg>
        )}
        {showAccountReady && (
          <FtlMsg id="ready-account-ready">
            <p className="my-4 text-sm">Your account is ready!</p>
          </FtlMsg>
        )}
      </section>
      {continueHandler && (
        <div className="flex justify-center mx-auto mt-6">
          <button
            type="submit"
            className="cta-primary cta-xl font-bold mx-2 flex-1"
            onClick={(e) => {
              const eventName = `flow.${viewName}.continue`;
              logViewEvent(viewName, eventName, REACT_ENTRYPOINT);
              continueHandler && continueHandler(e);
            }}
          >
            <FtlMsg id="ready-continue">Continue</FtlMsg>
          </button>
        </div>
      )}
    </>
  );
};

export default Ready;
