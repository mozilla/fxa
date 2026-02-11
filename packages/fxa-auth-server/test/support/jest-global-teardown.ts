/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import path from 'path';

const AUTH_SERVER_ROOT = path.resolve(__dirname, '../..');
const MAIL_HELPER_PID_FILE = path.join(AUTH_SERVER_ROOT, 'test', 'support', '.tmp', 'mail_helper.pid');

interface NodeError extends Error {
  code?: string;
}

export default async function globalTeardown(): Promise<void> {
  console.log('[Jest Global Teardown] Stopping mail_helper...');

  try {
    if (!fs.existsSync(MAIL_HELPER_PID_FILE)) {
      console.log('[Jest Global Teardown] No mail_helper PID file found');
      return;
    }

    const pid = parseInt(fs.readFileSync(MAIL_HELPER_PID_FILE, 'utf-8'), 10);

    if (pid) {
      try {
        process.kill(pid, 'SIGTERM');
        console.log('[Jest Global Teardown] mail_helper stopped (PID:', pid, ')');
      } catch (err: unknown) {
        const isProcessGone = (err as NodeError).code === 'ESRCH';
        if (!isProcessGone) {
          console.error('[Jest Global Teardown] Error killing mail_helper:', err);
        }
      }
    }

    fs.unlinkSync(MAIL_HELPER_PID_FILE);
  } catch (err) {
    console.error('[Jest Global Teardown] Error:', err);
  }
}
