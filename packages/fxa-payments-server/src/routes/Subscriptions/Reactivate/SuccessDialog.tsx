import React, { useContext } from 'react';
import { Plan } from '../../../store/types';
import { webIconConfigFromProductConfig } from 'fxa-shared/subscriptions/configuration/helpers';
import Modal from 'fxa-react/components/Modal';
import fpnImage from '../../../images/fpn';
import { Localized } from '@fluent/react';
import AppContext from '../../../lib/AppContext';

const SuccessDialog = ({
  plan,
  onDismiss,
}: {
  plan: Plan;
  onDismiss: () => void;
}) => {
  const { navigatorLanguages, config } = useContext(AppContext);
  const { product_name: productName } = plan;
  const { webIcon, webIconBackground } = webIconConfigFromProductConfig(
    plan,
    navigatorLanguages,
    config.featureFlags.useFirestoreProductConfigs
  );

  const setWebIconBackground = webIconBackground
    ? { background: webIconBackground }
    : '';

  return (
    <Modal
      onDismiss={onDismiss}
      data-testid="reactivate-subscription-success-dialog"
    >
      <div className="dialog-icon" style={{ ...setWebIconBackground }}>
        <img
          alt={productName}
          src={webIcon || fpnImage}
          width="48"
          height="48"
        />
      </div>
      <p
        data-testid="reactivate-subscription-success"
        className="reactivate-subscription-success"
      >
        <Localized id="reactivate-success-copy">
          Thanks! You're all set.
        </Localized>
      </p>
      <button
        className="settings-button"
        onClick={onDismiss}
        data-testid="reactivate-subscription-success-button"
      >
        <Localized id="reactivate-success-button">Close</Localized>
      </button>
    </Modal>
  );
};

export default SuccessDialog;
