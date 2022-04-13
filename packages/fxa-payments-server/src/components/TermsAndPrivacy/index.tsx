import React, { useContext } from 'react';
import { Localized } from '@fluent/react';

import {
  productDetailsFromPlan,
  DEFAULT_PRODUCT_DETAILS,
} from 'fxa-shared/subscriptions/metadata';

import { Plan } from '../../store/types';

import { AppContext } from '../../lib/AppContext';
import { legalDocsRedirectUrl } from '../../lib/formats';

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
  const { navigatorLanguages } = useContext(AppContext);

  // TODO: if a plan is not supplied, fall back to default details
  // This mainly happens in ProductUpdateForm where we're updating payment
  // details across *all* plans - are there better URLs to pick in that case?
  const { termsOfServiceURL, termsOfServiceDownloadURL, privacyNoticeURL } =
    plan
      ? productDetailsFromPlan(plan, navigatorLanguages)
      : DEFAULT_PRODUCT_DETAILS;

  const tosUrl = termsOfServiceDownloadURL
    ? legalDocsRedirectUrl(termsOfServiceDownloadURL)
    : termsOfServiceDownloadURL;

  const productLegalBlurb = (
    <p>
      <Localized id="terms">
        <a
          href={termsOfServiceURL}
          target="_blank"
          data-testid="terms"
          rel="noopener noreferrer"
        >
          Terms of Service
        </a>
      </Localized>
      &nbsp;&nbsp;&nbsp;
      <Localized id="privacy">
        <a
          href={privacyNoticeURL}
          target="_blank"
          data-testid="privacy"
          rel="noopener noreferrer"
        >
          Privacy Notice
        </a>
      </Localized>
      &nbsp;&nbsp;&nbsp;
      <Localized id="terms-download">
        <a
          href={tosUrl}
          target="_blank"
          data-testid="terms-download"
          rel="noopener noreferrer"
        >
          Download Terms
        </a>
      </Localized>
    </p>
  );

  const FXALegal = showFXALinks ? (
    <>
      <p className="legal-heading">Firefox Accounts</p>
      <p data-testid="fxa-legal-links">
        <Localized id="terms">
          <a
            href={`${contentServerURL}/legal/terms`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="fxa-terms"
          >
            Terms of Service
          </a>
        </Localized>
        &nbsp;&nbsp;&nbsp;
        <Localized id="privacy">
          <a
            href={`${contentServerURL}/legal/privacy`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="fxa-privacy"
          >
            Privacy Notice
          </a>
        </Localized>
      </p>
    </>
  ) : null;

  return (
    <div
      className="terms leading-5 clear-both text-center text-xs "
      data-testid="terms-and-privacy-component"
    >
      {FXALegal}
      <p className="legal-heading">{plan?.product_name}</p>
      {productLegalBlurb}
    </div>
  );
};

export default TermsAndPrivacy;
