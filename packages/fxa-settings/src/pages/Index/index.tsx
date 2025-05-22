/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { IndexFormData, IndexProps } from './interfaces';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';
import InputText from '../../components/InputText';
import { FtlMsg } from 'fxa-react/lib/utils';
import ThirdPartyAuth from '../../components/ThirdPartyAuth';
import TermsPrivacyAgreement from '../../components/TermsPrivacyAgreement';
import {
  isClientMonitor,
  isClientPocket,
  isClientRelay,
} from '../../models/integrations/client-matching';
import { isOAuthIntegration } from '../../models';
import GleanMetrics from '../../lib/glean';
import Banner from '../../components/Banner';

export const Index = ({
  integration,
  serviceName,
  processEmailSubmission,
  prefillEmail,
  errorBannerMessage,
  successBannerMessage,
  tooltipErrorMessage,
  setErrorBannerMessage,
  setSuccessBannerMessage,
  setTooltipErrorMessage,
  deeplink,
  flowQueryParams
}: IndexProps) => {
  const clientId = integration.getClientId();
  const isSync = integration.isSync();
  const isDesktopRelay = integration.isDesktopRelay();
  const isOAuth = isOAuthIntegration(integration);
  const isPocketClient = isOAuth && isClientPocket(clientId);
  const isMonitorClient = isOAuth && isClientMonitor(clientId);
  const isRelayClient = isOAuth && isClientRelay(clientId);

  const emailEngageEventEmitted = useRef(false);

  const isDeeplinking = !!deeplink;

  useEffect(() => {
    GleanMetrics.emailFirst.view();
  }, []);

  const onSubmit = async ({ email }: IndexFormData) => {
    processEmailSubmission(email.trim());
  };

  const handleInputChange = () => {
    if (!emailEngageEventEmitted.current) {
      GleanMetrics.emailFirst.engage();
      emailEngageEventEmitted.current = true;
    }

    if (errorBannerMessage || successBannerMessage) {
      // TODO improve this, needs height or some animation, FXA-9143
      setErrorBannerMessage('');
      setSuccessBannerMessage('');
    }
    if (tooltipErrorMessage) {
      setTooltipErrorMessage('');
    }
  };

  const { handleSubmit, register } = useForm<IndexFormData>({
    mode: 'onSubmit',
    defaultValues: {
      email: prefillEmail,
    },
  });

  if (isDeeplinking) {
    // To avoid flickering, we just render third party auth when deeplinking
    return <ThirdPartyAuth showSeparator={false} viewName="deeplink" deeplink={deeplink} flowQueryParams={flowQueryParams}/>
  }

  return (
    <AppLayout>
      {isSync ? (
        <>
          <h1 className="card-header">
            <FtlMsg id="index-sync-header">
              Continue to your Mozilla account
            </FtlMsg>
          </h1>
          <p className="mt-1 mb-9 text-sm">
            <FtlMsg id="index-sync-subheader">
              Sync your passwords, tabs, and bookmarks everywhere you use
              Firefox.
            </FtlMsg>
          </p>
        </>
      ) : isDesktopRelay ? (
        <>
          <h1 className="card-header">
            <FtlMsg id="index-relay-header">Create an email mask</FtlMsg>
          </h1>
          <p className="mt-1 mb-9 text-sm">
            <FtlMsg id="index-relay-subheader">
              Please provide the email address where you’d like to forward
              emails from your masked email.
            </FtlMsg>
          </p>
        </>
      ) : (
        <CardHeader
          headingText="Enter your email"
          headingTextFtlId="index-header"
          subheadingWithDefaultServiceFtlId="index-subheader-default"
          subheadingWithCustomServiceFtlId="index-subheader-with-servicename"
          subheadingWithLogoFtlId="index-subheader-with-logo"
          {...{ clientId, serviceName }}
        />
      )}
      {errorBannerMessage && (
        <Banner
          type="error"
          content={{ localizedHeading: errorBannerMessage }}
        />
      )}
      {successBannerMessage && (
        <Banner
          type="success"
          content={{ localizedHeading: successBannerMessage }}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FtlMsg id="index-email-input" attrs={{ label: true }}>
          <InputText
            className="mt-8"
            name="email"
            inputMode="email"
            label="Enter your email"
            inputRef={register()}
            autoFocus
            errorText={tooltipErrorMessage}
            onChange={handleInputChange}
          />
        </FtlMsg>
        <div className="flex mt-5">
          <button
            className="cta-primary cta-xl"
            type="submit"
            data-glean-id="email_first_submit"
          >
            <FtlMsg id="index-cta">Sign up or sign in</FtlMsg>
          </button>
        </div>
      </form>

      {isSync ? (
        <p className="mt-5 text-xs text-grey-500">
          <FtlMsg id="index-account-info">
            A Mozilla account also unlocks access to more privacy-protecting
            products from Mozilla.
          </FtlMsg>
        </p>
      ) : (
        !isDesktopRelay && <ThirdPartyAuth showSeparator viewName="index" flowQueryParams={flowQueryParams}/>
      )}
      <TermsPrivacyAgreement
        {...{ isPocketClient, isMonitorClient, isDesktopRelay, isRelayClient }}
      />
    </AppLayout>
  );
};

export default Index;
