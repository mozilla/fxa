import React from 'react';
import { Localized } from '@fluent/react';

import DialogMessage from '../../components/DialogMessage';
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
  const ariaLabelledBy = "plan-error-header";
  const ariaDescribedBy = "plan-error-description";

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
    <DialogMessage
      className="dialog-error"
      headerId={ariaLabelledBy}
      descId={ariaDescribedBy}
    >
      <Localized id="product-plan-not-found">
        <h4 id={ariaLabelledBy}>Plan not found</h4>
      </Localized>
      <Localized id="product-no-such-plan">
        <p id={ariaDescribedBy} data-testid="no-such-plan-error">No such plan for this product.</p>
      </Localized>
    </DialogMessage>
  );
};

export default PlanErrorDialog;
