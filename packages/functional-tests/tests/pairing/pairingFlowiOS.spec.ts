/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * iOS pairing flow E2E test.
 *
 * Coordinates Marionette (authority / desktop Firefox) with an iOS Simulator
 * (supplicant / Firefox iOS) to exercise the full cross-device pairing flow.
 *
 *   Authority (Marionette)          Supplicant (iOS Simulator)
 *   ---------------------           --------------------------
 *   1. Sign in to FxA via OAuth
 *   2. FxAccountsPairingFlow.start()
 *      -> generates QR URL
 *                                   3. XCUITest reads PAIRING_URL env var
 *                                   4. Tap "Scan QR Code" -> URL input fallback
 *                                   5. Paste URL -> Connect
 *                                   6. App runs native pairing via WKWebView
 *   7. Navigate to approval page
 *   8. Click "Yes, approve device"
 *                                   9. OAuth complete -> sync starts
 *
 * Prerequisites:
 *   - FXA stack running (auth :9000, content :3030)
 *   - Firefox binary (FIREFOX_BINARY env)
 *   - Firefox iOS built for Simulator (xcodebuild build-for-testing)
 *   - iOS Simulator booted (xcrun simctl boot "iPhone 16")
 *   - FIREFOX_IOS_PROJECT_DIR env pointing to firefox-ios checkout
 *
 * Set PAIRING_DEBUG=1 for verbose debug output.
 */

import { test, expect } from '../../lib/fixtures/pairing';
import { spawn, execSync, ChildProcess } from 'child_process';
import path from 'path';
import {
  signInAuthorityViaMarionette,
  getSignedInUser,
  startPairingFlow,
  buildAuthorityOAuthUrl,
  extractChannelId,
  findElementBySelectors,
  screenshotAuthority,
  isPairRoutesReact,
  waitForUrlContaining,
  captureDiagnostics,
  sleep,
} from '../../lib/pairing-helpers';
import { SELECTORS } from '../../lib/pairing-constants';

const DEBUG = !!process.env.PAIRING_DEBUG;
const debug = (msg: string) => DEBUG && console.log(`[iOS-PAIRING] ${msg}`);

const FIREFOX_IOS_PROJECT_DIR =
  process.env.FIREFOX_IOS_PROJECT_DIR || '/Users/vijaybudham/Desktop/working2/firefox-ios';
const IOS_DESTINATION =
  process.env.IOS_DESTINATION || 'platform=iOS Simulator,name=iPhone 16,OS=18.0';

/**
 * Find an existing .xctestrun file from a prior `build-for-testing`.
 * Returns the path if found, undefined otherwise.
 */
