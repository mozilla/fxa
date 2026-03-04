/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { usePageViewEvent } from '../../../lib/metrics';
import AppLayout from '../../../components/AppLayout';
import { REACT_ENTRYPOINT } from '../../../constants';
import Banner from '../../../components/Banner';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import config from '../../../lib/config';
import { Integration } from '../../../models';
import {
  PairingSupplicantIntegration,
  SupplicantState,
} from '../../../models/integrations/pairing-supplicant-integration';

// pair/supp is the gateway to the supplicant pairing flow.
// It opens the WebSocket channel via the integration (which persists across
// page transitions) and waits for connection + metadata before navigating
// to pair/supp/allow.
//
// URL format: /pair/supp?client_id=...&scope=...#channel_id=...&channel_key=...

export const viewName = 'pair.supp';

function parseHashParams(): { channelId?: string; channelKey?: string } {
  const hash = window.location.hash.substring(1);
  if (!hash) return {};
  const params = new URLSearchParams(hash);
  return {
    channelId: params.get('channel_id') || undefined,
    channelKey: params.get('channel_key') || undefined,
  };
}

type SuppProps = {
  integration?: Integration;
};

const Supp = ({ integration }: SuppProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const navigateWithQuery = useNavigateWithQuery();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (
      !integration ||
      !(integration instanceof PairingSupplicantIntegration)
    ) {
      return;
    }

    const suppIntegration = integration;
    const { channelId, channelKey } = parseHashParams();
    const channelServerUri = config.pairing?.serverBaseUri;

    if (!channelServerUri || !channelId || !channelKey) {
      setError('Invalid pairing configuration');
      return;
    }

    // Validate client_id against pairing allowlist (matching Backbone behavior)
    if (!suppIntegration.validatePairingClient()) {
      setError('Invalid pairing client');
      return;
    }

    // Subscribe to state changes — navigate when metadata is received
    suppIntegration.onStateChange = (state: SupplicantState) => {
      if (state === SupplicantState.WaitingForAuthorizations) {
        navigateWithQuery('/pair/supp/allow');
      } else if (state === SupplicantState.Failed) {
        setError(
          suppIntegration.error?.message || 'An error occurred during pairing'
        );
      }
    };

    suppIntegration.onError = (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'An error occurred during pairing';
      setError(message);
    };

    // Open channel — the integration manages the WebSocket connection
    // and it persists across page transitions (component unmounts)
    suppIntegration
      .openChannel(channelServerUri, channelId, channelKey)
      .catch((err: unknown) => {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to connect to pairing server';
        setError(message);
      });

    return () => {
      // Don't close the channel — it needs to persist for SuppAllow/WaitForAuth.
      // Just unsubscribe our callbacks.
      suppIntegration.onStateChange = null;
      suppIntegration.onError = null;
    };
  }, [integration, navigateWithQuery]);

  return error ? (
    <AppLayout>
      <Banner type="error" content={{ localizedHeading: error }} />
    </AppLayout>
  ) : (
    <AppLayout></AppLayout>
  );
};

export default Supp;
