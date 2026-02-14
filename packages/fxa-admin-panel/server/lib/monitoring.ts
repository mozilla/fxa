/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Config from '../config';
import mozLog from 'mozlog';
import { initMonitoring } from '@fxa/shared/monitoring';
import { version } from '../../package.json';

const config = Config.getProperties();
const log = mozLog(config.logging)(config.logging.app);
initMonitoring({
  log,
  config: {
    ...config,
    release: version,
  },
});
