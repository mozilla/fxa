import { screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { CouponForm, checkPromotionCode } from './index';
import { CouponDetails } from 'fxa-shared/dto/auth/payments/coupon';
import { defaultAppContext, AppContext } from '../../lib/AppContext';
import {
  COUPON_DETAILS_EXPIRED,
  COUPON_DETAILS_INVALID,
  COUPON_DETAILS_MAX_REDEEMED,
  COUPON_DETAILS_VALID,
  SELECTED_PLAN,
} from '../../lib/mock-data';
import {
  getFallbackTextByFluentId,
  CouponErrorMessageType,
} from '../../lib/errors';

import { APIError, apiRetrieveCouponDetails } from '../../lib/apiClient';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

import {
  coupon_REJECTED,
  coupon_FULFILLED,
  coupon_PENDING,
  couponMounted,
  couponEngaged,
} from '../../lib/amplitude';
jest.mock('../../lib/amplitude');

jest.mock('../../lib/apiClient', () => {
  return {
    ...jest.requireActual('../../lib/apiClient'),
    apiRetrieveCouponDetails: jest.fn(),
  };
});

beforeEach(() => {
  (apiRetrieveCouponDetails as jest.Mock)
    .mockClear()
    .mockResolvedValue(COUPON_DETAILS_VALID);
  (coupon_REJECTED as jest.Mock).mockClear();
  (coupon_FULFILLED as jest.Mock).mockClear();
  (coupon_PENDING as jest.Mock).mockClear();
  (couponMounted as jest.Mock).mockClear();
  (couponEngaged as jest.Mock).mockClear();
});

afterEach(cleanup);

describe('CouponForm', () => {
  describe('CouponForm component', () => {
    it('renders as expected', () => {
      const subject = () => {
        return renderWithLocalizationProvider(
          <CouponForm
            planId={SELECTED_PLAN.plan_id}
            coupon={undefined}
            setCoupon={() => {}}
            readOnly={false}
            subscriptionInProgress={false}
          />
        );
      };

      const { queryByTestId } = subject();
      const couponInputField = queryByTestId('coupon-input');
      const couponButton = queryByTestId('coupon-button');
      expect(couponInputField).toBeInTheDocument();
      expect(couponButton).toBeInTheDocument();
      expect(couponButton).not.toBeDisabled();
      expect(couponInputField).not.toBeDisabled();
      expect(couponMounted).toBeCalledTimes(1);
    });

    it('shows the coupon code and hides the input when a coupon is used', () => {
      const coupon: CouponDetails = {
        discountAmount: 200,
        promotionCode: '',
        type: '',
        durationInMonths: 1,
        valid: true,
        expired: false,
        maximallyRedeemed: false,
      };
      const subject = () => {
        return renderWithLocalizationProvider(
          <CouponForm
            planId={SELECTED_PLAN.plan_id}
            coupon={coupon}
            setCoupon={(coupon) => {}}
            readOnly={false}
            subscriptionInProgress={false}
          />
        );
      };

      const { queryByTestId } = subject();
      const couponForm = queryByTestId('coupon-form');
      const validCoupon = queryByTestId('coupon-hascoupon');
      expect(couponForm).not.toBeInTheDocument();
      expect(validCoupon).toBeInTheDocument();
    });

    it('shows an error message when invalid coupon code is used', async () => {
      (apiRetrieveCouponDetails as jest.Mock)
        .mockClear()
        .mockResolvedValue(COUPON_DETAILS_INVALID);
      const mockSetCoupon = jest.fn();
      const subject = () => {
        return renderWithLocalizationProvider(
          <CouponForm
            planId={SELECTED_PLAN.plan_id}
            coupon={undefined}
            setCoupon={mockSetCoupon}
            readOnly={false}
            subscriptionInProgress={false}
          />
        );
      };

      const { queryByTestId, getByTestId } = subject();

      await waitFor(() => {
        fireEvent.change(getByTestId('coupon-input'), {
          target: { value: 'a' },
        });
        fireEvent.click(getByTestId('coupon-button'));
      });

      await waitFor(() => {
        expect(queryByTestId('coupon-error')).toBeInTheDocument();
        expect(mockSetCoupon).toBeCalledWith(undefined);
      });

      const couponError = getByTestId('coupon-error');

      expect(couponError).toHaveTextContent(
        getFallbackTextByFluentId(CouponErrorMessageType.Invalid)
      );

      await waitFor(() => {
        fireEvent.change(getByTestId('coupon-input'), {
          target: { value: 'again' },
        });
        fireEvent.click(getByTestId('coupon-button'));
      });

      await waitFor(() => {
        expect(queryByTestId('coupon-error')).toBeInTheDocument();
        expect(mockSetCoupon).toBeCalledWith(undefined);
      });

      expect(couponMounted).toBeCalledTimes(1);
      expect(couponEngaged).toBeCalledTimes(1);
    });

    it('hides the remove button when there is a coupon in readonly mode', () => {
      const coupon: CouponDetails = {
        discountAmount: 200,
        promotionCode: '',
        type: '',
        durationInMonths: 1,
        valid: true,
        expired: false,
        maximallyRedeemed: false,
      };
      const subject = () => {
        return renderWithLocalizationProvider(
          <CouponForm
            planId={SELECTED_PLAN.plan_id}
            coupon={coupon}
            setCoupon={(coupon) => {}}
            readOnly={true}
            subscriptionInProgress={false}
          />
        );
      };

      const { queryByTestId } = subject();
      const removeButton = queryByTestId('coupon-remove-button');
      expect(removeButton).not.toBeInTheDocument();
    });

    it('has the input and buttons disabled during processing of a subscription', () => {
      const subject = () => {
        return renderWithLocalizationProvider(
          <CouponForm
            planId={SELECTED_PLAN.plan_id}
            coupon={undefined}
            setCoupon={(coupon) => {}}
            readOnly={false}
            subscriptionInProgress={true}
          />
        );
      };

      const { queryByTestId } = subject();
      const couponInput = queryByTestId('coupon-input');
      const applyButton = queryByTestId('coupon-button');
      expect(couponInput).toBeDisabled();
      expect(applyButton).toBeDisabled();
    });

    it('has the remove button disabled during processing of a subscription', () => {
      const coupon: CouponDetails = {
        discountAmount: 200,
        promotionCode: '',
        type: '',
        durationInMonths: 1,
        valid: true,
        expired: false,
        maximallyRedeemed: false,
      };
      const subject = () => {
        return renderWithLocalizationProvider(
          <CouponForm
            planId={SELECTED_PLAN.plan_id}
            coupon={coupon}
            setCoupon={(coupon) => {}}
            readOnly={false}
            subscriptionInProgress={true}
          />
        );
      };

      const { queryByTestId } = subject();
      const removeButton = queryByTestId('coupon-remove-button');
      expect(removeButton).toBeDisabled();
    });

    it('shows the coupon code if valid coupon code was passed in query string', async () => {
      const coupon: CouponDetails = {
        discountAmount: 200,
        promotionCode: 'IDCLEV19',
        type: '',
        durationInMonths: 1,
        valid: true,
        expired: false,
        maximallyRedeemed: false,
      };

      (apiRetrieveCouponDetails as jest.Mock)
        .mockClear()
        .mockResolvedValue(coupon);

      const subject = () => {
        return renderWithLocalizationProvider(
          <AppContext.Provider
            value={{
              ...defaultAppContext,
              queryParams: { coupon: 'IDCLEV19' },
            }}
          >
            <CouponForm
              planId={SELECTED_PLAN.plan_id}
              coupon={undefined}
              setCoupon={() => {}}
              readOnly={false}
              subscriptionInProgress={false}
            />
          </AppContext.Provider>
        );
      };

      const { queryByTestId } = subject();

      // wait for coupon to be applied
      await waitFor(() => {
        expect(screen.getByText('IDCLEV19')).toBeInTheDocument();
        expect(queryByTestId('coupon-form')).not.toBeInTheDocument();
        expect(queryByTestId('coupon-hascoupon')).toBeInTheDocument();
      });
    });

    it('renders without a coupon code if invalid coupon code was passed in query string', async () => {
      (apiRetrieveCouponDetails as jest.Mock)
        .mockClear()
        .mockResolvedValue(COUPON_DETAILS_INVALID);

      const subject = () => {
        return renderWithLocalizationProvider(
          <AppContext.Provider
            value={{
              ...defaultAppContext,
              queryParams: { coupon: 'THECAKEISALIE' },
            }}
          >
            <CouponForm
              planId={SELECTED_PLAN.plan_id}
              coupon={undefined}
              setCoupon={() => {}}
              readOnly={false}
              subscriptionInProgress={false}
            />
          </AppContext.Provider>
        );
      };

      const { queryByTestId } = subject();

      // wait for coupon to be checked
      await waitFor(() => {
        expect(screen.queryByText('THECAKEISALIE')).not.toBeInTheDocument();
        const couponInputField = queryByTestId('coupon-input');
        const couponButton = queryByTestId('coupon-button');
        expect(couponInputField).toBeInTheDocument();
        expect(couponInputField).not.toBeDisabled();
        expect(couponButton).toBeInTheDocument();
        expect(couponButton).not.toBeDisabled();
        expect(couponMounted).toBeCalledTimes(1);
      });
    });
  });

  describe('checkPromotionCode', () => {
    let error: Error | null = null;

    beforeEach(() => {
      error = null;
    });

    it('throws with invalid error message when invalid coupon code is used', async () => {
      (apiRetrieveCouponDetails as jest.Mock)
        .mockClear()
        .mockResolvedValue(COUPON_DETAILS_INVALID);
      try {
        await checkPromotionCode('plan_error', 'INVALID');
      } catch (err) {
        error = err;
      }

      expect(error?.message).toEqual(CouponErrorMessageType.Invalid);
      expect(coupon_PENDING).toBeCalledTimes(1);
      expect(coupon_REJECTED).toBeCalledTimes(1);
      expect(coupon_FULFILLED).toBeCalledTimes(0);
    });

    it('throws with expired error message when expired coupon code is used', async () => {
      (apiRetrieveCouponDetails as jest.Mock)
        .mockClear()
        .mockResolvedValue(COUPON_DETAILS_EXPIRED);
      try {
        await checkPromotionCode('plan_error', 'EXPIRED');
      } catch (err) {
        error = err;
      }

      expect(error?.message).toEqual(CouponErrorMessageType.Expired);
      expect(coupon_PENDING).toBeCalledTimes(1);
      expect(coupon_REJECTED).toBeCalledTimes(1);
      expect(coupon_FULFILLED).toBeCalledTimes(0);
    });

    it('throws with limit reached error message when maximally redeemed coupon code is used', async () => {
      (apiRetrieveCouponDetails as jest.Mock)
        .mockClear()
        .mockResolvedValue(COUPON_DETAILS_MAX_REDEEMED);
      try {
        await checkPromotionCode('plan_error', 'MAX_REDEEMED');
      } catch (err) {
        error = err;
      }

      expect(error?.message).toEqual(CouponErrorMessageType.LimitReached);
      expect(coupon_PENDING).toBeCalledTimes(1);
      expect(coupon_REJECTED).toBeCalledTimes(1);
      expect(coupon_FULFILLED).toBeCalledTimes(0);
    });

    it('throws with a generic error message when apiRetrieveCouponDetails fails', async () => {
      (apiRetrieveCouponDetails as jest.Mock)
        .mockClear()
        .mockRejectedValue(new APIError());
      try {
        await checkPromotionCode('plan_error', 'GENERIC');
      } catch (err) {
        error = err;
      }

      expect(error?.message).toEqual(CouponErrorMessageType.Generic);
      expect(coupon_PENDING).toBeCalledTimes(1);
      expect(coupon_REJECTED).toBeCalledTimes(1);
      expect(coupon_FULFILLED).toBeCalledTimes(0);
    });

    it('show success message when apiRetrieveCouponDetails succeeds', async () => {
      (apiRetrieveCouponDetails as jest.Mock)
        .mockClear()
        .mockResolvedValue(COUPON_DETAILS_VALID);
      try {
        await checkPromotionCode('plan_error', 'INVALID');
      } catch (err) {
        error = err;
      }

      expect(error).toBeNull();
      expect(coupon_PENDING).toBeCalledTimes(1);
      expect(coupon_REJECTED).toBeCalledTimes(0);
      expect(coupon_FULFILLED).toBeCalledTimes(1);
    });
  });
});
