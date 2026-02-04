/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Jest global teardown for integration tests.
 * Stops the mail_helper child process after all tests complete.
 */

import fs from 'fs';
import path from 'path';

const AUTH_SERVER_ROOT = path.resolve(__dirname, '../..');
const MAIL_HELPER_PID_FILE = path.join(AUTH_SERVER_ROOT, 'test', 'support', '.tmp', 'mail_helper.pid');

export default async function globalTeardown() {
  console.log('[Jest Global Teardown] Stopping mail_helper...');

  try {
    if (fs.existsSync(MAIL_HELPER_PID_FILE)) {
      const pid = parseInt(fs.readFileSync(MAIL_HELPER_PID_FILE, 'utf-8'), 10);

      if (pid) {
        try {
          process.kill(pid, 'SIGTERM');
          console.log('[Jest Global Teardown] mail_helper stopped (PID:', pid, ')');
        } catch (e: any) {
          if (e.code !== 'ESRCH') {
            // ESRCH = process not found (already dead)
            console.error('[Jest Global Teardown] Error killing mail_helper:', e.message);
          }
        }
      }

      // Clean up PID file
      fs.unlinkSync(MAIL_HELPER_PID_FILE);
    } else {
      console.log('[Jest Global Teardown] No mail_helper PID file found');
    }
  } catch (error) {
    console.error('[Jest Global Teardown] Error:', error);
  }
}
