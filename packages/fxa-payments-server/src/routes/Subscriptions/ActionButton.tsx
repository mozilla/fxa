/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useContext } from 'react';
import { Localized } from '@fluent/react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { Customer } from '../../store/types';
import AppContext from '../../lib/AppContext';

import * as PaymentProvider from '../../lib/PaymentProvider';
import { lastEventId } from '@sentry/browser';

export type ActionButtonProps = {
  customer: Customer;
  onRevealUpdateClick: () => void;
  revealFixPaymentModal: () => void;
};

export const ActionButton = ({
  customer,
  onRevealUpdateClick,
  revealFixPaymentModal,
}: ActionButtonProps) => {
  let {
    billing_agreement_id,
    payment_provider,
    paypal_payment_error,
  } = customer;

  // billing_agreement_id = null;
  paypal_payment_error = 'funding_source';

  const { config } = useContext(AppContext);

  const { apiUrl } = config.paypal;

  const stripeActionButton = () => (
    <button
      data-testid="reveal-payment-update-button"
      className="settings-button"
      onClick={onRevealUpdateClick}
    >
      <Localized id="pay-update-change-btn">
        <span className="change-button" data-testid="change-button">
          Change
        </span>
      </Localized>
    </button>
  );

  const paypalActionButton = () => (
    <Localized id="pay-update-change-btn">
      <LinkExternal
        data-testid="change-payment-update-button"
        className="settings-button"
        href={`${apiUrl}/myaccount/autopay/connect/${billing_agreement_id}`}
      >
        <span className="change-button" data-testid="change-button">
          Change
        </span>
      </LinkExternal>
    </Localized>
  );

  const paypalFundingSourceActionButton = () => (
    <LinkExternal
      data-testid="manage-payment-update-button"
      className="settings-button error-button"
      href={`${apiUrl}/myaccount/autopay/connect/${billing_agreement_id}`}
    >
      <Localized id="pay-update-manage-btn">
        <span className="manage-button" data-testid="manage-button">
          Manage
        </span>
      </Localized>
    </LinkExternal>
  );

  const paypalMissingAgreementActionButton = () => (
    <button
      data-testid="reveal-payment-modal-button"
      className="settings-button error-button"
      onClick={revealFixPaymentModal}
    >
      <Localized id="pay-update-manage-btn">
        <span className="manage-button" data-testid="manage-button">
          Manage
        </span>
      </Localized>
    </button>
  );

  const setActionButton = () => {
    if (PaymentProvider.isStripe(payment_provider)) {
      return stripeActionButton();
    }
    switch (paypal_payment_error) {
      case 'missing_agreement': {
        return paypalMissingAgreementActionButton();
      }
      case 'funding_source': {
        return paypalFundingSourceActionButton();
      }
      default: {
        return paypalActionButton();
      }
    }
  };

  return <div className="action">{setActionButton()}</div>;
};

export default ActionButton;
