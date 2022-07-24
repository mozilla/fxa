import React, { useContext } from 'react';
import { Localized } from '@fluent/react';

import { Plan } from '../../store/types';

import { AppContext } from '../../lib/AppContext';
import { legalDocsRedirectUrl } from '../../lib/formats';

import LinkExternal from 'fxa-react/components/LinkExternal';
import { urlsFromProductConfig } from 'fxa-shared/subscriptions/configuration/utils';

export type TermsAndPrivacyProps = {
  plan: Plan;
  showFXALinks?: boolean;
  contentServerURL?: string;
};

export const TermsAndPrivacy = ({
  plan,
  showFXALinks = false,
  contentServerURL,
}: TermsAndPrivacyProps) => {
  const { navigatorLanguages, config } = useContext(AppContext);

  // TODO: if a plan is not supplied, fall back to default details
  // This mainly happens in ProductUpdateForm where we're updating payment
  // details across *all* plans - are there better URLs to pick in that case?
  const { termsOfService, termsOfServiceDownload, privacyNotice } =
    urlsFromProductConfig(
      plan,
      navigatorLanguages,
      config.featureFlags.useFirestoreProductConfigs
    );

  const tosUrl = termsOfServiceDownload
    ? legalDocsRedirectUrl(termsOfServiceDownload)
    : termsOfServiceDownload;

  const productLegalBlurb = (
    <p>
      <Localized id="terms">
        <LinkExternal href={termsOfService} data-testid="terms">
          Terms of Service
        </LinkExternal>
      </Localized>
      &nbsp;&nbsp;&nbsp;
      <Localized id="privacy">
        <LinkExternal href={privacyNotice} data-testid="privacy">
          Privacy Notice
        </LinkExternal>
      </Localized>
      &nbsp;&nbsp;&nbsp;
      <Localized id="terms-download">
        <LinkExternal href={tosUrl} data-testid="terms-download">
          Download Terms
        </LinkExternal>
      </Localized>
    </p>
  );

  const FXALegal = showFXALinks ? (
    <>
      <p className="legal-heading">Firefox Accounts</p>
      <p data-testid="fxa-legal-links">
        <Localized id="terms">
          <LinkExternal
            href={`${contentServerURL}/legal/terms`}
            data-testid="fxa-terms"
          >
            Terms of Service
          </LinkExternal>
        </Localized>
        &nbsp;&nbsp;&nbsp;
        <Localized id="privacy">
          <LinkExternal
            href={`${contentServerURL}/legal/privacy`}
            data-testid="fxa-privacy"
          >
            Privacy Notice
          </LinkExternal>
        </Localized>
      </p>
    </>
  ) : null;

  return (
    <div className="legal-blurb" data-testid="terms-and-privacy-component">
      {FXALegal}
      <p className="legal-heading">{plan?.product_name}</p>
      {productLegalBlurb}
    </div>
  );
};

export default TermsAndPrivacy;
