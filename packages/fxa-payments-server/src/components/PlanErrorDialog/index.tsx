import React from 'react';
import { Localized } from '@fluent/react';

import DialogMessage from '../../components/DialogMessage';
import FetchErrorDialogMessage from '../../components/FetchErrorDialogMessage';
import { AuthServerErrno } from '../../lib/errors';
import { SelectorReturns } from '../../store/selectors';

type PlanErrorDialogProps = {
  locationReload: () => void;
  plans: SelectorReturns['plans'];
};

export const PlanErrorDialog = ({
  locationReload,
  plans,
}: PlanErrorDialogProps) => {
  const ariaLabelledBy = 'plan-error-header';
  const ariaDescribedBy = 'plan-error-description';

  if (!plans.result || plans.error !== null) {
    if (plans.error?.errno === AuthServerErrno.UNSUPPORTED_LOCATION) {
      return (
        <DialogMessage
          className="dialog-error"
          onDismiss={locationReload}
          headerId="product-location-unsupported-error-title"
          descId="product-location-unsupported-error-text"
        >
          <Localized id="product-location-unsupported-error">
            <h4
              id="product-location-unsupported-error-title"
              data-testid="product-location-unsupported-error"
            >
              Location not supported
            </h4>
          </Localized>
          <Localized id="location-unsupported">
            <p id="product-location-unsupported-error-text">
              Your current location is not supported according to our Terms of
              Service.
            </p>
          </Localized>
        </DialogMessage>
      );
    }
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
        <p id={ariaDescribedBy} data-testid="no-such-plan-error">
          No such plan for this product.
        </p>
      </Localized>
    </DialogMessage>
  );
};

export default PlanErrorDialog;
