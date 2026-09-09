/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { resetFeatureFlags } from '@fxa/shared/feature-flags';
import { FeatureFlagsProvider, useFeatureFlag } from './FeatureFlagsContext';

const Probe = () => (
  <span>{useFeatureFlag('my-test-flag') ? 'on' : 'off'}</span>
);

function mockFlagResponse(flags: string[]) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => flags,
  }) as any;
}

describe('FeatureFlagsContext', () => {
  afterEach(() => {
    resetFeatureFlags();
    jest.restoreAllMocks();
  });

  it('reports a flag as on once the list arrives', async () => {
    mockFlagResponse(['my-test-flag']);

    render(
      <FeatureFlagsProvider>
        <Probe />
      </FeatureFlagsProvider>
    );

    expect(await screen.findByText('on')).toBeInTheDocument();
  });

  it('reports off for a flag absent from the list', async () => {
    mockFlagResponse(['some-other-flag']);

    render(
      <FeatureFlagsProvider>
        <Probe />
      </FeatureFlagsProvider>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.getByText('off')).toBeInTheDocument();
  });

  it('reports off while the request is in flight', () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {})) as any;

    render(
      <FeatureFlagsProvider>
        <Probe />
      </FeatureFlagsProvider>
    );

    expect(screen.getByText('off')).toBeInTheDocument();
  });

  it('reports off when the request fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as any;

    render(
      <FeatureFlagsProvider>
        <Probe />
      </FeatureFlagsProvider>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.getByText('off')).toBeInTheDocument();
  });

  it('reports off with no provider mounted', () => {
    render(<Probe />);

    expect(screen.getByText('off')).toBeInTheDocument();
  });
});
