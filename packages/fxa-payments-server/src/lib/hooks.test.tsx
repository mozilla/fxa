/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import '@testing-library/jest-dom/extend-expect';

import { cleanup, fireEvent, waitFor } from '@testing-library/react';
import { CouponDetails } from 'fxa-shared/dto/auth/payments/coupon';
import {
  MozillaSubscription,
  Plan,
  WebSubscription,
} from 'fxa-shared/subscriptions/types';
import React from 'react';
import ReactGA from 'react-ga4';

import {
  CouponInfoBoxMessageType,
  getPromotionCodeForPrice,
  useCheckboxState,
  useFetchInvoicePreview,
  useInfoBoxMessage,
  useNonce,
  useReactGA4Setup,
} from './hooks';
import {
  COUPON_DETAILS_VALID,
  CUSTOMER,
  IAP_CUSTOMER,
  SELECTED_PLAN,
  PROFILE,
} from './mock-data';

// eslint-disable-next-line import/first
import { apiInvoicePreview } from '../lib/apiClient';
import { Config } from './config';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

jest.mock('../lib/apiClient', () => {
  return {
    ...jest.requireActual('../lib/apiClient'),
    apiInvoicePreview: jest.fn(),
  };
});

jest.mock('react-ga4');

afterEach(cleanup);

describe('useCheckboxStateResult', () => {
  const Subject = ({ initialState = false }: { initialState?: boolean }) => {
    const [state, onChange] = useCheckboxState(initialState);
    return (
      <div>
        <div data-testid="result">{state.toString()}</div>
        <input type="checkbox" onChange={onChange} data-testid="checkbox" />
      </div>
    );
  };

  it('updates state with checkbox state as expected', () => {
    const { getByTestId } = renderWithLocalizationProvider(<Subject />);
    expect(getByTestId('result')).toHaveTextContent('false');
    fireEvent.click(getByTestId('checkbox'));
    expect(getByTestId('result')).toHaveTextContent('true');
    fireEvent.click(getByTestId('checkbox'));
    expect(getByTestId('result')).toHaveTextContent('false');
  });

  it('accepts an initial value', () => {
    const { getByTestId } = renderWithLocalizationProvider(
      <Subject initialState={true} />
    );
    expect(getByTestId('result')).toHaveTextContent('true');
  });
});

describe('useNonce', () => {
  const Subject = () => {
    const [nonce, refresh] = useNonce();
    return (
      <div>
        <span data-testid="nonce">{nonce}</span>
        <button data-testid="refresh" onClick={refresh} />
      </div>
    );
  };

  it('should render with an initial nonce', () => {
    const { getByTestId } = renderWithLocalizationProvider(<Subject />);
    const initialNonce = getByTestId('nonce').textContent;
    expect(initialNonce).toBeDefined();
    expect(initialNonce).not.toBe('');
  });

  it('should change nonce on refresh', () => {
    const { getByTestId } = renderWithLocalizationProvider(<Subject />);
    const refreshButton = getByTestId('refresh');

    // Click the button a few times for good measure;
    const knownNonces = [getByTestId('nonce').textContent as string];
    for (let idx = 0; idx < 3; idx++) {
      fireEvent.click(refreshButton);
      const afterRefreshNonce = getByTestId('nonce').textContent as string;
      expect(knownNonces).not.toContain(afterRefreshNonce);
      knownNonces.push(afterRefreshNonce);
    }
  });
});

