import { Localized } from '@fluent/react';
import useValidatorState from '../../lib/validator';
import { Checkbox, Form } from '../fields';
import NewUserEmailForm from './NewUserEmailForm';

export default function AccountsInfo() {
  const checkboxValidator = useValidatorState();
  const voidFn = () => '';
  const checkAccountExistsTrue = async (email: string) =>
    email === 'bad@example.com'
      ? {
          exists: false,
          invalidDomain: true,
        }
      : {
          exists: false,
          invalidDomain: false,
        };

  return (
    <div>
      <Localized id="new-user-step-1">
        <h2 className="step-header">1. Create a Firefox account</h2>
      </Localized>
      <NewUserEmailForm
        signInURL={''}
        setValidEmail={voidFn}
        setAccountExists={voidFn}
        setInvalidEmailDomain={voidFn}
        setEmailsMatch={voidFn}
        checkAccountExists={checkAccountExistsTrue}
        onToggleNewsletterCheckbox={voidFn}
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
            termsOfServiceLink: <a href={''}>Terms of Service</a>,
            privacyNoticeLink: <a href={''}>Privacy Notice</a>,
          }}
        >
          <Checkbox
            name="confirm"
            data-testid="confirm"
            onClick={() => console.log('click')}
            required
          >
            I authorize Mozilla, maker of Firefox products, to charge my payment
            method for the amount shown, according to{' '}
            <a href={''}>Terms of Service</a> and{' '}
            <a href={''}>Privacy Notice</a>, until I cancel my subscription.
          </Checkbox>
        </Localized>
      </Form>
    </div>
  );
}
