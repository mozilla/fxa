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
  clearChannelComplete,
  isChannelComplete,
  PairingSupplicantIntegration,
  SupplicantState,
} from '../../../models/integrations/pairing-supplicant-integration';

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

    // channel_id/key live in the URL hash so they're not sent to the server.
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const channelId = hashParams.get('channel_id');
    const channelKey = hashParams.get('channel_key');
    const channelServerUri = config.pairing?.serverBaseUri;

    if (!channelServerUri || !channelId || !channelKey) {
      setError('Invalid pairing configuration');
      return;
    }

    if (!integration.validatePairingClient()) {
      setError('Invalid pairing client');
      return;
    }

    if (isChannelComplete(channelId)) {
      const clientId = integration.getClientId();
      if (clientId) {
        // We can now remove the flag, since we are about to navigate to the success page
        clearChannelComplete(channelId);
        navigateWithQuery(`/oauth/success/${clientId}`);
        return;
      }
      // Without a clientId, fall through rather than build /oauth/success/.
      // Don't clear the marker so isPostCompletionReconnect() can still
      // suppress the consumed-channel close/error from the WS reconnect.
    }

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

    // The integration owns the WebSocket and persists across page transitions.
    integration
      .openChannel(channelServerUri, channelId, channelKey)
      .catch(() => {
        navigateWithQuery('/pair/failure');
      });

    return () => {
      // Unsubscribe only — the channel must outlive this component for SuppAllow.
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
