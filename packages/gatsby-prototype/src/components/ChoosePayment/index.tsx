import React from 'react';
import { Localized } from '@fluent/react';

import { PaymentMethodHeaderType, Plan } from '../../lib/types';

import AcceptedCards from '../AcceptedCards';
import { PaymentMethodHeader } from '../PaymentMethodHeader';

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

        {/* <PaymentForm
              {...{
                submitNonce,
                onSubmit: onStripeSubmit,
                onChange,
                submitButtonL10nId: 'new-user-submit',
                submitButtonCopy: 'Subscribe Now',
                shouldAllowSubmit:
                  checkboxSet &&
                  validEmail !== '' &&
                  !accountExists &&
                  !invalidEmailDomain &&
                  emailsMatch,

                inProgress,
                validatorInitialState,
                confirm: false,
                submit: true,
                plan: selectedPlan,
                onMounted: onFormMounted,
                onEngaged: onFormEngaged,
                promotionCode: coupon?.promotionCode,
              }}
            /> */}
      </div>
    </>
  );
};

export default ChoosePayment;
