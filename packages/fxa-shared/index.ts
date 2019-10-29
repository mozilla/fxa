/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as popularDomains from './email/popularDomains.json';
import BaseGroupingRule from './experiments/base';
import { localizeTimestamp } from './l10n/localizeTimestamp';
import * as supportedLanguages from './l10n/supportedLanguages.json';
import * as amplitude from './metrics/amplitude';
import * as scopes from './oauth/scopes';
import * as promise from './promise';
import * as redis from './redis';

module.exports = {
  email: {
    popularDomains,
  },
  experiments: {
    BaseGroupingRule,
  },
  l10n: {
    localizeTimestamp,
    supportedLanguages,
  },
  metrics: {
    amplitude,
  },
  oauth: {
    scopes,
  },
  promise,
  redis,
};
