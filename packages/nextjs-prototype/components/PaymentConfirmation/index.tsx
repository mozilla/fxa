import { Localized } from '@fluent/react';
import { PaymentProvider } from '../../lib/paymentProvider';
import PaymentProviderDetails from './PaymentProviderDetails';
import { PlanInterval } from 'fxa-shared/subscriptions/types';
import { getLocalizedCurrency } from '../../lib/formats';

const CIRCLED_CHECKBOX = '/images/circled-confirm.svg';
const CHECKMARK_ICON = '/images/checkmark.svg';
const EMAIL_SENT_ICON = '/images/email-sent.svg';

// TW classes
const subheadingClasses = 'text-grey-400 max-w-sm';
const h2classes = 'text-xl font-normal mx-0 mt-6 mb-3';
const h3classes = 'text-sm font-semibold';
const bottomRowClasses = 'flex justify-between items-center text-grey-400';

export type PaymentConfirmationInvoiceInfo = {
  number: string;
  date: number;
  total: number;
  interval: PlanInterval;
  intervalCount: number;
  currency: string;
};

export type PaymentConfirmationProps = {
  accountExists: boolean;
  email: string;
  productName: string;
  downloadUrl: string;
  buttonLabel?: string;
  invoiceInfo: PaymentConfirmationInvoiceInfo;
  paymentProvider: PaymentProvider;
  brand?: string;
  last4?: string;
};

export default function PaymentConfirmation({
  accountExists,
  email,
  productName,
  downloadUrl,
  buttonLabel,
  invoiceInfo,
  paymentProvider,
  brand,
  last4,
}: PaymentConfirmationProps) {
  return (
    <>
      <section
        className="mb-auto tablet:m-0 payment-confirmation"
        data-testid="payment-confirmation"
      >
        <header className="flex flex-col justify-center items-center row-divider-grey-200 text-center pb-8 mt-5 desktop:mt-2">
          {accountExists ? (
            <>
              <img
                className="max-h-12"
                src={CIRCLED_CHECKBOX}
                alt="circled checkbox"
              />
              <Localized id="payment-confirmation-thanks-heading">
                <h2 className={h2classes}>Thank you!</h2>
              </Localized>
              <Localized
                id="payment-confirmation-thanks-subheading"
                vars={{ email, productName }}
              >
                <p
                  className={subheadingClasses}
                >{`A confirmation email has been sent to ${email} with details on how to get started with ${productName}.`}</p>
              </Localized>
            </>
          ) : (
            <>
              <img src={CHECKMARK_ICON} alt="checkmark icon" />
              <img src={EMAIL_SENT_ICON} alt="email sent icon" />
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

        <div className="pb-6 row-divider-grey-200">
          <Localized id="payment-confirmation-order-heading">
            <h3 className={h3classes}>Order details</h3>
          </Localized>
          <div className={bottomRowClasses}>
            <Localized
              id="payment-confirmation-invoice-number"
              vars={{ invoiceNumber: invoiceInfo.number }}
            >
              <p>Invoice #{invoiceInfo.number}</p>
            </Localized>
            <p>{new Date(invoiceInfo.date).toDateString()}</p>
          </div>
        </div>

        <div className="pb-6 row-divider-grey-200">
          <Localized id="payment-confirmation-details-heading-2">
            <h3 className={h3classes}>Payment information</h3>
          </Localized>
          <div className={bottomRowClasses}>
            <Localized
              id={`payment-confirmation-amount-${invoiceInfo.interval}`}
              vars={{
                amount: getLocalizedCurrency(
                  invoiceInfo.total,
                  invoiceInfo.currency
                ),
                intervalCount: invoiceInfo.intervalCount,
              }}
            >
              <p data-testid="plan-price">{invoiceInfo.total}</p>
            </Localized>

            <PaymentProviderDetails
              paymentProvider={paymentProvider}
              brand={brand}
              last4={last4}
            />
          </div>
        </div>

        {accountExists && (
          <div
            className="border-none flex flex-col justify-center mb-6"
            data-testid="options"
          >
            <a
              data-testid="download-link"
              // className="coupon-button"
              className="items-center bg-blue-500 text-white font-semibold flex justify-center my-8 h-12 no-underline w-100 rounded-md"
              href={downloadUrl}
            >
              {buttonLabel || 'Continue to download'}
            </a>
          </div>
        )}
      </section>
    </>
  );
}
