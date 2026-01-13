/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { forwardRef, useCallback, useState } from 'react';
import { useAlertBar, useFtlMsgResolver, useTheme } from '../../../models';
import Switch from '../Switch';
import UnitRow from '../UnitRow';
import { FtlMsg } from 'fxa-react/lib/utils';

export const DisplaySettings = forwardRef<HTMLDivElement>((_, ref) => {
  const { effectiveTheme, setThemePreference } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();

  const localizedHeader = (
    <FtlMsg id="display-settings-heading">Display Settings</FtlMsg>
  );

  const isDarkMode = effectiveTheme === 'dark';

  const handleDarkModeToggle = useCallback(() => {
    setIsSubmitting(true);
    try {
      const newTheme = isDarkMode ? 'light' : 'dark';
      setThemePreference(newTheme);

      const alertArgs: [string, string] = isDarkMode
        ? ['display-light-mode-enabled', 'Light mode enabled']
        : ['display-dark-mode-enabled', 'Dark mode enabled'];
      alertBar.success(ftlMsgResolver.getMsg.apply(ftlMsgResolver, alertArgs));
    } finally {
      setIsSubmitting(false);
    }
  }, [isDarkMode, setThemePreference, alertBar, ftlMsgResolver]);

  return (
    <section
      data-testid="settings-display"
      id="display-settings-section"
      {...{ ref }}
    >
      <h2 className="font-header font-bold mobileLandscape:ms-6 ms-4 mb-4 relative">
        <span id="display-settings" className="nav-anchor" />
        {localizedHeader}
      </h2>
      <div className="bg-white dark:bg-grey-700 tablet:rounded-xl shadow">
        <UnitRow
          header={ftlMsgResolver.getMsg('display-dark-mode', 'Dark mode')}
          hideHeaderValue
          actionContent={
            <Switch
              {...{
                isSubmitting,
                isOn: isDarkMode,
                id: 'dark-mode-toggle',
                handler: handleDarkModeToggle,
                localizedLabel: (
                  <FtlMsg id="display-dark-mode">Dark mode</FtlMsg>
                ),
              }}
            />
          }
        >
          <p>
            <FtlMsg id="display-dark-mode-description">
              Use a darker color scheme that's easier on your eyes in low light.
            </FtlMsg>
          </p>
        </UnitRow>
      </div>
    </section>
  );
});

export default DisplaySettings;
