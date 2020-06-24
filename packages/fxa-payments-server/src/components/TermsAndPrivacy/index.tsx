import React, { useContext } from 'react';
import { Localized } from '@fluent/react';
import { AppContext } from '../../lib/AppContext';
import {
  productDetailsFromPlan,
  DEFAULT_PRODUCT_DETAILS,
} from 'fxa-shared/subscriptions/metadata';
import { Plan } from '../../store/types';

import './index.scss';

export type TermsAndPrivacyProps = {
  plan?: Plan;
};

export const TermsAndPrivacy = ({ plan }: TermsAndPrivacyProps) => {
  const { navigatorLanguages } = useContext(AppContext);

  // TODO: if a plan is not supplied, fall back to default details
  // This mainly happens in ProductUpdateForm where we're updating payment
  // details across *all* plans - are there better URLs to pick in that case?
  const { termsOfServiceURL, privacyNoticeURL } = plan
    ? productDetailsFromPlan(plan, navigatorLanguages)
    : DEFAULT_PRODUCT_DETAILS;

  return (
    <div>
      <div className="terms">
        <Localized id="terms">
          <a
            rel="noopener noreferrer"
            target="_blank"
            data-testid="terms"
            href={termsOfServiceURL}
          >
            Terms of Service
          </a>
        </Localized>
      </div>
      <div className="privacy">
        <Localized id="privacy">
          <a
            rel="noopener noreferrer"
            target="_blank"
            data-testid="privacy"
            href={privacyNoticeURL}
          >
            Privacy Notice
          </a>
        </Localized>
      </div>
    </div>
  );
};

export default TermsAndPrivacy;
