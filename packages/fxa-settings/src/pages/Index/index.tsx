/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
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
import { isOAuthIntegration, useFtlMsgResolver } from '../../models';
import GleanMetrics from '../../lib/glean';
import { getLocalizedErrorMessage, interpolate } from '../../lib/error-utils';
import Banner from '../../components/Banner';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';

export const Index = ({
  integration,
  serviceName,
  signUpOrSignInHandler,
  prefillEmail,
  deleteAccountSuccess,
  hasBounced,
}: IndexProps) => {
  const clientId = integration.getClientId();
  const isSync = integration.isSync();
  const isDesktopRelay = integration.isDesktopRelay();
  const isOAuth = isOAuthIntegration(integration);
  const isPocketClient = isOAuth && isClientPocket(clientId);
  const isMonitorClient = isOAuth && isClientMonitor(clientId);
  const isRelayClient = isOAuth && isClientRelay(clientId);

  const ftlMsgResolver = useFtlMsgResolver();
  const [errorBannerMessage, setErrorBannerMessage] = useState('');
  const [successBannerMessage, setSuccessBannerMessage] = useState(
    deleteAccountSuccess
      ? ftlMsgResolver.getMsg(
          'index-account-delete-success',
          'Account deleted successfully'
        )
      : undefined
  );
  const [tooltipErrorText, setTooltipErrorText] = useState(
    hasBounced
      ? ftlMsgResolver.getMsg(
          'auth-errors-1018',
          'Your confirmation email was just returned. Mistyped email?'
        )
      : undefined
  );

  useEffect(() => {
    // Note we might not need this later due to automatic page load events,
    // but it's here for now to match parity with Backbone. This will be closely
    // monitored for the `service=relay` flow for some time.
    GleanMetrics.emailFirst.view();
  }, []);

  const { handleSubmit, register } = useForm<IndexFormData>({
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: {
      email: prefillEmail,
    },
  });

  const onSubmit = async ({ email }: IndexFormData) => {
    // This function handles navigation on success
    const { error } = await signUpOrSignInHandler(email.trim());
    if (error) {
      switch (error.errno) {
        case AuthUiErrors.MX_LOOKUP_WARNING.errno:
          setTooltipErrorText(
            ftlMsgResolver.getMsg('auth-error-1067', error.message)
          );
          break;
        case AuthUiErrors.EMAIL_REQUIRED.errno:
          setTooltipErrorText(
            ftlMsgResolver.getMsg(
              'auth-error-1011',
              AuthUiErrors.EMAIL_REQUIRED.message
            )
          );
          break;
        case AuthUiErrors.EMAIL_MASK_NEW_ACCOUNT.errno:
          setTooltipErrorText(
            ftlMsgResolver.getMsg(
              'auth-error-1066',
              AuthUiErrors.EMAIL_MASK_NEW_ACCOUNT.message
            )
          );
          break;
        case AuthUiErrors.DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN.errno:
          setTooltipErrorText(
            ftlMsgResolver.getMsg(
              'auth-error-1020',
              AuthUiErrors.DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN.message
            )
          );
          break;
        case AuthUiErrors.INVALID_EMAIL_DOMAIN.errno: {
          const [, domain] = email.split('@');
          setTooltipErrorText(
            ftlMsgResolver.getMsg(
              'auth-error-1064',
              interpolate(AuthUiErrors.INVALID_EMAIL_DOMAIN.message, {
                domain,
              }),
              { domain }
            )
          );
          break;
        }
        default:
          setErrorBannerMessage(
            getLocalizedErrorMessage(ftlMsgResolver, error)
          );
      }
    }
  };

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
            label="Enter your email"
            inputRef={register()}
            autoFocus
            errorText={tooltipErrorText}
            onChange={() => {
              if (errorBannerMessage || successBannerMessage) {
                // TODO improve this, needs height or some animation, FXA-9143
                setErrorBannerMessage('');
                setSuccessBannerMessage('');
              }
              if (tooltipErrorText) {
                setTooltipErrorText('');
              }
            }}
          />
        </FtlMsg>
        <div className="flex mt-5">
          <button className="cta-primary cta-xl" type="submit">
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
        !isDesktopRelay && <ThirdPartyAuth showSeparator viewName="index" />
      )}
      <TermsPrivacyAgreement
        {...{ isPocketClient, isMonitorClient, isDesktopRelay, isRelayClient }}
      />
    </AppLayout>
  );
};

export default Index;
