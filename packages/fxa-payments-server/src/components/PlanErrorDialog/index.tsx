import React from 'react';
import { Localized } from '@fluent/react';

import Modal from 'fxa-react/components/Modal';
import FetchErrorDialogMessage from '../../components/FetchErrorDialogMessage';

import { SelectorReturns } from '../../store/selectors';

type PlanErrorDialogProps = {
  locationReload: () => void;
  plans: SelectorReturns['plans'];
};

export const PlanErrorDialog = ({
  locationReload,
  plans,
}: PlanErrorDialogProps) => {
  if (!plans.result || plans.error !== null) {
    return (
      <Localized id="product-plan-error">
        <FetchErrorDialogMessage
          testid="error-loading-plans"
          title="Problem loading plans"
          fetchState={plans}
          onDismiss={locationReload}
        />
      </Localized>
    );
  }

  return (
    <Modal className="dialog-error" onDismiss={locationReload}>
      <Localized id="product-plan-not-found">
        <h4>Plan not found</h4>
      </Localized>
      <Localized id="product-no-such-plan">
        <p data-testid="no-such-plan-error">No such plan for this product.</p>
      </Localized>
    </Modal>
  );
};

export default PlanErrorDialog;
