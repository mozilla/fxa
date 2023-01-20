import React from 'react';
import { Localized } from '@fluent/react';

import { PaymentMethodHeaderType, Plan } from '../../lib/types';

import AcceptedCards from '../AcceptedCards';
import { PaymentMethodHeader } from '../PaymentMethodHeader';
import { Input } from '../fields';
import LockImage from '../../images/lock.svg';

export type ChoosePaymentProps = {
  paypalScriptLoaded: boolean;
  selectedPlan: Plan;
  onClick: (event: React.MouseEvent<HTMLInputElement>) => void;
  type?: PaymentMethodHeaderType;
};

const ChoosePayment = ({
  paypalScriptLoaded,
  selectedPlan,
  onClick,
}: ChoosePaymentProps) => {
  return (
    <>
      <PaymentMethodHeader
        plan={selectedPlan}
        onClick={onClick}
        type={PaymentMethodHeaderType.SecondStep}
      />

      <>
        {paypalScriptLoaded ? (
          <>
            {/* <div data-testid="pay-with-other">
              <Suspense fallback={<div>Loading...</div>}>
                <PaypalButton
                  beforeCreateOrder={beforePaypalCreateOrder}
                  customer={null}
                  disabled={
                    !checkboxSet ||
                    validEmail === '' ||
                    accountExists ||
                    invalidEmailDomain ||
                    !emailsMatch
                  }
                  idempotencyKey={submitNonce}
                  newPaypalAgreement={true}
                  selectedPlan={selectedPlan}
                  refreshSubmitNonce={refreshSubmitNonce}
                  postSubscriptionAttemptPaypalCallback={
                    postSubscriptionAttemptPaypalCallback
                  }
                  setSubscriptionError={setSubscriptionError}
                  setTransactionInProgress={setTransactionInProgress}
                  ButtonBase={paypalButtonBase}
                  promotionCode={coupon?.promotionCode}
                />
              </Suspense>
            </div> */}

            <Localized id="pay-with-heading-card-or">
              <p className="pay-with-heading">Or pay with card</p>
            </Localized>
          </>
        ) : (
          <Localized id="pay-with-heading-card-only">
            <p className="pay-with-heading">Pay with card</p>
          </Localized>
        )}

        <AcceptedCards />
      </>

      <div>
        <Localized id="new-user-card-title">
          <div className="label-title">Enter your card information</div>
        </Localized>

        <Localized id="payment-name" attrs={{ placeholder: true, label: true }}>
          <Input
            type="text"
            name="name"
            label="Name as it appears on your card"
            data-testid="name"
            placeholder="Full Name"
            required
            spellCheck={false}
            // onValidate={(value, focused, props) =>
            //   validateName(value, focused, props, getString)
            // }
          />
        </Localized>

        <Localized id="payment-cc" attrs={{ label: true }}>
          <Input
            name="creditCard"
            label="Your card"
            placeholder="Card Number"
            required
          />
        </Localized>
      </div>
      <div className="mb-5">
        <Localized id="payment-submit-btn">
          <button
            data-testid="submit"
            className="payment-button cta-primary !font-bold w-full mt-8 h-12"
            name="submit"
          >
            <div className="text-center">
              <img
                src={LockImage}
                className="h-4 w-4 my-0 mx-3 relative top-0.5"
                alt=""
              />
              <Localized id="subscribe-now">
                <span>Subscribe Now</span>
              </Localized>
            </div>
          </button>
        </Localized>
      </div>
    </>
  );
};

export default ChoosePayment;
