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
import { FluentBundle } from 'fluent';

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
  new Promise(resolve => setTimeout(resolve, delay));

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
const MockStripeElement = ({ testid }: { testid: string }) =>
  class extends React.Component {
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
      this.setRef = el => (this._ref = el);
    }

    render() {
      return (
        <div ref={this.setRef} data-testid={testid}>
          {testid}
        </div>
      );
    }
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
    return <WrappedComponent {...{ ...props, stripe: mockStripe }} />;
  };
}

// Mock out the Stripe elements we use in PaymentForm
jest.setMock(
  'react-stripe-elements',
  Object.assign(require.requireActual('react-stripe-elements'), {
    injectStripe,
    Elements: ({ children }: { children: ReactNode }) => children,
    CardNumberElement: MockStripeElement({ testid: 'cardNumberElement' }),
    CardExpiryElement: MockStripeElement({ testid: 'cardExpiryElement' }),
    CardCVCElement: MockStripeElement({ testid: 'cardCVCElement' }),
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
  matchMedia: jest.fn().mockImplementation(query => false),
  matchMediaDefault: jest.fn().mockImplementation(query => {
    return {
      matches: query.includes(': 0em'),
      media: query,
      addListener: jest.fn(),
      addEventListener: jest.fn(),
      removeListener: jest.fn(),
      removeEventListener: jest.fn()
    }
  }),
  navigateToUrl: jest.fn(),
  getScreenInfo: () => new ScreenInfo(window),
  locationReload: jest.fn(),
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
    interval: 'month',
    interval_count: 1,
    amount: 500,
    currency: 'usd',
    product_metadata: {
      productSet: 'example_upgrade',
      webIconURL: 'http://example.com/product.jpg',
    },
  },
  {
    plan_id: '123doneProMonthly',
    product_id: '123donepro',
    product_name: '123doneProProduct',
    interval: 'month',
    interval_count: 1,
    amount: 2500,
    currency: 'usd',
    product_metadata: {
      productSet: '123done',
      webIconURL: 'http://example.com/123donepro.jpg',
    },
  },
  {
    plan_id: 'plan_upgrade',
    product_id: 'prod_upgrade',
    product_name: 'Upgrade Product',
    interval: 'month',
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
    interval: 'day',
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
    interval: 'day',
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
    interval: 'week',
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
    interval: 'week',
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
    interval: 'month',
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
    interval: 'month',
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
    interval: 'year',
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
    interval: 'year',
    interval_count: 6,
    amount: 500,
    currency: 'usd',
    product_metadata: {
      productSet: 'fpn',
    },
  },
];

export const MOCK_PROFILE = {
  email: 'foo@example.com',
  locale: 'en-US,en;q=0.5',
  amrValues: ['pwd', 'email'],
  twoFactorAuthentication: false,
  uid: 'a90fef48240b49b2b6a33d333aee9b13',
  avatar: 'http://127.0.0.1:1112/a/00000000000000000000000000000000',
  avatarDefault: true,
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
  brand: 'Visa',
  last4: '8675',
  exp_month: 8,
  exp_year: 2020,
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
  const bundle = new FluentBundle(locale, { useIsolating: false });
  bundle.addMessages(messages);

  return bundle;
}

export function getLocalizedMessage(
  bundle: FluentBundle,
  msgId: string,
  args: any
): string {
  const msg = bundle.getMessage(msgId);
  if (msg === undefined) {
    throw Error(`unable to locate fluent message with id: '${msgId}'`);
  }

  return bundle.format(msg, { ...args });
}

export default MockApp;
