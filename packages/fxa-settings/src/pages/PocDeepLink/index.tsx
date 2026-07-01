/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * FXA-13863 — Deep-link proof of concept (THROWAWAY).
 *
 * Renders a scannable QR code used to validate, on real iOS & Android devices,
 * whether a QR scanned with the *native* camera can open Firefox straight into
 * pairing and fall back to the app store when Firefox is not installed.
 *
 * The QR encodes an https `/poc_pair_init` interstitial. The native camera only acts
 * on http(s) URLs, so this is what a scanned QR must encode; /poc_pair_init then
 * attempts the firefox:// custom scheme and falls back to the store.
 *
 * This page is intentionally minimal and unlocalized. It is a temporary test
 * harness feeding FXA-13865 (v2 QR URL format) and FXA-13732 (mobile work) and
 * is expected to be removed once findings are captured. Do NOT build production
 * pairing on top of it.
 */

import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';
import QRCode from '../../components/QRCode';
import { usePageViewEvent } from '../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../constants';
import { useConfig } from '../../models';

export const viewName = 'poc_deep_link';

// Sample pairing params. Used only to verify whether params survive the
// deep-link / store round-trip; not real channel credentials.
const DEFAULT_CHANNEL_ID = 'pocChannelId00000000000000000000';
const DEFAULT_CHANNEL_KEY = 'pocChannelKey0000000000000000000000000000000';

/**
 * The initial URL we want Firefox to open. `window.location.origin` keeps the
 * default correct across dev (LAN IP) / stage / prod. Override with `?url=` (or
 * just edit it live in the input on the page).
 */
function getInitialTarget(search: string) {
  const params = new URLSearchParams(search);
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://accounts.firefox.com';
  const sampleQuery = new URLSearchParams({
    channel_id: params.get('channel_id') || DEFAULT_CHANNEL_ID,
    channel_key: params.get('channel_key') || DEFAULT_CHANNEL_KEY,
  }).toString();
  return params.get('url') || `${origin}/poc_pair_start?${sampleQuery}`;
}

/**
 * Build the SCANNABLE https `/poc_pair_init` URL for the current target. The native
 * camera only acts on http(s) URLs, so this is what the QR must encode;
 * /poc_pair_init then attempts the firefox:// custom scheme and falls back to the store.
 */
function buildPairInitLink(targetUrl: string) {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://accounts.firefox.com';
  return `${origin}/poc_pair_init?url=${encodeURIComponent(targetUrl)}`;
}

const Section = ({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) => {
  const config = useConfig();
  return (
    <div className="flex flex-col items-center gap-3 max-w-xs">
      <b>{title}</b>
      <p className="text-sm text-grey-400 text-center">{description}</p>
      <QRCode
        value={url}
        localizedLabel={`QR code encoding ${url}`}
        size={200}
      />
      <code className="text-xs break-all text-center">{url}</code>
      <a className="link-blue text-sm" href={url}>
        Tap to open on this device
      </a>
      <div className="flex gap-4">
        <a
          className="link-blue text-sm"
          href={config.mobileStoreLinks.ios}
          target="_blank"
          rel="noreferrer"
        >
          iOS store fallback
        </a>
        <a
          className="link-blue text-sm"
          href={config.mobileStoreLinks.android}
          target="_blank"
          rel="noreferrer"
        >
          Android store fallback
        </a>
      </div>
    </div>
  );
};

const PocDeepLink = (props: RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const search =
    typeof window !== 'undefined' ? window.location.search : props.location?.search || '';
  const [targetUrl, setTargetUrl] = useState(() => getInitialTarget(search));
  const pairInitLink = buildPairInitLink(targetUrl);

  return (
    <AppLayout>
      <CardHeader
        headingText="Deep-link POC"
        headingTextFtlId="poc_deep_link-header"
      />
      <p className="text-sm text-grey-400 mt-2">
        Scan with the device&apos;s{' '}
        <b>native camera</b> (or tap on-device) to test the round-trip. Edit the
        target URL below (the QR updates live), or override it via{' '}
        <code>?url=</code>.
      </p>
      <label className="block mt-4 text-sm">
        <span className="font-bold">Target URL Firefox should open</span>
        <input
          type="url"
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="mt-1 w-full rounded border border-grey-300 p-2 text-sm font-mono dark:bg-grey-800 dark:text-grey-10"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          placeholder="https://accounts.firefox.com/pair?channel_id=…"
        />
      </label>
      <div className="flex flex-wrap justify-center gap-10 mt-6">
        <Section
          title="Scan this — /poc_pair_init interstitial (https)"
          description="The QR a native camera can actually open. Lands on /poc_pair_init, which tries to open Firefox at the target URL and, if it doesn't open, redirects to the app store."
          url={pairInitLink}
        />
      </div>
    </AppLayout>
  );
};

export default PocDeepLink;