describe('useReactGA4Setup', () => {
  const mockConfig = {
    googleAnalytics: {
      enabled: true,
      measurementId: '123',
      supportedProductIds: 'prod_GqM9ToKK62qjkK',
      debugMode: false,
    },
  } as Config;
  const Subject = ({
    config,
    productId,
    optedIn = true,
  }: {
    config: Config;
    productId: string;
    optedIn?: boolean;
  }) => {
    useReactGA4Setup(config, productId, optedIn);
    // Should always render
    return <div data-testid="success">Render success</div>;
  };

  beforeEach(() => {
    (ReactGA.initialize as jest.Mock).mockClear().mockReturnValue(true);
  });

  it('does not initialize ReactGA4 - not enabled', () => {
    const config = {
      googleAnalytics: {
        ...mockConfig.googleAnalytics,
        enabled: false,
      },
    } as Config;
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject config={config} productId="prod_GqM9ToKK62qjkK" />
    );

    expect(ReactGA.initialize).not.toBeCalled();
    expect(queryByTestId('success')?.textContent).toEqual('Render success');
  });

  it('does not initialize ReactGA4 - supportedProductIds is empty', () => {
    const config = {
      googleAnalytics: {
        ...mockConfig.googleAnalytics,
        supportedProductIds: '',
      },
    } as Config;
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject config={config} productId="prod_GqM9ToKK62qjkK" />
    );

    expect(ReactGA.initialize).not.toBeCalled();
    expect(queryByTestId('success')?.textContent).toEqual('Render success');
  });

  it('does not initialize ReactGA4 - productId is not in supportedProductIds', () => {
    const config = mockConfig;
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject config={config} productId="prod_fake" />
    );

    expect(ReactGA.initialize).not.toBeCalled();
    expect(queryByTestId('success')?.textContent).toEqual('Render success');
  });

  it('does not initialize ReactGA4 - measurementId is invalid', () => {
    (ReactGA.initialize as jest.Mock).mockClear().mockImplementation(() => {
      throw new Error('GA Measurement ID required');
    });
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const config = {
      googleAnalytics: {
        ...mockConfig.googleAnalytics,
        measurementId: '',
      },
    } as Config;
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject config={config} productId="prod_GqM9ToKK62qjkK" />
    );

    expect(ReactGA.initialize).toThrowError();
    expect(consoleError).toBeCalledWith(
      'Error initializing GA script\n',
      new Error('GA Measurement ID required')
    );
    expect(queryByTestId('success')?.textContent).toEqual('Render success');

    consoleError.mockRestore();
  });

  it('does not initialize ReactGA4 - customer is opted out of data collection and use', () => {
    const config = mockConfig;
    const profile = {
      ...PROFILE,
      metricsEnabled: false,
    };
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject
        config={config}
        productId="prod_GqM9ToKK62qjkK"
        optedIn={profile.metricsEnabled}
      />
    );

    expect(ReactGA.initialize).not.toBeCalled();
    expect(queryByTestId('success')?.textContent).toEqual('Render success');
  });

  it('successfully initialize ReactGA4', () => {
    const config = mockConfig;
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject config={config} productId="prod_GqM9ToKK62qjkK" />
    );

    expect(ReactGA.initialize).toBeCalledTimes(1);
    expect(ReactGA.initialize).toBeCalledWith(
      config.googleAnalytics.measurementId,
      {
        nonce: '',
        gtagOptions: {
          debug_mode: false,
        },
      }
    );
    expect(queryByTestId('success')?.textContent).toEqual('Render success');
  });

  it('successfully initialize ReactGA4 - with multiple supportedProductIds', () => {
    const config = {
      googleAnalytics: {
        ...mockConfig.googleAnalytics,
        supportedProductIds: 'prod_test_1,prod_GqM9ToKK62qjkK,prod_test_2',
      },
    } as Config;
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject config={config} productId="prod_GqM9ToKK62qjkK" />
    );

    expect(ReactGA.initialize).toBeCalledWith(
      config.googleAnalytics.measurementId,
      {
        nonce: '',
        gtagOptions: {
          debug_mode: false,
        },
      }
    );
    expect(queryByTestId('success')?.textContent).toEqual('Render success');
  });

  it('successfully initialize ReactGA4 - with debugMode enabled', () => {
    const config = {
      googleAnalytics: {
        ...mockConfig.googleAnalytics,
        debugMode: true,
      },
    } as Config;
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject config={config} productId="prod_GqM9ToKK62qjkK" />
    );

    expect(ReactGA.initialize).toBeCalledWith(
      config.googleAnalytics.measurementId,
      {
        nonce: '',
        gtagOptions: {
          debug_mode: true,
        },
      }
    );
    expect(queryByTestId('success')?.textContent).toEqual('Render success');
  });
});

