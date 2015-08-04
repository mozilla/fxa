<a name="0.43.0"></a>
# 0.43.0 (2015-08-04)


### chore

* chore(client): Add the Sync migration strings to strings.js
 ([ac20b86](https://github.com/mozilla/fxa-content-server/commit/ac20b86))
* chore(deps): Bump out of date deps.
 ([d0b8915](https://github.com/mozilla/fxa-content-server/commit/d0b8915)), closes [#2784](https://github.com/mozilla/fxa-content-server/issues/2784)
* chore(deps): update development dependencies
 ([bf9f563](https://github.com/mozilla/fxa-content-server/commit/bf9f563))
* chore(deps): update grunt-eslint to 16.0.0
 ([677a4c0](https://github.com/mozilla/fxa-content-server/commit/677a4c0))
* chore(dev): add 'npm run start-production' command to make it easier to run the server in prod mode
 ([679eeaf](https://github.com/mozilla/fxa-content-server/commit/679eeaf))
* chore(docs): Fix a typo in the firstrun docs.
 ([15f26ac](https://github.com/mozilla/fxa-content-server/commit/15f26ac))
* chore(docs): Update the commit body guidelines to include the issue number
 ([fcf4058](https://github.com/mozilla/fxa-content-server/commit/fcf4058))
* chore(l10n): update pot files
 ([164b9e7](https://github.com/mozilla/fxa-content-server/commit/164b9e7))
* chore(lint): Remove the eslint complexity checks
 ([3592d79](https://github.com/mozilla/fxa-content-server/commit/3592d79))
* chore(sass): update sass
 ([cf5dadf](https://github.com/mozilla/fxa-content-server/commit/cf5dadf))
* chore(strings): add choose what to sync strings
 ([73194ed](https://github.com/mozilla/fxa-content-server/commit/73194ed))
* chore(travis): remove libgmp-dev
 ([492fd94](https://github.com/mozilla/fxa-content-server/commit/492fd94))
* chore(travis): update Travis to use npm 2
 ([7d6ac7d](https://github.com/mozilla/fxa-content-server/commit/7d6ac7d))

### feat

* feat(client): Add the FxiOSV1 Authentication Broker.
 ([5cff1f4](https://github.com/mozilla/fxa-content-server/commit/5cff1f4)), closes [#2860](https://github.com/mozilla/fxa-content-server/issues/2860)
* feat(client): Provide `fx_ios_v1` context string for use by FxiOS
 ([2767a26](https://github.com/mozilla/fxa-content-server/commit/2767a26)), closes [#2861](https://github.com/mozilla/fxa-content-server/issues/2861)
* feat(client): redirect to the requested page after successful login
 ([ccfbef4](https://github.com/mozilla/fxa-content-server/commit/ccfbef4)), closes [#2821](https://github.com/mozilla/fxa-content-server/issues/2821)
* feat(client): sign in/up messaging for migrating users
 ([88a56ac](https://github.com/mozilla/fxa-content-server/commit/88a56ac))
* feat(content-server): Easter egg for Cloud Services
 ([70e1998](https://github.com/mozilla/fxa-content-server/commit/70e1998)), closes [#2470](https://github.com/mozilla/fxa-content-server/issues/2470)
* feat(deps): updating production dependencies
 ([26c26f1](https://github.com/mozilla/fxa-content-server/commit/26c26f1))
* feat(docs): Add info about the firstrun communication protocol.
 ([6e18531](https://github.com/mozilla/fxa-content-server/commit/6e18531))
* feat(l10n): Add support for Hindi (hi) and Hindi-India (hi-IN).
 ([c45edce](https://github.com/mozilla/fxa-content-server/commit/c45edce))
* feat(l10n): check if translated urls are valid
 ([5d378e1](https://github.com/mozilla/fxa-content-server/commit/5d378e1)), closes [#2763](https://github.com/mozilla/fxa-content-server/issues/2763)
* feat(test): Add signin functional tests for Fx on iOS.
 ([bf4fadf](https://github.com/mozilla/fxa-content-server/commit/bf4fadf))

* Merge pull request #2686 from mozilla/convert-iframe-channel
 ([9ec6b18](https://github.com/mozilla/fxa-content-server/commit/9ec6b18))
* Merge pull request #2737 from mozilla/phil/issue-2493
 ([6601361](https://github.com/mozilla/fxa-content-server/commit/6601361)), closes [#2493](https://github.com/mozilla/fxa-content-server/issues/2493)
* Merge pull request #2781 from TDA/issue-2470-easter-egg-redesigned
 ([131171c](https://github.com/mozilla/fxa-content-server/commit/131171c))
* Merge pull request #2803 from mozilla/document-firstrun-protocol
 ([456449e](https://github.com/mozilla/fxa-content-server/commit/456449e))
* Merge pull request #2804 from mozilla/firstrun-docs-typo
 ([bd43972](https://github.com/mozilla/fxa-content-server/commit/bd43972))
* Merge pull request #2805 from vladikoff/issue-2763-verify-translated-urls
 ([dff66fa](https://github.com/mozilla/fxa-content-server/commit/dff66fa))
* Merge pull request #2806 from mozilla/bump-eslint
 ([34c6e30](https://github.com/mozilla/fxa-content-server/commit/34c6e30))
* Merge pull request #2807 from vladikoff/update-deps-t43
 ([c7c4a18](https://github.com/mozilla/fxa-content-server/commit/c7c4a18))
* Merge pull request #2808 from vladikoff/prod-start
 ([d679f9a](https://github.com/mozilla/fxa-content-server/commit/d679f9a))
* Merge pull request #2809 from vladikoff/devdeps-t43
 ([94d56d7](https://github.com/mozilla/fxa-content-server/commit/94d56d7))
* Merge pull request #2812 from mozilla/ios-metrics-missing
 ([48dee30](https://github.com/mozilla/fxa-content-server/commit/48dee30))
* Merge pull request #2813 from mozilla/phil/issue-2493-postponed-navigation
 ([8de80bf](https://github.com/mozilla/fxa-content-server/commit/8de80bf))
* Merge pull request #2814 from mozilla/issue-2784-outdated-deps
 ([8eda711](https://github.com/mozilla/fxa-content-server/commit/8eda711))
* Merge pull request #2816 from mozilla/issues-2513-2623-normalize-auth-errors
 ([c144c51](https://github.com/mozilla/fxa-content-server/commit/c144c51))
* Merge pull request #2822 from eoger/issue-2821
 ([dcab648](https://github.com/mozilla/fxa-content-server/commit/dcab648))
* Merge pull request #2823 from mozilla/phil/issue-2786
 ([ee4443f](https://github.com/mozilla/fxa-content-server/commit/ee4443f))
* Merge pull request #2826 from mozilla/issue-2789-de-eslint-complexity
 ([b8db477](https://github.com/mozilla/fxa-content-server/commit/b8db477))
* Merge pull request #2833 from mozilla/issue-2830-correct-oauth-errors
 ([d60dd9d](https://github.com/mozilla/fxa-content-server/commit/d60dd9d))
* Merge pull request #2839 from mozilla/add-hindi-support
 ([0ccfb8d](https://github.com/mozilla/fxa-content-server/commit/0ccfb8d))
* Merge pull request #2840 from eoger/issue-2837
 ([b98e8f3](https://github.com/mozilla/fxa-content-server/commit/b98e8f3))
* Merge pull request #2841 from mozilla/update-sass
 ([e976839](https://github.com/mozilla/fxa-content-server/commit/e976839))
* Merge pull request #2845 from mozilla/issue-2844-merge-warning-firstrun
 ([0efbe4e](https://github.com/mozilla/fxa-content-server/commit/0efbe4e))
* Merge pull request #2846 from vladikoff/npm2
 ([4ed0589](https://github.com/mozilla/fxa-content-server/commit/4ed0589))
* Merge pull request #2847 from eoger/contributing-body-fixes
 ([640f6ac](https://github.com/mozilla/fxa-content-server/commit/640f6ac))
* Merge pull request #2851 from mozilla/issue-2850-invalid-client-id
 ([3bb62ae](https://github.com/mozilla/fxa-content-server/commit/3bb62ae))
* Merge pull request #2853 from mozilla/issue-2658-firstrun-signout
 ([4b6ab6a](https://github.com/mozilla/fxa-content-server/commit/4b6ab6a))
* Merge pull request #2854 from mozilla/remove-libgmp-dev
 ([93f3641](https://github.com/mozilla/fxa-content-server/commit/93f3641))
* Merge pull request #2857 from mozilla/issue-2856-metrics-screen-name-order
 ([73d8587](https://github.com/mozilla/fxa-content-server/commit/73d8587))
* Merge pull request #2859 from mozilla/issue-2858-one-mailcheckEnabled-choice
 ([74160d5](https://github.com/mozilla/fxa-content-server/commit/74160d5))
* Merge pull request #2863 from mozilla/issue-2786-strings
 ([d3eace6](https://github.com/mozilla/fxa-content-server/commit/d3eace6))
* Merge pull request #2865 from mozilla/rfk/fx-ios-v1-context
 ([c39d365](https://github.com/mozilla/fxa-content-server/commit/c39d365))
* Merge pull request #2866 from mozilla/constant-names
 ([5cf3012](https://github.com/mozilla/fxa-content-server/commit/5cf3012))
* Merge pull request #2868 from mozilla/issue-2860-no-signup-fx-ios
 ([719b2ae](https://github.com/mozilla/fxa-content-server/commit/719b2ae))
* Merge pull request #2869 from mozilla/choose-sync-strings
 ([40783dc](https://github.com/mozilla/fxa-content-server/commit/40783dc))
* Merge pull request #2871 from mozilla/rfk/basket-api-timeout
 ([42b73e2](https://github.com/mozilla/fxa-content-server/commit/42b73e2))
* Merge pull request #2875 from vladikoff/i2495
 ([b4dc552](https://github.com/mozilla/fxa-content-server/commit/b4dc552))
* Merge pull request #2876 from vladikoff/migrate-test-fix
 ([66dcd79](https://github.com/mozilla/fxa-content-server/commit/66dcd79))
* Merge pull request #2878 from vladikoff/exp43
 ([9b6beda](https://github.com/mozilla/fxa-content-server/commit/9b6beda))

### fix

* fix(avatar): cropper resize tests are more accurate
 ([8c7f362](https://github.com/mozilla/fxa-content-server/commit/8c7f362))
* fix(avatars): fixes blank avatars when session is expired
 ([3d0e7eb](https://github.com/mozilla/fxa-content-server/commit/3d0e7eb)), closes [#2495](https://github.com/mozilla/fxa-content-server/issues/2495)
* fix(basket): add explicit timeout when proxying to basket api.
 ([7fde0f5](https://github.com/mozilla/fxa-content-server/commit/7fde0f5))
* fix(client): Do not allow firstrun Sync based flows to sign out.
 ([a28fce6](https://github.com/mozilla/fxa-content-server/commit/a28fce6)), closes [#2658](https://github.com/mozilla/fxa-content-server/issues/2658)
* fix(client): Fix incorrect OAuth errors in error table.
 ([78ba49e](https://github.com/mozilla/fxa-content-server/commit/78ba49e)), closes [#2830](https://github.com/mozilla/fxa-content-server/issues/2830)
* fix(client): Fix merge warning handling in the firstrun flow.
 ([4914b73](https://github.com/mozilla/fxa-content-server/commit/4914b73)), closes [#2844](https://github.com/mozilla/fxa-content-server/issues/2844)
* fix(client): Invalid client id's show a 400 page, not 500.
 ([cd898f5](https://github.com/mozilla/fxa-content-server/commit/cd898f5)), closes [#2850](https://github.com/mozilla/fxa-content-server/issues/2850)
* fix(client): Normalize all errors from the Auth Server.
 ([3a45d1a](https://github.com/mozilla/fxa-content-server/commit/3a45d1a)), closes [#2513](https://github.com/mozilla/fxa-content-server/issues/2513) [#2623](https://github.com/mozilla/fxa-content-server/issues/2623)
* fix(experiments): add train-43 experiments
 ([9fa1fd4](https://github.com/mozilla/fxa-content-server/commit/9fa1fd4))
* fix(metrics): Ensure a screen's name is logged before any of it's events.
 ([25971d1](https://github.com/mozilla/fxa-content-server/commit/25971d1)), closes [#2856](https://github.com/mozilla/fxa-content-server/issues/2856)
* fix(metrics): Only check whether mailcheck is enabled once.
 ([6de03f1](https://github.com/mozilla/fxa-content-server/commit/6de03f1)), closes [#2858](https://github.com/mozilla/fxa-content-server/issues/2858)
* fix(metrics): minimize flush timeout and flush event metrics on blur event
 ([5b22cb3](https://github.com/mozilla/fxa-content-server/commit/5b22cb3)), closes [#2577](https://github.com/mozilla/fxa-content-server/issues/2577)
* fix(metrics): postpone OAuth navigation until metrics are flushed
 ([503e670](https://github.com/mozilla/fxa-content-server/commit/503e670))
* fix(metrics): use sendBeacon where available
 ([d45586e](https://github.com/mozilla/fxa-content-server/commit/d45586e))
* fix(tests): better migration message functional tests
 ([ecb28ea](https://github.com/mozilla/fxa-content-server/commit/ecb28ea))
* fix(tests): use "afterEach" instead of "teardown" for sync settings tests
 ([f49cafb](https://github.com/mozilla/fxa-content-server/commit/f49cafb))

### refactor

* refactor(client): Rename `FX_DESKTOP_CONTEXT` to `FX_DESKTOP_V1_CONTEXT`
 ([146dd54](https://github.com/mozilla/fxa-content-server/commit/146dd54))
* refactor(client): Rename `FX_DESKTOP_SYNC` to `SYNC_SERVICE`.
 ([5dc8b7a](https://github.com/mozilla/fxa-content-server/commit/5dc8b7a))
* refactor(client): Simplify the app-start error reporting/redirection.
 ([918ff9c](https://github.com/mozilla/fxa-content-server/commit/918ff9c))
* refactor(client): The IframeChannel is now DuplexChannel based.
 ([aa15de2](https://github.com/mozilla/fxa-content-server/commit/aa15de2))



<a name="0.42.0"></a>
### 0.42.0 (2015-07-21)


#### Bug Fixes

* **able:** update shrinkwrap ([d8fa3019](https://github.com/mozilla/fxa-content-server/commit/d8fa3019cccd1a60f3f3376b332c145aaa11a40e))
* **avatars:**
  * resize avatars before cropping them ([decc26c8](https://github.com/mozilla/fxa-content-server/commit/decc26c855c603a528ae2859eb84ea9e56260611))
  * error message does not overlap with the default avatar anymore ([5f5284f7](https://github.com/mozilla/fxa-content-server/commit/5f5284f7c304054b7229b5a5ea36f19713f38618))
  * ensure uploaded avatars dimensions are 100x100px at least ([43580105](https://github.com/mozilla/fxa-content-server/commit/4358010543d47ce129659e5cc48fdd2def4a3c63))
  * replace the word Home by Back ([c8b9bb10](https://github.com/mozilla/fxa-content-server/commit/c8b9bb101903c7bfb7b37648e0dcd44c412c7f96))
* **client:**
  * Hide the border around the marketing snippet for the firstrun flow. ([a84e2546](https://github.com/mozilla/fxa-content-server/commit/a84e254682851ef1de1c199e926ed3d558735722))
  * Ensure COPPA errors are logged. ([628b62c8](https://github.com/mozilla/fxa-content-server/commit/628b62c8ec30983909d58a946261ef6c6a76f106))
  * Handle 4xx and 5xx Basket errors. ([bc862acb](https://github.com/mozilla/fxa-content-server/commit/bc862acb9d51f21f72b86a17dc51b66b15fff00e))
  * Ensure the password manager has an email to work with. ([ff38e16a](https://github.com/mozilla/fxa-content-server/commit/ff38e16a81163ee4baa1a04d949bec7f8166646a))
  * Firstrun flow should not halt the screens after login. ([a178fa0b](https://github.com/mozilla/fxa-content-server/commit/a178fa0b75bfa47fc478065a8aa9aa4d37bc245d))
* **config:**
  * add production experiments config file ([8c87743d](https://github.com/mozilla/fxa-content-server/commit/8c87743d048e721451471071c232dc77710e9adb))
  * use dev branch of experiments ([0f3bdbc2](https://github.com/mozilla/fxa-content-server/commit/0f3bdbc225cbcaf2174469ffddc0fd1cee8421a2))
* **cookies:** redirect to /cookies_disabled if storage is disabled ([a24931f2](https://github.com/mozilla/fxa-content-server/commit/a24931f2d803dec2183d8f1292e434477b6df526), closes [#2480](https://github.com/mozilla/fxa-content-server/issues/2480))
* **forms:** fixes regression with the floating placeholder ([d9853f00](https://github.com/mozilla/fxa-content-server/commit/d9853f00cb4afc18b433d4ab6c1c145712930345), closes [#2739](https://github.com/mozilla/fxa-content-server/issues/2739))
* **log:** log errors with no message ([37af6e2a](https://github.com/mozilla/fxa-content-server/commit/37af6e2af4ff1821cb32eb6ed16187e25df7b4c9))
* **metrics:** include coppa errors in metrics ([3b5841a5](https://github.com/mozilla/fxa-content-server/commit/3b5841a5299d2716a7a77172312d57c065151440), closes [#2512](https://github.com/mozilla/fxa-content-server/issues/2512))
* **oauth:** handle short-lived access tokens for profile server requests ([b372c806](https://github.com/mozilla/fxa-content-server/commit/b372c8066cbb6ab27e8af8a2cd20c861d33f5543))
* **server:**
  * remove 'Fxa requires JavaScript' message in ie8/9 Add conditional comment to not ([158c041b](https://github.com/mozilla/fxa-content-server/commit/158c041b50d1c2d848662acb65be80c81a4146f1), closes [#2279](https://github.com/mozilla/fxa-content-server/issues/2279))
  * let server task fail if port is in use ([fb175809](https://github.com/mozilla/fxa-content-server/commit/fb175809f829b31833ca8ccea75fa1b122703763))
* **signin:** Hide the Unauthorized avatar error ([bc17e796](https://github.com/mozilla/fxa-content-server/commit/bc17e79644706f121ad0e928a7ac566bc43ee7d9))
* **styles:** Hide the service name in the firstrun flow. ([4d98dd1a](https://github.com/mozilla/fxa-content-server/commit/4d98dd1a0517b6da938ee59d32b7fd933d9f8d7e))
* **sync:** do not send sessionTokenContext to Firefox Sync ([5b29830b](https://github.com/mozilla/fxa-content-server/commit/5b29830b9f6e7c7f1065b7c4421c7baf04ae6eff), closes [#2766](https://github.com/mozilla/fxa-content-server/issues/2766))
* **tests:**
  * show the firefox --version in test logs ([f1c60a29](https://github.com/mozilla/fxa-content-server/commit/f1c60a29cc7435293d10b2ff169eafef8cbac281))
  * only log "waiting" if too many attempts ([427ef395](https://github.com/mozilla/fxa-content-server/commit/427ef3955eef8180ef02e447ebf89c3486e7e092))
  * set metrics.sample_rate based on FxaDevBox too ([8b7d469e](https://github.com/mozilla/fxa-content-server/commit/8b7d469eb693819dc42794d371c48a85508bee5a))
  * allow override of expected value from remote server ([3e734189](https://github.com/mozilla/fxa-content-server/commit/3e73418950f3d21f8eb22c9485ef8ca2816d52bd))
  * add fxaDevBox config param ([6688dd73](https://github.com/mozilla/fxa-content-server/commit/6688dd73553b18dbde7b2dea35ed4004617de747))
  * only update Fx binaries if they are stale ([989243e5](https://github.com/mozilla/fxa-content-server/commit/989243e502e92db15fe087bcc574d095fe0e911f))
  * add a test runner for intern_server tests ([1e551e37](https://github.com/mozilla/fxa-content-server/commit/1e551e3764a1102915d00625b803beed25fbfac5))


#### Features

* **avatars:** enable the gravatar option with permission prompt ([c2b5d96c](https://github.com/mozilla/fxa-content-server/commit/c2b5d96c658db2ed1f7ff4080fd116eef882f916), closes [#2053](https://github.com/mozilla/fxa-content-server/issues/2053))
* **client:**
  * Send a `signup_must_verify` event to the firstrun page on signup. ([da411363](https://github.com/mozilla/fxa-content-server/commit/da41136348eb0846af50935647d729dd6dc2c223))
  * update to fxa-js-client 0.1.30 ([d81207c5](https://github.com/mozilla/fxa-content-server/commit/d81207c58429b62b1b9c3d5fafc369cc7d564003))
  * firstrun - notify the parent of important events. ([aade4c77](https://github.com/mozilla/fxa-content-server/commit/aade4c77e01207f5c9aa80882ca3155cca46dfbe))
  * Pass Google Analytics query params to metrics. ([b0f273a2](https://github.com/mozilla/fxa-content-server/commit/b0f273a2bc8d44a4a46338dc6c231bca5d01798f))
  * Preserve `uniqueUserId` across email verifiation. ([84063546](https://github.com/mozilla/fxa-content-server/commit/8406354691085ccb748a1cb19607e431bb31717c))
  * `campaign` and `entrypoint` are sent to metrics on verification. ([2c354ae0](https://github.com/mozilla/fxa-content-server/commit/2c354ae0fc7fd063ba8f18ca0bc38f63ae100c0c))
  * Add support for `context=fx_desktop_v2` ([8830562a](https://github.com/mozilla/fxa-content-server/commit/8830562a6f8efbcc340dd36923c7b6ae5cd7f659))
* **metrics:**
  * add server google analytics events ([c549edfb](https://github.com/mozilla/fxa-content-server/commit/c549edfb3eef6056d9ca2c9d65590a7e16d9ad29))
  * Report all metrics to our backend. ([bf71368e](https://github.com/mozilla/fxa-content-server/commit/bf71368efc5d4a409c1c79201dcf8912438930da))
  * add timing metrics to the statsd collector ([90c95c7f](https://github.com/mozilla/fxa-content-server/commit/90c95c7fb339406eb2ae8db45ae0126337bfbb78))


<a name="0.41.1"></a>
## 0.41.1 (2015-07-08)


#### Bug Fixes

* **templates:** fixes issues with 50*.html templates in production mode ([09e95013](https://github.com/mozilla/fxa-content-server/commit/09e95013745f193799ac39f9b41f4bff67ee28cf), closes [#2663](https://github.com/mozilla/fxa-content-server/issues/2663))


<a name="0.41.0"></a>
## 0.41.0 (2015-07-08)


#### Bug Fixes

* **avatars:** Fix float imprecision errors when saving cropped image ([b241c698](https://github.com/mozilla/fxa-content-server/commit/b241c698871e331df7633e7e372fa44da2fd1686))
* **client:** Mozilla Payments flow is not considered an iframe. ([82c1981d](https://github.com/mozilla/fxa-content-server/commit/82c1981d942b839f7e77235cc6a29073be5c94fe))
* **content-server:** open TOS/PP in new tab if inside an iframe Check for presence of link inside ifr ([a556142e](https://github.com/mozilla/fxa-content-server/commit/a556142ec36e2f29a009a573372e885de211f5be), closes [#2351](https://github.com/mozilla/fxa-content-server/issues/2351))
* **icons:** add a precomposed icon for apple devices to avoid extra 404 requests ([df4dccd7](https://github.com/mozilla/fxa-content-server/commit/df4dccd7c0c9c92d177d2864e09715ec57b95e71), closes [#2655](https://github.com/mozilla/fxa-content-server/issues/2655))
* **lint:** Fix the eslint camelcase errors. ([b352476a](https://github.com/mozilla/fxa-content-server/commit/b352476a65b5df815191993b37760bfe56ef41bc))
* **marketing:** add a bit of top margin to the opt in ([042c210f](https://github.com/mozilla/fxa-content-server/commit/042c210f0036b3295cd3821b6bb4c4d8ae0582fc))
* **styles:** Fix the header spacing for the firstrun flow. ([b855a72b](https://github.com/mozilla/fxa-content-server/commit/b855a72ba60be43217af26a1c4c475da0630a893))
* **tests:**
  * check that content in all expected languages is available ([89591f00](https://github.com/mozilla/fxa-content-server/commit/89591f00c0be675e43762d342700fd9322f9a80a))
  * adjust code to support IE10 ([a1c7c203](https://github.com/mozilla/fxa-content-server/commit/a1c7c203893aebc09aa09bcee9aca08731e31875), closes [#2378](https://github.com/mozilla/fxa-content-server/issues/2378))


#### Features

* **avatars:** add metrics for avatar cropping operations ([79c05c97](https://github.com/mozilla/fxa-content-server/commit/79c05c9748eaef5d2073a72111284c2077e978c7))
* **metrics:** add Sentry metrics for front-end errors ([9c11f69a](https://github.com/mozilla/fxa-content-server/commit/9c11f69a9111f469fe72049ae607b7784f70df20))
* **oauth:** allow access_type query parameter ([ebcc10d4](https://github.com/mozilla/fxa-content-server/commit/ebcc10d4806ac8d2c4ae3c718a0e3547af5c9a0e))
* **signup:** adds mailcheck + ab testing ([1553651d](https://github.com/mozilla/fxa-content-server/commit/1553651d6bf5806360c6773b50002a5099e70fbf))


#### Breaking Changes

* Developer's local.json needs to be updated to remove
the `api_proxy` configuration parameter.
 ([d69a64b1](https://github.com/mozilla/fxa-content-server/commit/d69a64b1748aa6a5daf15ae680bd441f1118edab))


<a name="0.40.0"></a>
## 0.40.0 (2015-06-29)


#### Bug Fixes

* **avatars:** rounded camera cropper in google chrome ([5c4a1264](https://github.com/mozilla/fxa-content-server/commit/5c4a12642b52422753c62d7f5298f113adb92178))
* **basket:** add a bit more logging to basket-proxy-server ([2de3d6aa](https://github.com/mozilla/fxa-content-server/commit/2de3d6aa155ba08e1752369dccc1805febd76b61))
* **build:** revert use script and force it to use function mode ([faa0a02d](https://github.com/mozilla/fxa-content-server/commit/faa0a02d459b7c6c67bc774295700422a1cb3882))
* **client:**
  * Supress the malformed WebChannelMessageToContent log for errors ([531a2259](https://github.com/mozilla/fxa-content-server/commit/531a225976155e4a4ffa83d49b7a91452621145e))
  * Fix the submit button on communcation preferences page. ([fa0df9c7](https://github.com/mozilla/fxa-content-server/commit/fa0df9c77bfb3cf33ae62c596aa15bc35926c69a))
* **lint:** remove "use strict" from server code ([745e569b](https://github.com/mozilla/fxa-content-server/commit/745e569b8042858b45f95ebea23f5ae45e91f84f), closes [#2558](https://github.com/mozilla/fxa-content-server/issues/2558))
* **server:** inconsistent use of 'use strict' ([38ab1c05](https://github.com/mozilla/fxa-content-server/commit/38ab1c0516525274f2cec1fe380516c88545a7b0), closes [#1318](https://github.com/mozilla/fxa-content-server/issues/1318))
* **tests:**
  * restore first tests to run are signin and signup ([c3d474a1](https://github.com/mozilla/fxa-content-server/commit/c3d474a153c20a93f2a0086986a8cb0d9df2defd))
  * use the regularly updated firefox binaries ([8bb8e3b4](https://github.com/mozilla/fxa-content-server/commit/8bb8e3b40c16ad152f1f02e88cf78da37d32d37d))
  * fix Basket functional tests ([6adf3c0d](https://github.com/mozilla/fxa-content-server/commit/6adf3c0d837107163d84914ed4214c13d52f51ce))
  * add a run script for beta on latest ([bcb0e699](https://github.com/mozilla/fxa-content-server/commit/bcb0e69998e200b0d3fd0f0246f3ddbf32ae6c9c))


#### Features

* **client:**
  * Notify IFRAME reliers when the content height changes. ([c698324b](https://github.com/mozilla/fxa-content-server/commit/c698324b400a8be66d1b119a3c877b4b3b9da0bd))
  * Add Easter Egg to Content Server ([0a5ea8ed](https://github.com/mozilla/fxa-content-server/commit/0a5ea8ed461575fa4d194a0d1bab857278524bee))
* **metrics:** add uuid for metrics and able purposes ([89ac7a58](https://github.com/mozilla/fxa-content-server/commit/89ac7a587c31741a00cc29c8dca7d9b2042b1b48))
* **server:** Support /v1/reset_password ([043f6221](https://github.com/mozilla/fxa-content-server/commit/043f6221bcab6e396858c10bdde8b222d6ebbd3b))
* **style:** The `chromeless` style hides the header. ([7b12bbf6](https://github.com/mozilla/fxa-content-server/commit/7b12bbf68dd5e8e33d5ec05daa67c56403aa73a5))


<a name="0.39.0"></a>
## 0.39.0 (2015-06-09)


#### Bug Fixes

* **avatars:**
  * allow users to change their avatar if they have/had one ([e6a9cd0d](https://github.com/mozilla/fxa-content-server/commit/e6a9cd0d7b3f3f511d8e960cbb9978b2c5fc41d4))
  * disable the gravatar option on avatar change ([153f3d4c](https://github.com/mozilla/fxa-content-server/commit/153f3d4cfa98df75e9a819e6d5edf4f0aea7d6e9))
* **basket:**
  * only destroy the token if we successfully acquired one ([de4c26c7](https://github.com/mozilla/fxa-content-server/commit/de4c26c785fca0bbc8f6c1f742e3ed6f95ec03b5))
  * URI-encode email address in basket server urls. ([a43061d3](https://github.com/mozilla/fxa-content-server/commit/a43061d3317af3d26c15337c314e07f6ab5dade2))
* **basket-proxy:** tighten up param checking and logging ([fa5aa01d](https://github.com/mozilla/fxa-content-server/commit/fa5aa01d1e19df561b1497fc23aedd0422826abc))
* **client:** Continue email verification flow on Basket server error. ([919e64db](https://github.com/mozilla/fxa-content-server/commit/919e64dbf1389da8f03ef993613a0c7c90838e53))
* **docs:** add verification_redirect to query params ([5dff0821](https://github.com/mozilla/fxa-content-server/commit/5dff08217ae9401010e175900c892e4906cb09bd), closes [#2438](https://github.com/mozilla/fxa-content-server/issues/2438))
* **form:** fixes form autofill for Firefox and paste for iOS ([9b062568](https://github.com/mozilla/fxa-content-server/commit/9b062568ef152694be276488f01b36f203d3b2d8))
* **metrics:** measure when users add or modify their profile picture. ([e5b35659](https://github.com/mozilla/fxa-content-server/commit/e5b356594ee1c596fcfc400aa9671d21a44e797d), closes [#2294](https://github.com/mozilla/fxa-content-server/issues/2294))
* **npm:** move request to production dependency ([dcd6a50c](https://github.com/mozilla/fxa-content-server/commit/dcd6a50c98471a3c53b4798c24cb14219e46a66b))
* **oauth:** sanitize scope of untrusted reliers ([f80a57fb](https://github.com/mozilla/fxa-content-server/commit/f80a57fbe163646d59396d8c3330d162fab259af))
* **test:** Fix refreshes_metrics functional test on Firefox 18 ([52c88e54](https://github.com/mozilla/fxa-content-server/commit/52c88e543d4036733d9bbb53c7f72d7483df573f))
* **tests:**
  * more improvements to avatar tests to avoid remote timeouts ([c7a44841](https://github.com/mozilla/fxa-content-server/commit/c7a448414b7fd03e3ee7d9436504cf91c4be8e8d))
  * improve legal copy tests and update avatar tests ([11104f77](https://github.com/mozilla/fxa-content-server/commit/11104f772790ba63efca3d13a00b848be6df2771))
  * skip functional/email_opt_in test if fxaProduction=true ([c7fbe52c](https://github.com/mozilla/fxa-content-server/commit/c7fbe52cc9901caaea17bcd0c83af4bc829a7977))
  * wait for ".error" to be visible; fixes #2475 ([8ab41765](https://github.com/mozilla/fxa-content-server/commit/8ab4176525520a5125c198b16f3ae46c8b989066))


#### Features

* Email opt-in. ([8c4246ec](https://github.com/mozilla/fxa-content-server/commit/8c4246ec5afdb25a9c2fe6fc290f506ef8c2e896))
* **build:** Compress the HTML files ([39667b9a](https://github.com/mozilla/fxa-content-server/commit/39667b9aa5a599b275546e4a26ce116232e10bcb))
* **server:** add basket proxy server ([4cbfed3d](https://github.com/mozilla/fxa-content-server/commit/4cbfed3d33b70a8e35ac894e2b7ce3c61d1fdbaa))
* **tests:** Add metrics in functional tests ([18658991](https://github.com/mozilla/fxa-content-server/commit/186589914de6cd0db4ce74d81411f1174a4f26d4))


<a name="0.38.1"></a>
### 0.38.1 (2015-05-28)


#### Bug Fixes

* **oauth:** sanitize scope of untrusted reliers ([619b3429](https://github.com/mozilla/fxa-content-server/commit/619b3429a46fdcb1e19ddc53c3ec7cb4a4e3c90b))
* **tests:** wait for ".error" to be visible; fixes #2475 ([436a47c7](https://github.com/mozilla/fxa-content-server/commit/436a47c718400f7d96b89f4832f9e3c936d38a43))


<a name="0.38.0"></a>
## 0.38.0 (2015-05-26)


#### Bug Fixes

* **avatars:**
  * Redirect to settings/avatar/change on error ([6b6a5f77](https://github.com/mozilla/fxa-content-server/commit/6b6a5f77c6cc0f332b4649a22678aa9ef4278644))
  * cache the profile image after fetching ([30601d4f](https://github.com/mozilla/fxa-content-server/commit/30601d4f2ef466f9203bcb31079ada17ab470909), closes [#2429](https://github.com/mozilla/fxa-content-server/issues/2429))
* **client:** `Invalid scopes` is an error message. ([3f42a328](https://github.com/mozilla/fxa-content-server/commit/3f42a32867bcb5a4171f82c489e2e7eb2db0f858))
* **docs:**
  * add <screen_name>.refresh metrics event ([d30a95b2](https://github.com/mozilla/fxa-content-server/commit/d30a95b2838f53aa78253fbecbc63e3572fe6806))
  * add confirm resend metrics event ([492f8bbf](https://github.com/mozilla/fxa-content-server/commit/492f8bbfd77666e97e93a0e40fb3efa309d28fc5))
  * fix metrics documentation headers ([dc24d386](https://github.com/mozilla/fxa-content-server/commit/dc24d3868f1dc398691859b705f4fc6535bb7df1))
* **metrics:**
  * set metrics to 1 in local dev ([5599e91d](https://github.com/mozilla/fxa-content-server/commit/5599e91d708b6df3816aaae9a88cb7cbcaeb245c))
  * metrics for signout. ([455da813](https://github.com/mozilla/fxa-content-server/commit/455da8131ca1f7923b59c110303b19e8322281f0), closes [#2295](https://github.com/mozilla/fxa-content-server/issues/2295))
* **oauth:**
  * strip permissions that are not on the whitelist ([a6a22c0a](https://github.com/mozilla/fxa-content-server/commit/a6a22c0ab74139ed2d8ceef3a7315200e68bfa38))
  * update verification_redirect to always redirect in same browser or show "proceed ([3be6da92](https://github.com/mozilla/fxa-content-server/commit/3be6da9263abe05754ffd8e2244c114c695da94f), closes [#2436](https://github.com/mozilla/fxa-content-server/issues/2436), [#2402](https://github.com/mozilla/fxa-content-server/issues/2402))
* **tests:**
  * improve progress indicator coverage ([51cb1058](https://github.com/mozilla/fxa-content-server/commit/51cb1058bcf1f81e298d26609e11092a229685a0), closes [#2465](https://github.com/mozilla/fxa-content-server/issues/2465))
  * remove Test lib from verification_redirect ([a38d8082](https://github.com/mozilla/fxa-content-server/commit/a38d80828bca01c16406183dffd0194fb5ffe836))
  * update travis to firefox 38 ([35d0027f](https://github.com/mozilla/fxa-content-server/commit/35d0027fb8e56b35346e847c84fe26532412085a))
  * Update the submit button selector for the permissions screen tests. ([e67cbc30](https://github.com/mozilla/fxa-content-server/commit/e67cbc305513c7d945396c0cbd4cbc8223345e16))


#### Features

* `/` can be framed by allowed reliers. ([aedfae9e](https://github.com/mozilla/fxa-content-server/commit/aedfae9e1ca1c1891d9cb3b7430390bdfdcc1d98))
* **client:** Pass along a `service` and `reason` whenever signing a user in. ([32812392](https://github.com/mozilla/fxa-content-server/commit/32812392012ae583541daf9c4fa0caf1b462abc3))
* **lib:** storage lib is now able to use sessionStorage ([33c53def](https://github.com/mozilla/fxa-content-server/commit/33c53defb91f2bd8ac96e025191fd3c825945024))
* **metrics:** measure page reloads by user ([29ede010](https://github.com/mozilla/fxa-content-server/commit/29ede010010eb14ca994fba78d49674fb0d0f3d5))
* **oauth:** signal action=signup or action=signin at end of oauth flow. ([9016164b](https://github.com/mozilla/fxa-content-server/commit/9016164b7742c04ddf15169c1ccceac2a2634941))


<a name="0.37.1"></a>
### 0.37.1 (2015-05-14)


#### Bug Fixes

* **metrics:** track account deleted events ([2c296a44](https://github.com/mozilla/fxa-content-server/commit/2c296a445ed7d613ec99e3711311c122ae989a9e), closes [#2297](https://github.com/mozilla/fxa-content-server/issues/2297))
* **oauth:** serviceUri is not used for now so remove it ([b361aba3](https://github.com/mozilla/fxa-content-server/commit/b361aba35df3215105e8d57f108db3f64007e886))
* **tests:** increase timeout for password reset tests ([10a3fc6c](https://github.com/mozilla/fxa-content-server/commit/10a3fc6c340446097d9b5ebd8b50f9a573fa6f72))


<a name="0.37.0"></a>
## 0.37.0 (2015-05-13)


#### Bug Fixes

* **client:**
  * Ensure ask-password metrics are only logged once. ([bc336543](https://github.com/mozilla/fxa-content-server/commit/bc336543a7f99998f2b32d7f698934e38c8d03c0))
  * getUserMedia check for avatar change. ([0a0405bd](https://github.com/mozilla/fxa-content-server/commit/0a0405bd6f0bd4f74cb9cd0bc4634ddbeb041832))
* **oauth:**
  * bring back oauth session clearing to WebChannels ([7487fe65](https://github.com/mozilla/fxa-content-server/commit/7487fe6582b8bf946275a2452bcbb0fa8d483ae9))
  * Ensure we can derive relier keys during the signup flow. ([fd2fc72d](https://github.com/mozilla/fxa-content-server/commit/fd2fc72d3af8abaa7acff61f026c166fc306d3c3))
* **signup:** make email suggestion tooltip keyboard accessible ([6d40efbb](https://github.com/mozilla/fxa-content-server/commit/6d40efbb9153fed8d88d2aa455b43eaaf591637a), closes [#2185](https://github.com/mozilla/fxa-content-server/issues/2185))
* **tests:**
  * Fix the oauth permissions tests. ([2b479e1e](https://github.com/mozilla/fxa-content-server/commit/2b479e1e563790d442951e4989cc303e71bca85f))
  * more timeout and fix element .end() for OAuth tests ([6296db62](https://github.com/mozilla/fxa-content-server/commit/6296db621dafe10de8808bd992957495484ad783))
  * add untrusted app to TeamCity configs ([33a97662](https://github.com/mozilla/fxa-content-server/commit/33a97662990370e8d4e46d65fabc4038f90f347d))
  * stabilize tos and pp functional tests ([50994dc6](https://github.com/mozilla/fxa-content-server/commit/50994dc6c73120deeea5f70a93ade904878e3701))


#### Features

* **client:**
  * Sync over WebChannel glue ([92b118c9](https://github.com/mozilla/fxa-content-server/commit/92b118c9711e3d69078e9fe68b10d83b0f243715))
  * Add a DuplexChannel, convert the WebChannel to a duplex channel. ([9b1ebb1e](https://github.com/mozilla/fxa-content-server/commit/9b1ebb1e83b1a795f1a249884992ed316b7d3329))
* **metrics:**
  * Log metrics about whether we ask for a password at signin: ([838c365e](https://github.com/mozilla/fxa-content-server/commit/838c365ec5528141c178f1d03deae665141e9b06))
  * adds DataDog integration ([d10b0de0](https://github.com/mozilla/fxa-content-server/commit/d10b0de0fba0679dd12028e7dad1370bc051ace0))
* **oauth:**
  *  'verification_redirect' option for OAuth reliers ([a5fdaee9](https://github.com/mozilla/fxa-content-server/commit/a5fdaee90b61b7aa3ecc5c39e6d2499a19632750))
  * show permission screen for untrusted reliers ([123821de](https://github.com/mozilla/fxa-content-server/commit/123821de702f59b813bb0900a18fd3c25dcc1886))
  * suggest account to use during sign up if possible ([7fc06358](https://github.com/mozilla/fxa-content-server/commit/7fc06358cdd525793047b5370ae13977dbade618))
* **test:** Print unit test names when they fail in travis. ([08932c5a](https://github.com/mozilla/fxa-content-server/commit/08932c5adc2956cf0b05a9a820e97b1965e4d6dd))


<a name="0.36.3"></a>
### 0.36.3 (2015-05-01)


#### Bug Fixes

* **tests:** stabilize tos and pp functional tests ([d14d608a](https://github.com/mozilla/fxa-content-server/commit/d14d608a1e9b487dc296b75c9c957d465e3d144e))


<a name="0.36.2"></a>
### 0.36.2 (2015-04-30)


#### Features

* **oauth:** suggest account to use during sign up if possible ([186b2d74](https://github.com/mozilla/fxa-content-server/commit/186b2d742d3d628dc4f79a3d94d1a44029f2a5ba))


<a name="0.36.1"></a>
### 0.36.1 (2015-04-29)


#### Bug Fixes

* **client:** If a relier wants keys, give them keys. ([519ca117](https://github.com/mozilla/fxa-content-server/commit/519ca117ecdbb05211041d352bb0f0b6d99f68e7))


<a name="0.36.0"></a>
## 0.36.0 (2015-04-27)


#### Bug Fixes

* **csp:** use only the origin part of fxaccount_url (with /v1 is a csp violation) ([db55881b](https://github.com/mozilla/fxa-content-server/commit/db55881b596136e4a3d5d39a5b99dac1381f6110))
* **css:** Show links in TOS/PP text next to the original anchor text. ([5fcb9664](https://github.com/mozilla/fxa-content-server/commit/5fcb9664d9e54a6878c940eaf6dfcd2d6b0c8ea9))
* **icons:** fixes 404s for iOS icons ([e488c8af](https://github.com/mozilla/fxa-content-server/commit/e488c8af54b432ec9030692c4027c73f7a8425cb), closes [#2062](https://github.com/mozilla/fxa-content-server/issues/2062))
* **l10n:**
  * missing legal template redirect should start with "/" ([0498008a](https://github.com/mozilla/fxa-content-server/commit/0498008a2a658de3d58efe0c3f190d76be8cb4b3))
  * copy es-ES legal templates to es ([76d895a1](https://github.com/mozilla/fxa-content-server/commit/76d895a147e21c48bbf033fe824609dcf6ad5f4c), closes [#2305](https://github.com/mozilla/fxa-content-server/issues/2305))
* **styles:** Hide the top-right Mozilla link if signing into Sync on Fx for iOS ([a536e557](https://github.com/mozilla/fxa-content-server/commit/a536e5575d94ae9a015ac034e3b60cd80bf5be79))
* **test:** make asyncTimeout settable from the intern command line ([77ddde9b](https://github.com/mozilla/fxa-content-server/commit/77ddde9bc36888f3320aa020652e092471ce26c0))


#### Features

* **client:** Add the `change_password` and `delete_account` messages to the FxDesktop broker. ([56306f10](https://github.com/mozilla/fxa-content-server/commit/56306f10d214df3cb3e7327715a1e3ae8cab60f7))
* **test:** Add env-test.js unit tests. ([207a84ce](https://github.com/mozilla/fxa-content-server/commit/207a84ceb409fd32889659169d9e5dde27927495))


<a name="0.35.0"></a>
## 0.35.0 (2015-04-13)


#### Bug Fixes

* **auth-broker:** fixes fx-desktop channel tests for FF18 and FxOS 1.* ([2cadc2bd](https://github.com/mozilla/fxa-content-server/commit/2cadc2bd378aff2d27704e063b19ef7ca61b4cca))
* **avatars:** show a default avatar if a uploaded avatar does not load ([cbdc5a11](https://github.com/mozilla/fxa-content-server/commit/cbdc5a11a2822738176a0938c4c2290a8eef242b), closes [#1804](https://github.com/mozilla/fxa-content-server/issues/1804))
* **client:** Replace the `ﬁ` with `fi` (no ligature). ([43a402ef](https://github.com/mozilla/fxa-content-server/commit/43a402ef32086e9abfac2d3d7b2e6a8273e2d98b))
* **csp:**
  * use camelCase option keys instead of e.g., "img-src" ([730939aa](https://github.com/mozilla/fxa-content-server/commit/730939aac69145af76a153b29cb4ea6c2be42417))
  * improve content-security-policy configuration ([bad1e80d](https://github.com/mozilla/fxa-content-server/commit/bad1e80dc5fda0a3f1b432f8b1e596417fc93939))
* **jscs:** allow the 'other' quote mark to be used, but only to avoid having to escape ([b4fc1fda](https://github.com/mozilla/fxa-content-server/commit/b4fc1fdaef199922ed2518071b7ae7008095b0af))
* **server:**
  * Serve HTML templates for TOS/PP if Accept header is not `text/partial` ([3207c1d8](https://github.com/mozilla/fxa-content-server/commit/3207c1d84ca1ac3189a3f82ab4966127db77bf9f))
  * migrate to Express 4 ([bc008ce4](https://github.com/mozilla/fxa-content-server/commit/bc008ce488e6df56498909418f172422c586b0d9), closes [#2214](https://github.com/mozilla/fxa-content-server/issues/2214))
* **settings:** allow settings page redirect to work with extra query params ([4f8d64c0](https://github.com/mozilla/fxa-content-server/commit/4f8d64c025fcaffb95f1453b2f39a3b48fec1ef4), closes [#2301](https://github.com/mozilla/fxa-content-server/issues/2301))
* **teamcity:** replace execSync with sync-exec module ([57cf75a1](https://github.com/mozilla/fxa-content-server/commit/57cf75a1b9c50f71db1f157c052cb68ff1c57640))
* **test:** add missing "/v1" on FXA_AUTH_ROOT ([09b8ca91](https://github.com/mozilla/fxa-content-server/commit/09b8ca91ab627dd707d277f8804e54ff7fe421c8))
* **tests:**
  * tasks for running latest-beta and latest-esr builds in stage ([1c84e7f8](https://github.com/mozilla/fxa-content-server/commit/1c84e7f8203290c6011f4bd60444244ec2a55d90))
  * create a task to ensure latest release, beta and esr builds are available ([bceb2e22](https://github.com/mozilla/fxa-content-server/commit/bceb2e223ebf8a9867bba14553389f534b962eb5))


#### Features

* **client:** Add "Chromeless" styling - remove all the extra stuff. ([b17dc56b](https://github.com/mozilla/fxa-content-server/commit/b17dc56b838d74cf98bfe03a3fce2fb83663a11f))
* **docs:** Add documentation about the accepted query parameters. ([295fc00e](https://github.com/mozilla/fxa-content-server/commit/295fc00eb839f3026ed833b825b6328696071e28))


<a name="0.34.0"></a>
## 0.34.0 (2015-03-31)


#### Bug Fixes

* **client:**
  * Only send postMessages to and from the expected parent when using the iframe. ([0a453d1c](https://github.com/mozilla/fxa-content-server/commit/0a453d1cb5375390558bd34d0b75b4c3775d4468))
  * Channel timeouts are informative, they no longer throw errors. ([0b7770c1](https://github.com/mozilla/fxa-content-server/commit/0b7770c1139519965261898750ae281ca4200f76))
  * Extract the COPPA datepicker logic into its own module. ([a368072d](https://github.com/mozilla/fxa-content-server/commit/a368072d8790cd5dae78fa2af2ea6d580da3d1d4))
* **l10n:** sv is no longer maintained, copy strings from sv-SE ([7d28bfcd](https://github.com/mozilla/fxa-content-server/commit/7d28bfcdc4a4bd697bedcd5555ea233312cbde81), closes [#1773](https://github.com/mozilla/fxa-content-server/issues/1773))
* **server:** Translate static pages (in dev mode too!). ([28e5759d](https://github.com/mozilla/fxa-content-server/commit/28e5759dfa71b1476233f200ff68bfee6da993b1))
* **test:** Fix the account locked tests when run against latest. ([45073cf6](https://github.com/mozilla/fxa-content-server/commit/45073cf66cf69118251c85846f6ce0e330f8bafd))


#### Features

* **client:** Add the account locked flows. ([8e405298](https://github.com/mozilla/fxa-content-server/commit/8e405298b8fee3b1e5c4e495a006d42580432c49))
* **settings:** redirect to avatar change page when query param setting=avatar ([344f9c70](https://github.com/mozilla/fxa-content-server/commit/344f9c70ebd7fc7bae9eb9ab31c8682e42c64b47), closes [#2249](https://github.com/mozilla/fxa-content-server/issues/2249))


<a name="0.33.0"></a>
## 0.33.0 (2015-03-16)


#### Bug Fixes

* **client:**
  * Use standard error formats for expired and damaged verification links. ([86384b2f](https://github.com/mozilla/fxa-content-server/commit/86384b2fe95e6cac0d36ca3258884116f689a784))
  * Opt in to the iframe broker. ([09b9bac2](https://github.com/mozilla/fxa-content-server/commit/09b9bac2a7c8aea37b2a79a67a1008d3132d6f73))
  * Ensure console errors are displayed in Firefox on catastrophic startup error. ([47a8c299](https://github.com/mozilla/fxa-content-server/commit/47a8c2995cee27f9d1f5bb78383682b0b4708cee))
* **docs:**
  * Update docs for the new iframe message format. ([20121dc7](https://github.com/mozilla/fxa-content-server/commit/20121dc793a7d7fe7a375d293d348c561d4447b8))
  * Correct the documentation of the afterResetPasswordConfirmationPoll function. ([033ad26e](https://github.com/mozilla/fxa-content-server/commit/033ad26e07fc88b9c0ffe662233826d7e787bbab))
* **tests:** Start the auth-db server for travis. ([8f21f017](https://github.com/mozilla/fxa-content-server/commit/8f21f01701a361b16ea5a6ebd4d63829c4d5cd6d))


#### Features

* **channels:** broadcast messages across across all channels ([dfacd358](https://github.com/mozilla/fxa-content-server/commit/dfacd3581558d08a1e803fe0a50dc0e45d64437a), closes [#2095](https://github.com/mozilla/fxa-content-server/issues/2095))
* **docs:** Document the email suggestion events. ([29b0fadb](https://github.com/mozilla/fxa-content-server/commit/29b0fadb69f641f8df3226280fabb16e96bb2c8e))


<a name="0.32.0"></a>
## 0.32.0 (2015-03-03)


#### Bug Fixes

* **avatars:**
  * show error if avatar removal fails ([9dcd9b65](https://github.com/mozilla/fxa-content-server/commit/9dcd9b650cc4d30d907987f78ac419e88587270d))
  * fix avatar image uploads ([1e6ecd8a](https://github.com/mozilla/fxa-content-server/commit/1e6ecd8a2c8a41f7354748df398024c3413ab91e))
  * prevent flicker when loading avatars on settings pages ([c3be4f45](https://github.com/mozilla/fxa-content-server/commit/c3be4f45b3b7793261b552d4bdc4b9a66ca27f35), closes [#2105](https://github.com/mozilla/fxa-content-server/issues/2105))
* **build:** simple default grunt command ([9f101ee1](https://github.com/mozilla/fxa-content-server/commit/9f101ee196b706cd3519ad29b18416b25d0ced77))
* **client:**
  * Simplify the message serialization for the iframe channel. ([1af5009d](https://github.com/mozilla/fxa-content-server/commit/1af5009d092935f345ce19f3c6e9befccb2780df))
  * Add "successfully" to most success messages. ([ec4b4fcc](https://github.com/mozilla/fxa-content-server/commit/ec4b4fcc6c00a26c8241d550c322b8e88dd4642c))
* **errors:** reverts the "Invalid verification code" string back to normal. r=vladikoff ([14cbf41d](https://github.com/mozilla/fxa-content-server/commit/14cbf41d78d918382fc414d67abc0a4fa6d81619))
* **l10n:** join server templates so email strings are not overwritten ([b0898f76](https://github.com/mozilla/fxa-content-server/commit/b0898f76f700bceda4f3d18816d69d62ed8a4fb8))
* **pages:** 502 pages should be allowed to be iframed ([00e69196](https://github.com/mozilla/fxa-content-server/commit/00e69196560a3d335443ff0cc64bd8fcd04c4208), closes [#2056](https://github.com/mozilla/fxa-content-server/issues/2056))
* **router:**
  * make sure loaded message is still sent after a view render error ([79c93978](https://github.com/mozilla/fxa-content-server/commit/79c93978bd4e8859a5156b89d3ed09b52d5ba5d1))
  * anchor event handler should handle event bubbling ([cd4a64ca](https://github.com/mozilla/fxa-content-server/commit/cd4a64cadcbba51ea862e1a8ebc13fa4e6bed724))
* **server:** Ensure templates render text in dev mode. ([b7c5eb0a](https://github.com/mozilla/fxa-content-server/commit/b7c5eb0a400974e54d78571f2888adbaca4f3ed2))


#### Features

* **docker:** Dockerfile and README update for basic docker development workflow ([4b244644](https://github.com/mozilla/fxa-content-server/commit/4b2446441b6da3805cc7a03d98c1f0d7268a5b58))
* **docs:** Document the iframe protocol. ([02e0fc49](https://github.com/mozilla/fxa-content-server/commit/02e0fc49eed086ebe12e46394d861077634e86e9))
* **login:** indicate whether the account is verified in the fx-desktop channel ([6c5c0c42](https://github.com/mozilla/fxa-content-server/commit/6c5c0c429e89cea7fb78a7cf894a4d6b9c67b00e), closes [#2094](https://github.com/mozilla/fxa-content-server/issues/2094))
* **oauth:** Expose relier-specific encryption keys to OAuth WebChannel reliers. ([a0318c28](https://github.com/mozilla/fxa-content-server/commit/a0318c28a5daf1d311ef926715c6a9dad391dab0), closes [#2088](https://github.com/mozilla/fxa-content-server/issues/2088))
* **signup:** suggest proper email spelling ([a825a83f](https://github.com/mozilla/fxa-content-server/commit/a825a83f4903231c1316d6ba14b3b219dba2e737), closes [#871](https://github.com/mozilla/fxa-content-server/issues/871))
* **tests:** Boost the test coverage of router.js ([0e7d06e6](https://github.com/mozilla/fxa-content-server/commit/0e7d06e68f43fedf7370dd596600b3637b742d93))


<a name="0.31.0"></a>
## 0.31.0 (2015-02-17)


#### Bug Fixes

* **client:** Redirect to `/settings` for direct access users who verify signup or password re ([31e4b2c6](https://github.com/mozilla/fxa-content-server/commit/31e4b2c64b593c73c7447bf6eb7b51b4357603c7))
* **metrics:** track window.onerror ([4f9bd296](https://github.com/mozilla/fxa-content-server/commit/4f9bd2963cb422b3dc47551fdd7306157e4c46bd))


#### Features

* **metrics:** Log more screen info ([85a05e41](https://github.com/mozilla/fxa-content-server/commit/85a05e4113aef899e2ebb3e113076232b5b25a22))


<a name="0.30.0"></a>
## 0.30.0 (2015-02-02)


#### Bug Fixes

* **avatars:** fixes Firefox 18 dataType json request ([005c9f5d](https://github.com/mozilla/fxa-content-server/commit/005c9f5d6376c1654d8751592baa45d03a3b2d40), closes [#1930](https://github.com/mozilla/fxa-content-server/issues/1930))
* **l10n:** use en as the default language instead of en-US ([8f599d54](https://github.com/mozilla/fxa-content-server/commit/8f599d54a340ba9168ae6f77c00ceeac67d94efe), closes [#2072](https://github.com/mozilla/fxa-content-server/issues/2072))
* **xhr:** send correct JSON content-type and accept headers to api servers ([8dc69d0b](https://github.com/mozilla/fxa-content-server/commit/8dc69d0bc012b1e788958f7eb8e595650d5d249b))


#### Features

* **avatars:** set the account by uid when visiting avatar pages ([d9f5649e](https://github.com/mozilla/fxa-content-server/commit/d9f5649e8c80b76af98a08dcbdaf94cd51e21bf8), closes [#1974](https://github.com/mozilla/fxa-content-server/issues/1974), [#1876](https://github.com/mozilla/fxa-content-server/issues/1876))
* **client:** Add a `loaded` message for the fx-desktop and iframe brokers. ([c9ca23e8](https://github.com/mozilla/fxa-content-server/commit/c9ca23e837b43a8b08c055766dd66a43ab82acfe))
* **l10n:** add az locale to list ([0acd097e](https://github.com/mozilla/fxa-content-server/commit/0acd097e36395a42ba0e55f18685778f592dc2ea), closes [#1774](https://github.com/mozilla/fxa-content-server/issues/1774))
* **metrics:**
  * Add `signup.customizeSync.(true|false)` metrics. ([919f9281](https://github.com/mozilla/fxa-content-server/commit/919f928178488dc4d022242704d77cbb4e56aa15))
  * Log whether the user changes the password visibility. ([13b2b835](https://github.com/mozilla/fxa-content-server/commit/13b2b83534106482f43877e3e0dd1fe042e33dbd))


<a name="0.29.0"></a>
## 0.29.0 (2015-01-20)


#### Bug Fixes

* **avatars:** make avatar navigation l10n friendly ([014b4ec5](https://github.com/mozilla/fxa-content-server/commit/014b4ec59871b4c831689c146b732ed83141bbb1), closes [#1729](https://github.com/mozilla/fxa-content-server/issues/1729))
* **client:**
  * Do not display errors after window.beforeunload is triggerred. ([2e080e81](https://github.com/mozilla/fxa-content-server/commit/2e080e817496767811fb73b9ba317b3dc538e1e1))
  * Disable the sign up confirmation poll for Sync. ([e6421a71](https://github.com/mozilla/fxa-content-server/commit/e6421a711c883cb098b2014674c4e4b7a60f5589))
  * Only request keys from the server for Sync users. ([283b41b4](https://github.com/mozilla/fxa-content-server/commit/283b41b44ce32f60ce50f9273bc583265ca7324a))
* **iframe:** fixes styling issues caused by the iframe environment #2 ([9347d818](https://github.com/mozilla/fxa-content-server/commit/9347d8184b098649de166a1ccad10d3e0f79a3bb), closes [#2010](https://github.com/mozilla/fxa-content-server/issues/2010))
* **logging:** switch to mozlog ([a346b9d1](https://github.com/mozilla/fxa-content-server/commit/a346b9d102eb5ef20430cb15f69535dc4ec2af8b), closes [#1994](https://github.com/mozilla/fxa-content-server/issues/1994))
* **signin:** better reject with errors ([2e6c3bbd](https://github.com/mozilla/fxa-content-server/commit/2e6c3bbd34b227bd2379648963c0958f1d8d134d), closes [#2031](https://github.com/mozilla/fxa-content-server/issues/2031))
* **tests:**
  * fail when not enough coverage, add more oauth-errors coverage ([87be18f7](https://github.com/mozilla/fxa-content-server/commit/87be18f79e4c01ee7670647ca86b93488feb0ca6))
  * better functional tests for age dropdowns ([01c70f95](https://github.com/mozilla/fxa-content-server/commit/01c70f95bc886b142cca787307e991594815ecbb))


#### Features

* Check for required OAuth parameters on startup. ([52f65f78](https://github.com/mozilla/fxa-content-server/commit/52f65f78c1ec2b95db2c7cc2cfa135280c2bf204))
* **client:**
  * force_auth action for oauth! ([82a6c0be](https://github.com/mozilla/fxa-content-server/commit/82a6c0be7973056a73b6c6de067638d3b816cda7))
  * Give the relier the ability to overrule cached credentials. ([74cb38e1](https://github.com/mozilla/fxa-content-server/commit/74cb38e11c955e3a1537fabc4454e3c73782bab0))
* **docs:** Start on an architecture doc ([4a3c0540](https://github.com/mozilla/fxa-content-server/commit/4a3c05400dc85f83a473509e441e24b30652a493))
* **error-pages:** add a static 502.html error page for nginx to route to ([fe343454](https://github.com/mozilla/fxa-content-server/commit/fe343454d2064327df3c866f12085ea38aca5e51))


<a name="0.28.0"></a>
## 0.28.0 (2015-01-05)


#### Bug Fixes

* **account:** filter account.toJSON ([6044aa6d](https://github.com/mozilla/fxa-content-server/commit/6044aa6dfdccf4e88a3c2859d63ca3cf27008904))
* **build:** generate sourcemaps ([fdcf92fd](https://github.com/mozilla/fxa-content-server/commit/fdcf92fda50a98cf3a706616de997d0ef8455589), closes [#258](https://github.com/mozilla/fxa-content-server/issues/258))
* **client:**
  * We broke password managers with `autocomplete=off` on password fields! ([7df783f2](https://github.com/mozilla/fxa-content-server/commit/7df783f2fce77db869cd4c9076a75be0bc87e112))
  * OAuth/redirect users who paste the verification link into the original tab shoul ([86b1c5cb](https://github.com/mozilla/fxa-content-server/commit/86b1c5cb0649129dbdad8ddbbc4a1467f21c4771))
  * Allow Fx18 to use the iframe flow. ([c2020f85](https://github.com/mozilla/fxa-content-server/commit/c2020f856ffc31034b1fe124031cc5f232e8d2ea))
* **docs:** update AUTHORS list ([09aec587](https://github.com/mozilla/fxa-content-server/commit/09aec587119c54332c87fd5c0984420a59e2f036), closes [#1981](https://github.com/mozilla/fxa-content-server/issues/1981))
* **iframe:** fixes styling issues caused by the iframe environment ([740006de](https://github.com/mozilla/fxa-content-server/commit/740006de68e291412399c9e275bb888c0cf11eca), closes [#2010](https://github.com/mozilla/fxa-content-server/issues/2010))
* **metrics:** Convert all `_` in screen names to `-`. ([726d9017](https://github.com/mozilla/fxa-content-server/commit/726d90170beee05b3c7d22c069d8bb6ba0a0d403))
* **server:** Allow the 500 and 503 pages to be iframed. ([b25faa2c](https://github.com/mozilla/fxa-content-server/commit/b25faa2c2ff1e99c1628b0ba210fd0914639fd52))
* **signin:**
  * set the current account after logging in with cached sync account ([9732f05f](https://github.com/mozilla/fxa-content-server/commit/9732f05fa5ede4142b0c4b9187945edc1f145c83))
  * pass account data to broker instead of using currentUser ([aeb4aa15](https://github.com/mozilla/fxa-content-server/commit/aeb4aa15d6a228166339de7a40c7991f644d7440), closes [#1973](https://github.com/mozilla/fxa-content-server/issues/1973))
* **styles:** make sure normalize.css is used in production ([28ff205e](https://github.com/mozilla/fxa-content-server/commit/28ff205e648e99b4e2d60ced78551a910175763a), closes [#1997](https://github.com/mozilla/fxa-content-server/issues/1997))
* **sync:** correct a typo that voided the customize sync option ([8f78e1d6](https://github.com/mozilla/fxa-content-server/commit/8f78e1d6ffadea035d75764d5b3f33118ac69d69))
* **tests:** fix up select dropdown ([995a8a5a](https://github.com/mozilla/fxa-content-server/commit/995a8a5a75fe6698145a09a998a423710ae28ee2))


#### Features

* **client:** An Fx Sync relier can specify `customizeSync=true` to force the Customize Sync c ([a4a26f91](https://github.com/mozilla/fxa-content-server/commit/a4a26f9189ca1776f1b0f8087b42eba9a3ef3eef))
* **metrics:** Report distinct metrics codes for missing and invalid emails ([71489471](https://github.com/mozilla/fxa-content-server/commit/71489471a0916f0a1b17dec36096ad7d1b30adbb))


<a name="0.27.0"></a>
## 0.27.0 (2014-12-08)


#### Bug Fixes

* **client:**
  * WebChannel/Hello screen and event fixes. ([e67d2158](https://github.com/mozilla/fxa-content-server/commit/e67d2158e6e0264a4c58a78c8474f408ac9c5dba))
  * Ensure the web-channel flows match expected behavior. ([0cbcf9a6](https://github.com/mozilla/fxa-content-server/commit/0cbcf9a6ffa39a4f2996615b4c79a6425ea0f670))
  * Show the back button for reset_password, even if an email is on the URL query st ([9e293664](https://github.com/mozilla/fxa-content-server/commit/9e29366405dd2f828975ad3608da86f1bb37c1bb))
  * Go to the /cookies_disabled screen instead of the /500 screen if cookies are dis ([e9433b7a](https://github.com/mozilla/fxa-content-server/commit/e9433b7ac8f16db89335d513fdc46f7081f16067))
* **confirm:** redirect to signup on bounced email error ([bb3c8d8c](https://github.com/mozilla/fxa-content-server/commit/bb3c8d8c6cec414d3b09c753f31bafb0029b0619), closes [#1902](https://github.com/mozilla/fxa-content-server/issues/1902))
* **docs:** add Bower usage to CONTRIBUTING ([dc9db2d7](https://github.com/mozilla/fxa-content-server/commit/dc9db2d78170d7d1e3efdc0985d5b750721742f1))
* **l10n:** use a less spammy email headline ([f2efc82b](https://github.com/mozilla/fxa-content-server/commit/f2efc82b57d4bc76d2ce2b0fe496736d9735ccb4), closes [#1849](https://github.com/mozilla/fxa-content-server/issues/1849))
* **metrics:** Show the correct screen name in the iframe flow metrics. ([44c630b5](https://github.com/mozilla/fxa-content-server/commit/44c630b5d96643329e82273c2d6622bff0eb6e81))
* **signup:** block signup attempts with @firefox.com emails. ([b41389fc](https://github.com/mozilla/fxa-content-server/commit/b41389fcdb6a7ae7a909c4862a43b17939c4a07b), closes [#1859](https://github.com/mozilla/fxa-content-server/issues/1859))
* **style:** marketing snippet offset ([ddbacce7](https://github.com/mozilla/fxa-content-server/commit/ddbacce7fe238dfbf6c27242fb3c470a6fe4814d))
* **styles:** no more underscored classes ([46e0cc0e](https://github.com/mozilla/fxa-content-server/commit/46e0cc0e916c705dbc8c5fe6249277c305e889e4))
* **test:**
  * allow custom Firefox binary locations for tests ([4338d193](https://github.com/mozilla/fxa-content-server/commit/4338d1931075fe52276030a788c8422701863d7b))
  * check that signin is complete before proceeding ([ad07160d](https://github.com/mozilla/fxa-content-server/commit/ad07160d5169f8169aed339098bae28187d746a2))
  * No longer redirect on the web channel tests. ([21863591](https://github.com/mozilla/fxa-content-server/commit/2186359155692c5bddf1d21d749dc5a8b1800082))
  * Fix the 'Unexpected error' flash in the sign_in tests. ([58780398](https://github.com/mozilla/fxa-content-server/commit/587803989ee847fa6071f83deaa2b38e0ff2d6a0))
  * Remove the inter-test dependencies in the reset-password tests. ([1a198fdd](https://github.com/mozilla/fxa-content-server/commit/1a198fddc3521b7dec7a1d2fb1cd92624373b5a5))
* **tests:**
  * add iframe app to latest tester ([d5216304](https://github.com/mozilla/fxa-content-server/commit/d5216304f11bc43dc6756ef35d2529e131213b6e), closes [#1959](https://github.com/mozilla/fxa-content-server/issues/1959))
  * update sauce tests to firefox 33 ([d5884034](https://github.com/mozilla/fxa-content-server/commit/d5884034890031c2ae9a808de776cb7869194e92))
  * fix avatar crop transition. ([89b8225c](https://github.com/mozilla/fxa-content-server/commit/89b8225c1179f0d3ccb49073f8645975bb617287), closes [#1836](https://github.com/mozilla/fxa-content-server/issues/1836))


#### Features

* **client:**
  * Add the iframe flow. ([8561ec3c](https://github.com/mozilla/fxa-content-server/commit/8561ec3c1d06763f454f4ac7cb8ef142eb0c01b0))
  * Allow TLD only domain names in email addresses ([e3487a04](https://github.com/mozilla/fxa-content-server/commit/e3487a04f78eba4920b3c78cb20c29e777099624))
* **metrics:**
  * Add the `campaign` metric. ([21e18a96](https://github.com/mozilla/fxa-content-server/commit/21e18a96eb607fbfe412d3dfc3c2ea12918f5afe))
  * Add the `isMigration` field to the reported metrics. ([d9f7ddd1](https://github.com/mozilla/fxa-content-server/commit/d9f7ddd18d8a5e2964949cd9dbf562368e689cfc))
* **test:** Add more functional tests! ([a43d65f9](https://github.com/mozilla/fxa-content-server/commit/a43d65f933e32bd711c1ec50ec83520e3d9d66ee))


<a name="0.26.2"></a>
### 0.26.2 (2014-11-20)


#### Bug Fixes

* **client:** Go to the /cookies_disabled screen instead of the /500 screen if cookies are dis ([d12d6ec8](https://github.com/mozilla/fxa-content-server/commit/d12d6ec88de44bb1b8e0774b0b190089a0672c54))


<a name="0.26.1"></a>
### 0.26.1 (2014-11-17)


#### Bug Fixes

* **l10n:** update the header font mixin name for locales that use system fonts ([60d05bb9](https://github.com/mozilla/fxa-content-server/commit/60d05bb9192c38c57a74364cf5e3c680b4aa2fc4))


<a name="0.26.0"></a>
## 0.26.0 (2014-11-14)


#### Bug Fixes

* **accounts:** only fetch access token if verified ([d3168850](https://github.com/mozilla/fxa-content-server/commit/d3168850a23a314cdf6477c5d74794e819561c84))
* **avatars:**
  * ensure the default image background is covered by the profile image ([387e3246](https://github.com/mozilla/fxa-content-server/commit/387e3246a9f5fcd3bd474d7df7c93f6ce2f0444f))
  * load profile image on settings and sign in pages if available ([382c9db9](https://github.com/mozilla/fxa-content-server/commit/382c9db980753300b38b3f767aa071a1163ccf73), closes [#1727](https://github.com/mozilla/fxa-content-server/issues/1727))
* **broker:** fix desktop broker to forward account data before confirm ([0492140e](https://github.com/mozilla/fxa-content-server/commit/0492140e90cc85535681dce1e2daf24d456f44c6))
* **client:**
  * Fixed missing spinner on subsequent requests. ([910ff4dd](https://github.com/mozilla/fxa-content-server/commit/910ff4ddad0768c2d5d796a7abb6701381308271))
  * Notify Sync of unverified logins and signups before the user verifies her email  ([8943f1f7](https://github.com/mozilla/fxa-content-server/commit/8943f1f7e58f13c1e4297e0c8268be80c8ea41d1))
  * The Sync flow should not notify the browser of login after the signup confirmati ([3ba53720](https://github.com/mozilla/fxa-content-server/commit/3ba5372020c32fb0eace40e8530137f70c77da56))
  * Autofocus on /signup works again. ([7f142421](https://github.com/mozilla/fxa-content-server/commit/7f142421495d74f5bd13e4dd3a7f31bab2ac69ea))
  * The FxDesktop broker no longer sends the `session_status` message on startup. ([8f414c4a](https://github.com/mozilla/fxa-content-server/commit/8f414c4a0b9cc70d2c243897c102368d79021be2))
  * Ensure the spinner stays spinning after signin for Sync/OAuth. ([5c74b8a2](https://github.com/mozilla/fxa-content-server/commit/5c74b8a228120314412917db1531602f8cdb4c45))
  * Do not fail on startup if cookies or access to dom.storage is disabled. ([e084cba7](https://github.com/mozilla/fxa-content-server/commit/e084cba7ffc8ba8b2f950024b9576368921c3631))
  * Ensure the Loop initiated reset password verification flow sends OAuth credentia ([a91e27b5](https://github.com/mozilla/fxa-content-server/commit/a91e27b5ad74798fbf99c5974966da7c0b0469c0))
* **images:** optimize images with new optipng ([780ff760](https://github.com/mozilla/fxa-content-server/commit/780ff76029cfcd15911ded01ccd80fef977a4135))
* **style:**
  * remove end padding from text inputs ([07dacd9d](https://github.com/mozilla/fxa-content-server/commit/07dacd9d423e10bf30c8c7b000de40bf03a8a7ac))
  * tos/pn layout overlap ([53d8a7b3](https://github.com/mozilla/fxa-content-server/commit/53d8a7b38d220c9323af57a4cb06cf9f258cfc77))
* **styles:**
  * spinning wheel affects button height ([3d536417](https://github.com/mozilla/fxa-content-server/commit/3d536417bd96c6d291a848c5459e821e25b77db1))
  * show password border radius ([20270acd](https://github.com/mozilla/fxa-content-server/commit/20270acd423387cc4deb5826b2d0b020230d2434))
  * odd wrapping on choose account and reset pwd links on sign in in some l10ns ([f454d9d3](https://github.com/mozilla/fxa-content-server/commit/f454d9d3c86c77d162498a18f2129a59d926cb22))
* **test:** Ensure the web channel tests complete. ([46b578d6](https://github.com/mozilla/fxa-content-server/commit/46b578d67e01a6fc4eb17f59ab4c0c22c510706a))


#### Features

* **client:**
  * Allow the user to restart the signup flow on email bounce. ([896d1f47](https://github.com/mozilla/fxa-content-server/commit/896d1f470fc70614feb8e66a1bd57a1e0dedb3fb))
  * Add some brokers! ([83ee1861](https://github.com/mozilla/fxa-content-server/commit/83ee186129cf28e49d88942aaef47bd5d48e6eb1))
* **test:** Add functional test for web channel flow when user signs up, closes original tab ([c2b51b9d](https://github.com/mozilla/fxa-content-server/commit/c2b51b9d5e580fa1575d73236a00dc445cc77c51))


<a name="0.25.0"></a>
## 0.25.0 (2014-10-29)


#### Bug Fixes

* **chrome:** fix a "read-only" strict mode error in Chrome ([c15de01b](https://github.com/mozilla/fxa-content-server/commit/c15de01b706e5cadeb59965182267c3bdb73cbc9))
* **client:**
  * Fix CORS requests not being decoded for Fx<21 ([a92ab607](https://github.com/mozilla/fxa-content-server/commit/a92ab607cd8e14068b44a6f12c2fbf693446246c))
  * COPPA - make learn more link target _blank only on sync ([ae06e403](https://github.com/mozilla/fxa-content-server/commit/ae06e403931f26bf3370140313c77e9f7baced3d))
  * Allow leading/trailing whitespace on email addresses. ([2385500d](https://github.com/mozilla/fxa-content-server/commit/2385500df7b9895b509dbd098d1ee9015e8a9d53))
* **coppa:** better align error message in pop up ([7bc43ca4](https://github.com/mozilla/fxa-content-server/commit/7bc43ca432c5a41c566509abebf68cde0f585057))
* **oauth:**
  * fixes WebChannel double submit during password reset ([c4ad6289](https://github.com/mozilla/fxa-content-server/commit/c4ad6289303190c87b6559a6270faba4408e138d))
  * validate that redirect param exists. ([a8c63fd0](https://github.com/mozilla/fxa-content-server/commit/a8c63fd0991dacaf4a944fe7c0ae4d8ed4cafa4c), closes [#1786](https://github.com/mozilla/fxa-content-server/issues/1786))
* **test:** fixes setTimeout tests in FF18 ([ab270636](https://github.com/mozilla/fxa-content-server/commit/ab2706363f33068ad0e7ab9f1b4f50d169546a1f))


#### Features

* **metrics:** Add three new auth-errors ([ca2e1c46](https://github.com/mozilla/fxa-content-server/commit/ca2e1c46639aaf84041c7b79985dedb7f191e050))


<a name="0.24.0"></a>
## 0.24.0 (2014-10-20)


#### Bug Fixes

* **client:**
  * Change the "Next" button to say "Sign up" ([08a008c0](https://github.com/mozilla/fxa-content-server/commit/08a008c069ca226f28ce7ca4136d7ea89496f6a6))
  * Add a "forgot password?" link when using cached credentials. ([99754f76](https://github.com/mozilla/fxa-content-server/commit/99754f76adb340cff02c831196ec9e4e53e39f62))
* **oauth:** use the correct client_id for local oauth server ([8e1c288c](https://github.com/mozilla/fxa-content-server/commit/8e1c288c46f7dd1434cd50e637358a0b4543a725))
* **signin:** choosing to use a different account clears cached credentials ([4919e1d1](https://github.com/mozilla/fxa-content-server/commit/4919e1d18bf9a7346e315615436f6911f44bf82e), closes [#1721](https://github.com/mozilla/fxa-content-server/issues/1721))
* **styles:** Ensure the year of birth select box uses Clear Sans. ([4f796b29](https://github.com/mozilla/fxa-content-server/commit/4f796b29070f38bb103fb0de163b298390e95360))
* **test:** Fix `test-latest` functional tests. ([37696cb0](https://github.com/mozilla/fxa-content-server/commit/37696cb0c337e112151bd473ba7df428114d0a04))
* **tests:** remove about:prefs tests from full testing ([cccdeb09](https://github.com/mozilla/fxa-content-server/commit/cccdeb09b1d89b926a60fa6134a3ad74d66c6c54))
* **trusted-ui-style:** make layout shorter ([02c7d7fb](https://github.com/mozilla/fxa-content-server/commit/02c7d7fb559b054be522110c4e8430860d4b1fc1))


#### Features

* **client:** Create and send a resume token to the OAuth server. ([8dd01b07](https://github.com/mozilla/fxa-content-server/commit/8dd01b072ceda0d868056aab9b4de9771f88696a))
* **metrics:** Add metrics for signup, preverified signup, signin, hide the resend button. ([76ecb248](https://github.com/mozilla/fxa-content-server/commit/76ecb24855cb9112d72e60c73369c1c42df2bf80))
* **test:** Add more functional tests sign up/reset password flows. ([483ba166](https://github.com/mozilla/fxa-content-server/commit/483ba16602010006eda5d7725fc8fdd945d88fe7))


<a name="0.23.0"></a>
## 0.23.0 (2014-10-07)


#### Bug Fixes

* **appStart:** show an error screen when errors occur during app start ([e457eae4](https://github.com/mozilla/fxa-content-server/commit/e457eae409c8b5674c3bfb7a888025781c1f94f4))
* **avatars:** redirect unverified users to confirm screen ([d440e4d7](https://github.com/mozilla/fxa-content-server/commit/d440e4d74a1893d50a38bf7fd615e1ed4ab57130), closes [#1662](https://github.com/mozilla/fxa-content-server/issues/1662))
* **fxa-client:** update to latest client ([fdb6dbbb](https://github.com/mozilla/fxa-content-server/commit/fdb6dbbbaf392d6a9e28120c9170dfbf8bcedb22))
* **style:** ensure legal pages are no taller than /signup ([1698922b](https://github.com/mozilla/fxa-content-server/commit/1698922bda64dd09e50e59bb91b014a768db6fd7))
* **tests:**
  * run tos and pp test for saving information separately - fixes #1640 ([d2f52126](https://github.com/mozilla/fxa-content-server/commit/d2f5212642f4b8275f9eaca94bc0e3503fad5df6))
  * Only set the autofocus timeout if the element to be focused is hidden. ([ce2ce9d0](https://github.com/mozilla/fxa-content-server/commit/ce2ce9d03e428fcb7ba1be021114482d0bd7fd4a))


#### Features

* **client:**
  * Smooth out the verification flow. ([02b0d351](https://github.com/mozilla/fxa-content-server/commit/02b0d3514586fc2759c1af7cecd3ba420d16385d))
  * Fix the COPPA flow to allow 13 year olds that are born this year to register. ([61ec08bd](https://github.com/mozilla/fxa-content-server/commit/61ec08bd98cf21605b95b284c60156ac9f580e20))


<a name="0.22.0"></a>
## 0.22.0 (2014-09-22)


#### Bug Fixes

* **avatars:**
  * show a spinner icon when loading images with latency ([ae1e17f1](https://github.com/mozilla/fxa-content-server/commit/ae1e17f1b1878469bc08add6cc3112d801e76c84), closes [#1527](https://github.com/mozilla/fxa-content-server/issues/1527))
  * set the correct OAuth client ID for fxa-dev environment ([f6374760](https://github.com/mozilla/fxa-content-server/commit/f637476099cecca239f6bd4ba2146d86acdbfb1e), closes [#1683](https://github.com/mozilla/fxa-content-server/issues/1683))
  * integrate profile server backend for profile images ([66ebc83a](https://github.com/mozilla/fxa-content-server/commit/66ebc83a45c42ac10b10791cfb5e7f8c59f36dd9))
  * disable remote URL option ([17e76acd](https://github.com/mozilla/fxa-content-server/commit/17e76acdb274c9842658acb8786caded78fbdc87))
* **client:**
  * autofocus the password field on /oauth/signin if the user already has a session. ([c4228b2f](https://github.com/mozilla/fxa-content-server/commit/c4228b2fcbae528cdc6e02807d7ccc1d06c2c2e6))
  * Auto-focus the password field on the /delete_account page. ([31fc11d2](https://github.com/mozilla/fxa-content-server/commit/31fc11d260d60dbb67ed465028b001846a4c677b))
* **errors:** use the correct context for error messages ([a3c4f2a2](https://github.com/mozilla/fxa-content-server/commit/a3c4f2a2063a3c61ee455ebcc6ad0182fd427386), closes [#1660](https://github.com/mozilla/fxa-content-server/issues/1660))
* **oauth:** increase the assertion lifetime to avoid clock skew issues ([132bbf57](https://github.com/mozilla/fxa-content-server/commit/132bbf572d71b3f8d58c909fb23f8aba8a7fd45e))
* **test:** Fix and enable the oauth-preverified-sign-up functional test. ([7cade58a](https://github.com/mozilla/fxa-content-server/commit/7cade58a6147a28bf40ec76d50e76a7e432afba6))
* **tests:**
  * Fix some places that race with an XHR response return ([f49e3de6](https://github.com/mozilla/fxa-content-server/commit/f49e3de67d55d22e8c81b260f0222ae95be3bb96))
  * Fix the oauth_webchannel tests when run by themselves. ([f19d2d58](https://github.com/mozilla/fxa-content-server/commit/f19d2d58f615081672627a7dbada8d816af22246))


#### Features

* **metrics:** Log `entrypoint` to the metrics. ([9ecf71bb](https://github.com/mozilla/fxa-content-server/commit/9ecf71bb514e42072c23ea0e1f256ab43b665d07))
* **test:** Add the ability to run `npm run-script test-functional-oauth` from the command l ([6ca4fe4d](https://github.com/mozilla/fxa-content-server/commit/6ca4fe4dc802272eaf1d8ed78e53e7c2b9e36802))


<a name="0.21.0"></a>
## 0.21.0 (2014-09-08)


#### Bug Fixes

* **avatars:** allow mobile browsers to reposition the image during crop ([74202ea1](https://github.com/mozilla/fxa-content-server/commit/74202ea1b9127786834d8bf387efdd0fd8eb1a63))
* **hsts:** force hsts headers and use milliseconds ([138756b1](https://github.com/mozilla/fxa-content-server/commit/138756b1df4a12878b67b4c3992e6f9003c73eb2))
* **signin:** cache credentials for desktop sign-ins, otherwise only cache email ([33675ae8](https://github.com/mozilla/fxa-content-server/commit/33675ae8863a85bf530c4b3bcbd9703b027524df), closes [#1621](https://github.com/mozilla/fxa-content-server/issues/1621))
* **styles:** Un-nesting some CSS to fix /signin links ([1878d120](https://github.com/mozilla/fxa-content-server/commit/1878d120928ecce25373327a392e90801c4a7fd2))


#### Features

* **client:** Add support for `preVerfiyToken`. ([d30dd6d3](https://github.com/mozilla/fxa-content-server/commit/d30dd6d3f4d65ceeb6a195b16cf6fd689eb1f7a4))
* **signin:** Add cached signin ([7780e49a](https://github.com/mozilla/fxa-content-server/commit/7780e49aa007db60d12e29ea791d60489298ad3a))


<a name="0.20.0"></a>
## 0.20.0 (2014-08-25)


#### Bug Fixes

* **build:**
  * Remove imagemin for dependencies ([bddf83fe](https://github.com/mozilla/fxa-content-server/commit/bddf83fe80296ddfabe6330eeb1fb260c6f4d59a))
  * Wait for config to load. Move draggable into a require.js packge. ([b2a0be17](https://github.com/mozilla/fxa-content-server/commit/b2a0be177fe3dbb24e7cc9832939187a02822096))
* **l10n:** remove the en i18n symlink ([9c2e5ba0](https://github.com/mozilla/fxa-content-server/commit/9c2e5ba0c707f8a20bcef5a7ea17462531d58937))
* **teats:** Use execute to clear browser state ([f56aa45e](https://github.com/mozilla/fxa-content-server/commit/f56aa45e2e0a9d09f199f175ee376bde3fbe446c))
* **tests:**
  * Avatar functional test updates ([ceb5561d](https://github.com/mozilla/fxa-content-server/commit/ceb5561d2ba9f64846ddd9d556b704099e02ef3e))
  * Update service-mixin tests. ([37d6c371](https://github.com/mozilla/fxa-content-server/commit/37d6c371db3d7442d6742e5ba79fd24b68d7ca92), closes [#1400](https://github.com/mozilla/fxa-content-server/issues/1400))
* **travis:** Run functional tests first, move sleep. ([23f124cc](https://github.com/mozilla/fxa-content-server/commit/23f124cce5b9e38d8621097ec398716f06b3f0d6))


#### Features

* **oauth:** Support for URN redirects ([dc2cefd6](https://github.com/mozilla/fxa-content-server/commit/dc2cefd658f7ad8fc0c70b39d174b9b42f3a4101))


<a name="0.19.0"></a>
## 0.19.0 (2014-08-11)


#### Bug Fixes

* **avatars:**
  * add profile server client to proxy remote images ([899f1895](https://github.com/mozilla/fxa-content-server/commit/899f18956b3f6cdb12de6a920b561ea030d6612d))
  * clean up numerous issues from comments in #1405 ([916044d6](https://github.com/mozilla/fxa-content-server/commit/916044d668305d3a94b698ec226b4a9130dca5d5))
* **bug:**
  * IE9: browser unsupported message is very wide ([488f5108](https://github.com/mozilla/fxa-content-server/commit/488f510878be6a788b70b0f6c79d10c9951bfd53))
  * fixed snippet layout error ([0e3dcd9e](https://github.com/mozilla/fxa-content-server/commit/0e3dcd9eb8bc533202757ee202a1dae1b7b82d3d))
* **client:**
  * Show the /force_auth error message on startup, if one exists. ([e61bf17e](https://github.com/mozilla/fxa-content-server/commit/e61bf17e5083788f355d9753abaa6474aa4265ca))
  * Remove the survey material all together, it's not being used. ([04249936](https://github.com/mozilla/fxa-content-server/commit/04249936f85cb64421f0a2a7b5557f7383549b3f))
  * If logError/displayError/displayErrorUnsafe is called without an error, log an ` ([d3bf9552](https://github.com/mozilla/fxa-content-server/commit/d3bf95521ecd6f86daa18f7c6766d12477959bd6))
  * Display `Service Unavailable` if the user visits `/oauth/sign(in|up)` and the OA ([fe599744](https://github.com/mozilla/fxa-content-server/commit/fe599744d5c7d191136616ea49744be2a6ee50d4))
  * Ensure a down OAuth server does not cause an `undefined` error. ([7224d952](https://github.com/mozilla/fxa-content-server/commit/7224d9528c73c02d24afada320901ed5ce122284))
* **csp:**
  * allow image sources from gravatar ([cfd7ce84](https://github.com/mozilla/fxa-content-server/commit/cfd7ce84f5213eca4ffff7a488e6173d05b3b130))
  * allow data uris for images ([9a880661](https://github.com/mozilla/fxa-content-server/commit/9a880661e1e5272cd26aa48eacde3736a93eaa49))
* **deps:** update express and request dependencies to patched versions ([5e990731](https://github.com/mozilla/fxa-content-server/commit/5e9907315cf22e5447af8794e5760ab4c515064e))
* **fxa-client:** remove lang from fxa-client requests ([93c3384d](https://github.com/mozilla/fxa-content-server/commit/93c3384d80d913a5a1a746b2e2213240f9b404b0), closes [#1404](https://github.com/mozilla/fxa-content-server/issues/1404))
* **l10n:**
  * ensure that supported languages are a subset of the default supported languages ([d0d14176](https://github.com/mozilla/fxa-content-server/commit/d0d141761f51ed7b0397d92d0f90fcf219b34d06))
  * add hsb and dsb to default supported languag list for asset generation ([c726205d](https://github.com/mozilla/fxa-content-server/commit/c726205d62649df14f6dcefd2ee97861759ddd02))
* **legal:**
  * show home button on legal pages when loaded directly ([8bf43a37](https://github.com/mozilla/fxa-content-server/commit/8bf43a37d40febaaab93d597ed4ecd2b06e5c7b0))
  * fix layout of statically rendered legal pages ([f59d82b1](https://github.com/mozilla/fxa-content-server/commit/f59d82b1c5a7694c932f836ab398304ae284ac71))
* **logger:** fix for express logger api change ([dfa60957](https://github.com/mozilla/fxa-content-server/commit/dfa609575339e903969fdabe9e91657b468e17a9))
* **metrics:** Log a screen once, childviews should not cause the parent to be lgoged. ([5964e0ba](https://github.com/mozilla/fxa-content-server/commit/5964e0badb1495c62a44e807ea604e43b8543f3f))
* **router:** show error screen when view rendering fails ([49eb7063](https://github.com/mozilla/fxa-content-server/commit/49eb70631f261cf7deecaf15e5c324edf51e704f))
* **sync:** show Sync brand name when signin up/in for Sync ([c15a2761](https://github.com/mozilla/fxa-content-server/commit/c15a276112883834a46b7c7b50cebe39db941214), closes [#1339](https://github.com/mozilla/fxa-content-server/issues/1339))
* **test:** Ensure requirejs configuration is loaded before any other scripts. ([10eddcb4](https://github.com/mozilla/fxa-content-server/commit/10eddcb4bd11eeadb50b21577272ecd00882c31e))
* **tos-pp:** rely on accept headers instead of naviagor.language for partial requests ([fdceab5a](https://github.com/mozilla/fxa-content-server/commit/fdceab5a0aad420e0c000bb920b121ce05bd99d5), closes [#1412](https://github.com/mozilla/fxa-content-server/issues/1412))


#### Features

* **metrics:** Add screen width and height to the metrics. ([0f5f3513](https://github.com/mozilla/fxa-content-server/commit/0f5f35135098b0502a9276549d4d74160a28279a))
* **oauth:**
  * Add WebChannel support ([97b714b6](https://github.com/mozilla/fxa-content-server/commit/97b714b6705ba7f719febe9ca7c814bf768207f8))
  * message to native flows ([00c1c0f7](https://github.com/mozilla/fxa-content-server/commit/00c1c0f7a054fa690b0af00f52aa5f526dc0b127))
* **settings:** profile images ([fe0b8770](https://github.com/mozilla/fxa-content-server/commit/fe0b8770c8bfe0b719a947f193a827d03bf747e6))


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


