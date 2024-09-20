/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { normalizeGleanFalsyValues } from './normalizeGleanFalsyValues';

const PLACEHOLDER_FUTURE_USE = '';

export function mapSession(
  searchParams: Record<string, string>,
  deviceType: string
) {
  return {
    session_device_type: deviceType,
    session_entrypoint_experiment: PLACEHOLDER_FUTURE_USE,
    session_entrypoint_variation: PLACEHOLDER_FUTURE_USE,
    session_entrypoint: normalizeGleanFalsyValues(searchParams['entrypoint']),
    session_flow_id: normalizeGleanFalsyValues(searchParams['flow_id']),
  };
}