describe('useInfoBoxMessage', () => {
  const selectedPlan = SELECTED_PLAN;
  const coupon = COUPON_DETAILS_VALID;

  const Subject = ({
    coupon,
    selectedPlan,
  }: {
    coupon: CouponDetails | undefined;
    selectedPlan: Plan;
  }) => {
    const infoBoxMessage = useInfoBoxMessage(coupon, selectedPlan);
    return infoBoxMessage ? (
      <div data-testid="info-box-message">
        <span data-testid="message">{infoBoxMessage.message}</span>
        {infoBoxMessage.couponDurationDate ? (
          <div data-testid="couponDurationDate-container">
            <span data-testid="couponDurationDate">
              {infoBoxMessage.couponDurationDate}
            </span>
          </div>
        ) : null}
      </div>
    ) : (
      <div data-testid="info-box-message-empty"></div>
    );
  };

  it('coupon has no value', () => {
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject coupon={undefined} selectedPlan={selectedPlan} />
    );
    expect(queryByTestId('info-box-message')).not.toBeInTheDocument();
    expect(queryByTestId('info-box-message-empty')).toBeInTheDocument();
  });

  it('coupon type is "forever"', () => {
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject
        coupon={{ ...coupon, type: 'forever' }}
        selectedPlan={selectedPlan}
      />
    );
    expect(queryByTestId('info-box-message')).not.toBeInTheDocument();
    expect(queryByTestId('info-box-message-empty')).toBeInTheDocument();
  });

  it('coupon type is an unexpected value', () => {
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject
        coupon={{ ...coupon, type: 'unexpected-value' }}
        selectedPlan={selectedPlan}
      />
    );
    expect(queryByTestId('info-box-message')).not.toBeInTheDocument();
    expect(queryByTestId('info-box-message-empty')).toBeInTheDocument();
  });

  it('coupon type is "once"', () => {
    const { queryByTestId, getByTestId } = renderWithLocalizationProvider(
      <Subject
        coupon={{ ...coupon, type: 'once' }}
        selectedPlan={selectedPlan}
      />
    );
    expect(
      queryByTestId('couponDurationDate-container')
    ).not.toBeInTheDocument();
    const messageText = getByTestId('message').textContent;
    expect(messageText).toBe(CouponInfoBoxMessageType.Default);
  });

  it('coupon type is "repeating" plan interval greater than coupon duration', () => {
    const { queryByTestId, getByTestId } = renderWithLocalizationProvider(
      <Subject
        coupon={{ ...coupon, type: 'repeating' }}
        selectedPlan={{ ...selectedPlan, interval_count: 6 }}
      />
    );
    expect(
      queryByTestId('couponDurationDate-container')
    ).not.toBeInTheDocument();
    const messageText = getByTestId('message').textContent;
    expect(messageText).toBe(CouponInfoBoxMessageType.Default);
  });

  // FXA-11195 - Temporary skip due to intermittent test failure.
  it.skip('coupon type is "repeating" plan interval equal to coupon duration', () => {
    const { queryByTestId, getByTestId } = renderWithLocalizationProvider(
      <Subject
        coupon={{ ...coupon, type: 'repeating' }}
        selectedPlan={selectedPlan}
      />
    );
    expect(
      queryByTestId('couponDurationDate-container')
    ).not.toBeInTheDocument();
    const messageText = getByTestId('message').textContent;
    expect(messageText).toBe(CouponInfoBoxMessageType.Default);
  });

  it('coupon type is "repeating" and plan interval less than coupon duration', () => {
    const couponLongerDuration = {
      ...coupon,
      durationInMonths: 2,
      type: 'repeating',
    };
    const { getByTestId } = renderWithLocalizationProvider(
      <Subject coupon={couponLongerDuration} selectedPlan={selectedPlan} />
    );
    const date = new Date();
    const expectedCouponDurationDate = `${Math.round(
      new Date(
        date.setMonth(
          date.getMonth() + (couponLongerDuration.durationInMonths || 2)
        )
      ).getTime() / 100
    )}`;
    const messageText = getByTestId('message').textContent;
    const couponDurationDate = getByTestId('couponDurationDate').textContent;
    expect(messageText).toBe(CouponInfoBoxMessageType.Repeating);
    expect(couponDurationDate).not.toBeNull();
    expect(couponDurationDate?.slice(0, 7)).toBe(
      expectedCouponDurationDate.slice(0, 7)
    );
  });
});

describe('getPromotionCodeForPrice', () => {
  const PROMOTION_CODE = 'CODE10';
  const customerSubscriptions = CUSTOMER.subscriptions;
  const customerSubscriptionsWithPromotionCode: MozillaSubscription[] = [
    {
      ...CUSTOMER.subscriptions[0],
      promotion_code: PROMOTION_CODE,
      promotion_duration: 'forever',
    } as WebSubscription,
  ];
  const customerSubscriptionsIAP = IAP_CUSTOMER.subscriptions;
  const PLAN_ID = (CUSTOMER.subscriptions[0] as WebSubscription).plan_id;

  it('returns promotionCode if priceId matchs customerSubscriptions', () => {
    const actual = getPromotionCodeForPrice(
      PLAN_ID,
      customerSubscriptionsWithPromotionCode
    );
    const expected = PROMOTION_CODE;
    expect(actual).toBe(expected);
  });

  it('returns undefined if priceId doesnt match customerSubscriptions', () => {
    const actual = getPromotionCodeForPrice(
      'plan_random',
      customerSubscriptionsWithPromotionCode
    );
    expect(actual).toBeUndefined();
  });

  it('returns undefined if customerSubscriptions doesnt have promotion code', () => {
    const actual = getPromotionCodeForPrice(PLAN_ID, customerSubscriptions);
    expect(actual).toBeUndefined();
  });

  it('returns undefined if customerSubscriptions only has non web subs', () => {
    const actual = getPromotionCodeForPrice(PLAN_ID, customerSubscriptionsIAP);
    expect(actual).toBeUndefined();
  });

  it('returns undefined if priceId and customerSubscriptions are null', () => {
    const actual = getPromotionCodeForPrice(undefined, null);
    expect(actual).toBeUndefined();
  });

  it('returns undefined if priceId is undefined', () => {
    const actual = getPromotionCodeForPrice(undefined, customerSubscriptions);
    expect(actual).toBeUndefined();
  });

  it('returns undefined if customerSubscriptions is null', () => {
    const actual = getPromotionCodeForPrice(PLAN_ID, null);
    expect(actual).toBeUndefined();
  });
});

