/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { LocalizeOptions } from '../../l10n/localizeTimestamp';

export type ClientFormatterConfig = {
  i18n: LocalizeOptions;
  lastAccessTimeUpdates: {
    earliestSaneTimestamp: number;
  };
};
