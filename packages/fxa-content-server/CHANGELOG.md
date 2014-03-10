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


