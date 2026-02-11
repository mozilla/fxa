/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Localized, LocalizedProps, useLocalization } from '@fluent/react';
import { ReactElement } from 'react';

type SwitchProps = {
  isSubmitting: boolean;
  isOn: boolean;
  handler: () => void;
  id: string;
  localizedLabel: ReactElement<LocalizedProps>;
};

export const Switch = ({
  isSubmitting,
  isOn,
  handler,
  id,
  localizedLabel,
}: SwitchProps) => {
  const { l10n } = useLocalization();

  return (
    <>
      <button
        role="switch"
        disabled={isSubmitting}
        aria-checked={isOn}
        {...{ id }}
        data-testid={id}
        className="switch"
        title={
          isSubmitting
            ? l10n.getString('switch-submitting', null, 'Submitting…')
            : isOn
            ? l10n.getString('switch-turn-off', null, 'Turn off')
            : l10n.getString('switch-turn-on', null, 'Turn on')
        }
        onClick={handler}
        type="button"
      >
        <span className="slider" />
        <span className="slider-status" data-testid="slider-status">
          <span className={isSubmitting ? 'invisible' : 'p-2'}>
            {isOn ? (
              <Localized id="switch-is-on">on</Localized>
            ) : (
              <Localized id="switch-is-off">off</Localized>
            )}
          </span>
        </span>
      </button>
      <label htmlFor={id} className="sr-only">
        {localizedLabel}
      </label>
    </>
  );
};

export default Switch;
