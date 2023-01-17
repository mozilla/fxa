import { useState, useEffect } from 'react';
import { Localized } from '@fluent/react';
import useValidatorState from '../../lib/validator';
import { Checkbox, Form } from '../fields';
import NewUserEmailForm from './NewUserEmailForm';

const TERMS_OF_SERVICE_URL =
  'https://www.mozilla.org/about/legal/terms/subscription-services';
const PRIVACY_NOTICE_URL =
  'https://www.mozilla.org/privacy/subscription-services';

type AccountsInfoProps = {
  signInUrl: string;
  setPaymentsDisabled: (disabled: boolean) => void;
};

export default function AccountsInfo(props: AccountsInfoProps) {
  const { signInUrl, setPaymentsDisabled } = props;
  const [emailOk, setEmailOk] = useState(false);
  const [checkboxAuthorization, setCheckboxAuthorization] = useState(false);
  const checkboxValidator = useValidatorState();
  const voidFn = () => '';
  const checkAccountExistsTrue = async (email: string) => {
    if (email === 'bad@example.com') {
      return {
        exists: false,
        invalidDomain: true,
      };
    } else if (email === 'exists@example.com') {
      return {
        exists: true,
        invalidDomain: false,
      };
    } else {
      return {
        exists: false,
        invalidDomain: false,
      };
    }
  };

  useEffect(() => {
    if (emailOk && checkboxAuthorization) {
      setPaymentsDisabled(false);
    } else {
      setPaymentsDisabled(true);
    }
  }, [emailOk, checkboxAuthorization, setPaymentsDisabled]);

  return (
    <div>
      <Localized id="new-user-step-1">
        <h2 className="step-header">1. Create a Firefox account</h2>
      </Localized>
      <NewUserEmailForm
        signInURL={signInUrl}
        checkAccountExists={checkAccountExistsTrue}
        onToggleNewsletterCheckbox={voidFn}
        setEmailOk={setEmailOk}
      />
      <Localized id="payment-method-header-second-step">
        <h2 className="step-header" data-testid="header-prefix">
          2. Choose your payment method
        </h2>
      </Localized>
      <Localized id="payment-method-required">
        <strong>Required</strong>
      </Localized>
      <Form validator={checkboxValidator}>
        <Localized
          id="payment-confirm-with-legal-links-static"
          elems={{
            termsOfServiceLink: (
              <a href={TERMS_OF_SERVICE_URL}>Terms of Service</a>
            ),
            privacyNoticeLink: <a href={PRIVACY_NOTICE_URL}>Privacy Notice</a>,
          }}
        >
          <Checkbox
            name="confirm"
            data-testid="confirm"
            onClick={() => setCheckboxAuthorization(!checkboxAuthorization)}
            required
          >
            I authorize Mozilla, maker of Firefox products, to charge my payment
            method for the amount shown, according to{' '}
            <a href={TERMS_OF_SERVICE_URL}>Terms of Service</a> and{' '}
            <a href={PRIVACY_NOTICE_URL}>Privacy Notice</a>, until I cancel my
            subscription.
          </Checkbox>
        </Localized>
      </Form>
    </div>
  );
}
