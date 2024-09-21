/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { mapSession } from './mapSession';

describe('mapSession', () => {
  it('should map the values if present', () => {
    const result = mapSession(
      { entrypoint: 'entrypoint', flow_id: 'flow id' },
      'desktop'
    );
    expect(result).toEqual({
      session_device_type: 'desktop',
      session_entrypoint_experiment: '',
      session_entrypoint_variation: '',
      session_entrypoint: 'entrypoint',
      session_flow_id: 'flow id',
    });
  });

  it('should return empty strings if values are not present', () => {
    const result = mapSession({}, 'desktop');
    expect(result).toEqual({
      session_device_type: 'desktop',
      session_entrypoint_experiment: '',
      session_entrypoint_variation: '',
      session_entrypoint: '',
      session_flow_id: '',
    });
  });
});
