import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { MOCK_PLANS } from '../../lib/test-utils';
import { TermsAndPrivacy } from './index';
import { defaultAppContext, AppContext } from '../../lib/AppContext';
import { DEFAULT_PRODUCT_DETAILS } from 'fxa-shared/subscriptions/metadata';
import { updateConfig } from '../../lib/config';

const enTermsOfServiceURL =
  'https://www.mozilla.org/en-US/about/legal/terms/services/';
const enTermsOfServiceDownloadURL =
  'https://www.mozilla.org/en-US/about/legal/terms/services/download.pdf';
const enPrivacyNoticeURL = 'https://www.mozilla.org/en-US/privacy/websites/';
const frTermsOfServiceURL =
  'https://www.mozilla.org/fr/about/legal/terms/services/';
const frTermsOfServiceDownloadURL =
  'https://www.mozilla.org/fr/about/legal/terms/services/download.pdf';
const frPrivacyNoticeURL = 'https://www.mozilla.org/fr/privacy/websites/';

const plan = {
  ...MOCK_PLANS[0],
  plan_metadata: {
    'product:termsOfServiceURL': enTermsOfServiceURL,
    'product:termsOfServiceURL:fr': frTermsOfServiceURL,
    'product:termsOfServiceDownloadURL': enTermsOfServiceDownloadURL,
    'product:termsOfServiceDownloadURL:fr': frTermsOfServiceDownloadURL,
    'product:privacyNoticeURL': enPrivacyNoticeURL,
    'product:privacyNoticeURL:fr': frPrivacyNoticeURL,
  },
};

const planWithNoLegalLinks = {
  ...MOCK_PLANS[0],
};

const planWithConfiguration = {
  ...MOCK_PLANS[0],
  configuration: {
    urls: {
      termsOfService: `${enTermsOfServiceURL}/config`,
      termsOfServiceDownload: `${enTermsOfServiceDownloadURL}/config`,
      privacyNotice: `${enPrivacyNoticeURL}/config`,
    },
    locales: {
      fr: {
        urls: {
          termsOfService: `${frTermsOfServiceURL}/config`,
          termsOfServiceDownload: `${frTermsOfServiceDownloadURL}/config`,
          privacyNotice: `${frPrivacyNoticeURL}/config`,
        },
      },
    },
  },
};

afterEach(() => {
  updateConfig({
    featureFlags: {
      useFirestoreProductConfigs: false,
    },
  });
  cleanup();
});

it('renders as expected with a plan with no legal doc links metadata', () => {
  const { queryByTestId } = render(
    <TermsAndPrivacy plan={planWithNoLegalLinks} />
  );

  const termsLink = queryByTestId('terms');
  expect(termsLink).toBeInTheDocument();
  expect(termsLink).toHaveAttribute(
    'href',
    DEFAULT_PRODUCT_DETAILS.termsOfServiceURL
  );

  const termsDownloadLink = queryByTestId('terms-download');
  expect(termsDownloadLink).toBeInTheDocument();
  expect(termsDownloadLink).toHaveAttribute(
    'href',
    `/legal-docs?url=${DEFAULT_PRODUCT_DETAILS.termsOfServiceDownloadURL}`
  );

  const privacyLink = queryByTestId('privacy');
  expect(privacyLink).toBeInTheDocument();
  expect(privacyLink).toHaveAttribute(
    'href',
    DEFAULT_PRODUCT_DETAILS.privacyNoticeURL
  );
});

it('renders as expected when passed "showFXALinks" option', () => {
  const { queryByTestId } = render(
    <TermsAndPrivacy plan={planWithNoLegalLinks} showFXALinks={true} />
  );

  const fxaLegalSection = queryByTestId('fxa-legal-links');
  expect(fxaLegalSection).toBeInTheDocument();
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

it('renders as expected with firestore config and default locale', () => {
  updateConfig({
    featureFlags: {
      useFirestoreProductConfigs: true,
    },
  });
  const { queryByTestId } = render(
    <TermsAndPrivacy plan={planWithConfiguration} />
  );
  const termsLink = queryByTestId('terms');
  expect(termsLink).toBeInTheDocument();
  expect(termsLink).toHaveAttribute('href', `${enTermsOfServiceURL}/config`);
  const privacyLink = queryByTestId('privacy');
  expect(privacyLink).toBeInTheDocument();
  expect(privacyLink).toHaveAttribute('href', `${enPrivacyNoticeURL}/config`);
});

it('renders as expected with firestore config and fr locale', () => {
  updateConfig({
    featureFlags: {
      useFirestoreProductConfigs: true,
    },
  });
  const { queryByTestId } = render(
    <AppContext.Provider
      value={{ ...defaultAppContext, navigatorLanguages: ['fr'] }}
    >
      <TermsAndPrivacy plan={planWithConfiguration} />
    </AppContext.Provider>
  );
  const termsLink = queryByTestId('terms');
  expect(termsLink).toBeInTheDocument();
  expect(termsLink).toHaveAttribute('href', `${frTermsOfServiceURL}/config`);
  const privacyLink = queryByTestId('privacy');
  expect(privacyLink).toBeInTheDocument();
  expect(privacyLink).toHaveAttribute('href', `${frPrivacyNoticeURL}/config`);
});
