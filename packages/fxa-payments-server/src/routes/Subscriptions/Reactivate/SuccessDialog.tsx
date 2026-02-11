import React, { useContext } from 'react';
import { Plan } from '../../../store/types';
import { webIconConfigFromProductConfig } from 'fxa-shared/subscriptions/configuration/utils';
import DialogMessage from '../../../components/DialogMessage';
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

  const ariaLabelledBy = 'reactivate-subscription-success-header';
  const ariaDescribedBy = 'reactivate-subscription-success-description';

  const setWebIconBackground = webIconBackground
    ? { background: webIconBackground }
    : '';

  return (
    <DialogMessage
      onDismiss={onDismiss}
      data-testid="reactivate-subscription-success-dialog"
      headerId={ariaLabelledBy}
      descId={ariaDescribedBy}
    >
      <div
        id={ariaLabelledBy}
        className="dialog-icon"
        style={{ ...setWebIconBackground }}
      >
        <img
          alt={productName}
          src={webIcon || fpnImage}
          width="48"
          height="48"
        />
      </div>
      <p
        id={ariaDescribedBy}
        data-testid="reactivate-subscription-success"
        className="reactivate-subscription-success"
      >
        <Localized id="reactivate-success-copy">
          Thanks! You're all set.
        </Localized>
      </p>
      <button
        className="button settings-button"
        onClick={onDismiss}
        data-testid="reactivate-subscription-success-button"
      >
        <Localized id="reactivate-success-button">Close</Localized>
      </button>
    </DialogMessage>
  );
};

export default SuccessDialog;
