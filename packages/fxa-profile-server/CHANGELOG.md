<a name="0.31.0"></a>
## 0.31.0 (2015-02-17)


#### Features

* **docker:** Dockerfile and README update for basic docker development workflow ([d424fb66](mozilla/fxa-profile-server/commit/d424fb6664f08bb783db4ecdf76bb805113b4485))
* **images:** delete images from s3 when asked to ([ec25152b](mozilla/fxa-profile-server/commit/ec25152b434b4b75939a5184b38210e326dea438))


<a name="0.26.1"></a>
### 0.26.1 (2014-11-17)


#### Bug Fixes

* **avatars:**
  * properly detect and report image upload errors ([902d0e68](mozilla/fxa-profile-server/commit/902d0e68cac6292acfeb8ed61f5708616a785532), closes [#79](mozilla/fxa-profile-server/issues/79))
  * return the profile image id after a post or upload ([85ffefc9](mozilla/fxa-profile-server/commit/85ffefc9d027b08fa923f2d23ff06a7e1153e31b))
* **config:** use ip addresses instead of localhost ([58defb67](mozilla/fxa-profile-server/commit/58defb67d921bce98001285b153ab7178d51245c))
* **logging:**
  * remove spaces from logging op name ([41fad890](mozilla/fxa-profile-server/commit/41fad890dbbb779d0f7b871067a9f6bd5d56cd5c))
  * remove spaces from logging op name in the worker ([290c9ed7](mozilla/fxa-profile-server/commit/290c9ed785dc14ed27936c217132582545c73af0), closes [#77](mozilla/fxa-profile-server/issues/77))


#### Features

* **logging:** use mozlog with heka format ([b27b48bf](mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd), closes [#71](mozilla/fxa-profile-server/issues/71))
* **server:** enable HSTS maxAge six months ([248e2e48](mozilla/fxa-profile-server/commit/248e2e48f86eaa9e053d26b599f0db2752be7e6c))


#### Breaking Changes

* Both the config and the output for logging has changed.
    Config can be removed, as the defaults are what should be used in
    production.
 ([b27b48bf](mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd))


<a name="0.26.0"></a>
## 0.26.0 (2014-11-12)


#### Features

* **logging:** use mozlog with heka format ([b27b48bf](mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd), closes [#71](mozilla/fxa-profile-server/issues/71))


#### Breaking Changes

* Both the config and the output for logging has changed.
    Config can be removed, as the defaults are what should be used in
    production.
 ([b27b48bf](mozilla/fxa-profile-server/commit/b27b48bf6116c86353f1523be91d6964a7fb48fd))


<a name="0.24.0"></a>
## 0.24.0 (2014-10-20)


#### Features

* **server:** enable HSTS maxAge six months ([248e2e48](mozilla/fxa-profile-server/commit/248e2e48f86eaa9e053d26b599f0db2752be7e6c))

