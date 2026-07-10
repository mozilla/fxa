/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = function () {
  const route = {};
  route.method = 'get';
  route.path = '/.well-known/assetlinks.json';

  route.process = function (req, res) {
    // charset must be set on json responses.
    res.charset = 'utf-8';

    // FXA-13863: Android App Links. To make an https://accounts.firefox.com link
    // open Firefox directly from the native camera (instead of the browser),
    // Android requires a Digital Asset Links statement served from
    // `/.well-known/assetlinks.json`. See:
    // https://developer.android.com/training/app-links/verify-android-applinks
    //
    // Each entry grants the named app permission to handle links for this domain.
    // The `sha256_cert_fingerprints` MUST be the signing certificate fingerprints
    // of the released Firefox Android builds — these are owned by the mobile team
    // (cross-team work in FXA-13732) and are PLACEHOLDERS here. App Links will not
    // verify until the real fingerprints are supplied AND the app declares an
    // intent filter with android:autoVerify="true" for accounts.firefox.com.
    const sha256CertFingerprints = [
      // TODO(FXA-13732): replace with real Firefox Android signing fingerprints
      'YOUR_RELEASE_SHA256_FINGERPRINT_HERE',
    ];

    // Release, Beta, and Nightly package names for Firefox Android (Fenix).
    const packageNames = [
      'org.mozilla.firefox',
      'org.mozilla.firefox_beta',
      'org.mozilla.fenix',
    ];

    res.json(
      packageNames.map((packageName) => ({
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: packageName,
          sha256_cert_fingerprints: sha256CertFingerprints,
        },
      }))
    );
  };

  return route;
};
