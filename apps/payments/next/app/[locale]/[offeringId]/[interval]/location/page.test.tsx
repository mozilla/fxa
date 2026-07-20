/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  PageContentCommonContentResultFactory,
  PageContentOfferingDefaultPurchaseTransformedFactory,
  PageContentOfferingTransformedFactory,
  PageContentPurchaseDetailsTransformedFactory,
} from '@fxa/shared/cms/testing';
import Location from './page';

const mockFetchCMSData = jest.fn();
const mockValidateLocationAction = jest.fn();
const mockGetL10n = jest.fn();
const mockHeaders = jest.fn();
const mockNotFound = jest.fn();
const mockTermsAndPrivacy = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  fetchCMSData: (...args: unknown[]) => mockFetchCMSData(...args),
  validateLocationAction: (...args: unknown[]) =>
    mockValidateLocationAction(...args),
}));

jest.mock('@fxa/payments/ui/server', () => ({
  __esModule: true,
  getApp: () => ({
    getL10n: (...args: unknown[]) => mockGetL10n(...args),
    getEmitterService: () => ({ emit: jest.fn() }),
  }),
  TermsAndPrivacy: (props: Record<string, unknown>) => {
    mockTermsAndPrivacy(props);
    return <div data-testid="terms-and-privacy" />;
  },
}));

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  Banner: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant: string;
  }) => (
    <div data-testid="banner" data-variant={variant}>
      {children}
    </div>
  ),
  BannerVariant: {
    Error: 'error',
    Info: 'info',
  },
  BaseParams: {},
  IsolatedSelectTaxLocation: () => (
    <div data-testid="isolated-select-tax-location" />
  ),
  buildRedirectUrl: jest.fn(),
}));

jest.mock('@fxa/payments/eligibility', () => ({
  __esModule: true,
  LocationStatus: {
    SanctionedLocation: 'sanctioned_location',
    ProductNotAvailable: 'product_not_available',
    Unresolved: 'unresolved',
    Valid: 'valid',
  },
}));

jest.mock('@fxa/payments/cart', () => ({
  __esModule: true,
  TaxChangeAllowedStatus: {
    CurrencyNotFound: 'currency_not_found',
    CurrencyChange: 'currency_change',
    PriceCurrencyNotAvailable: 'price_currency_not_available',
    Allowed: 'allowed',
  },
}));

jest.mock('next/headers', () => ({
  __esModule: true,
  headers: () => mockHeaders(),
}));

jest.mock('next/navigation', () => ({
  __esModule: true,
  notFound: (...args: unknown[]) => mockNotFound(...args),
}));

jest.mock('apps/payments/next/config', () => ({
  __esModule: true,
  config: {
    paymentsNextHostedUrl: 'https://payments.example.com',
    contentServerUrl: 'https://accounts.example.com',
    location: { subscriptionsUnsupportedLocations: [] },
  },
}));

// eslint-disable-next-line @next/next/no-img-element
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    className,
  }: {
    alt?: string;
    className?: string;
    src?: unknown;
    // eslint-disable-next-line @next/next/no-img-element
  }) => <img alt={alt ?? ''} className={className} src="mock-image" />,
}));

jest.mock(
  '@fxa/shared/assets/images/confirm-pairing.svg',
  () => ({ __esModule: true, default: 'confirm-pairing.svg' }),
  { virtual: true }
);

const MOCK_PRODUCT_NAME = 'Test Product';
const MOCK_TOS_URL = 'https://example.com/terms';
const MOCK_PRIVACY_URL = 'https://example.com/privacy';
const MOCK_PRIVACY_DOWNLOAD_URL = 'https://example.com/privacy-download';
const MOCK_TOS_DOWNLOAD_URL = 'https://example.com/terms-download';
const MOCK_CANCELLATION_URL = 'https://example.com/cancel';

const baseCmsData = PageContentOfferingTransformedFactory({
  defaultPurchase: PageContentOfferingDefaultPurchaseTransformedFactory({
    purchaseDetails: {
      ...PageContentPurchaseDetailsTransformedFactory({
        productName: MOCK_PRODUCT_NAME,
      }),
      localizations: [],
    },
  }),
  commonContent: {
    ...PageContentCommonContentResultFactory({
      privacyNoticeUrl: MOCK_PRIVACY_URL,
      privacyNoticeDownloadUrl: MOCK_PRIVACY_DOWNLOAD_URL,
      termsOfServiceUrl: MOCK_TOS_URL,
      termsOfServiceDownloadUrl: MOCK_TOS_DOWNLOAD_URL,
      cancellationUrl: MOCK_CANCELLATION_URL,
      emailIcon: null,
      newsletterLabelTextCode: null,
      newsletterSlug: null,
    }),
    localizations: [],
  },
});

