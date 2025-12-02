/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useMemo, useState } from 'react';
import {
  Integration,
  isOAuthIntegration,
  isSyncDesktopV3Integration,
  isOAuthNativeIntegration,
} from '../../../models';
import {
  defaultDesktopV3SyncEngineConfigs,
  getSyncEngineIds,
  syncEngineConfigs,
  webChannelDesktopV3EngineConfigs,
} from '../../sync-engines';
import firefox from '../../channels/firefox';
import { Constants } from '../../constants';

type FxAStatusIntegration = Pick<Integration, 'type' | 'isSync'>;

/**
 * If integration.isSync or integration is OAuthNative, sends firefox.fxaStatus to retrieve
 * available sync engines from the browser and checks Fx capabilities.
 */
export function useFxAStatus(integration: FxAStatusIntegration) {
  const isSyncOAuth = isOAuthIntegration(integration) && integration.isSync();
  const isSyncDesktopV3 = isSyncDesktopV3Integration(integration);
  const isSync = integration.isSync();
  const isOAuthNative = isOAuthNativeIntegration(integration);

  const [webChannelEngines, setWebChannelEngines] = useState<
    string[] | undefined
  >();
  const [offeredSyncEngineConfigs, setOfferedSyncEngineConfigs] = useState<
    typeof syncEngineConfigs | undefined
  >();
  const [declinedSyncEngines, setDeclinedSyncEngines] = useState<string[]>([]);
  const [supportsKeysOptionalLogin, setSupportsKeysOptionalLogin] =
    useState<boolean>(false);
  const [supportsCanLinkAccountUid, setSupportsCanLinkAccountUid] =
    useState<boolean>(false);

  useEffect(() => {
    // This sends a web channel message to the browser to prompt a response
    // that we listen for.
    if (isSync || isOAuthNative) {
      (async () => {
        const status = await firefox.fxaStatus({
          // TODO: Improve getting 'context', probably set this on the integration
          context: isSyncDesktopV3
            ? Constants.FX_DESKTOP_V3_CONTEXT
            : Constants.OAUTH_CONTEXT,
          isPairing: false,
          service: Constants.SYNC_SERVICE,
        });
        if (!webChannelEngines && status.capabilities.engines) {
          // choose_what_to_sync may be disabled for mobile sync, see:
          // https://github.com/mozilla/application-services/issues/1761
          // Desktop OAuth Sync will always provide this capability too
          // for consistency.
          if (
            isSyncDesktopV3 ||
            (isSyncOAuth && status.capabilities.choose_what_to_sync)
          ) {
            setWebChannelEngines(status.capabilities.engines);
          }
        }
        // Check if third party auth (passwordless) log in to the browser is supported
        if (
          status.capabilities.keys_optional &&
          isOAuthNative &&
          integration.isFirefoxNonSync()
        ) {
          setSupportsKeysOptionalLogin(true);
        } else {
          setSupportsKeysOptionalLogin(false);
        }
        if (status.capabilities.can_link_account_uid) {
          setSupportsCanLinkAccountUid(true);
        } else {
          setSupportsCanLinkAccountUid(false);
        }
      })();
    }
  }, [
    isSync,
    isOAuthNative,
    isSyncDesktopV3,
    isSyncOAuth,
    webChannelEngines,
    integration,
  ]);

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
  };
}

export type UseFxAStatusResult = ReturnType<typeof useFxAStatus>;

export default useFxAStatus;
