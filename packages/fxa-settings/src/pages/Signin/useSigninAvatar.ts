/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useState } from 'react';
import { useAuthClient, useConfig } from '../../models';
import { PROFILE_OAUTH_TOKEN_TTL_SECONDS } from '../../lib/oauth';

export type SigninAvatarData =
  | { account: { avatar: { id: string; url: string } } }
  | undefined;

/**
 * Fetches the user's avatar for display on signin pages.
 *
 * The profile server is only reachable over its HTTP API, which requires an
 * OAuth token, so this mints a short-lived `profile:avatar`-scoped token. That
 * token does NOT represent a real relying-party sign-in — it's minted purely to
 * render an avatar — so it's tagged `exclude_dau: true` to keep it out of the
 * services DAU signal (FXA-14226 bandaid). The proper fix, avoiding the mint
 * entirely when the avatar isn't rendered, is tracked in FXA-14160.
 *
 * Resolves `avatarLoading: false` immediately when there is no session token or
 * no profile/oauth config (nothing to fetch). Any fetch failure falls back to
 * the default avatar (`avatarData: undefined`).
 */
export const useSigninAvatar = (sessionToken?: string) => {
  const authClient = useAuthClient();
  const config = useConfig();
  const [avatarData, setAvatarData] = useState<SigninAvatarData>(undefined);
  const [avatarLoading, setAvatarLoading] = useState(true);

  useEffect(() => {
    if (
      !sessionToken ||
      !config?.servers?.profile?.url ||
      !config?.oauth?.clientId
    ) {
      setAvatarLoading(false);
      return;
    }
    const { clientId } = config.oauth;
    const profileUrl = config.servers.profile.url;
    let cancelled = false;

    const fetchAvatar = async () => {
      try {
        const { access_token } = await authClient.createOAuthToken(
          sessionToken,
          clientId,
          {
            scope: 'profile:avatar',
            ttl: PROFILE_OAUTH_TOKEN_TTL_SECONDS,
            exclude_dau: true,
          }
        );
        const response = await fetch(`${profileUrl}/v1/avatar`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch avatar');
        const data: { id: string; url: string; avatar?: string } =
          await response.json();
        if (!cancelled) {
          setAvatarData({
            account: { avatar: { id: data.id, url: data.avatar || data.url } },
          });
        }
      } catch {
        if (!cancelled) setAvatarData(undefined);
      } finally {
        if (!cancelled) setAvatarLoading(false);
      }
    };

    fetchAvatar();

    return () => {
      cancelled = true;
    };
  }, [authClient, config, sessionToken]);

  return { avatarData, avatarLoading };
};
