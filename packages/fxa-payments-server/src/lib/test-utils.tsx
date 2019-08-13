import React, { useContext, ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { AppContext, AppContextType } from '../../src/lib/AppContext';
import { config, updateConfig } from '../../src/lib/config';
import ScreenInfo from '../../src/lib/screen-info';
import { ReactStripeElements } from 'react-stripe-elements';
import nock from 'nock';

import { Store, State } from '../../src/store/types';
import { createAppStore } from '../../src/store';

declare global {
  namespace NodeJS {
    interface Global {
      fetch: Function;
    }
  }
}

export const wait = (delay: number) =>
  new Promise(
    resolve => setTimeout(resolve, delay)
  );

export function expectNockScopesDone(scopes: nock.Scope[]) {
  for (const scope of scopes) {
    expect(scope.isDone()).toBeTruthy();
  }
}

export const mockConfig = {
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
      const { onChange } = props;
      mockStripeElementOnChangeFns[testid] = onChange as onChangeFunctionType;

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
  empty: !!value,
  error:
    (!!errorMessage && {
      type: 'card_error',
      charge: 'test',
      message: errorMessage,
    }) ||
    undefined,
});

export const defaultAppContextValue = (): AppContextType => ({
  accessToken: 'at_12345',
  config,
  queryParams: {},
  matchMedia: jest.fn().mockImplementation(query => false),
  navigateToUrl: jest.fn(),
  getScreenInfo: () => new ScreenInfo(window),
  locationReload: jest.fn(),
});

type MockAppProps = {
  children: ReactNode;
  store?: Store,
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
    <ReduxProvider store={store || createAppStore(initialState, storeEnhancers)}>
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

export const STRIPE_FIELDS = [
  'cardNumberElement',
  'cardCVCElement',
  'cardExpiryElement',
];

export const PLAN_ID = 'plan_12345';

export const PLAN_NAME = 'Plan 12345';

export const PRODUCT_ID = 'product_8675309';

export const PRODUCT_REDIRECT_URLS = {
  [PRODUCT_ID]: 'https://example.com/product',
};

export const MOCK_PLANS = [
  {
    plan_id: PLAN_ID,
    plan_name: PLAN_NAME,
    product_id: PRODUCT_ID,
    product_name: 'Product 67890',
    interval: 'month',
    amount: '500',
    currency: 'usd',
  },
  {
    plan_id: '123doneProMonthly',
    plan_name: '123done Pro Monthly',
    product_id: '123donepro',
    product_name: '123doneProProduct',
    interval: 'month',
    amount: '2500',
    currency: 'usd',
  }
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
  payment_type: 'tok_1F7TltEOSeHhIAfQo9u6eqTc',
  last4: '8675',
  exp_month: 8,
  exp_year: 2020,
  subscriptions: [
    {
      subscription_id: 'sub0.28964929339372136',
      plan_id: '123doneProMonthly',
      plan_name: '123done Pro Monthly',
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
      plan_name: 'Plan 12345',
      status: 'active',
      cancel_at_period_end: false,
      current_period_start: 1565816388.815,
      current_period_end: 1568408388.815,
    },
  ],
};

export default MockApp;
