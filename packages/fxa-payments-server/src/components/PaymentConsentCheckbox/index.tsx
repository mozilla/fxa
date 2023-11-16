import React, { useContext, useEffect } from 'react';
import { Localized, useLocalization } from '@fluent/react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { urlsFromProductConfig } from 'fxa-shared/subscriptions/configuration/utils';

import AppContext from '../../lib/AppContext';
import { Plan } from '../../store/types';
import {
  Checkbox,
  OnValidateFunction,
  FormContext,
  FormContextValue,
} from '../fields';

export type PaymentConsentCheckboxProps = {
  plan: Plan;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
  showTooltip?: boolean;
};

export const PaymentConsentCheckbox = ({
  plan,
  onClick,
  showTooltip = false,
}: PaymentConsentCheckboxProps) => {
  const { navigatorLanguages, config } = useContext(AppContext);
  const { validator } = useContext(FormContext) as FormContextValue;
  const { termsOfService, privacyNotice } = urlsFromProductConfig(
    plan,
    navigatorLanguages,
    config.featureFlags.useFirestoreProductConfigs
  );
  const { l10n } = useLocalization();

  const errorMsg = l10n.getString(
    'payment-confirm-checkbox-error',
    null,
    'You need to complete this before moving forward'
  );

  useEffect(() => {
    if (showTooltip && !validator.getError('confirm')) {
      validator.updateField({
        name: 'confirm',
        value: false,
        valid: false,
        error: errorMsg,
      });
    }
  }, [validator, showTooltip, errorMsg]);

  const validateCheckbox: OnValidateFunction = (value, _focused, props) => {
    let valid = true;

    if (props.required && !value) {
      valid = false;
    }

    return {
      value,
      valid,
      error: valid ? null : errorMsg,
    };
  };

  return (
    <Localized
      id="payment-confirm-with-legal-links-static"
      elems={{
        termsOfServiceLink: (
          <LinkExternal href={termsOfService}>Terms of Service</LinkExternal>
        ),
        privacyNoticeLink: (
          <LinkExternal href={privacyNotice}>Privacy Notice</LinkExternal>
        ),
      }}
    >
      <Checkbox
        className="input-row input-row--checkbox cursor-pointer"
        name="confirm"
        data-testid="confirm"
        onClick={onClick}
        required
        tooltip={true}
        onValidate={(value, focused, props) =>
          validateCheckbox(value, focused, props)
        }
      >
        I authorize Mozilla, maker of Firefox products, to charge my payment
        method for the amount shown, according to{' '}
        <LinkExternal href={termsOfService}>Terms of Service</LinkExternal> and{' '}
        <LinkExternal href={privacyNotice}>Privacy Notice</LinkExternal>, until
        I cancel my subscription.
      </Checkbox>
    </Localized>
  );
};
