/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { Localized } from '@fluent/react';
import {
  getLocalizedDate,
  getLocalizedDateString,
  formatPriceAmount,
  getLocalizedCurrency,
} from '../../../lib/formats';
import { useCheckboxState } from '../../../lib/hooks';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { Plan } from '../../../store/types';
import { SelectorReturns } from '../../../store/selectors';
import { SubscriptionsProps } from '../index';
import { uiContentFromProductConfig } from 'fxa-shared/subscriptions/configuration/utils';
import * as Amplitude from '../../../lib/amplitude';
import { PaymentProvider } from 'fxa-payments-server/src/lib/PaymentProvider';
import { WebSubscription } from 'fxa-shared/subscriptions/types';
import AppContext from '../../../lib/AppContext';
import { PriceDetails } from '../../../components/PriceDetails';
import {
  LatestInvoiceItems,
  SubsequentInvoicePreview,
} from 'fxa-shared/dto/auth/payments/invoice';
import couponIcon from '@fxa/shared/assets/images/ico-coupon.svg';

const getIntervalPriceDetailsData = (
  invoice: LatestInvoiceItems | SubsequentInvoicePreview
) => {
  const exclusiveTaxRates =
    invoice.tax?.filter(
      (taxRate) => !taxRate.inclusive && taxRate.amount > 0
    ) || [];
  const showInvoiceTax = !!exclusiveTaxRates.length;

  const invoiceDisplayTotal =
    showInvoiceTax && invoice.total_excluding_tax
      ? invoice.total_excluding_tax
      : invoice.total;

  const taxAmount = exclusiveTaxRates.reduce(
    (total, taxRate) => total + taxRate.amount,
    0
  );

  return {
    showInvoiceTax,
    invoiceDisplayTotal,
    taxAmount,
  };
};

const getNextBillData = (
  subsequentInvoice: SubsequentInvoicePreview,
  currency: string
) => {
  const { period_start: subsequentInvoiceDate } = subsequentInvoice;

  const { showInvoiceTax, invoiceDisplayTotal, taxAmount } =
    getIntervalPriceDetailsData(subsequentInvoice);

  const nextBillL10nId = showInvoiceTax
    ? 'sub-next-bill-tax-1'
    : 'sub-next-bill-no-tax-1';
  const nextBillAmount = formatPriceAmount(
    invoiceDisplayTotal,
    currency,
    showInvoiceTax,
    taxAmount || null
  );
  const nextBillDate = getLocalizedDateString(subsequentInvoiceDate, true);
  const nextBillL10nVarsDefault = {
    priceAmount: getLocalizedCurrency(invoiceDisplayTotal, currency),
    date: getLocalizedDate(subsequentInvoiceDate, true),
  };
  const nextBillL10nVars = showInvoiceTax
    ? {
        ...nextBillL10nVarsDefault,
        taxAmount: getLocalizedCurrency(taxAmount, currency),
      }
    : nextBillL10nVarsDefault;

  return {
    nextBillL10nId,
    nextBillAmount,
    nextBillDate,
    nextBillL10nVars,
  };
};

export type CancelSubscriptionPanelProps = {
  plan: Plan;
  cancelSubscription: SubscriptionsProps['cancelSubscription'];
  customerSubscription: WebSubscription;
  cancelSubscriptionStatus: SelectorReturns['cancelSubscriptionStatus'];
  paymentProvider: PaymentProvider | undefined;
  promotionCode: string | undefined;
  subsequentInvoice: SubsequentInvoicePreview;
  invoice: LatestInvoiceItems;
};

