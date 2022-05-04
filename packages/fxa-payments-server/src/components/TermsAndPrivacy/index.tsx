import React, { useContext } from 'react';
import { Localized } from '@fluent/react';

import {
  productDetailsFromPlan,
  DEFAULT_PRODUCT_DETAILS,
} from 'fxa-shared/subscriptions/metadata';

import { Plan } from '../../store/types';

import { AppContext } from '../../lib/AppContext';
import { legalDocsRedirectUrl } from '../../lib/formats';

import LinkExternal from 'fxa-react/components/LinkExternal';

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
  // This logic assumes that values exist on DEFAULT_PRODUCT_DETAILS and are not undefined
  const {
    termsOfServiceURL = DEFAULT_PRODUCT_DETAILS.termsOfServiceURL!,
    termsOfServiceDownloadURL = DEFAULT_PRODUCT_DETAILS.termsOfServiceDownloadURL!,
    privacyNoticeURL = DEFAULT_PRODUCT_DETAILS.privacyNoticeURL!,
  } = plan
    ? productDetailsFromPlan(plan, navigatorLanguages)
    : DEFAULT_PRODUCT_DETAILS;

  const tosUrl = termsOfServiceDownloadURL
    ? legalDocsRedirectUrl(termsOfServiceDownloadURL)
    : termsOfServiceDownloadURL;

  const productLegalBlurb = (
    <p>
      <Localized id="terms">
        <LinkExternal href={termsOfServiceURL} data-testid="terms">
          Terms of Service
        </LinkExternal>
      </Localized>
      &nbsp;&nbsp;&nbsp;
      <Localized id="privacy">
        <LinkExternal href={privacyNoticeURL} data-testid="privacy">
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
