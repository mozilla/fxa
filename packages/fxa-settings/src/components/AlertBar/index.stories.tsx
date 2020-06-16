/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { storiesOf } from '@storybook/react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { AlertBar } from '.';

storiesOf('Components|AlertBar', module)
  .add('with a short message', () => (
    <AlertBarToggle>
      {({ alertBarRevealed, hideAlertBar }) =>
        alertBarRevealed && (
          <AlertBar onDismiss={hideAlertBar}>
            <p>A short message.</p>
          </AlertBar>
        )
      }
    </AlertBarToggle>
  ))
  .add('with a long message', () => (
    <AlertBarToggle>
      {({ alertBarRevealed, hideAlertBar }) =>
        alertBarRevealed && (
          <AlertBar onDismiss={hideAlertBar}>
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
  alertBarRevealed: boolean;
  hideAlertBar: Function;
  showAlertBar: Function;
};
type AlertBarToggleProps = {
  children: (props: AlertBarToggleChildrenProps) => React.ReactNode | null;
};
const AlertBarToggle = ({ children }: AlertBarToggleProps) => {
  const [alertBarRevealed, showAlertBar, hideAlertBar] = useBooleanState(true);
  const onClick = useCallback(
    (ev: React.MouseEvent) => {
      ev.preventDefault();
      showAlertBar();
    },
    [showAlertBar]
  );
  return (
    <div>
      {children({ alertBarRevealed, showAlertBar, hideAlertBar })}
      {!alertBarRevealed && (
        <button {...{ onClick }}>Click to trigger alert bar</button>
      )}
    </div>
  );
};
