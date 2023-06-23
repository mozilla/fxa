import React, { useContext } from 'react';
import { Localized, useLocalization } from '@fluent/react';
import {
  getLocalizedCurrency,
  formatPlanPricing,
  getLocalizedDate,
  getLocalizedDateString,
} from '../../lib/formats';
import { Plan, Profile, Customer } from '../../store/types';
import { PaymentProviderDetails } from '../PaymentProviderDetails';
import SubscriptionTitle from '../SubscriptionTitle';
import { TermsAndPrivacy } from '../TermsAndPrivacy';
import PaymentLegalBlurb from '../PaymentLegalBlurb';

import circledCheckbox from './images/circled-confirm.svg';
import emailSentIcon from './images/email-sent.svg';
import checkmarkIcon from './images/checkmark.svg';

import './index.scss';
import { uiContentFromProductConfig } from 'fxa-shared/subscriptions/configuration/utils';
import { AppContext } from '../../lib/AppContext';
import { WebSubscription } from 'fxa-shared/subscriptions/types';
import { FirstInvoicePreview } from 'fxa-shared/dto/auth/payments/invoice';

export type PaymentConfirmationProps = {
  customer: Customer;
  profile: Profile;
  selectedPlan: Plan;
  productUrl: string;
  accountExists?: boolean;
  invoice?: FirstInvoicePreview;
};

export const PaymentConfirmation = ({
  customer,
  profile,
  selectedPlan,
  productUrl,
  accountExists = true,
  invoice,
}: PaymentConfirmationProps) => {
  const { config, navigatorLanguages } = useContext(AppContext);
  const { amount, currency, interval, interval_count, product_name } =
    selectedPlan;
  const { email } = profile;

  const { payment_provider, subscriptions } = customer;

  const buttonLabel = uiContentFromProductConfig(
    selectedPlan,
    navigatorLanguages,
    config.featureFlags.useFirestoreProductConfigs
  ).successActionButtonLabel;

  const subscription = (subscriptions as WebSubscription[]).find(
    (sub) => sub.plan_id === selectedPlan.plan_id
  );
  const invoiceNumber = subscription?.latest_invoice;
  const latestInvoiceLineItem =
    subscription?.latest_invoice_items.line_items.find(
      (item) => item.id === selectedPlan.plan_id
    );
  const invoiceDate = latestInvoiceLineItem?.period.start;

  const finalAmount = invoice && amount ? invoice.total : amount;
  const planPrice = formatPlanPricing(
    finalAmount,
    currency,
    interval,
    interval_count
  );

  const { l10n } = useLocalization();
  const downloadUrl: URL = new URL(productUrl);
  downloadUrl.searchParams.append('email', email);

  // TW classes
  const subheadingClasses = 'text-grey-400 max-w-sm';
  const h2classes = 'text-xl font-normal mx-0 mt-6 mb-3';
  const h3classes = 'text-sm font-semibold';
  const bottomRowClasses = 'flex justify-between items-center text-grey-400';

  return (
    <>
      <SubscriptionTitle screenType="success" />
      <section
        className="mb-auto tablet:m-0 payment-confirmation"
        data-testid="payment-confirmation"
      >
        <header className="flex flex-col justify-center items-center row-divider-grey-200 text-center pb-8 mt-5 desktop:mt-2">
          {accountExists ? (
            <>
              <img
                className="max-h-12"
                src={circledCheckbox}
                alt="circled checkbox"
              />
              <Localized id="payment-confirmation-thanks-heading">
                <h2 className={h2classes}>Thank you!</h2>
              </Localized>
              <Localized
                id="payment-confirmation-thanks-subheading"
                vars={{ email, product_name }}
              >
                <p
                  className={subheadingClasses}
                >{`A confirmation email has been sent to ${email} with details on how to get started with ${product_name}.`}</p>
              </Localized>
            </>
          ) : (
            <>
              <img src={checkmarkIcon} alt="checkmark icon" />
              <img src={emailSentIcon} alt="email sent icon" />
              <Localized id="payment-confirmation-thanks-heading-account-exists">
                <h2 className={h2classes}>Thanks, now check your email!</h2>
              </Localized>
              <Localized
                id="payment-confirmation-thanks-subheading-account-exists"
                vars={{ email }}
              >
                <p
                  className={subheadingClasses}
                >{`You\`ll receive an email at ${email} with instructions for setting up your account as well as  your payment details.`}</p>
              </Localized>
            </>
          )}
        </header>

        {
          // Do not display Order details section if all data could not be retrieved
          invoiceNumber && invoiceDate !== undefined && (
            <div
              className="pb-6 row-divider-grey-200"
              data-testid="payment-confirmation-order"
            >
              <Localized id="payment-confirmation-order-heading">
                <h3 className={h3classes}>Order details</h3>
              </Localized>
              <div className={bottomRowClasses}>
                <Localized
                  id="payment-confirmation-invoice-number"
                  vars={{ invoiceNumber }}
                >
                  <p>Invoice #{invoiceNumber}</p>
                </Localized>
                <Localized
                  id="payment-confirmation-invoice-date"
                  vars={{ invoiceDate: getLocalizedDate(invoiceDate) }}
                >
                  <p>{getLocalizedDateString(invoiceDate)}</p>
                </Localized>
              </div>
            </div>
          )
        }

        <div className="pb-6 row-divider-grey-200">
          <Localized id="payment-confirmation-details-heading-2">
            <h3 className={h3classes}>Payment information</h3>
          </Localized>
          <div className={bottomRowClasses}>
            <Localized
              id={`payment-confirmation-amount-${interval}`}
              vars={{
                amount: getLocalizedCurrency(finalAmount, currency),
                intervalCount: interval_count,
              }}
            >
              <p data-testid="plan-price">{planPrice}</p>
            </Localized>

            <PaymentProviderDetails customer={customer} />
          </div>
        </div>

        {accountExists && (
          <div className="options mb-6" data-testid="options">
            <a
              data-testid="download-link"
              className="button download-link"
              href={downloadUrl.href}
            >
              {buttonLabel ||
                l10n.getString(
                  'payment-confirmation-download-button',
                  null,
                  'Continue to download'
                )}
            </a>
          </div>
        )}

        <div className="payment-footer" data-testid="footer">
          <PaymentLegalBlurb provider={payment_provider} />
          <TermsAndPrivacy
            plan={selectedPlan}
            showFXALinks={!accountExists}
            contentServerURL={config.servers.content.url}
          />
        </div>
      </section>
    </>
  );
};

export default PaymentConfirmation;
