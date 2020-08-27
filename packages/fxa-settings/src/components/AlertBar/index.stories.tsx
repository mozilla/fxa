/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { AlertBar, AlertBarType } from '.';

storiesOf('Components|AlertBar', module)
  .add('with a short message', () => (
    <AlertBarToggle>
      {({ alertType, alertBarRevealed, hideAlertBar }) =>
        alertBarRevealed &&
        alertType && (
          <AlertBar onDismiss={hideAlertBar} type={alertType}>
            <p>A short message.</p>
          </AlertBar>
        )
      }
    </AlertBarToggle>
  ))
  .add('with a long message', () => (
    <AlertBarToggle>
      {({ alertType, alertBarRevealed, hideAlertBar }) =>
        alertBarRevealed &&
        alertType && (
          <AlertBar onDismiss={hideAlertBar} type={alertType}>
            <p>
              Cake toffee jujubes gummi bears cheesecake cotton candy chocolate
              cake. Soufflé toffee cupcake ice cream donut icing. Sweet pastry
              wafer cheesecake tiramisu. Dessert carrot cake topping danish
              macaroon tart halvah halvah gummies.
            </p>
          </AlertBar>
        )
      }
    </AlertBarToggle>
  ));

type AlertBarToggleChildrenProps = {
  alertType?: AlertBarType;
  alertBarRevealed: boolean;
  hideAlertBar: Function;
  showAlertBar: Function;
};
type AlertBarToggleProps = {
  children: (props: AlertBarToggleChildrenProps) => React.ReactNode | null;
};
const AlertBarToggle = ({ children }: AlertBarToggleProps) => {
  const [alertBarRevealed, showAlertBar, hideAlertBar] = useBooleanState(false);
  const [alertType, setAlertType] = useState<AlertBarType>();

  return (
    <div>
      {children({ alertType, alertBarRevealed, showAlertBar, hideAlertBar })}
      {!alertBarRevealed && (
        <>
          <button
            className="block cta-neutral"
            onClick={() => {
              setAlertType('success');
              showAlertBar();
            }}
          >
            Click to trigger a success alert bar
          </button>

          <button
            className="block cta-neutral"
            onClick={() => {
              setAlertType('info');
              showAlertBar();
            }}
          >
            Click to trigger an info alert bar
          </button>

          <button
            className="block cta-neutral"
            onClick={() => {
              setAlertType('error');
              showAlertBar();
            }}
          >
            Click to trigger an error alert bar
          </button>
        </>
      )}
    </div>
  );
};
