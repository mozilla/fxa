/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useMemo, useState } from 'react';
import {
  Integration,
  isOAuthIntegration,
  isSyncDesktopV3Integration,
  isOAuthNativeIntegration,
  isProbablyFirefox,
} from '../../../models';
import {
  defaultDesktopV3SyncEngineConfigs,
  getSyncEngineIds,
  syncEngineConfigs,
  webChannelDesktopV3EngineConfigs,
} from '../../sync-engines';
import firefox, { FxAStatusResponse } from '../../channels/firefox';
import { Constants } from '../../constants';

type FxAStatusIntegration = Pick<
  Integration,
  'type' | 'isSync' | 'isFirefoxNonSync' | 'isPairing'
>;

type SyncEngineConfigs = typeof syncEngineConfigs | undefined;

export type FxAStatusState = 'pending' | 'unanswered' | 'answered';

export const PAIRING_FXA_STATUS_TIMEOUT_MS = 500;

/**
 * `pairing` is optional in the fxa_status response, and very old versions of
 * Firefox iOS omit `capabilities` entirely. Normalizing here means callers can
 * read the capability off `fxaStatus` instead of each re-deriving the default.
 */
const DEFAULT_PAIRING_CAPABILITIES = {
  pairing: false,
  pairingVersion: 1,
};

/**
 * What we settle on when no fxa_status is coming — either the browser cannot
 * answer at all, or it never replied within `firefox.fxaStatus`'s attempts.
 */
const DEFAULT_FXA_STATUS: FxAStatusResponse = {
  capabilities: {
    engines: [],
    multiService: false,
    ...DEFAULT_PAIRING_CAPABILITIES,
  },
};

/**
 * If integration.isSync or integration is OAuthNative, sends firefox.fxaStatus to retrieve
 * available sync engines from the browser and checks Fx capabilities.
 */
