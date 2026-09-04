/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';

import { usePageViewEvent } from '../../../lib/metrics';
import AppLayout from '../../../components/AppLayout';
import { REACT_ENTRYPOINT } from '../../../constants';
import Banner from '../../../components/Banner';
import { useNavigateWithQuery } from '../../../lib/hooks';
import type { UseFxAStatusResult } from '../../../lib/hooks';
import config from '../../../lib/config';
import { Integration } from '../../../models';
import {
  clearChannelComplete,
  isChannelComplete,
  PairingSupplicantIntegration,
  SupplicantState,
} from '../../../models/integrations/pairing-supplicant-integration';
import { parsePairingHash } from '../../../lib/pairing/pair-url';

// URL format: /pair/supp?client_id=...&scope=...#channel_id=...&channel_key=...
//
// A mobile Firefox that scans the QR with its own camera opens this page through
// app-services, which runs OAuth start itself and copies the authority's
// fragment over verbatim — so both protocol versions arrive here.

export const viewName = 'pair.supp';

type SuppProps = {
  integration?: Integration;
  error?: string;
  fxaStatusResult: UseFxAStatusResult;
};

const Supp = ({
  integration,
  error: errorProp,
  fxaStatusResult,
}: SuppProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const navigateWithQuery = useNavigateWithQuery();
  const [error, setError] = useState<string | undefined>(errorProp);

  const { fxaStatusState } = fxaStatusResult;
  const supplicantPairingVersion =
    fxaStatusResult.fxaStatus?.capabilities.pairingVersion;

  useEffect(() => {
    if (!(integration instanceof PairingSupplicantIntegration)) {
      return;
    }

    // channel_id/key live in the URL hash so they're not sent to the server.
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.substring(1));
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

    // Three things have to agree before the v2 screens are the right ones: the
    // authority encoded `v=2` into the fragment, FxA has v2 enabled, and this
    // browser reported over the web channel that it speaks v2. A supplicant
    // without the v2 commands belongs on the v1 flow, which it can complete.
    const v2Channel = parsePairingHash(hash);
    const authorityWantsV2 =
      config.pairing?.version === 2 && v2Channel !== undefined;

    // Only a v=2 fragment has anything to learn from fxa_status, so a v1 URL
    // never waits on the reply. 'unanswered' is an answer: none is coming.
    if (authorityWantsV2 && fxaStatusState === 'pending') {
      return;
    }

    const isV2 = authorityWantsV2 && supplicantPairingVersion === 2;

    if (isChannelComplete(channelId)) {
      if (isV2) {
        clearChannelComplete(channelId);
        navigateWithQuery('/pair/supplicant/sync_success', {}, false);
        return;
      }
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

    if (isV2) {
      // The v2 flow opens the channel itself, on the screen it lands on. The
      // channel key is the pairing PSK, so it travels in router state and the
      // hash it arrived in must not follow it into the next URL.
      navigateWithQuery(
        '/pair/supplicant/connect_this_device',
        { state: v2Channel },
        false
      );
      return;
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
  }, [
    integration,
    navigateWithQuery,
    fxaStatusState,
    supplicantPairingVersion,
  ]);

  return error ? (
    <AppLayout>
      <Banner type="error" content={{ localizedHeading: error }} />
    </AppLayout>
  ) : (
    <AppLayout loading />
  );
};

export default Supp;
