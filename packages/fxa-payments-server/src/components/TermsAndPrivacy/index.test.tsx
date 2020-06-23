import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { MOCK_PLANS } from '../../lib/test-utils';
import { TermsAndPrivacy } from './index';
import { defaultAppContext, AppContext } from '../../lib/AppContext';
import { DEFAULT_PRODUCT_DETAILS } from '../../store/utils';

const enTermsOfServiceURL =
  'https://www.mozilla.org/en-US/about/legal/terms/services/';
const enPrivacyNoticeURL = 'https://www.mozilla.org/en-US/privacy/websites/';
const frTermsOfServiceURL =
  'https://www.mozilla.org/fr/about/legal/terms/services/';
const frPrivacyNoticeURL = 'https://www.mozilla.org/fr/privacy/websites/';

const plan = {
  ...MOCK_PLANS[0],
  plan_metadata: {
    'product:termsOfServiceURL': enTermsOfServiceURL,
    'product:termsOfServiceURL:fr': frTermsOfServiceURL,
    'product:privacyNoticeURL': enPrivacyNoticeURL,
    'product:privacyNoticeURL:fr': frPrivacyNoticeURL,
  },
};

afterEach(cleanup);

it('renders as expected with no plan', () => {
  const { queryByTestId } = render(<TermsAndPrivacy />);
  const termsLink = queryByTestId('terms');
  expect(termsLink).toBeInTheDocument();
  expect(termsLink).toHaveAttribute(
    'href',
    DEFAULT_PRODUCT_DETAILS.termsOfServiceURL
  );
  const privacyLink = queryByTestId('privacy');
  expect(privacyLink).toBeInTheDocument();
  expect(privacyLink).toHaveAttribute(
    'href',
    DEFAULT_PRODUCT_DETAILS.privacyNoticeURL
  );
});

it('renders as expected with default locale', () => {
  const { queryByTestId } = render(<TermsAndPrivacy plan={plan} />);
  const termsLink = queryByTestId('terms');
  expect(termsLink).toBeInTheDocument();
  expect(termsLink).toHaveAttribute('href', enTermsOfServiceURL);
  const privacyLink = queryByTestId('privacy');
  expect(privacyLink).toBeInTheDocument();
  expect(privacyLink).toHaveAttribute('href', enPrivacyNoticeURL);
});

it('renders as expected with fr locale', () => {
  const { queryByTestId } = render(
    <AppContext.Provider
      value={{ ...defaultAppContext, navigatorLanguages: ['fr'] }}
    >
      <TermsAndPrivacy plan={plan} />
    </AppContext.Provider>
  );
  const termsLink = queryByTestId('terms');
  expect(termsLink).toBeInTheDocument();
  expect(termsLink).toHaveAttribute('href', frTermsOfServiceURL);
  const privacyLink = queryByTestId('privacy');
  expect(privacyLink).toBeInTheDocument();
  expect(privacyLink).toHaveAttribute('href', frPrivacyNoticeURL);
});
