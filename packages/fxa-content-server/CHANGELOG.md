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
* **style:** Fiding duplicated selector in main.scss ([c23f9f9e](https://github.com/mozilla/fxa-content-server/commit/c23f9f9e22a1f3ad61d866edd54b89bfba0fdae4))
* **styles:** Removing unneeded vendor prefixes ([f7e5373c](https://github.com/mozilla/fxa-content-server/commit/f7e5373c507070bb9b44877a3999b9f0f1bc7a12))


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