function findXctestrun(): string | undefined {
  try {
    const result = execSync(
      'find ~/Library/Developer/Xcode/DerivedData/Client-*/Build/Products -name "*.xctestrun" -maxdepth 1 2>/dev/null | head -1',
      { encoding: 'utf8' }
    ).trim();
    return result || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Patch the xctestrun file in-place with env vars injected.
 *
 * XCUITest runs in a sandboxed process — env vars from the host xcodebuild
 * process are NOT inherited. We inject them into the xctestrun plist's
 * EnvironmentVariables section so xcodebuild passes them to the test runner.
 *
 * The xctestrun must stay in its original directory because it references
 * test products via relative paths.
 */
function patchXctestrun(
  xctestrunPath: string,
  envVars: Record<string, string>
): void {
  for (const [key, value] of Object.entries(envVars)) {
    // Use PlistBuddy to inject each env var into the test target's EnvironmentVariables
    execSync(
      `/usr/libexec/PlistBuddy -c "Add :TestConfigurations:0:TestTargets:0:EnvironmentVariables:${key} string ${value}" "${xctestrunPath}" 2>/dev/null || ` +
      `/usr/libexec/PlistBuddy -c "Set :TestConfigurations:0:TestTargets:0:EnvironmentVariables:${key} ${value}" "${xctestrunPath}"`
    );
  }
  debug(`Patched xctestrun with env vars: ${Object.keys(envVars).join(', ')}`);
}

/**
 * Launch the iOS XCUITest that drives the supplicant side of pairing.
 *
 * Uses `test-without-building` if a pre-built xctestrun exists (fast),
 * otherwise falls back to `test` which compiles first (slow).
 *
 * Environment variables are injected into the xctestrun plist so they
 * reach the sandboxed XCUITest runner process.
 */
function launchXCUITest(
  pairingUrl: string,
  customFxAServer: string
): { process: ChildProcess; promise: Promise<void> } {
  const xctestrun = findXctestrun();
  let args: string[];

  if (xctestrun) {
    patchXctestrun(xctestrun, {
      PAIRING_URL: pairingUrl,
      CUSTOM_FXA_SERVER: customFxAServer,
    });
    debug(`Using pre-built xctestrun: ${xctestrun}`);
    args = [
      'test-without-building',
      '-xctestrun', xctestrun,
      '-destination', IOS_DESTINATION,
      '-only-testing:XCUITests/PairingTests/testPairingWithUrl',
    ];
  } else {
    debug('No xctestrun found, falling back to xcodebuild test (will compile)');
    args = [
      'test',
      '-project', path.join('firefox-ios', 'Client.xcodeproj'),
      '-scheme', 'Fennec',
      '-destination', IOS_DESTINATION,
      '-testPlan', 'SyncIntegrationTestPlan',
      '-only-testing:XCUITests/PairingTests/testPairingWithUrl',
    ];
  }

  // Always pipe so we can parse test results; mirror to console in debug mode.
  const proc = spawn('xcodebuild', args, {
    cwd: FIREFOX_IOS_PROJECT_DIR,
    env: {
      ...process.env,
      PAIRING_URL: pairingUrl,
      CUSTOM_FXA_SERVER: customFxAServer,
    },
    stdio: 'pipe',
  });

  let output = '';
  proc.stdout?.on('data', (chunk: Buffer) => {
    const text = chunk.toString();
    output += text;
    if (DEBUG) process.stdout.write(text);
  });
  proc.stderr?.on('data', (chunk: Buffer) => {
    const text = chunk.toString();
    output += text;
    if (DEBUG) process.stderr.write(text);
  });

  const promise = new Promise<void>((resolve, reject) => {
    proc.on('close', (code) => {
      // xcodebuild may return exit code 65 even when all tests pass
      // (infrastructure/coverage issues). Check actual test results.
      const testsPassed = output.includes("Test Suite 'Selected tests' passed");
      if (code === 0 || testsPassed) {
        debug(`xcodebuild exited with code ${code}, tests passed: ${testsPassed}`);
        resolve();
      } else {
        reject(new Error(
          `xcodebuild exited with code ${code}. ` +
          `Last 500 chars: ${output.slice(-500)}`
        ));
      }
    });
    proc.on('error', (err) => {
      reject(new Error(`Failed to launch xcodebuild: ${err.message}`));
    });
  });

  return { process: proc, promise };
}

// 4 min — includes xcodebuild launch + 45s wait for iOS app + pairing flow
test.setTimeout(240_000);

test.describe('severity-2 #smoke', () => {
  test.describe.serial('iOS pairing flow', () => {
    test.slow();

    // iOS pairing tests require Marionette + local FXA stack + iOS Simulator
    test.beforeEach(async ({ target }, testInfo) => {
      if (testInfo.project.name !== 'local') {
        testInfo.skip(true, 'iOS pairing tests only run on the local (Firefox) project');
      }
      if (!process.env.IOS_PAIRING_ENABLED) {
        testInfo.skip(true, 'Set IOS_PAIRING_ENABLED=1 to run iOS pairing tests');
      }
    });

    test('authority generates QR URL and iOS supplicant connects', async ({
      target,
      testAccountTracker,
      marionetteAuthority,
    }) => {
      const client = marionetteAuthority.client;
      const useReact = await isPairRoutesReact(target.contentServerUrl);

      // 1. Create account + sign in authority
      const credentials = await test.step('Create test account', async () => {
        const creds = await testAccountTracker.signUp();
        debug(`Account created: ${creds.email}`);
        return creds;
      });

      const signedInUser = await test.step('Sign in authority via Marionette', async () => {
        await signInAuthorityViaMarionette(
          client,
          target.contentServerUrl,
          credentials.email,
          credentials.password,
          undefined,
          useReact
        );
        const user = await getSignedInUser(client);
        expect(user.signedIn).toBe(true);
        expect(user.email).toBe(credentials.email);
        await screenshotAuthority(client, 'iOS', '1-signed-in');
        return user;
      });

      // 2. Start pairing flow -> QR URL
      const { pairUrl, channelId } = await test.step('Start pairing flow on authority', async () => {
        const url = await startPairingFlow(client);
        debug(`Pair URL: ${url}`);
        expect(url).toBeTruthy();
        expect(url).toContain('/pair#');
        expect(url).toContain('channel_id=');

        const id = extractChannelId(url);
        expect(id).toBeTruthy();
        return { pairUrl: url, channelId: id };
      });

      // 3. Launch iOS supplicant in background
      const xcuitest = await test.step('Launch iOS supplicant', async () => {
        const result = launchXCUITest(pairUrl, target.contentServerUrl);
        debug('Launched xcodebuild for iOS supplicant');
        return result;
      });

      // 4. Wait for supplicant to connect, then approve on authority
      await test.step('Authority approves pairing', async () => {
        expect(signedInUser.uid).toBeTruthy();
        const authorityOAuthUrl = buildAuthorityOAuthUrl(
          target.contentServerUrl,
          {
            email: credentials.email,
            uid: signedInUser.uid as string,
            channelId,
          },
          useReact
        );

        await client.setContext('content');

        // The iOS app needs time to: boot (~10s) + navigate UI (~5s) +
        // enter URL + tap Connect (~5s) + Rust FxA beginPairingFlow (~10s).
        // Total ~30-40s. Use 45s to be safe.
        debug('Waiting 45s for iOS app to boot and connect to channel...');
        await sleep(45_000);

        debug(`Navigating authority to: ${authorityOAuthUrl}`);
        await client.navigate(authorityOAuthUrl);

        // Wait for the page to settle and check we're not already at failure
        await sleep(3_000);
        const { url: preApproveUrl } = await captureDiagnostics(client);
        debug(`Authority URL before approve: ${preApproveUrl}`);
        await screenshotAuthority(client, 'iOS', '2-auth-approve');

        if (preApproveUrl.includes('pair/failure')) {
          throw new Error(
            `Authority reached /pair/failure before approve. ` +
            `Supplicant likely did not connect to channel in time.`
          );
        }

        const approveBtn = await findElementBySelectors(
          client,
          SELECTORS.AUTHORITY_APPROVE,
          30_000 // longer timeout — supplicant may still be connecting
        );
        await client.clickElement(approveBtn);
        debug('Authority approved pairing');
        await screenshotAuthority(client, 'iOS', '3-auth-approved');
      });

      // 5. Wait for authority to reach completion page
      await test.step('Verify authority completion', async () => {
        // After approve, authority should navigate through:
        //   /pair/auth/allow -> /pair/auth/wait_for_supp -> /pair/auth/complete
        // Give 30s for the supplicant to complete OAuth.
        const finalUrl = await waitForUrlContaining(
          client,
          'pair/auth/complete',
          30_000
        );
        expect(finalUrl).not.toContain('pair/failure');
        debug(`Authority completed at: ${finalUrl}`);
        await screenshotAuthority(client, 'iOS', '4-auth-complete');
      });

      // 6. Wait for iOS XCUITest to finish
      await test.step('Wait for iOS XCUITest completion', async () => {
        await xcuitest.promise;
        debug('iOS pairing test completed successfully');
      });
    });
  });
});