export function useFxAStatus(integration: FxAStatusIntegration) {
  const isSyncOAuth = isOAuthIntegration(integration) && integration.isSync();
  const isSyncDesktopV3 = isSyncDesktopV3Integration(integration);
  const isSync = integration.isSync();
  const isPairing = integration.isPairing();
  const isOAuthNative = isOAuthNativeIntegration(integration);
  const [webChannelEngines, setWebChannelEngines] = useState<string[]>();
  const [offeredSyncEngineConfigs, setOfferedSyncEngineConfigs] =
    useState<SyncEngineConfigs>();
  const [declinedSyncEngines, setDeclinedSyncEngines] = useState<string[]>([]);
  const [supportsKeysOptionalLogin, setSupportsKeysOptionalLogin] =
    useState<boolean>(false);

  const [supportsCanLinkAccountUid, setSupportsCanLinkAccountUid] = useState<
    boolean | undefined
  >(undefined);

  // Undefined until the browser answers, so callers can tell "not yet known"
  // from "settled, no pairing" rather than routing on an unresolved default.
  const [fxaStatus, setFxaStatus] = useState<FxAStatusResponse>();
  const [fxaStatusState, setFxaStatusState] =
    useState<FxAStatusState>('pending');

  useEffect(() => {
    // This sends a web channel message to the browser to prompt a response
    // that we listen for.
    if ((isSync || isOAuthNative || isPairing) && isProbablyFirefox()) {
      (async () => {
        const status = await firefox.fxaStatus({
          // TODO: Improve getting 'context', probably set this on the integration
          context: isSyncDesktopV3
            ? Constants.FX_DESKTOP_V3_CONTEXT
            : Constants.OAUTH_CONTEXT,
          isPairing,
          service: Constants.SYNC_SERVICE,
        });

        // `status` is undefined when the browser never answered, and very old
        // versions of Firefox iOS answer without `capabilities`. Falling back to
        // the defaults in both cases means callers settle rather than wait.
        const capabilities = {
          ...DEFAULT_FXA_STATUS.capabilities,
          ...status?.capabilities,
        };

        // Unconditional, and deliberately not guarded on the current state: a
        // reply that arrives after the deadline below must still win, so a slow
        // but genuine Firefox is never left on the fabricated defaults.
        setFxaStatus({
          ...status,
          capabilities: {
            ...capabilities,
            pairing: !!capabilities.pairing,
            pairingVersion:
              capabilities.pairingVersion ||
              DEFAULT_PAIRING_CAPABILITIES.pairingVersion,
          },
        });
        setFxaStatusState('answered');

        if (!webChannelEngines && capabilities.engines) {
          // choose_what_to_sync may be disabled for mobile sync, see:
          // https://github.com/mozilla/application-services/issues/1761
          // Desktop OAuth Sync will always provide this capability too
          // for consistency.
          if (
            isSyncDesktopV3 ||
            (isSyncOAuth && capabilities.choose_what_to_sync)
          ) {
            setWebChannelEngines(capabilities.engines);
          }
        }
        // Check if third party auth (passwordless) log in to the browser is supported,
        // currently only Firefox desktop 147+ as of Q1 2026
        if (
          capabilities.keys_optional &&
          isOAuthNative &&
          integration.isFirefoxNonSync()
        ) {
          setSupportsKeysOptionalLogin(true);
        } else {
          setSupportsKeysOptionalLogin(false);
        }
        if (capabilities.can_link_account_uid) {
          setSupportsCanLinkAccountUid(true);
        } else {
          setSupportsCanLinkAccountUid(false);
        }
      })();
    } else {
      // No fxa_status is coming, so settle on the defaults rather than leaving
      // callers waiting on a reply that will never arrive.
      setFxaStatus(DEFAULT_FXA_STATUS);
      setFxaStatusState('unanswered');
    }
  }, [
    isSync,
    isPairing,
    isOAuthNative,
    isSyncDesktopV3,
    isSyncOAuth,
    webChannelEngines,
    integration,
  ]);

  // Give up waiting on a browser that looks like Firefox but never answers —
  // an in-app WebView, or a spoofed user agent. Pairing only: see
  // PAIRING_FXA_STATUS_TIMEOUT_MS.
  //
  // Keyed on the pending state rather than on "did we send the message", so the
  // timer exists only while a reply is genuinely outstanding: when we never
  // asked, the effect above has already settled on 'unanswered' and this clears
  // itself. A reply that lands after the deadline still wins, because the effect
  // above sets both values unconditionally.
  useEffect(() => {
    if (!isPairing || fxaStatusState !== 'pending') {
      return;
    }
    const timer = window.setTimeout(() => {
      setFxaStatus((current) => current ?? DEFAULT_FXA_STATUS);
      setFxaStatusState((current) =>
        current === 'pending' ? 'unanswered' : current
      );
    }, PAIRING_FXA_STATUS_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [isPairing, fxaStatusState]);

  useEffect(() => {
    if (webChannelEngines) {
      if (isSyncDesktopV3) {
        // Desktop v3 web channel message sends additional engines
        setOfferedSyncEngineConfigs([
          ...defaultDesktopV3SyncEngineConfigs,
          ...webChannelDesktopV3EngineConfigs.filter((engine) =>
            webChannelEngines.includes(engine.id)
          ),
        ]);
      } else if (isSyncOAuth) {
        // OAuth Webchannel context sends all engines
        setOfferedSyncEngineConfigs(
          syncEngineConfigs.filter((engine) =>
            webChannelEngines.includes(engine.id)
          )
        );
      }
    }
  }, [isSyncDesktopV3, isSyncOAuth, webChannelEngines]);

  useEffect(() => {
    if (offeredSyncEngineConfigs) {
      const defaultDeclinedSyncEngines = offeredSyncEngineConfigs
        .filter((engineConfig) => !engineConfig.defaultInclude)
        .map((engineConfig) => engineConfig.id);
      setDeclinedSyncEngines(defaultDeclinedSyncEngines);
    }
  }, [offeredSyncEngineConfigs, setDeclinedSyncEngines]);

  const offeredSyncEngines = getSyncEngineIds(offeredSyncEngineConfigs || []);

  const selectedEnginesForGlean = useMemo(() => {
    if (isSync) {
      return offeredSyncEngines.reduce(
        (acc, syncEngId) => {
          acc[syncEngId] = !declinedSyncEngines.includes(syncEngId);
          return acc;
        },
        {} as Record<string, boolean>
      );
    }
    return {};
  }, [isSync, declinedSyncEngines, offeredSyncEngines]);

  return {
    offeredSyncEngines,
    offeredSyncEngineConfigs,
    declinedSyncEngines,
    selectedEnginesForGlean,
    supportsKeysOptionalLogin,
    supportsCanLinkAccountUid,
    fxaStatus,
    fxaStatusState,
  };
}

export type UseFxAStatusResult = ReturnType<typeof useFxAStatus>;

export default useFxAStatus;