const baseValidateLocationResult = {
  isValid: true,
  status: undefined,
  currentCurrency: undefined,
};

const mockL10n = {
  getString: (_id: string, ...rest: unknown[]) => {
    const fallback = rest.length === 1 ? rest[0] : rest[1];
    return typeof fallback === 'string' ? fallback : '';
  },
  getFragmentWithSource: (
    _id: string,
    _args: unknown,
    fallback: React.ReactNode
  ) => fallback,
};

const defaultParams = Promise.resolve({
  locale: 'en',
  offeringId: 'offering-1',
  interval: 'monthly',
});

const defaultSearchParams = Promise.resolve({});

async function renderPage(
  paramsOverride?: Promise<Record<string, string>>,
  searchParamsOverride?: Promise<Record<string, string | string[]>>
) {
  const jsx = await Location({
    params: (paramsOverride ?? defaultParams) as any,
    searchParams: (searchParamsOverride ?? defaultSearchParams) as any,
  });
  return render(jsx);
}

describe('Location page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue({
      get: () => 'en-US',
    });
    mockFetchCMSData.mockResolvedValue(baseCmsData);
    mockValidateLocationAction.mockResolvedValue(baseValidateLocationResult);
    mockGetL10n.mockReturnValue(mockL10n);
  });

  it('renders heading with product name', async () => {
    await renderPage();

    expect(
      screen.getByRole('heading', {
        name: /select your country and enter your postal code/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(`to continue to checkout for ${MOCK_PRODUCT_NAME}`)
    ).toBeInTheDocument();
  });

  it('shows info banner by default when no location status issue', async () => {
    await renderPage();

    const banner = screen.getByTestId('banner');
    expect(banner).toHaveAttribute('data-variant', 'info');
    expect(banner).toHaveTextContent(
      /We weren.t able to detect your location automatically/
    );
  });

  it('shows error banner for sanctioned location', async () => {
    mockValidateLocationAction.mockResolvedValue({
      ...baseValidateLocationResult,
      status: 'sanctioned_location',
    });

    await renderPage();

    const banner = screen.getByTestId('banner');
    expect(banner).toHaveAttribute('data-variant', 'error');
    expect(banner).toHaveTextContent(
      /not supported according to our Terms of Service/
    );
  });

  it('shows error banner for product not available', async () => {
    mockValidateLocationAction.mockResolvedValue({
      ...baseValidateLocationResult,
      status: 'product_not_available',
    });

    await renderPage();

    const banner = screen.getByTestId('banner');
    expect(banner).toHaveAttribute('data-variant', 'error');
    expect(banner).toHaveTextContent(/is not available in this location/);
  });

  it('shows error banner for currency change not supported', async () => {
    mockValidateLocationAction.mockResolvedValue({
      ...baseValidateLocationResult,
      status: 'currency_change',
    });

    await renderPage();

    const banner = screen.getByTestId('banner');
    expect(banner).toHaveAttribute('data-variant', 'error');
    expect(banner).toHaveTextContent(/Currency change not supported/);
  });

  it('calls notFound when CMS fetch fails with FetchCmsInvalidOfferingError', async () => {
    const cmsError = new Error('Invalid offering');
    cmsError.name = 'FetchCmsInvalidOfferingError';
    mockFetchCMSData.mockRejectedValue(cmsError);
    // Next.js notFound() throws to halt rendering; simulate that behavior
    mockNotFound.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });

    await expect(renderPage()).rejects.toThrow('NEXT_NOT_FOUND');

    expect(mockNotFound).toHaveBeenCalled();
  });

  it('renders TermsAndPrivacy component', async () => {
    await renderPage();

    expect(screen.getByTestId('terms-and-privacy')).toBeInTheDocument();
    expect(mockTermsAndPrivacy).toHaveBeenCalledWith(
      expect.objectContaining({
        contentServerUrl: 'https://accounts.example.com',
        showFXALinks: true,
      })
    );
  });

  it('renders IsolatedSelectTaxLocation component', async () => {
    await renderPage();

    expect(
      screen.getByTestId('isolated-select-tax-location')
    ).toBeInTheDocument();
  });
});
