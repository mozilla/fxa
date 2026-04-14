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

type SuppProps = {
  integration?: Integration;
  error?: string;
};

const Supp = ({
  integration,
  error: errorProp,
}: SuppProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const navigateWithQuery = useNavigateWithQuery();
  const [error, setError] = useState<string | undefined>(errorProp);

  useEffect(() => {
    if (!(integration instanceof PairingSupplicantIntegration)) {
      return;
    }

    // Supplicant receives channel_id and channel_key in the URL hash
    // (never the query string) so they're not sent to the server.
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const channelId = hashParams.get('channel_id');
    const channelKey = hashParams.get('channel_key');
    const channelServerUri = config.pairing?.serverBaseUri;

    if (!channelServerUri || !channelId || !channelKey) {
      setError('Invalid pairing configuration');
      return;
    }

    // Validate client_id against pairing allowlist (matching Backbone behavior)
    if (!integration.validatePairingClient()) {
      setError('Invalid pairing client');
      return;
    }

    // Subscribe to state changes — navigate when metadata is received
    integration.onStateChange = (state: SupplicantState) => {
      if (state === SupplicantState.WaitingForAuthorizations) {
        navigateWithQuery('/pair/supp/allow');
      } else if (state === SupplicantState.Failed) {
        navigateWithQuery('/pair/failure');
      }
    };

    integration.onError = () => {
      navigateWithQuery('/pair/failure');
    };

    // Open channel — the integration manages the WebSocket connection
    // and it persists across page transitions (component unmounts)
    integration
      .openChannel(channelServerUri, channelId, channelKey)
      .catch(() => {
        navigateWithQuery('/pair/failure');
      });

    return () => {
      // Don't close the channel — it needs to persist for SuppAllow/WaitForAuth.
      // Just unsubscribe our callbacks.
      integration.onStateChange = null;
      integration.onError = null;
    };
  }, [integration, navigateWithQuery]);

  return error ? (
    <AppLayout>
      <Banner type="error" content={{ localizedHeading: error }} />
    </AppLayout>
  ) : (
    <AppLayout loading />
  );
};

export default Supp;
