/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// SHA-256 fingerprints of the certificates that sign Firefox Android (Fenix)
// builds. Release and Beta share one signing key; Nightly uses another.
//
// To regenerate, download an APK from https://ftp.mozilla.org/pub/fenix/ and
// run (from the Android SDK build-tools):
//   apksigner verify --print-certs --verbose <file>.apk
// The `certificate SHA-256 digest` line is the fingerprint. Android expects it
// as upper-case, colon-separated hex.
const RELEASE_BETA_FINGERPRINT =
  'A7:8B:62:A5:16:5B:44:94:B2:FE:AD:9E:76:A2:80:D2:2D:93:7F:EE:62:51:AE:CE:59:94:46:B2:EA:31:9B:04';
const NIGHTLY_FINGERPRINT =
  '50:04:77:90:88:E7:F9:88:D5:BC:5C:C5:F8:79:8F:EB:F4:F8:CD:08:4A:1B:2A:46:EF:D4:C8:EE:4A:EA:F2:11';

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
    // Each entry grants the named app permission to handle links for this
    // domain, provided the app is signed with one of the listed certificates
    // and declares an intent filter with android:autoVerify="true" for
    // accounts.firefox.com.
    const apps = [
      {
        packageName: 'org.mozilla.firefox',
        fingerprints: [RELEASE_BETA_FINGERPRINT],
      },
      {
        packageName: 'org.mozilla.firefox_beta',
        fingerprints: [RELEASE_BETA_FINGERPRINT],
      },
      {
        packageName: 'org.mozilla.fenix',
        fingerprints: [NIGHTLY_FINGERPRINT],
      },
    ];

    res.json(
      apps.map(({ packageName, fingerprints }) => ({
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: packageName,
          sha256_cert_fingerprints: fingerprints,
        },
      }))
    );
  };

  return route;
};
