<a name="0.18.0"></a>
## 0.18.0 (2014-07-28)


#### Bug Fixes

* **bug:**
  * IE9: browser unsupported message is very wide ([488f5108](https://github.com/mozilla/fxa-content-server/commit/488f510878be6a788b70b0f6c79d10c9951bfd53))
  * fixed snippet layout error ([0e3dcd9e](https://github.com/mozilla/fxa-content-server/commit/0e3dcd9eb8bc533202757ee202a1dae1b7b82d3d))
* **client:**
  * If logError/displayError/displayErrorUnsafe is called without an error, log an ` ([d3bf9552](https://github.com/mozilla/fxa-content-server/commit/d3bf95521ecd6f86daa18f7c6766d12477959bd6))
  * Display `Service Unavailable` if the user visits `/oauth/sign(in|up)` and the OA ([fe599744](https://github.com/mozilla/fxa-content-server/commit/fe599744d5c7d191136616ea49744be2a6ee50d4))
  * Ensure a down OAuth server does not cause an `undefined` error. ([7224d952](https://github.com/mozilla/fxa-content-server/commit/7224d9528c73c02d24afada320901ed5ce122284))
* **fxa-client:** remove lang from fxa-client requests ([93c3384d](https://github.com/mozilla/fxa-content-server/commit/93c3384d80d913a5a1a746b2e2213240f9b404b0), closes [#1404](https://github.com/mozilla/fxa-content-server/issues/1404))
* **l10n:** add hsb and dsb to default supported languag list for asset generation ([c726205d](https://github.com/mozilla/fxa-content-server/commit/c726205d62649df14f6dcefd2ee97861759ddd02))
* **legal:** fix layout of statically rendered legal pages ([f59d82b1](https://github.com/mozilla/fxa-content-server/commit/f59d82b1c5a7694c932f836ab398304ae284ac71))
* **metrics:** Log a screen once, childviews should not cause the parent to be lgoged. ([5964e0ba](https://github.com/mozilla/fxa-content-server/commit/5964e0badb1495c62a44e807ea604e43b8543f3f))
* **router:** show error screen when view rendering fails ([49eb7063](https://github.com/mozilla/fxa-content-server/commit/49eb70631f261cf7deecaf15e5c324edf51e704f))
* **sync:** show Sync brand name when signin up/in for Sync ([c15a2761](https://github.com/mozilla/fxa-content-server/commit/c15a276112883834a46b7c7b50cebe39db941214), closes [#1339](https://github.com/mozilla/fxa-content-server/issues/1339))
* **tos-pp:** rely on accept headers instead of naviagor.language for partial requests ([fdceab5a](https://github.com/mozilla/fxa-content-server/commit/fdceab5a0aad420e0c000bb920b121ce05bd99d5), closes [#1412](https://github.com/mozilla/fxa-content-server/issues/1412))


#### Features

* **metrics:** Add screen width and height to the metrics. ([0f5f3513](https://github.com/mozilla/fxa-content-server/commit/0f5f35135098b0502a9276549d4d74160a28279a))
* **settings:** profile images ([fe0b8770](https://github.com/mozilla/fxa-content-server/commit/fe0b8770c8bfe0b719a947f193a827d03bf747e6))


<a name="0.17.0"></a>
## 0.17.0 (2014-07-14)


#### Bug Fixes

* **fonts:** Update connect-fonts-firasans and grunt-connect-fonts. ([e5a2fdcd](https://github.com/mozilla/fxa-content-server/commit/e5a2fdcd74659ff0f0465b2c831dfedf212e8a53))
* **l10n:** use correct locale if specified in url for legal pages ([02c287cb](https://github.com/mozilla/fxa-content-server/commit/02c287cb055558e4b8ada3394fbb08a91a6c2f9c), closes [#1337](https://github.com/mozilla/fxa-content-server/issues/1337))
* **legal:** fix rendering of legal pages when loaded directly via url ([70b17b37](https://github.com/mozilla/fxa-content-server/commit/70b17b375d1a6e3184b3724c786284241cd6131b), closes [#1372](https://github.com/mozilla/fxa-content-server/issues/1372))
* **styles:** sassify border radii ([10f53c09](https://github.com/mozilla/fxa-content-server/commit/10f53c099a62ebf159d317f3555b0bf495a3aec2))
* **tests:** Make IE10/IE11 pass all the mocha tests. ([074c7246](https://github.com/mozilla/fxa-content-server/commit/074c724640e5987e89961d657333cd38ef02ac5d))


#### Features

* **metrics:** Log which marketing material is shown to a user. ([afa111ac](https://github.com/mozilla/fxa-content-server/commit/afa111ac163b9103ea32ce0db7bb099f6ca78a41))
* **server:** Add a forwarding proxy for IE8. ([50060ce3](https://github.com/mozilla/fxa-content-server/commit/50060ce3305d2e720d32b6247df65301bba3d8d3))


<a name="0.16.0"></a>
## 0.16.0 (2014-06-30)


#### Bug Fixes

* **client:**
  * Firefox for Android Sync marketing material is only available to desktop sync us ([c5e62fa6](https://github.com/mozilla/fxa-content-server/commit/c5e62fa6b48af641210a95514bc14b888bdd984d))
  * Only send a `link_expired` event if the password reset link is expired. ([38310417](https://github.com/mozilla/fxa-content-server/commit/38310417567662bb37e07a3d973f86400a9ffb78))
  * Fix the IE8 password toggle test for real this time. ([8cdecd14](https://github.com/mozilla/fxa-content-server/commit/8cdecd14d48945120b005132724859b6d56f57f3))
  * Check the user's old password before attempting a change password. ([b78bfaa5](https://github.com/mozilla/fxa-content-server/commit/b78bfaa56b77afd991cc459d7b58fa8ab804a2c5))
  * Remove the ability for IE8 and IE10+ to show the password field. ([b257333f](https://github.com/mozilla/fxa-content-server/commit/b257333fff061ef85bd0d4f3b457520bea8b935f))
  * Abort autofocus events if no element exists with the `autofocus` attribute. ([07a12642](https://github.com/mozilla/fxa-content-server/commit/07a126429d2eb36115eb40ef44fa823ca8186c13))
  * Throw an exception if invokeHandler is passed an invalid handler. ([0f58af47](https://github.com/mozilla/fxa-content-server/commit/0f58af478a7a31c81d770a7dfb695601976cab6b))
  * Remove keyboard accessibility for the show/hide button. ([09fc7a96](https://github.com/mozilla/fxa-content-server/commit/09fc7a96066cb3541566fca5822df2a5c8ee367d))
  * Replace calls to [].indexOf with _.indexOf for IE8 support. ([b5430e1b](https://github.com/mozilla/fxa-content-server/commit/b5430e1b44014e6f019aa329bf387715680773fe))
* **csp:** turn on report only mode until CSP issues are resolved ([e39e4128](https://github.com/mozilla/fxa-content-server/commit/e39e41289048d84b520f3451039240929f0b09ec))
* **css:** Remove the blue background on select element focus in IE10+ ([b8300f9f](https://github.com/mozilla/fxa-content-server/commit/b8300f9fdab2ea7749efaaa0113518cd3e8467ba))
* **desktop:** keep desktop context after password change ([df187b8d](https://github.com/mozilla/fxa-content-server/commit/df187b8d655de93d62638d36ac5be26cae9813df), closes [#812](https://github.com/mozilla/fxa-content-server/issues/812))
* **ie8:** use a standard font so the password field renders correctly ([48c7e807](https://github.com/mozilla/fxa-content-server/commit/48c7e8076bc3a6304fc32d0f5529a29ee16f1cd1), closes [#1266](https://github.com/mozilla/fxa-content-server/issues/1266))
* **l10n:**
  * disable fira sans for unsupported locales ([46dedd04](https://github.com/mozilla/fxa-content-server/commit/46dedd04ebf5b9871d8cbd74566f8b498c089d04))
  * build json locale bundles on server start ([1ba744c3](https://github.com/mozilla/fxa-content-server/commit/1ba744c3fbe431c6e6f2e641426d5cdc3fcb4364), closes [#1295](https://github.com/mozilla/fxa-content-server/issues/1295))
  * upgrade jsxgettext to handle nested handlebar clocks ([229303ac](https://github.com/mozilla/fxa-content-server/commit/229303ace2303efa0bcebeb9d6cf004ecb8ed9c0), closes [#1306](https://github.com/mozilla/fxa-content-server/issues/1306))
* **oauth:**
  * ensure oauth forms are enabled if valid on afterRender ([f46e435c](https://github.com/mozilla/fxa-content-server/commit/f46e435ce59b94d9bdbd80f8ae86cb9bd7ebaec9))
  * only show service name if it is defined ([dc5775ee](https://github.com/mozilla/fxa-content-server/commit/dc5775ee2f318efa69462349168d9d2a1c1b8bd0), closes [#1216](https://github.com/mozilla/fxa-content-server/issues/1216))
  * keep the oauth context after a page refresh ([a548e575](https://github.com/mozilla/fxa-content-server/commit/a548e5758c9bd382ee0bf7a515f22f224020c5e1))
* **server:** Add a 'connect-src' directive to allow contact with the auth-server and oauth-se ([28d9a90d](https://github.com/mozilla/fxa-content-server/commit/28d9a90dce2f1d2088ee0b55327c941f08922a8e))
* **strings:** fix reset password link error messages ([cf525dcf](https://github.com/mozilla/fxa-content-server/commit/cf525dcfbb7b6c0cd7719b0a4f357c4f0484cca5))
* **test:**
  * fix functional test remote for slow connections ([8f0d0025](https://github.com/mozilla/fxa-content-server/commit/8f0d0025496ae8012469161de0e8ae14daaccd46))
  * Remove cache busting URLs in dev mode. ([ffc0de84](https://github.com/mozilla/fxa-content-server/commit/ffc0de84a06cad81ffe9fde0e70f06f30228e7d1))
* **tests:** Fix throttled test.. ([6e3430f3](https://github.com/mozilla/fxa-content-server/commit/6e3430f318794c19cb625911324eb7668c75ef9e), closes [#1144](https://github.com/mozilla/fxa-content-server/issues/1144))


#### Features

* **client:**
  * Add email prefill on the `/signin` page if the email address is passed as a sear ([f7049063](https://github.com/mozilla/fxa-content-server/commit/f7049063a128906f88b4a9b780ec77afbba6cac8))
  * Add email prefil on the `/signup` page if an email is passed as a URL search par ([af7ad386](https://github.com/mozilla/fxa-content-server/commit/af7ad386c30edf61e86eef4a5671368dd7320e3e))
  * add expired verification link message and a email resend link ([12b1fe71](https://github.com/mozilla/fxa-content-server/commit/12b1fe7178cbd5d6741d0d60c6eeb554bdcc5f05))
* **server:** Add `x-content-type-options: nosniff` headers to prevent browser content type sn ([3bdc2584](https://github.com/mozilla/fxa-content-server/commit/3bdc25841204fd316e65f41281191845ddef4cbb))


<a name="0.15.0"></a>
## 0.15.0 (2014-06-16)


#### Bug Fixes

* **client:**
  * Convert all inline error strings to use an error object. ([73231273](https://github.com/mozilla/fxa-content-server/commit/7323127309fd663b1d6b5d74778619305867f946))
  * Fix disabled cookies screen not showing correctly. ([6442364e](https://github.com/mozilla/fxa-content-server/commit/6442364e8362d90f6cdf63904e9c04bfb6258f12))
* **config:** don't alter process.env.CONFIG_FILES from the config script ([11653d4c](https://github.com/mozilla/fxa-content-server/commit/11653d4c3bf9501f8f7ae206a347770d2dcd2b67))
* **csp:** update p-promise library to version that is CSP compatible ([a82e51f3](https://github.com/mozilla/fxa-content-server/commit/a82e51f3e958a21afa71fe28bd55c25c94ab4f8a))
* **form:** a regression was hiding sign up/in suggestions ([6466370d](https://github.com/mozilla/fxa-content-server/commit/6466370d36e0f62729eabed068781be08b08fba8))
* **forms:** labels should not shift unless values change ([2811d0a9](https://github.com/mozilla/fxa-content-server/commit/2811d0a90d68c2a7dff46bc50999873d4a2fd549), closes [#1008](https://github.com/mozilla/fxa-content-server/issues/1008))
* **style:** make tooltips work for the select list hack ([30d91076](https://github.com/mozilla/fxa-content-server/commit/30d9107641a62eeedc836e6f214be1ccd2f0c67d))
* **test:** Run Mocha tests in order ([8d0d58a3](https://github.com/mozilla/fxa-content-server/commit/8d0d58a3a94fe7e49e1554424e74c5f455cdac54))
* **tests:** update legal and tos tests to work under slow conditions ([17006989](https://github.com/mozilla/fxa-content-server/commit/17006989d1c09e243bd0464f0ab0cbe1bda40acd))


#### Features

* **ux:** show messaging when response takes longer than expected ([e4d13330](https://github.com/mozilla/fxa-content-server/commit/e4d13330afc13ca321c05435f0a59974d33ca464))


<a name="0.14.0"></a>
## 0.14.0 (2014-06-02)


#### Bug Fixes

* **bug:** modify select css to remediate bug 1017864 ([c15d8f47](https://github.com/mozilla/fxa-content-server/commit/c15d8f47c29d4a2735a9472c30f3efe5fff34792))
* **build:**
  * Exclude testing tools from production build ([84658550](https://github.com/mozilla/fxa-content-server/commit/846585508e5b71b5440c41623cf165364e20d503))
  * Downgrade imagemin ([e04c9e9a](https://github.com/mozilla/fxa-content-server/commit/e04c9e9a9384e229ab9c521b27dcf7d868841a50))
* **config:**
  * Add oauth_url to awsbox ([3e2c5576](https://github.com/mozilla/fxa-content-server/commit/3e2c5576dbfb743940704085d03cea43cfa3957e))
  * set default oauth url to dev deployment ([63237fe7](https://github.com/mozilla/fxa-content-server/commit/63237fe7e1f645588b723d10cd88eb1723508e11))
* **logs:** Set metrics sample_date to 0 ([037c0da4](https://github.com/mozilla/fxa-content-server/commit/037c0da4b64b429be6a61127049cfe0c9c1e2300))
* **oauth:** Adding functional oauth tests and fixing oauth bugs ([8e941318](https://github.com/mozilla/fxa-content-server/commit/8e94131802eb72717781848c739cc61c2ac4d864))
* **server:** Remove X-FRAME-OPTIONS for Legal and Terms ([9eff994f](https://github.com/mozilla/fxa-content-server/commit/9eff994fb32bba07140da8204782d8a09abeca4a))
* **test:**
  * Update oauth client name, jshint ([566355fb](https://github.com/mozilla/fxa-content-server/commit/566355fbcb6514375e424bb790bf244f78bd04e1))
  * Force focus in Mocha tests. ([23bead9a](https://github.com/mozilla/fxa-content-server/commit/23bead9a30d4b6059055f93deb0c4440a02392a6))
  * Removed 'npm run test-browser'. Combined into 'npm test' ([38cb00b2](https://github.com/mozilla/fxa-content-server/commit/38cb00b2b3316413bf98e66f027af8f78e8a813a))
* **tests:**
  * Exclude functional tests from Travis ([e84daa75](https://github.com/mozilla/fxa-content-server/commit/e84daa7555960866374195f81922bfc89366c384))
  * fix hanging email issues ([04b186ea](https://github.com/mozilla/fxa-content-server/commit/04b186eac3d005392db1cc44e8d7ba33759a7354))
* **views:** strip spaces in uid, token, code when pasted ([1d1919ac](https://github.com/mozilla/fxa-content-server/commit/1d1919ac5b427ea8568ae9c04bd8380334db93b4))


#### Features

* Add front end metrics gathering. ([084fce06](https://github.com/mozilla/fxa-content-server/commit/084fce06ae1bb1acde9fb71e1ccdfce90ad9ea11))
* **server:** serve directly over https ([1216ab0d](https://github.com/mozilla/fxa-content-server/commit/1216ab0de5fd5223b0425e19f1226141f38cfe54))


<a name="0.13.0"></a>
## 0.13.0 (2014-05-19)


#### Bug Fixes

* **build:**
  * Remove Sync browser pages from distribution build ([50ddf022](https://github.com/mozilla/fxa-content-server/commit/50ddf0227bd2c13bb14647e7c012dad71423f58b))
  * Exclude env-test.js from the copyright check, it has its own from the Modernizr  ([7ae249dd](https://github.com/mozilla/fxa-content-server/commit/7ae249dd118e7def6e468cdde2a417d8795bc2dd))
  * Fix IE 404s when requesting .eot fonts in prod. ([ef28093f](https://github.com/mozilla/fxa-content-server/commit/ef28093fc50af4b103458643836670572231d134))
* **client:**
  * update js-client so xhr works in IE ([15a75cee](https://github.com/mozilla/fxa-content-server/commit/15a75cee270c8f453646fc8b538c3b13112fd69b))
  * Fix form validation on browsers that do not have HTML5 form field validation. ([aa8992eb](https://github.com/mozilla/fxa-content-server/commit/aa8992eb46bf1feb7a98ee4cda4fb447094116d4))
  * Disable IE9 support until we get IE9's CORS situation situated. ([717fbcf2](https://github.com/mozilla/fxa-content-server/commit/717fbcf210a643b0ad58764fabddf6fd8adfbc28))
  * Fix the styling on outdated browsers. ([9b1ef4ef](https://github.com/mozilla/fxa-content-server/commit/9b1ef4efc36437427bbdcb6b569a4dfc0e8824e3))
  * update js-client to 0.1.19 for request timeouts ([48d6a637](https://github.com/mozilla/fxa-content-server/commit/48d6a6375ee9949e1e657b9c1d8432a3c74c9fe4))
  * Fix email field focus in Chrome. No more exceptions. ([d1ed5334](https://github.com/mozilla/fxa-content-server/commit/d1ed53349b2d95d47f8eb6605dca309065fcb646))
  * Prefill the user's email on /signin if the user clicks the "sign in" link from " ([efaa0ab8](https://github.com/mozilla/fxa-content-server/commit/efaa0ab83ee7cb36ba50d625c0ecd164ff5da259))
  * Fix the "Sign in" link on `/confirm_reset_password` if the user is in the force  ([9fbe392f](https://github.com/mozilla/fxa-content-server/commit/9fbe392fbc957cdd41284a7a59fae314997dec59))
  * No longer automatically sign in existing users on signup. ([ae625d93](https://github.com/mozilla/fxa-content-server/commit/ae625d934192c0b11b11bacc50eecf2421a32947))
* **email:**
  * generated templates should escape email and link variables ([7bf2b225](https://github.com/mozilla/fxa-content-server/commit/7bf2b22556e2c0f1047037e71ccc3b6d6337a838))
  * don't escape template strings with smart quotes ([886ef989](https://github.com/mozilla/fxa-content-server/commit/886ef989de687f4f7a25da3a4451360d23d4dfe3))
* **emails:** no need to HTML escape text based emails ([fdecafb2](https://github.com/mozilla/fxa-content-server/commit/fdecafb2356c17210ad6d8acd1172543f80dc14e))
* **marketing:** add breakpoints for marketing snippet ([cf9c7698](https://github.com/mozilla/fxa-content-server/commit/cf9c7698da6cd87709106a325659bf6d806fa4a1))
* **server:** Fix IE9 not showing any content. ([cca162d0](https://github.com/mozilla/fxa-content-server/commit/cca162d06489b06fb6743bb5803d5aa38fa7514b))
* **test:** Fix the reset password related tests that were broken by the new form prefill fe ([686533f6](https://github.com/mozilla/fxa-content-server/commit/686533f6fec9b7429799de4a33bf0940b0e72647))
* **tests:**
  * Fixed a regex typo in the reset password tests ([c28bdfc5](https://github.com/mozilla/fxa-content-server/commit/c28bdfc5e8580e6921f4f6f75a7ed19b49cfc9ed))
  * Fix Safari focus issues. ([ef7f760e](https://github.com/mozilla/fxa-content-server/commit/ef7f760efb56d6363d84d45699e1be45de551443), closes [#1049](https://github.com/mozilla/fxa-content-server/issues/1049))
  * Add a missing semicolon. ([85a795e6](https://github.com/mozilla/fxa-content-server/commit/85a795e6024725d62b6d73f2be638f891d7cb088))
  * Fix the jshint errors and warnings in all of the tests. ([ad82aac6](https://github.com/mozilla/fxa-content-server/commit/ad82aac66cc2bb82c6bac3b52d7097b9133fdbf1))
* **ui:** word-break long email addresses ([1d1efbbf](https://github.com/mozilla/fxa-content-server/commit/1d1efbbf289e915cd740309d04f6e44e64834745))


<a name="0.12.0"></a>
## 0.12.0 (2014-05-05)


#### Bug Fixes

* **build:** Use the custom version of Modernizr in prod, not the full version. ([7c31d07a](https://github.com/mozilla/fxa-content-server/commit/7c31d07aeb22e7e95db2114111390a9c6bef689b))
* **client:**
  * Do not show Fx for Android marketing material if completing sign up on B2G or Fe ([23a08b4a](https://github.com/mozilla/fxa-content-server/commit/23a08b4a2008a6a12a80469c5ab3b872255a681f))
  * Gracefully handle server errors when fetching translations. ([24d95825](https://github.com/mozilla/fxa-content-server/commit/24d958252ff31e111930f2d10c2d2bff30d11345))
* **l10n:** normalize locale when fetching client.json ([7a3ce02c](https://github.com/mozilla/fxa-content-server/commit/7a3ce02ce5b90e4b0a4cc3b9214648a4b64bd1f1), closes [#1024](https://github.com/mozilla/fxa-content-server/issues/1024))
* **server:** Ensure the browsehappy text is translated ([ae1cc9e9](https://github.com/mozilla/fxa-content-server/commit/ae1cc9e950596bb4d1ce7abed917206f558283a2))


<a name="0.11.2"></a>
### 0.11.2 (2014-04-29)


#### Bug Fixes

* **email:** Pass {{link}} url into outlook-specific markup in email templates. ([ec231c25](https://github.com/mozilla/fxa-content-server/commit/ec231c2527944b6dbaea9d1370a3e72e2ed7cf8d))


<a name="0.11.1"></a>
### 0.11.1 (2014-04-28)


#### Bug Fixes

* **client:** Gracefully handle server errors when fetching translations. ([768b5926](https://github.com/mozilla/fxa-content-server/commit/768b5926c99246216317a83a01efdd59c9757841))
* **l10n:** revert untranslated strings ([faf5651e](https://github.com/mozilla/fxa-content-server/commit/faf5651ee78956bc540a3856285b4e2cdc393b3e))


<a name="0.11.0"></a>
## 0.11.0 (2014-04-21)


#### Bug Fixes

* **client:**
  * Replaced cookie checks with localStorage checks as a work around for 3rd party c ([4442d1ab](https://github.com/mozilla/fxa-content-server/commit/4442d1ab0186e6141ef47c6761295b202405c196))
  * Correctly handle the THROTTLED error from fxa-client.js->signUp ([5ebe34c2](https://github.com/mozilla/fxa-content-server/commit/5ebe34c24be23a10b65b8eea0ac182251ed3e826))
  * Fix disappearing error messages when toggling password visibility. ([5c71c26f](https://github.com/mozilla/fxa-content-server/commit/5c71c26f8f4aaad4a4c7c883bba7a35460737acd))
* **emails:** make emails responsive + work with outlook ([f2af56c0](https://github.com/mozilla/fxa-content-server/commit/f2af56c02f90879e96a54d352bf58625294dd2a1))
* **i18n:** Ensure i18n works in Chrome. ([a5fa583a](https://github.com/mozilla/fxa-content-server/commit/a5fa583a3d0340aeb9ca168aa784e84574c3b1bf))
* **l10n:**
  * config should return the language not locale ([3d90a4b7](https://github.com/mozilla/fxa-content-server/commit/3d90a4b78b576f86564cc21148a93797a2c1c551))
  * ensure the default locale is listed as supported ([07a07a6c](https://github.com/mozilla/fxa-content-server/commit/07a07a6ccd36c6263c1e1ddd36fe70f5c7c301c5))
* **server:**
  * add cache-control header for /config ([21f992f9](https://github.com/mozilla/fxa-content-server/commit/21f992f9dc52463309529116d4c647bece0a9b71))
  * Add maxAge cache control for static assets ([581531e6](https://github.com/mozilla/fxa-content-server/commit/581531e6c1891c1ef035d58d6be1964b1e5c1368))
* **templates:** make firefox logo visible on templates and add mozilla logo ([9b9a5039](https://github.com/mozilla/fxa-content-server/commit/9b9a5039783b0ccaa11143c743bf6190b28f8bc9))


<a name="0.10.2"></a>
### 0.10.2 (2014-04-18)

#### Bug Fixes

* **tests:** fix privacy heading ID ([4fd3139e](https://github.com/mozilla/fxa-content-server/commit/4fd3139e4a4044e45bd6d06ebc680c4d1f1c667c))


<a name="0.10.1"></a>
### 0.10.1 (2014-04-18)


#### Bug Fixes

* **client:** Replaced cookie checks with localStorage checks as a work around for 3rd party c ([c75bf680](https://github.com/mozilla/fxa-content-server/commit/c75bf6801eb764bfd773c0b831381dd6a58157ea))


<a name="0.10.0"></a>
## 0.10.0 (2014-04-14)


#### Bug Fixes

* **build:** Fix the typo when copying fonts. ([cec3e6eb](https://github.com/mozilla/fxa-content-server/commit/cec3e6eb81dea2f83d243e17c9d76c844c1ee55e))
* **client:** Enable back button functionality when visiting `/`. ([35ba88e2](https://github.com/mozilla/fxa-content-server/commit/35ba88e2656c5fcb57828e6a122505032499eb65))
* **server:** Ensure fonts have cacheable URLs. ([c66e6ef1](https://github.com/mozilla/fxa-content-server/commit/c66e6ef10bb395269c64b9e0dae8d9a234b674f4))


#### Features

* **client:** updating js client to 0.1.18 ([db4764e3](https://github.com/mozilla/fxa-content-server/commit/db4764e381468f7b7edd036a2c5476c59bfa41a5))


<a name="0.9.0"></a>
## 0.9.0 (2014-04-07)


#### Bug Fixes

* **client:**
  * Redirect to start page if resend email token is invalid. ([28217658](https://github.com/mozilla/fxa-content-server/commit/282176589dc4c6737a5db98ed37343620ed920b5))
  * Use sentance casing on placeholder text. ([4d4142f9](https://github.com/mozilla/fxa-content-server/commit/4d4142f9a068c8366c6740c343e789d45341d96d))
  * transition from password reset confirmation to signin once reset is complete ([23311db0](https://github.com/mozilla/fxa-content-server/commit/23311db08271c4b1122e9246b5380d20592d66b1))
  * All error strings should have a Capitalized first letter. ([a1a74b18](https://github.com/mozilla/fxa-content-server/commit/a1a74b18e4320553533eb85679a0a69b6c99be68))
  * Ensure auth-server errors are displayed on confirm pages. ([ba156c2b](https://github.com/mozilla/fxa-content-server/commit/ba156c2b46105f72f051d5cdc8eda425f2a94c36))
* **tests:**
  * Ensure all tests pass. ([a6d0c31c](https://github.com/mozilla/fxa-content-server/commit/a6d0c31c0a5fce37d3dd51302d3b79861d8cb5c2))
  * Use `assert(false, <message>)` instead of `assert.fail(<message>)`. ([e541e3fb](https://github.com/mozilla/fxa-content-server/commit/e541e3fb95b720849ffe036ac1294eeab4417a62))
  * Fix test failures by reducing shared global state. ([f6948cd4](https://github.com/mozilla/fxa-content-server/commit/f6948cd4181ca4c149e041c814affe53350388c8))
  * Update unit and functional tests to handle throttled password reset email reques ([190ba0b5](https://github.com/mozilla/fxa-content-server/commit/190ba0b576d12b9d673b359dd67dc1f4fdf8cbeb))


<a name="0.8.0"></a>
## 0.8.0 (2014-03-31)


#### Bug Fixes

* **build:**
  * Use lowercase extensions on output files in marked. ([bff7ad71](https://github.com/mozilla/fxa-content-server/commit/bff7ad710f0768dee9c6b14dd9b6dfcf2a1a069b))
  * Normalize TOS/PP filenames to use the `_` separator. ([19095a44](https://github.com/mozilla/fxa-content-server/commit/19095a44181911b8b8496a5f85225bcc9f7242a5))
* **client:**
  * Ensure the client specifies a language when requesting TOS/PP templates. ([eef61de4](https://github.com/mozilla/fxa-content-server/commit/eef61de4202d0f22432da5f679db02d0221fa1c0))
  * remove retry functionality over desktop channel ([e722a204](https://github.com/mozilla/fxa-content-server/commit/e722a204f029efe3d269d6f0b7eb76658de8b3ed))
  * automatically add version to auth-server url if missing ([79237efb](https://github.com/mozilla/fxa-content-server/commit/79237efb748185ff1bf99f428e686c9227574662))
  * Enabled autocomplete='off' for all password input boxes. ([51d77028](https://github.com/mozilla/fxa-content-server/commit/51d7702865ebaabd5b4496d4e10fd2c68bf29d61))
* **server:** Redirect with locale name that abide understands. ([b430cd7c](https://github.com/mozilla/fxa-content-server/commit/b430cd7c15c4f10c57330257ebdbc92643b3121c))
* **signup:** choose what to sync checkbox should persist on the signup page ([0570ccdb](https://github.com/mozilla/fxa-content-server/commit/0570ccdb14f54f9ace440e740a1fc9b9d2d5ad12))
* **styles:**
  * kill webkit default inset shadow ([bbf6f856](https://github.com/mozilla/fxa-content-server/commit/bbf6f856b3176a5f5e0c7a01a2aca997e0146e45))
  * user older standard for bg-pos to work with ios7 ([0c2b7e73](https://github.com/mozilla/fxa-content-server/commit/0c2b7e73c62aa42036ea03e4530c168053719a9a))
* **tests:**
  * Fix the failing fxaClient->signIn test. ([3e484316](https://github.com/mozilla/fxa-content-server/commit/3e4843166b6af829a0892eede13724366b97bc81))
  * Ensure a real locale is used for TOS/PP template requests. ([1825b321](https://github.com/mozilla/fxa-content-server/commit/1825b321a09ff542f1c46fbe858056bc7716b9b8))


#### Features

* Translated TOS/PP text! ([26f680b3](https://github.com/mozilla/fxa-content-server/commit/26f680b3d1fc7c2110a2b663d7305fbe2524b80d))
* **client:**
  * Add support for "can_link_account" Desktop Channel message. ([fecbe20d](https://github.com/mozilla/fxa-content-server/commit/fecbe20d3515b890d544646904fd1fa50dbb1f85))
  * updating js client to 0.1.17 ([11e8f398](https://github.com/mozilla/fxa-content-server/commit/11e8f39846d3549e238779390443b15d4e6cbe54))


<a name="0.0.7"></a>
### 0.0.7 (2014-03-24)


#### Bug Fixes

* **client:**
  * Session values only last as long as the browsing session now by default. ([d22e5680](https://github.com/mozilla/fxa-content-server/commit/d22e5680f2268afd6dc1bd2b23341d4be84621d9))
  * put a fixed limit on email resend api calls ([1b3c8b37](https://github.com/mozilla/fxa-content-server/commit/1b3c8b371dc63c3c0644b994c099a8d225c1d18d))
* **fxa-client:** trim leading/trailing whitespace from user's email ([2b5bf630](https://github.com/mozilla/fxa-content-server/commit/2b5bf630553b413fe0c0f70a849dc2f24097053e))
* **l10n:** normalize locale name when generating json strings ([fb1cedff](https://github.com/mozilla/fxa-content-server/commit/fb1cedff7f37094f65cef76084ad55d893e36834))
* **style:**
  * fix android chrome select box ([9b889146](https://github.com/mozilla/fxa-content-server/commit/9b8891468f60a999c570fb56e3dab51bbfa6797b))
  * removes flicker from post email verification screen ([185d0e80](https://github.com/mozilla/fxa-content-server/commit/185d0e80a0825d99ec45fc3d011b8e32f57222de))


<a name="0.0.6"></a>
### 0.0.6 (2014-03-17)


#### Bug Fixes

* **awsbox:** fix awsbox authserver config ([f0134f15](https://github.com/mozilla/fxa-content-server/commit/f0134f1501a630fcede82363c4979955209f11f2))
* **build:** Use fxa-content Sauce Labs account ([4f383524](https://github.com/mozilla/fxa-content-server/commit/4f383524f962106ebc99ad3f52b78bf6d0d11d04))
* **channel:**
  * call 'done' callback in Session.send if given ([f92a6deb](https://github.com/mozilla/fxa-content-server/commit/f92a6debb959ef20625ea5b835f3ba26f0f32f8f))
  * Make sure the web channel invokes the 'done' callback in Channel.send if it's gi ([b8435bf9](https://github.com/mozilla/fxa-content-server/commit/b8435bf9bf4479f4ac32ba8f5bf59bf8ce357269))
* **client:**
  * Hide sign out from users who signed in from Firefox desktop. ([5d8699de](https://github.com/mozilla/fxa-content-server/commit/5d8699de9a1d1a99efd5dc86ff2a8e114dba4e33))
  * Re-enable "delete account" in settings. ([9d6cf483](https://github.com/mozilla/fxa-content-server/commit/9d6cf48356851694281c3ecd8ba5984c90e6e203))
  * Use /settings as the landing page when logging in to the accounts portal. ([9dba7e5a](https://github.com/mozilla/fxa-content-server/commit/9dba7e5a3a232cce9570932e735f48ea990dfab6))
* **constants:** Added a constant for the Fx Desktop context ([582b86e4](https://github.com/mozilla/fxa-content-server/commit/582b86e4a16a31bc32a102e84bbf55ed6bd5af31))
* **l10n:**
  * fix configuration typo causing default language to be undefined ([4cb85819](https://github.com/mozilla/fxa-content-server/commit/4cb85819f9e000d516c9b6de0c9d4cdbd5e0122a))
  * find best locale when region not available ([bb67db05](https://github.com/mozilla/fxa-content-server/commit/bb67db05879608bf86243b10eddc0ce094d6d886))
  * fix string copy task ([8f0b338a](https://github.com/mozilla/fxa-content-server/commit/8f0b338a8befdeccdf94c3aa575475d253a0143f))
  * fetch strings from the l10n repo and fix supported languages config ([dfaa76d7](https://github.com/mozilla/fxa-content-server/commit/dfaa76d758d0e49b80021b6935a377d1e6743249))
* **routes:** allow direct loading of delete_account page ([e4defe45](https://github.com/mozilla/fxa-content-server/commit/e4defe454891bc0b0d649f149c30601ea1c78316))
* **styles:**
  * issue 678 ([12f43c94](https://github.com/mozilla/fxa-content-server/commit/12f43c94ce8aa8ec2622e73d15615bdfabb84b82))
  * Removing explicit Show button width ([7d925a30](https://github.com/mozilla/fxa-content-server/commit/7d925a30ab3ff5497d75b51f391d2307f7d20483))
* **templates:** Remove ip address restriction on email templates ([edd4c0a9](https://github.com/mozilla/fxa-content-server/commit/edd4c0a929d47e3aef5d10a2599057c02c74d251))
* **view:** update delete account view and associated template ([76635cc8](https://github.com/mozilla/fxa-content-server/commit/76635cc8a4cf10a4c8d7e995241d8660ce9150ed))


#### Features

* **client:** Don't show 'settings' when context=desktop and user is verified ([768cd7f7](https://github.com/mozilla/fxa-content-server/commit/768cd7f742c9d0f6a39a550728eaa9f23656a26b))
* **session:** Make the Session aware of the 'context' ([3d7f1b6a](https://github.com/mozilla/fxa-content-server/commit/3d7f1b6adbf84a14dfcb49c2e6f8afea5d200b64))


<a name="0.0.5"></a>
### 0.0.5 (2014-03-10)


#### Bug Fixes

* **client:**
  * signOut is always a success, even if it is a failure. ([7adb896a](https://github.com/mozilla/fxa-content-server/commit/7adb896a176dbbaaebe600a84654e1d393444116), closes [#616](https://github.com/mozilla/fxa-content-server/issues/616))
  * Show "Service unavailable" error message if auth server is unavailable or return ([6c0dc629](https://github.com/mozilla/fxa-content-server/commit/6c0dc62921ca84d53bb0bb304316b6039cc29865), closes [#601](https://github.com/mozilla/fxa-content-server/issues/601))
* **l10n:** add missing debug locale to local config ([15e0403e](https://github.com/mozilla/fxa-content-server/commit/15e0403ef4658af5aa8302d8fff2791bfd669c80))
* **router:**
  * handle an extra slash when loading the index ([bf1a5e24](https://github.com/mozilla/fxa-content-server/commit/bf1a5e2410beea7ad5d660d14868b396039f58c2))
  * allow optional trailing slash on routes - fixes #641 ([0c28907c](https://github.com/mozilla/fxa-content-server/commit/0c28907c5efff8a5688982abdcecb576ee589523))
* **server:**
  * run_locally.js - just pipe the child streams to stdout/stderr ([0a80fbad](https://github.com/mozilla/fxa-content-server/commit/0a80fbad3838a6813a5110c63bb5551185cfc243))
  * add timestamps to log lines - fixes GH-662 ([32f64b30](https://github.com/mozilla/fxa-content-server/commit/32f64b304b37ce8b8265a9d6f576d14b01a24097))
  * Use correct production path for config/version.json ([5211df72](https://github.com/mozilla/fxa-content-server/commit/5211df72d82a8b8fe06621ec95b1385677934cbb), closes [#530](https://github.com/mozilla/fxa-content-server/issues/530))
* **tests:** Update to handle unverified users re-signing up. ([32175d6e](https://github.com/mozilla/fxa-content-server/commit/32175d6e2722a079b7466856d5231a9c3a332f5a), closes [#666](https://github.com/mozilla/fxa-content-server/issues/666))


#### Features

* **client:** Password reset email prefill & /force_auth simplification. ([8259981a](https://github.com/mozilla/fxa-content-server/commit/8259981ac3e9768a1df434255d5f63e1ebeb8544), closes [#549](https://github.com/mozilla/fxa-content-server/issues/549), [#637](https://github.com/mozilla/fxa-content-server/issues/637))


<a name="0.0.2"></a>
### 0.0.2 (2014-03-03)


#### Bug Fixes

* keyframe animations should go to 360 degrees, not 365 ([065ab83c](https://github.com/mozilla/fxa-content-server/commit/065ab83c5fd843ba969d6b2fc9ff384794e22d79))
* remove grunt-contrib-connect dependency. ([77d91393](https://github.com/mozilla/fxa-content-server/commit/77d913933a439a1cad85f14036beabce11b52c62))
* show the focus ring on anchors ([f4694627](https://github.com/mozilla/fxa-content-server/commit/f469462785cf9709ed13f0e1a9a70f7c11f925bf))
* interpolate error string variables with data from backend. ([93c672c5](https://github.com/mozilla/fxa-content-server/commit/93c672c54a8b1dfa5769d5e1535e5a7427ef0c7a))
* **awsbox:** fix awsbox configuration ([2560de4d](https://github.com/mozilla/fxa-content-server/commit/2560de4dfcaaea39aa5d9f6819595fc5f5a91f2c))
* **build:**
  * Use static version numbers for bower deps ([1f07875d](https://github.com/mozilla/fxa-content-server/commit/1f07875d9f4b6161c55592436b9b0cc88c092c1c))
  * Update lockdown.json with new dependencies ([6192bcc8](https://github.com/mozilla/fxa-content-server/commit/6192bcc837d8f49697f316865a2085f3f2067c35))
* **client:**
  * validate emails against IETF rfc5321 ([d7d3a0ba](https://github.com/mozilla/fxa-content-server/commit/d7d3a0ba93b48abd7d5c343633da6fb3461a3a14), closes [#563](https://github.com/mozilla/fxa-content-server/issues/563))
  * Add /signin_complete endpoint. ([083d7734](https://github.com/mozilla/fxa-content-server/commit/083d77344fbb496c52dc5ec18f6e8e9f26185a0b), closes [#546](https://github.com/mozilla/fxa-content-server/issues/546))
* **l10n:** use underscores instead of dashes in locale directory names; enable all locales  ([5fc24fc3](https://github.com/mozilla/fxa-content-server/commit/5fc24fc3a4f549f4d99c5a99a28e2a029664eebd))
* **styles:**
  * Fiding duplicated selector in main.scss ([c23f9f9e](https://github.com/mozilla/fxa-content-server/commit/c23f9f9e22a1f3ad61d866edd54b89bfba0fdae4))
  * Removing unneeded vendor prefixes ([f7e5373c](https://github.com/mozilla/fxa-content-server/commit/f7e5373c507070bb9b44877a3999b9f0f1bc7a12))


#### Features

* Add a styled 404 page, rendered on the back end. ([cc2a024b](https://github.com/mozilla/fxa-content-server/commit/cc2a024bfb72efe5457cbdfc829b1a4cb4620f9e))
* **build:**
  * Adding npm-lockdown ([d60699d7](https://github.com/mozilla/fxa-content-server/commit/d60699d789c3519eefb0caa2f03acb5f40bdb941))
  * Add a `grunt version` task to stamp a new version. ([aaa6e9d8](https://github.com/mozilla/fxa-content-server/commit/aaa6e9d8ecd805bb0f2ed71030c1c4fb448fc703), closes [#496](https://github.com/mozilla/fxa-content-server/issues/496))
* **client:** update document title on screen transition. ([8973b1a3](https://github.com/mozilla/fxa-content-server/commit/8973b1a3ffe60a70d1f55dac950d9fff4fd26e2f), closes [#531](https://github.com/mozilla/fxa-content-server/issues/531))


#### Breaking Changes

* The production configuration script must add a new option to its config :
```
   page_template_subdirectory: 'dist'
```

issue #554

.
 ([cc2a024b](https://github.com/mozilla/fxa-content-server/commit/cc2a024bfb72efe5457cbdfc829b1a4cb4620f9e))