const CancelSubscriptionPanel = ({
  plan,
  cancelSubscription,
  customerSubscription: { subscription_id, current_period_end, promotion_name },
  cancelSubscriptionStatus,
  paymentProvider,
  promotionCode,
  subsequentInvoice,
  invoice,
}: CancelSubscriptionPanelProps) => {
  const { navigatorLanguages, config } = useContext(AppContext);
  const [cancelRevealed, revealCancel, hideCancel] = useBooleanState();
  const [confirmationChecked, onConfirmationChanged] = useCheckboxState();
  const [
    isLocalCancellation,
    setIsLocalCancellation,
    resetIsLocalCancellation,
  ] = useBooleanState();
  const isMounted = useRef(false);

  const confirmCancellation = useCallback(async () => {
    setIsLocalCancellation();
    try {
      await cancelSubscription(
        subscription_id,
        plan,
        paymentProvider,
        promotionCode
      );
    } catch (err) {
      // no-op, error is displayed in the Subscriptions route parent
    }
    if (isMounted.current) {
      resetIsLocalCancellation();
    }
  }, [
    cancelSubscription,
    subscription_id,
    plan,
    paymentProvider,
    promotionCode,
    resetIsLocalCancellation,
    setIsLocalCancellation,
  ]);

  const viewed = useRef(false);
  const engaged = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    if (!viewed.current && cancelRevealed) {
      Amplitude.cancelSubscriptionMounted({ ...plan, promotionCode });
      viewed.current = true;
    }

    return () => {
      isMounted.current = false;
    };
  }, [cancelRevealed, viewed, plan, promotionCode]);

  const engage = useCallback(() => {
    if (!engaged.current) {
      Amplitude.cancelSubscriptionEngaged({ ...plan, promotionCode });
      engaged.current = true;
    }
  }, [engaged, plan, promotionCode]);

  const engagedOnHideCancel = useCallback(
    (evt) => {
      engage();
      onConfirmationChanged(evt);
      hideCancel();
    },
    [hideCancel, engage, onConfirmationChanged]
  );

  const engagedOnConfirmationChanged = useCallback(
    (evt) => {
      engage();
      onConfirmationChanged(evt);
    },
    [onConfirmationChanged, engage]
  );

  const invoiceCurrency = subsequentInvoice.currency;
  const intervalPriceDetailsData = getIntervalPriceDetailsData(invoice);
  const { nextBillL10nId, nextBillAmount, nextBillDate, nextBillL10nVars } =
    getNextBillData(subsequentInvoice, invoiceCurrency);

  const { upgradeCTA } = uiContentFromProductConfig(
    plan,
    navigatorLanguages,
    config.featureFlags.useFirestoreProductConfigs
  );

  return (
    <>
      <div className="cancel-subscription">
        {!cancelRevealed ? (
          <>
            <div className="with-settings-button">
              <div className="flex items-start">
                {promotion_name && (
                  <img src={couponIcon} alt="" className="ltr:pr-2 rtl:pl-2" />
                )}
                <span
                  className="flex flex-col flex-4 text-grey-900 ltr:pr-8 rtl:pl-8"
                  data-testid="price-details"
                >
                  <div className="font-semibold mb-2">
                    {promotion_name ? (
                      <Localized
                        id="sub-promo-coupon-applied"
                        vars={{ promotion_name }}
                        elems={{
                          priceDetails: (
                            <PriceDetails
                              total={
                                intervalPriceDetailsData.invoiceDisplayTotal
                              }
                              tax={intervalPriceDetailsData.taxAmount}
                              showTax={intervalPriceDetailsData.showInvoiceTax}
                              currency={invoiceCurrency}
                              interval={plan.interval}
                              intervalCount={plan.interval_count}
                              className="font-semibold mb-2"
                              dataTestId="price-details-standalone"
                            />
                          ),
                        }}
                      >
                        <span data-testid="sub-coupon-applied">
                          {promotion_name} coupon applied:{' '}
                          <PriceDetails
                            total={intervalPriceDetailsData.invoiceDisplayTotal}
                            tax={intervalPriceDetailsData.taxAmount}
                            showTax={intervalPriceDetailsData.showInvoiceTax}
                            currency={invoiceCurrency}
                            interval={plan.interval}
                            intervalCount={plan.interval_count}
                            className="font-semibold mb-2"
                            dataTestId="price-details-standalone"
                          />
                        </span>
                      </Localized>
                    ) : (
                      <PriceDetails
                        total={intervalPriceDetailsData.invoiceDisplayTotal}
                        tax={intervalPriceDetailsData.taxAmount}
                        showTax={intervalPriceDetailsData.showInvoiceTax}
                        currency={invoiceCurrency}
                        interval={plan.interval}
                        intervalCount={plan.interval_count}
                        className="font-semibold mb-2"
                        dataTestId="price-details-standalone"
                      />
                    )}
                  </div>
                  <Localized id={nextBillL10nId} vars={nextBillL10nVars}>
                    <div data-testid="sub-next-bill">
                      Next bill of {nextBillAmount} is due {nextBillDate}
                    </div>
                  </Localized>
                </span>
              </div>
              <div className="action">
                <button
                  className="button settings-button"
                  onClick={revealCancel}
                  data-testid="reveal-cancel-subscription-button"
                >
                  <Localized id="payment-cancel-btn">
                    <span className="change-button">Cancel</span>
                  </Localized>
                </button>
              </div>
            </div>
            {upgradeCTA && (
              <p
                className="upgrade-cta"
                data-testid="upgrade-cta"
                dangerouslySetInnerHTML={{ __html: upgradeCTA }}
              />
            )}
          </>
        ) : (
          <>
            <Localized id="sub-item-cancel-sub">
              <h3>Cancel Subscription</h3>
            </Localized>
            <Localized
              id="sub-item-cancel-msg"
              vars={{
                name: plan.product_name,
                period: getLocalizedDate(current_period_end),
              }}
            >
              <p>
                You will no longer be able to use {plan.product_name} after{' '}
                {getLocalizedDateString(current_period_end)}, the last day of
                your billing cycle.
              </p>
            </Localized>
            <div className="input-row input-row--checkbox">
              <label>
                <input
                  data-testid="confirm-cancel-subscription-checkbox"
                  type="checkbox"
                  defaultChecked={confirmationChecked}
                  onChange={engagedOnConfirmationChanged}
                />
                <Localized
                  id="sub-item-cancel-confirm"
                  vars={{
                    name: plan.product_name,
                    period: getLocalizedDate(current_period_end),
                  }}
                >
                  <span>
                    Cancel my access and my saved information within{' '}
                    {plan.product_name} on{' '}
                    {getLocalizedDateString(current_period_end, false)}
                  </span>
                </Localized>
              </label>
            </div>
            <div className="button-row">
              <Localized id="sub-item-stay-sub">
                <button
                  className="button settings-button primary-button"
                  data-testid="stay-subscribed-button"
                  onClick={engagedOnHideCancel}
                >
                  Stay Subscribed
                </button>
              </Localized>
              <button
                data-testid="cancel-subscription-button"
                className="button settings-button secondary-button"
                onClick={confirmCancellation}
                disabled={
                  cancelSubscriptionStatus.loading || !confirmationChecked
                }
              >
                {cancelSubscriptionStatus.loading && isLocalCancellation ? (
                  <span data-testid="spinner-update" className="spinner">
                    &nbsp;
                  </span>
                ) : (
                  <Localized id="sub-item-cancel-sub">
                    <span>Cancel Subscription</span>
                  </Localized>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CancelSubscriptionPanel;
