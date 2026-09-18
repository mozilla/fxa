/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Devices } from '../utilities';

/** The Firefox flavours pairing v2 rolls out to, one minimum version each. */
export type PairingPlatform = 'ios' | 'android' | 'desktop';

/**
 * Lowest Firefox major version, per platform, that takes the v2 flow. A
 * platform left out defers to the browser. See `pairing.v2_min_version`.
 */
export type PairingV2MinVersions = Partial<Record<PairingPlatform, number>>;

const PLATFORM_BY_DEVICE: Partial<Record<Devices, PairingPlatform>> = {
  [Devices.FIREFOX_IOS]: 'ios',
  [Devices.FIREFOX_ANDROID]: 'android',
  [Devices.FIREFOX_DESKTOP]: 'desktop',
};

/** Which Firefox `device` is, or undefined when it is not Firefox at all. */
export function getPairingPlatform(
  device: Devices
): PairingPlatform | undefined {
  return PLATFORM_BY_DEVICE[device];
}

/**
 * Major version of the Firefox behind `userAgent`. Firefox iOS identifies
 * itself with an `FxiOS/` token and carries no `Firefox/` token; desktop and
 * Android carry `Firefox/` alone. Reading the token for `platform` rather than
 * whichever is present keeps a spoofed or hybrid UA from passing as the wrong
 * flavour.
 */
export function getFirefoxMajorVersion(
  userAgent: string,
  platform: PairingPlatform
): number | undefined {
  const token = platform === 'ios' ? /FxiOS\/(\d+)/i : /Firefox\/(\d+)/i;
  const match = userAgent.match(token);
  return match ? parseInt(match[1], 10) : undefined;
}

export type PairingV2Config = {
  version: number;
  v2MinVersion?: PairingV2MinVersions;
};

/**
 * The minimum configured for `platform`, or undefined when the deployment has
 * not rolled v2 out to it. A minimum that did not survive the trip from convict
 * (NaN serialises to null) counts as unset rather than as "nobody qualifies".
 */
function getPairingV2MinVersion(
  pairing: PairingV2Config,
  platform: PairingPlatform
): number | undefined {
  const minVersion = pairing.v2MinVersion?.[platform];
  return typeof minVersion === 'number' && Number.isFinite(minVersion)
    ? minVersion
    : undefined;
}

/**
 * Whether the deployment has rolled pairing v2 out to `platform` at all, i.e.
 * some version of that Firefox takes the v2 flow on its own say-so. This is
 * what makes handing a pairing URL to the Firefox iOS app worth doing: before
 * the rollout the app can only land on /pair/unsupported.
 */
export function isPairingV2RolledOut(
  pairing: PairingV2Config,
  platform: PairingPlatform
): boolean {
  return (
    pairing.version === 2 &&
    getPairingV2MinVersion(pairing, platform) !== undefined
  );
}

/**
 * Whether this browser takes the pairing v2 flow.
 *
 * `pairing.version` is the deployment-wide switch. Beneath it each Firefox
 * platform rolls out on its own: when `v2MinVersion` names the browser's
 * platform, the major version in its user agent decides, so the rollout is
 * FxA's to control and does not wait on Firefox shipping a flipped
 * `identity.fxaccounts.pairing.version` pref. A platform with no minimum, and
 * anything that is not Firefox, defers to the `pairingVersion` the browser
 * reported in fxa_status, which is how a local build opts in for testing.
 */
export function isPairingV2Enabled({
  pairing,
  device,
  userAgent,
  browserPairingVersion,
}: {
  pairing: PairingV2Config;
  device: Devices;
  userAgent: string;
  /** `capabilities.pairingVersion` from fxa_status; undefined until it answers. */
  browserPairingVersion?: number;
}): boolean {
  if (pairing.version !== 2) {
    return false;
  }

  const platform = getPairingPlatform(device);
  const minVersion = platform
    ? getPairingV2MinVersion(pairing, platform)
    : undefined;
  if (platform && minVersion !== undefined) {
    const major = getFirefoxMajorVersion(userAgent, platform);
    return major !== undefined && major >= minVersion;
  }

  return browserPairingVersion === 2;
}