describe('useFetchInvoicePreview', () => {
  const PROMOTION_CODE = 'CODE10';
  const customerSubscriptions = CUSTOMER.subscriptions;
  const customerSubscriptionsWithPromotionCode: MozillaSubscription[] = [
    {
      ...CUSTOMER.subscriptions[0],
      promotion_code: PROMOTION_CODE,
      promotion_duration: 'forever',
    } as WebSubscription,
  ];
  const PLAN_ID = (CUSTOMER.subscriptions[0] as WebSubscription).plan_id;

  const Subject = ({
    planId,
    customerSubscriptions,
  }: {
    planId?: string;
    customerSubscriptions?: MozillaSubscription[];
  }) => {
    const { loading, error, result } = useFetchInvoicePreview(
      planId,
      customerSubscriptions
    );

    if (loading) {
      return <span data-testid="loading">loading</span>;
    }
    if (error) {
      return <span data-testid="error">error</span>;
    }
    if (!result) {
      return <span data-testid="no-invoice">No invoice</span>;
    }
    if (result) {
      return <span data-testid="total">{result.total}</span>;
    }

    return <span data-testid="default">default</span>;
  };

  beforeEach(() => {
    (apiInvoicePreview as jest.Mock)
      .mockClear()
      .mockResolvedValue({ total: 100 });
  });

  it('returns invoicePreview no subscriptions', async () => {
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject planId={PLAN_ID} />
    );

    await waitFor(() => {
      expect(queryByTestId('loading')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(queryByTestId('total')).toBeInTheDocument();
    });

    expect(apiInvoicePreview).toHaveBeenCalledTimes(1);
    expect(apiInvoicePreview).toHaveBeenCalledWith({ priceId: PLAN_ID });
  });

  it('returns invoicePreview no promotionCode', async () => {
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject planId={PLAN_ID} customerSubscriptions={customerSubscriptions} />
    );

    await waitFor(() => {
      expect(queryByTestId('loading')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(queryByTestId('total')).toBeInTheDocument();
    });

    expect(apiInvoicePreview).toHaveBeenCalledTimes(1);
    expect(apiInvoicePreview).toHaveBeenCalledWith({ priceId: PLAN_ID });
  });

  it('returns invoicePreview with promotionCode', async () => {
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject
        planId={PLAN_ID}
        customerSubscriptions={customerSubscriptionsWithPromotionCode}
      />
    );

    await waitFor(() => {
      expect(queryByTestId('loading')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(queryByTestId('total')).toBeInTheDocument();
    });

    expect(apiInvoicePreview).toHaveBeenCalledTimes(1);
    expect(apiInvoicePreview).toHaveBeenCalledWith({
      priceId: PLAN_ID,
      promotionCode: PROMOTION_CODE,
    });
  });

  it('empty planId', async () => {
    const { queryByTestId } = renderWithLocalizationProvider(<Subject />);

    await waitFor(() => {
      expect(queryByTestId('no-invoice')).toBeInTheDocument();
    });

    expect(apiInvoicePreview).toHaveBeenCalledTimes(0);
  });

  it('invoicePreview throws error', async () => {
    (apiInvoicePreview as jest.Mock).mockClear().mockRejectedValue({});
    const { queryByTestId } = renderWithLocalizationProvider(
      <Subject planId={PLAN_ID} customerSubscriptions={customerSubscriptions} />
    );

    await waitFor(() => {
      expect(queryByTestId('loading')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(queryByTestId('error')).toBeInTheDocument();
    });

    expect(apiInvoicePreview).toHaveBeenCalledTimes(1);
  });
});
