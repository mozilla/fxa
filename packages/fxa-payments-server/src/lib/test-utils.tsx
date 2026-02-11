import React, { useContext, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { AppContext, AppContextType } from '../../src/lib/AppContext';
import { config, updateConfig } from '../../src/lib/config';
import {
  updateAPIClientConfig,
  updateAPIClientToken,
} from '../../src/lib/apiClient';
import ScreenInfo from '../../src/lib/screen-info';
import { ReactStripeElements } from 'react-stripe-elements';
import nock from 'nock';
import { FluentBundle } from '@fluent/bundle';

import { State } from '../store/state';
import { Store, createAppStore } from '../../src/store';
import { Customer, Plan, Profile, Token } from '../../src/store/types';
import {
  MozillaSubscription,
  MozillaSubscriptionTypes,
  WebSubscription,
} from 'fxa-shared/subscriptions/types';
import { MemoryRouter } from 'react-router-dom';
import {
  FirstInvoicePreview,
  LatestInvoiceItems,
  SubsequentInvoicePreview,
} from 'fxa-shared/dto/auth/payments/invoice';

import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';

declare global {
  namespace NodeJS {
    interface Global {
      fetch: Function;
    }
  }
}

export const deepCopy = (object: Object) => JSON.parse(JSON.stringify(object));

export const wait = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export function expectNockScopesDone(scopes: nock.Scope[]) {
  for (const scope of scopes) {
    if (!scope.isDone()) console.log('SCOPE NOT DONE::::::::', scope);
    expect(scope.isDone()).toBeTruthy();
  }
}

export const mockConfig = {
  lang: 'gd',
  productRedirectURLs: {
    product_8675309: 'https://example.com/product',
  },
  servers: {
    content: {
      url: 'https://content.example',
    },
    auth: {
      url: 'https://auth.example',
    },
    oauth: {
      url: 'https://oauth.example',
      clientId: 'HAL',
    },
    profile: {
      url: 'https://profile.example',
    },
  },
};

export const mockServerUrl = (name: 'auth' | 'oauth' | 'profile' | 'content') =>
  config.servers[name].url;

const CORS_OPTIONS_HEADERS = {
  'access-control-allow-methods': 'GET,POST',
  'access-control-allow-origin': 'http://localhost',
  'access-control-allow-headers':
    'Accept,Authorization,Content-Type,If-None-Match',
};

export const VALID_CREATE_TOKEN_RESPONSE: stripe.TokenResponse = {
  token: {
    id: 'tok_8675309',
    object: 'test',
    client_ip: '123.123.123.123',
    created: Date.now(),
    livemode: false,
    type: 'card',
    used: false,
  },
};

export function mockOptionsResponses(baseUrl: string) {
  return nock(baseUrl)
    .options(/\/v1/)
    .reply(200, '', CORS_OPTIONS_HEADERS)
    .persist();
}

export const setupMockConfig = (config?: typeof mockConfig) => {
  updateConfig(config || mockConfig);
  updateAPIClientConfig(config || mockConfig);
  updateAPIClientToken(MOCK_CLIENT_TOKEN);
};

// Minimal mock for react-stripe-elements that lets us trigger onChange
// handlers with testing data
const MockStripeElement = ({ testid }: { testid: string }) => {
  const mockElement = class extends React.Component {
    _ref: null;
    setRef: (el: any) => void;

    constructor(props: ReactStripeElements.ElementProps) {
      super(props);

      // Stash this element's onChange handler in module-global registry.
      const { onChange, onBlur } = props;
      mockStripeElementOnChangeFns[testid] = onChange as onChangeFunctionType;
      mockStripeElementOnBlurFns[testid] = onBlur as onBlurFunctionType;

      // Real react-stripe-elements stash a ref to their container in
      // this._ref, which we use for tooltip positioning
      this._ref = null;
      this.setRef = (el) => (this._ref = el);
    }

    render() {
      return (
        <div ref={this.setRef} data-testid={testid}>
          {testid}
        </div>
      );
    }
  };
  // Ensure we have a test ID to identify which kind of Stripe
  // element this is, later on. Using Object.defineProperty because
  // a simple mockElement.testid = testid makes TypeScript angry
  return Object.defineProperty(mockElement, 'testid', {
    value: testid,
    writable: false,
  });
};

// onChange handler registry - indexed by per-component testid, of which
// there should only be one instance per PaymentForm
type onChangeFunctionType = (
  value: stripe.elements.ElementChangeResponse
) => void;

export const mockStripeElementOnChangeFns: {
  [name: string]: onChangeFunctionType;
} = {};

type onBlurFunctionType = (
  value: stripe.elements.ElementChangeResponse
) => void;

export const mockStripeElementOnBlurFns: {
  [name: string]: onBlurFunctionType;
} = {};

export type MockStripeType = {
  createToken(
    options?: stripe.TokenOptions
  ): Promise<ReactStripeElements.TokenResponse>;
};

export type MockStripeContextType = {
  mockStripe?: MockStripeType;
};

const MockStripeContext = React.createContext<MockStripeContextType>({});

function injectStripe<P extends Object>(
  WrappedComponent: React.ComponentType<
    P & ReactStripeElements.InjectedStripeProps
  >
) {
  return (props: P) => {
    const { mockStripe } = useContext(MockStripeContext);
    return (
      <WrappedComponent
        {...{
          ...props,
          stripe:
            mockStripe as ReactStripeElements.InjectedStripeProps['stripe'],
          elements: null,
        }}
        as
        any
      />
    );
  };
}

// Mock out the Stripe elements we use in PaymentForm
jest.setMock(
  'react-stripe-elements',
  Object.assign(jest.requireActual('react-stripe-elements'), {
    injectStripe,
    StripeProvider: ({ children }: { children: ReactNode }) => (
      <section data-testid="StripeProvider">{children}</section>
    ),
    Elements: ({ children }: { children: ReactNode }) => children,
    CardNumberElement: MockStripeElement({ testid: 'cardNumberElement' }),
    CardExpiryElement: MockStripeElement({ testid: 'cardExpiryElement' }),
    CardCVCElement: MockStripeElement({ testid: 'cardCVCElement' }),
    CardElement: MockStripeElement({ testid: 'cardElement' }),
  })
);

jest.setMock(
  '@stripe/react-stripe-js',
  Object.assign(jest.requireActual('@stripe/react-stripe-js'), {
    Elements: ({ children }: { children: ReactNode }) => children,
    // Minimal implementation of "mocks" here, since the PaymentForm code
    // only checks that these things are truthy
    useStripe: jest.fn(() => ({})),
    useElements: jest.fn(() => ({
      // Mocked getElement passes along the mock element test ID to verify
      // the kind of Stripe element
      getElement: (el: any) => ({ isMockElement: true, testid: el.testid }),
    })),
    CardElement: MockStripeElement({ testid: 'cardElement' }),
  })
);

export const elementChangeResponse = ({
  complete = true,
  value,
  errorMessage,
}: {
  complete?: boolean;
  value?: any;
  errorMessage?: string;
}): stripe.elements.ElementChangeResponse => ({
  elementType: 'test',
  brand: 'test',
  value: 'boof',
  complete,
  empty: !value,
  error:
    (!!errorMessage && {
      type: 'card_error',
      charge: 'test',
      message: errorMessage,
    }) ||
    undefined,
});

export const defaultAppContextValue = (): AppContextType => ({
  config,
  queryParams: {
    device_id: 'quux',
    flow_begin_time: Date.now(),
    flow_id: 'thisisanid',
  },
  accessToken: 'lettherightonein',
  matchMedia: jest.fn().mockImplementation((query) => false),
  matchMediaDefault: jest.fn().mockImplementation((query) => {
    return {
      matches: query.includes(': 0em'),
      media: query,
      addListener: jest.fn(),
      addEventListener: jest.fn(),
      removeListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  }),
  navigateToUrl: jest.fn(),
  getScreenInfo: () => new ScreenInfo(window),
  locationReload: jest.fn(),
  stripePromise: Promise.resolve(null),
});

type MockAppProps = {
  children: ReactNode;
  store?: Store;
  appContextValue?: AppContextType;
  initialState?: State;
  storeEnhancers?: Array<any>;
  mockStripe?: MockStripeType;
};

export const MockApp = ({
  children,
  store,
  initialState,
  storeEnhancers,
  appContextValue,
  mockStripe,
}: MockAppProps) => {
  return (
    <ReduxProvider
      store={store || createAppStore(initialState, storeEnhancers)}
    >
      <MockStripeContext.Provider value={{ mockStripe }}>
        <AppContext.Provider
          value={appContextValue || defaultAppContextValue()}
        >
          <MemoryRouter initialEntries={['/']}>
            <React.Suspense
              fallback={<div data-testid="is-loading">Loading</div>}
            >
              {children}
            </React.Suspense>
          </MemoryRouter>
        </AppContext.Provider>
      </MockStripeContext.Provider>
    </ReduxProvider>
  );
};

export const MOCK_CLIENT_TOKEN = 'tok-8675309';

export const MOCK_TOKEN: Token = {
  active: true,
  scope: 'mock-scope',
  client_id: 'abcde8675309',
  token_type: 'refresh',
  exp: 0,
  iat: 0,
  sub: 'foo@bar.com',
  jti: '',
};

export const MOCK_CHECKOUT_TOKEN = {
  token: 'EC-8NC18566WJ1581100',
};

export const MOCK_PAYPAL_SUBSCRIPTION_RESULT = {
  sourceCountry: 'FR',
  subscription: { what: 'ever' },
};

export const MOCK_PAYPAL_CUSTOMER_RESULT = {
  invoice_settings: {},
  subscriptions: [{ what: 'ever' }],
};

export const STRIPE_FIELDS = [
  'cardNumberElement',
  'cardCVCElement',
  'cardExpiryElement',
];

export const PLAN_ID = 'plan_12345';
export const INACTIVE_PLAN_ID = 'inactive';

export const PRODUCT_ID = 'product_8675309';

export const PRODUCT_NAME = 'Firefox Tanooki Suit';

export const PRODUCT_REDIRECT_URLS = {
  [PRODUCT_ID]: 'https://example.com/product',
};

export const MOCK_PLANS: Plan[] = [
  {
    plan_id: PLAN_ID,
    product_id: PRODUCT_ID,
    product_name: PRODUCT_NAME,
    interval: 'month' as const,
    interval_count: 1,
    amount: 500,
    currency: 'usd',
    plan_metadata: {
      productOrder: 3,
    },
    product_metadata: {
      productSet: ['example_upgrade'],
      webIconURL: 'http://example.com/product.jpg',
      webIconBackground: 'purple',
    },
    active: true,
  },
  {
    plan_id: '123doneProMonthly',
    product_id: '123donepro',
    product_name: '123doneProProduct',
    interval: 'month' as const,
    interval_count: 1,
    amount: 2500,
    currency: 'usd',
    plan_metadata: null,
    product_metadata: {
      productSet: ['123done'],
      webIconURL: 'http://example.com/123donepro.jpg',
      webIconBackground: 'orange',
      'product:subtitle': '123DonePro subtitle',
    },
    active: true,
  },
  {
    plan_id: 'plan_upgrade',
    product_id: 'prod_upgrade',
    product_name: 'Upgrade Product',
    interval: 'month' as const,
    interval_count: 1,
    amount: 5900,
    currency: 'usd',
    plan_metadata: {
      productOrder: 5,
    },
    product_metadata: {
      productSet: ['example_upgrade'],
    },
    active: true,
  },
  {
    plan_id: 'plan_no_upgrade',
    product_id: 'prod_upgrade',
    product_name: 'Upgrade Product',
    interval: 'month' as const,
    interval_count: 1,
    amount: 5900,
    currency: 'usd',
    plan_metadata: {},
    product_metadata: {
      productSet: ['example_upgrade'],
    },
    active: true,
  },
  {
    plan_id: 'plan_no_downgrade',
    product_id: 'prod_upgrade',
    product_name: 'upside down product',
    interval: 'month' as const,
    interval_count: 1,
    amount: 5900,
    currency: 'usd',
    plan_metadata: {
      productOrder: 1,
    },
    product_metadata: {
      productSet: ['example_upgrade'],
    },
    active: true,
  },
  {
    plan_id: 'plan_daily',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'day' as const,
    interval_count: 1,
    amount: 500,
    currency: 'usd',
    plan_metadata: null,
    product_metadata: {
      productSet: ['fpn'],
    },
    active: true,
  },
  {
    plan_id: 'plan_archiveddaily',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'day' as const,
    interval_count: 1,
    amount: 500,
    currency: 'usd',
    plan_metadata: null,
    product_metadata: {
      productSet: ['fpn'],
    },
    active: false,
  },
  {
    plan_id: 'plan_6days',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'day' as const,
    interval_count: 6,
    amount: 500,
    currency: 'usd',
    plan_metadata: null,
    product_metadata: {
      productSet: ['fpn'],
    },
    active: true,
  },
  {
    plan_id: 'plan_weekly',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'week' as const,
    interval_count: 1,
    amount: 500,
    currency: 'usd',
    plan_metadata: null,
    product_metadata: {
      productSet: ['fpn'],
    },
    active: true,
  },
  {
    plan_id: 'plan_archivedweekly',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'week' as const,
    interval_count: 1,
    amount: 500,
    currency: 'usd',
    plan_metadata: null,
    product_metadata: {
      productSet: ['fpn'],
    },
    active: false,
  },
  {
    plan_id: 'plan_6weeks',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'week' as const,
    interval_count: 6,
    amount: 500,
    currency: 'usd',
    plan_metadata: null,
    product_metadata: {
      productSet: ['fpn'],
    },
    active: true,
  },
  {
    plan_id: 'plan_monthly',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'month' as const,
    interval_count: 1,
    amount: 500,
    currency: 'usd',
    plan_metadata: null,
    product_metadata: {
      productSet: ['fpn'],
    },
    active: true,
  },
  {
    plan_id: 'plan_archivedmonthly',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'month' as const,
    interval_count: 1,
    amount: 500,
    currency: 'usd',
    plan_metadata: null,
    product_metadata: {
      productSet: ['fpn'],
    },
    active: false,
  },
  {
    plan_id: 'plan_6months',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'month' as const,
    interval_count: 6,
    amount: 500,
    currency: 'usd',
    plan_metadata: null,
    product_metadata: {
      productSet: ['fpn'],
    },
    active: true,
  },
  {
    plan_id: 'plan_yearly',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'year' as const,
    interval_count: 1,
    amount: 500,
    currency: 'usd',
    plan_metadata: null,
    product_metadata: {
      productSet: ['fpn'],
    },
    active: true,
  },
  {
    plan_id: 'plan_archivedyearly',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'year' as const,
    interval_count: 1,
    amount: 500,
    currency: 'usd',
    plan_metadata: null,
    product_metadata: {
      productSet: ['fpn'],
    },
    active: false,
  },
  {
    plan_id: 'plan_6years',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'year' as const,
    interval_count: 6,
    amount: 500,
    currency: 'usd',
    plan_metadata: null,
    product_metadata: {
      productSet: ['fpn'],
    },
    active: true,
  },
  {
    plan_id: 'nextlevel',
    product_id: PRODUCT_ID,
    product_name: PRODUCT_NAME,
    interval: 'year' as const,
    interval_count: 1,
    amount: 999,
    currency: 'usd',
    plan_metadata: null,
    product_metadata: {
      webIconURL: 'http://example.com/product.jpg',
      webIconBackground: 'purple',
    },
    active: true,
  },
  {
    plan_id: INACTIVE_PLAN_ID,
    product_id: PRODUCT_ID,
    product_name: PRODUCT_NAME,
    interval: 'year' as const,
    interval_count: 1,
    amount: 999,
    currency: 'usd',
    plan_metadata: null,
    product_metadata: {
      webIconURL: 'http://example.com/product.jpg',
      webIconBackground: 'purple',
    },
    active: false,
  },
  {
    plan_id: 'plan_withname',
    product_id: PRODUCT_ID,
    product_name: PRODUCT_NAME,
    interval: 'year' as const,
    interval_count: 1,
    amount: 999,
    currency: 'usd',
    plan_metadata: {
      'product:name': 'Nyctereutes viverrinus',
    },
    product_metadata: {
      webIconURL: 'http://example.com/product.jpg',
      webIconBackground: 'purple',
    },
    active: true,
  },
];

export const MOCK_PROFILE: Profile = {
  email: 'foo@example.com',
  locale: 'en;q=0.5',
  amrValues: ['pwd', 'email'],
  twoFactorAuthentication: false,
  uid: 'a90fef48240b49b2b6a33d333aee9b13',
  avatar: 'http://localhost:1112/a/00000000000000000000000000000000',
  avatarDefault: true,
  displayName: 'Foxy77',
  metricsEnabled: true,
};

export const MOCK_ACTIVE_SUBSCRIPTIONS = [
  {
    uid: 'a90fef48240b49b2b6a33d333aee9b13',
    subscriptionId: 'sub0.28964929339372136',
    productId: '123doneProProduct',
    createdAt: 1565816388815,
    cancelledAt: null,
  },
];

export const MOCK_ACTIVE_SUBSCRIPTIONS_TO_ARCHIVED = [
  {
    uid: 'a90fef48240b49b2b6a33d333aee9b13',
    subscriptionId: 'sub0.28964929339372137',
    productId: PRODUCT_ID,
    createdAt: 1565816388815,
    cancelledAt: null,
  },
];

export const MOCK_SUBSEQUENT_INVOICES: SubsequentInvoicePreview[] = [
  {
    currency: 'usd',
    subscriptionId: 'sub0.28964929339372136',
    period_start: 1565816388.815,
    subtotal: 500,
    subtotal_excluding_tax: null,
    total: 500,
    total_excluding_tax: null,
  },
  {
    currency: 'usd',
    subscriptionId: 'sub0.21234123424',
    period_start: 1565816388.815,
    subtotal: 0,
    subtotal_excluding_tax: null,
    total: 0,
    total_excluding_tax: null,
  },
  // 2 - With Exclusive tax
  {
    currency: 'usd',
    subscriptionId: 'sub0.28964929339372136',
    period_start: 1565816388.815,
    subtotal: 500,
    subtotal_excluding_tax: 500,
    total: 623,
    total_excluding_tax: 500,
    tax: [
      {
        amount: 123,
        inclusive: false,
        display_name: 'Sales Tax',
      },
    ],
  },
  // 3 - With Inclusive tax
  {
    currency: 'usd',
    subscriptionId: 'sub0.28964929339372136',
    period_start: 1565816388.815,
    subtotal: 500,
    subtotal_excluding_tax: 377,
    total: 500,
    total_excluding_tax: 377,
    tax: [
      {
        amount: 123,
        inclusive: true,
        display_name: 'Sales Tax',
      },
    ],
  },
  // 4 - With Exclusive tax and Discount
  {
    currency: 'usd',
    subscriptionId: 'sub0.28964929339372136',
    period_start: 1565816388.815,
    subtotal: 500,
    subtotal_excluding_tax: 500,
    total: 573,
    total_excluding_tax: 450,
    tax: [
      {
        amount: 123,
        inclusive: false,
        display_name: 'Sales Tax',
      },
    ],
  },
  // 5 - With Inclusive tax and Discount
  {
    currency: 'usd',
    subscriptionId: 'sub0.28964929339372136',
    period_start: 1565816388.815,
    subtotal: 500,
    subtotal_excluding_tax: 377,
    total: 450,
    total_excluding_tax: 327,
    tax: [
      {
        amount: 123,
        inclusive: true,
        display_name: 'Sales Tax',
      },
    ],
  },
  {
    currency: 'usd',
    subscriptionId: MOCK_ACTIVE_SUBSCRIPTIONS_TO_ARCHIVED[0].subscriptionId,
    period_start: 1565816388.815,
    subtotal: 500,
    subtotal_excluding_tax: null,
    total: 500,
    total_excluding_tax: null,
  },
  // 7 - With zero amount Exclusive tax
  {
    currency: 'usd',
    subscriptionId: 'sub0.28964929339372136',
    period_start: 1565816388.815,
    subtotal: 500,
    subtotal_excluding_tax: 500,
    total: 500,
    total_excluding_tax: 500,
    tax: [
      {
        amount: 0,
        inclusive: false,
        display_name: 'Sales Tax',
      },
    ],
  },
];

export const MOCK_ACTIVE_SUBSCRIPTIONS_AFTER_SUBSCRIPTION = [
  {
    uid: 'a90fef48240b49b2b6a33d333aee9b13',
    subscriptionId: 'sub0.28964929339372136',
    productId: '123doneProProduct',
    createdAt: 1565816388815,
    cancelledAt: null,
  },
  {
    uid: 'a90fef48240b49b2b6a33d333aee9b13',
    subscriptionId: 'sub0.21234123424',
    productId: 'prod_67890',
    createdAt: 1565816388815,
    cancelledAt: null,
  },
];

export const MOCK_LATEST_INVOICE_ITEMS: LatestInvoiceItems = {
  line_items: [],
  subtotal: 735,
  subtotal_excluding_tax: null,
  total: 735,
  total_excluding_tax: null,
};

export const MOCK_CUSTOMER: Customer = {
  customerId: 'cus_123xyz',
  billing_name: 'Jane Doe',
  payment_type: 'card',
  payment_provider: 'stripe',
  brand: 'Visa',
  last4: '8675',
  exp_month: '8',
  exp_year: '2020',
  subscriptions: [
    {
      _subscription_type: MozillaSubscriptionTypes.WEB,
      subscription_id: 'sub0.28964929339372136',
      plan_id: '123doneProMonthly',
      product_id: 'prod_123',
      product_name: '123done Pro',
      latest_invoice: '628031D-0002',
      latest_invoice_items: MOCK_LATEST_INVOICE_ITEMS,
      status: 'active',
      cancel_at_period_end: false,
      created: 1565815388.815,
      current_period_start: 1565816388.815,
      current_period_end: 1568408388.815,
      end_at: null,
      promotion_duration: null,
      promotion_end: null,
    } as MozillaSubscription,
  ],
};

export const MOCK_CUSTOMER_AFTER_SUBSCRIPTION: Customer = {
  ...MOCK_CUSTOMER,
  subscriptions: [
    ...MOCK_CUSTOMER.subscriptions,
    {
      _subscription_type: MozillaSubscriptionTypes.WEB,
      subscription_id: 'sub0.21234123424',
      plan_id: PLAN_ID,
      product_id: PRODUCT_ID,
      product_name: '',
      latest_invoice: '628031D-0002',
      latest_invoice_items: MOCK_LATEST_INVOICE_ITEMS,
      status: 'active',
      cancel_at_period_end: false,
      created: 1565816388.815,
      current_period_start: 1565816388.815,
      current_period_end: 1568408388.815,
      end_at: null,
      promotion_duration: null,
      promotion_end: null,
    },
  ],
};

export const MOCK_CUSTOMER_ARCHIVED_PLAN: Customer = {
  ...MOCK_CUSTOMER,
  subscriptions: [
    {
      ...MOCK_CUSTOMER.subscriptions[0],
      subscription_id: MOCK_ACTIVE_SUBSCRIPTIONS_TO_ARCHIVED[0].subscriptionId,
      plan_id: INACTIVE_PLAN_ID,
    } as WebSubscription,
  ],
};

const customerWebSubscriptionPlanId = (
  MOCK_CUSTOMER.subscriptions[0] as WebSubscription
).plan_id;

export const MOCK_PREVIEW_INVOICE_NO_TAX: FirstInvoicePreview = {
  total: 2000,
  total_excluding_tax: null,
  subtotal: 2000,
  subtotal_excluding_tax: null,
  line_items: [
    {
      amount: 2000,
      currency: 'USD',
      id: customerWebSubscriptionPlanId,
      name: 'first invoice',
      period: {
        end: 1565816388,
        start: 1565816388,
      },
    },
  ],
  prorated_amount: -833,
  one_time_charge: 1337,
};

export const MOCK_PREVIEW_INVOICE_AFTER_SUBSCRIPTION: FirstInvoicePreview = {
  total: 2000,
  total_excluding_tax: null,
  subtotal: 2000,
  subtotal_excluding_tax: null,
  line_items: [
    {
      amount: 2000,
      currency: 'USD',
      id: PLAN_ID,
      name: 'first invoice',
      period: {
        end: 1565816388,
        start: 1565816388,
      },
    },
  ],
  prorated_amount: -833,
  one_time_charge: 1337,
};

export const MOCK_PREVIEW_INVOICE_WITH_TAX_EXCLUSIVE: FirstInvoicePreview = {
  total: 2300,
  total_excluding_tax: 2000,
  subtotal: 2000,
  subtotal_excluding_tax: 2000,
  line_items: [
    {
      amount: 2000,
      currency: 'USD',
      id: customerWebSubscriptionPlanId,
      name: 'first invoice',
      period: {
        end: 1565816388,
        start: 1565816388,
      },
    },
  ],
  tax: [
    {
      amount: 300,
      inclusive: false,
      display_name: 'Sales Tax',
    },
  ],
  prorated_amount: -833,
  one_time_charge: 1337,
};

export const MOCK_PREVIEW_INVOICE_WITH_ZERO_TAX_EXCLUSIVE: FirstInvoicePreview =
  {
    ...MOCK_PREVIEW_INVOICE_WITH_TAX_EXCLUSIVE,
    total: MOCK_PREVIEW_INVOICE_WITH_TAX_EXCLUSIVE.total_excluding_tax!,
    tax: [
      {
        ...MOCK_PREVIEW_INVOICE_WITH_TAX_EXCLUSIVE.tax![0],
        amount: 0,
      },
    ],
  };

export const MOCK_PREVIEW_INVOICE_WITH_TAX_INCLUSIVE: FirstInvoicePreview = {
  total: 2000,
  total_excluding_tax: 1700,
  subtotal: 2000,
  subtotal_excluding_tax: 1700,
  line_items: [
    {
      amount: 2000,
      currency: 'USD',
      id: customerWebSubscriptionPlanId,
      name: 'first invoice',
      period: {
        end: 1565816388,
        start: 1565816388,
      },
    },
  ],
  tax: [
    {
      amount: 300,
      inclusive: true,
      display_name: 'Sales Tax',
    },
  ],
  prorated_amount: -833,
  one_time_charge: 1337,
};

export const MOCK_PREVIEW_INVOICE_WITH_TAX_INCLUSIVE_DISCOUNT: FirstInvoicePreview =
  {
    total: 1950,
    total_excluding_tax: 1650,
    subtotal: 2000,
    subtotal_excluding_tax: 1700,
    line_items: [
      {
        amount: 2000,
        currency: 'USD',
        id: customerWebSubscriptionPlanId,
        name: 'first invoice',
        period: {
          end: 1565816388,
          start: 1565816388,
        },
      },
    ],
    tax: [
      {
        amount: 300,
        inclusive: true,
        display_name: 'Sales Tax',
      },
    ],
    discount: {
      amount: 50,
      amount_off: 50,
      percent_off: null,
    },
    prorated_amount: -833,
    one_time_charge: 1337,
  };

export const MOCK_PREVIEW_INVOICE_WITH_TAX_EXCLUSIVE_DISCOUNT: FirstInvoicePreview =
  {
    total: 2250,
    total_excluding_tax: 1950,
    subtotal: 2000,
    subtotal_excluding_tax: 2000,
    line_items: [
      {
        amount: 2000,
        currency: 'USD',
        id: customerWebSubscriptionPlanId,
        name: 'first invoice',
        period: {
          end: 1565816388,
          start: 1565816388,
        },
      },
    ],
    tax: [
      {
        amount: 300,
        inclusive: false,
        display_name: 'Sales Tax',
      },
    ],
    discount: {
      amount: 50,
      amount_off: 50,
      percent_off: null,
    },
    prorated_amount: -833,
    one_time_charge: 1337,
  };

export const INVOICE_NO_TAX: LatestInvoiceItems = MOCK_PREVIEW_INVOICE_NO_TAX;

export const INVOICE_AFTER_SUBSCRIPTION: LatestInvoiceItems =
  MOCK_PREVIEW_INVOICE_AFTER_SUBSCRIPTION;

export const INVOICE_WITH_TAX_EXCLUSIVE: LatestInvoiceItems =
  MOCK_PREVIEW_INVOICE_WITH_TAX_EXCLUSIVE;

export const INVOICE_WITH_ZERO_TAX_EXCLUSIVE: LatestInvoiceItems =
  MOCK_PREVIEW_INVOICE_WITH_ZERO_TAX_EXCLUSIVE;

export const INVOICE_WITH_TAX_INCLUSIVE: LatestInvoiceItems =
  MOCK_PREVIEW_INVOICE_WITH_TAX_INCLUSIVE;

export const INVOICE_WITH_TAX_INCLUSIVE_DISCOUNT: LatestInvoiceItems =
  MOCK_PREVIEW_INVOICE_WITH_TAX_INCLUSIVE_DISCOUNT;

export const INVOICE_WITH_TAX_EXCLUSIVE_DISCOUNT: LatestInvoiceItems =
  MOCK_PREVIEW_INVOICE_WITH_TAX_EXCLUSIVE_DISCOUNT;

export function getLocalizedMessage(
  bundle: FluentBundle,
  msgId: string,
  args: any
): string {
  let localizedMessage = bundle.getMessage(msgId);
  if (localizedMessage === undefined || localizedMessage.value === null) {
    throw new Error(`unable to locate fluent message with id: ${msgId}`);
  }

  return bundle.formatPattern(localizedMessage.value, { ...args });
}

export function renderWithLocalizationProvider(
  children,
  messages: { [key: string]: string[] } = { en: ['testo: lol'] }
) {
  return render(withLocalizationProvider(children, messages));
}

export function withLocalizationProvider(
  children,
  messages: { [key: string]: string[] } = { en: ['testo: lol'] }
) {
  return (
    <AppLocalizationProvider messages={messages} reportError={() => {}}>
      {children}
    </AppLocalizationProvider>
  );
}

export default MockApp;
