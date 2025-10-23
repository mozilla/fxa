/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState } from 'react';
import { useDynamicLocalization } from '../../contexts/DynamicLocalizationContext';
import {
  getAvailableLocales,
  isRTLLocale,
  isUsingBrowserDefault,
  LOCALE_MAPPINGS,
  LocaleOption,
} from '../locales';

export interface LocaleManager {
  currentLocale: string;
  currentLanguage: LocaleOption | undefined;
  availableLocales: LocaleOption[];
  switchLocale: (newLocale: string) => Promise<void>;
  clearLocalePreference: () => Promise<void>;
  isUsingBrowserDefault: boolean;
  isRTL: boolean;
  isLoading: boolean;
}

export const useLocaleManager = (): LocaleManager => {
  const { currentLocale, switchLanguage, clearLanguagePreference, isLoading } =
    useDynamicLocalization();
  const [availableLocales] = useState<LocaleOption[]>(() =>
    getAvailableLocales()
  );

  const currentLanguage = LOCALE_MAPPINGS[currentLocale];
  const isRTL = isRTLLocale(currentLocale);
  const browserDefault = isUsingBrowserDefault();

  return {
    currentLocale,
    currentLanguage,
    availableLocales,
    switchLocale: switchLanguage,
    clearLocalePreference: clearLanguagePreference,
    isUsingBrowserDefault: browserDefault,
    isRTL,
    isLoading,
  };
};
