import React, { useContext, ReactNode } from 'react';
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
import fs from 'fs';
import path from 'path';
import { FluentBundle, FluentResource } from '@fluent/bundle';

import { State } from '../store/state';
import { Store, createAppStore } from '../../src/store';
import { Plan, Token } from '../../src/store/types';

declare global {
  namespace NodeJS {
    interface Global {
      fetch: Function;
    }
  }
}

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
  ): Promise<ReactStripeElements.PatchedTokenResponse>;
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
          stripe: mockStripe as ReactStripeElements.InjectedStripeProps['stripe'],
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
          <React.Suspense
            fallback={<div data-testid="is-loading">Loading</div>}
          >
            {children}
          </React.Suspense>
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
    product_metadata: {
      productSet: 'example_upgrade',
      webIconURL: 'http://example.com/product.jpg',
      webIconBackground: 'purple',
    },
  },
  {
    plan_id: '123doneProMonthly',
    product_id: '123donepro',
    product_name: '123doneProProduct',
    interval: 'month' as const,
    interval_count: 1,
    amount: 2500,
    currency: 'usd',
    product_metadata: {
      productSet: '123done',
      webIconURL: 'http://example.com/123donepro.jpg',
      webIconBackground: 'orange',
      'product:subtitle': '123DonePro subtitle',
    },
  },
  {
    plan_id: 'plan_upgrade',
    product_id: 'prod_upgrade',
    product_name: 'Upgrade Product',
    interval: 'month' as const,
    interval_count: 1,
    amount: 5900,
    currency: 'usd',
    product_metadata: {
      productSet: 'example_upgrade',
    },
  },
  {
    plan_id: 'plan_daily',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'day' as const,
    interval_count: 1,
    amount: 500,
    currency: 'usd',
    product_metadata: {
      productSet: 'fpn',
    },
  },
  {
    plan_id: 'plan_6days',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'day' as const,
    interval_count: 6,
    amount: 500,
    currency: 'usd',
    product_metadata: {
      productSet: 'fpn',
    },
  },
  {
    plan_id: 'plan_weekly',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'week' as const,
    interval_count: 1,
    amount: 500,
    currency: 'usd',
    product_metadata: {
      productSet: 'fpn',
    },
  },
  {
    plan_id: 'plan_6weeks',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'week' as const,
    interval_count: 6,
    amount: 500,
    currency: 'usd',
    product_metadata: {
      productSet: 'fpn',
    },
  },
  {
    plan_id: 'plan_monthly',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'month' as const,
    interval_count: 1,
    amount: 500,
    currency: 'usd',
    product_metadata: {
      productSet: 'fpn',
    },
  },
  {
    plan_id: 'plan_6months',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'month' as const,
    interval_count: 6,
    amount: 500,
    currency: 'usd',
    product_metadata: {
      productSet: 'fpn',
    },
  },
  {
    plan_id: 'plan_yearly',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'year' as const,
    interval_count: 1,
    amount: 500,
    currency: 'usd',
    product_metadata: {
      productSet: 'fpn',
    },
  },
  {
    plan_id: 'plan_6years',
    product_id: 'prod_fpn',
    product_name: 'FPN',
    interval: 'year' as const,
    interval_count: 6,
    amount: 500,
    currency: 'usd',
    product_metadata: {
      productSet: 'fpn',
    },
  },
  {
    plan_id: 'nextlevel',
    product_id: PRODUCT_ID,
    product_name: PRODUCT_NAME,
    interval: 'year' as const,
    interval_count: 1,
    amount: 999,
    currency: 'usd',
    product_metadata: {
      webIconURL: 'http://example.com/product.jpg',
      webIconBackground: 'purple',
    },
  },
];

export const MOCK_PROFILE = {
  email: 'foo@example.com',
  locale: 'en-US,en;q=0.5',
  amrValues: ['pwd', 'email'],
  twoFactorAuthentication: false,
  uid: 'a90fef48240b49b2b6a33d333aee9b13',
  avatar: 'http://localhost:1112/a/00000000000000000000000000000000',
  avatarDefault: true,
  displayName: 'Foxy77',
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

export const MOCK_CUSTOMER = {
  billing_name: 'Jane Doe',
  payment_type: 'card',
  payment_provider: 'stripe',
  brand: 'Visa',
  last4: '8675',
  exp_month: '8',
  exp_year: '2020',
  subscriptions: [
    {
      subscription_id: 'sub0.28964929339372136',
      plan_id: '123doneProMonthly',
      product_id: 'prod_123',
      product_name: '123done Pro',
      latest_invoice: '628031D-0002',
      status: 'active',
      cancel_at_period_end: false,
      current_period_start: 1565816388.815,
      current_period_end: 1568408388.815,
      end_at: null,
    },
  ],
};

export const MOCK_CUSTOMER_AFTER_SUBSCRIPTION = {
  ...MOCK_CUSTOMER,
  subscriptions: [
    ...MOCK_CUSTOMER.subscriptions,
    {
      subscription_id: 'sub0.21234123424',
      plan_id: PLAN_ID,
      product_id: PRODUCT_ID,
      latest_invoice: '628031D-0002',
      status: 'active',
      cancel_at_period_end: false,
      current_period_start: 1565816388.815,
      current_period_end: 1568408388.815,
    },
  ],
};

export function setupFluentLocalizationTest(locale: string): FluentBundle {
  const filepath = path.join(
    __dirname,
    '..',
    '..',
    'public',
    'locales',
    locale,
    'main.ftl'
  );
  const messages = fs.readFileSync(filepath).toString();
  const resource = new FluentResource(messages);
  const bundle = new FluentBundle(locale, { useIsolating: false });
  bundle.addResource(resource);

  return bundle;
}

export function getLocalizedMessage(
  bundle: FluentBundle,
  msgId: string,
  args: any
): string {
  let localizedMessage = bundle.getMessage(msgId);
  if (localizedMessage === undefined || localizedMessage.value === null) {
    throw Error(`unable to locate fluent message with id: '${msgId}'`);
  }

  return bundle.formatPattern(localizedMessage.value, { ...args });
}

export default MockApp;
