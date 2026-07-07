/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Pure, grunt-agnostic core of the WAICT manifest generation. The grunt task
// (grunttasks/waict-manifest.js) is a thin adapter that supplies the file list,
// a byte reader, and a warn() sink; all decision logic lives here so it can be
// unit-tested without a grunt/filesystem harness.
//
// See https://github.com/waict-wg/waict-integrity-spec.

'use strict';
const crypto = require('crypto');

// Frontend unit-test bundles are only emitted in development and are not part
// of any shipped page.
const TEST_BUNDLE = /\/(test|testDependencies)\.bundle(\.|\b)/;

/**
 * Pick which fxa-settings env directory under dist/settings is actually served.
 * A given build usually emits a single env (e.g. dist/settings/dev), so when
 * exactly one is present we use it; otherwise we fall back to `fallback`.
 *
 * @param {String[]} envDirs directory names found under dist/settings
 * @param {String} [envOverride] value of STATIC_SETTINGS_DIRECTORY, if set
 * @param {String} [fallback] used when the directory can't be uniquely resolved
 * @returns {String}
 */
function pickSettingsDirectory(envDirs, envOverride, fallback = 'prod') {
  if (envOverride) {
    return envOverride;
  }
  return envDirs.length === 1 ? envDirs[0] : fallback;
}

/**
 * Map a dist-relative path to the (same-origin) URL the browser requests it
 * from, or return null if the file is not served.
 *
 * @param {String} distRelative forward-slash path relative to dist
 * @param {String} settingsDirectory the served fxa-settings env directory
 * @returns {String|null}
 */
function toServedUrl(distRelative, settingsDirectory) {
  if (distRelative.indexOf('settings/') === 0) {
    // settings/<env>/<rest> -> /settings/<rest>, but only for the served env.
    const withoutPrefix = distRelative.slice('settings/'.length);
    const slash = withoutPrefix.indexOf('/');
    if (slash === -1) {
      return null;
    }
    const env = withoutPrefix.slice(0, slash);
    if (env !== settingsDirectory) {
      return null;
    }
    return '/settings/' + withoutPrefix.slice(slash + 1);
  }

  return '/' + distRelative;
}

/**
 * SHA-256 of the given bytes, base64-encoded. WAICT v1 always uses SHA-256
 * (matching SRI's `sha256-<base64>` convention but without the prefix).
 *
 * @param {Buffer|String} bytes
 * @returns {String}
 */
function sha256Base64(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('base64');
}

/**
 * Absolute (or same-origin) URL a settings script is fetched from. In stage/prod
 * the settings build bakes a CDN `baseUrl` (PUBLIC_URL) into index.html, so the
 * browser fetches `<baseUrl>/<rest>`; in dev the base is empty and content-server
 * serves it same-origin at `/settings/<rest>`.
 *
 * @param {String} rest path after `settings/<env>/`
 * @param {String} baseUrl recorded settings origin, or '' for same-origin
 * @returns {String}
 */
function settingsServedUrl(rest, baseUrl) {
  if (baseUrl) {
    return baseUrl.replace(/\/+$/, '') + '/' + rest;
  }
  return '/settings/' + rest;
}

/**
 * Build the WAICT manifest from an abstract file list. No filesystem or grunt
 * dependency: `readBytes(distRelative)` returns the file's bytes and `warn(msg)`
 * surfaces recoverable problems (unknown asset mode, missing version).
 *
 * Pinning strategy - prefer per-URL `hashes` (strong), fall back to url-agnostic
 * `any_hashes` (content-addressed) only where a script's served URL cannot be
 * known at build time:
 *   - fxa-settings scripts: URL is knowable (same-origin `/settings/...`, or the
 *     recorded CDN `settingsBaseUrl` for stage/prod) -> URL-pinned in `hashes`.
 *   - content-server's own scripts: referenced via the runtime-interpolated
 *     `{{{ staticResourceUrl }}}`, so the absolute URL is NOT knowable at build
 *     time -> content-addressed in `any_hashes` (the unavoidable case).
 *   - cache-busted settings assets declared `any`: the `?v=` is volatile, so
 *     they are intentionally content-addressed too.
 *
 * @param {Object} args
 * @param {String[]} args.files dist-relative forward-slash paths
 * @param {(distRelative: string) => (Buffer|string)} args.readBytes
 * @param {String} args.settingsDirectory served fxa-settings env directory
 * @param {String} [args.settingsBaseUrl] CDN origin settings is served from ('' = same-origin)
 * @param {Object} [args.publicAssets] declared cache-busted public/ assets
 * @param {(msg: string) => void} [args.warn]
 * @returns {{ manifest: {hashes: Object, any_hashes: string[]}, count: number }}
 */
function buildManifest({
  files,
  readBytes,
  settingsDirectory,
  settingsBaseUrl = '',
  publicAssets = {},
  warn = () => {},
}) {
  const hashes = {};
  // De-duplicate: several URLs can share content, and content-addressing keys
  // by hash alone.
  const anyHashes = new Set();
  let count = 0;

  files.forEach((distRelative) => {
    if (TEST_BUNDLE.test('/' + distRelative)) {
      return;
    }

    const servedUrl = toServedUrl(distRelative, settingsDirectory);
    if (!servedUrl) {
      return;
    }

    const hash = sha256Base64(readBytes(distRelative));
    count++;

    // Content-server's own scripts (everything not under /settings/) are
    // referenced via the runtime-interpolated staticResourceUrl, so we can't
    // pin their URL at build time - content-address them.
    if (!servedUrl.startsWith('/settings/')) {
      anyHashes.add(hash);
      return;
    }

    const rest = servedUrl.slice('/settings/'.length);
    const url = settingsServedUrl(rest, settingsBaseUrl);
    const declared = publicAssets[rest];

    if (declared) {
      // Route declared cache-busted public/ scripts. `any` matches the content
      // hash regardless of URL (absorbs the ?v=); `exact` pins the precise ?v=
      // URL the build references it with.
      if (declared.mode === 'any') {
        anyHashes.add(hash);
      } else if (declared.mode === 'exact' && declared.v) {
        hashes[url + '?v=' + declared.v] = hash;
      } else if (declared.mode === 'exact') {
        // exact mode with no version can't produce a matchable ?v= key; fall
        // back to url-agnostic matching rather than emitting `?v=undefined`.
        warn(
          `waict-manifest: "${rest}" is exact mode but has no version; ` +
            'falling back to url-agnostic (any) matching'
        );
        anyHashes.add(hash);
      } else {
        // Unknown mode: don't silently drop the file from the manifest.
        warn(
          `waict-manifest: unknown mode "${declared.mode}" for "${rest}"; ` +
            'keying by served URL'
        );
        hashes[url] = hash;
      }
      return;
    }

    hashes[url] = hash;
  });

  return {
    manifest: { hashes, any_hashes: Array.from(anyHashes) },
    count,
  };
}

module.exports = {
  TEST_BUNDLE,
  pickSettingsDirectory,
  toServedUrl,
  sha256Base64,
  settingsServedUrl,
  buildManifest,
};
