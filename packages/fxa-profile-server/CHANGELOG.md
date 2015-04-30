<a name="0.36.0"></a>
## 0.36.0 (2015-04-30)


#### Bug Fixes

* **db:** race condition when asking for db multiple times at startup ([1bc2cae5](https://github.com/mozilla/fxa-profile-server/commit/1bc2cae55a065d5d979dd5e4494e51c3492c4e2f))


#### Features

* **profile:** return all /profile pieces that scopes allow ([35a4875f](https://github.com/mozilla/fxa-profile-server/commit/35a4875f868d5695d455e382673aba8db4586b91), closes [#108](https://github.com/mozilla/fxa-profile-server/issues/108))


<a name"0.35.0"></a>
## 0.35.0 (2015-04-13)


#### Bug Fixes

* **changelog:** set package.json repository correctly so conventional-changelog creates valid UR ([17100542](https://github.com/mozilla/fxa-profile-server/commit/17100542))
* **test:**
  * set maxSockets to Infinity for real ([d2795966](https://github.com/mozilla/fxa-profile-server/commit/d2795966))
  * expect new default size of 200x200 ([18f130f9](https://github.com/mozilla/fxa-profile-server/commit/18f130f9))


#### Features

* **displayName:** add a profile table with a displayName field ([ad6488eb](https://github.com/mozilla/fxa-profile-server/commit/ad6488eb))
* **mysql:** use mysql patcher to allow incremental schema updates ([2fbfbbda](https://github.com/mozilla/fxa-profile-server/commit/2fbfbbda))


<a name="0.33.0"></a>
## 0.33.0 (2015-03-16)


#### Bug Fixes

* **docs:** note "avatar" field in /v1/profile response ([0698d434](https://github.com/mozilla/fxa-profile-server/commit/0698d434ff1bc147d1676ce0b94c0ff832feba39))


#### Features

* **avatar:** add support for multiple image sizes ([187b0766](https://github.com/mozilla/fxa-profile-server/commit/187b07664882d5fdb16b4bd374baa5b5d3e2d274), closes [#68](https://github.com/mozilla/fxa-profile-server/issues/68), [#89](https://github.com/mozilla/fxa-profile-server/issues/89))
* **test:**
  * in load test, make image deletion optional ([b388fb62](https://github.com/mozilla/fxa-profile-server/commit/b388fb62fa2b9cd05a094871c401daa37d8c0765))
  * in load test, add delete after download ([4a433260](https://github.com/mozilla/fxa-profile-server/commit/4a433260f63516ee89aaaa31f9f21cb91882f851))


<a name="0.31.0"></a>
## 0.31.0 (2015-02-17)


#### Features

* **docker:** Dockerfile and README update for basic docker development workflow ([d424fb66](https://github.com/mozilla/fxa-profile-server/commit/d424fb6664f08bb783db4ecdf76bb805113b4485))
* **images:** delete images from s3 when asked to ([ec25152b](https://github.com/mozilla/fxa-profile-server/commit/ec25152b434b4b75939a5184b38210e326dea438))


<a name="0.26.1"></a>
### 0.26.1 (2014-11-17)


#### Bug Fixes

* **avatars:**
  * properly detect and report image upload errors ([902d0e68](https://github.com/mozilla/fxa-profile-server/commit/902d0e68cac6292acfeb8ed61f5708616a785532), closes [#79](https://github.com/mozilla/fxa-profile-server/issues/79))
  * return the profile image id after a post or upload ([85ffefc9](https://github.com/mozilla/fxa-profile-server/commit/85ffefc9d027b08fa923f2d23ff06a7e1153e31b))
* **config:** use ip addresses instead of localhost ([58defb67](https://github.com/mozilla/fxa-profile-server/commit/58defb67d921bce98001285b153ab7178d51245c))
* **logging:**
  * remove spaces from logging op name ([41fad890](https://github.com/mozilla/fxa-profile-server/commit/41fad890dbbb779d0f7b871067a9f6bd5d56cd5c))
  * remove spaces from logging op name in the worker ([290c9ed7](https://github.com/mozilla/fxa-profile-server/commit/290c9ed785dc14ed27936c217132582545c73af0), closes [#77](https://github.com/mozilla/fxa-profile-server/issues/77))


#### Features

* **logging:** use mozlog with heka format ([b27b48bf](https://github.com/mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd), closes [#71](https://github.com/mozilla/fxa-profile-server/issues/71))
* **server:** enable HSTS maxAge six months ([248e2e48](https://github.com/mozilla/fxa-profile-server/commit/248e2e48f86eaa9e053d26b599f0db2752be7e6c))


#### Breaking Changes

* Both the config and the output for logging has changed.
    Config can be removed, as the defaults are what should be used in
    production.
 ([b27b48bf](https://github.com/mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd))


<a name="0.26.0"></a>
## 0.26.0 (2014-11-12)


#### Features

* **logging:** use mozlog with heka format ([b27b48bf](https://github.com/mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd), closes [#71](https://github.com/mozilla/fxa-profile-server/issues/71))


#### Breaking Changes

* Both the config and the output for logging has changed.
    Config can be removed, as the defaults are what should be used in
    production.
 ([b27b48bf](https://github.com/mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd))


<a name="0.24.0"></a>
## 0.24.0 (2014-10-20)


#### Features

* **server:** enable HSTS maxAge six months ([248e2e48](https://github.com/mozilla/fxa-profile-server/commit/248e2e48f86eaa9e053d26b599f0db2752be7e6c))
