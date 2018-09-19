<a name="v1.121.0"></a>
## v1.121.0 (2018-09-18)

#### Features

* **chore:**  utilize a rust-toolchain file ([3903f0b9](3903f0b9))



<a name="v1.120.0"></a>
## v1.120.0 (2018-09-06)


#### Features

* **docs:**  document errors and errno ([482f69ce](482f69ce))
* **errors:**  return bouncedAt field in bounce error message ([d74eaec9](d74eaec9))



<a name="v1.119.0"></a>
## v1.119.0 (2018-08-22)


#### Features

* **logging:**  add sentry support (#176) r=@vladikoff ([73d07bd7](73d07bd7))
* **socketlabs:**  create and return id for socketlabs messages ([30639fc3](30639fc3))

#### Bug Fixes

* **logging:**  remove unnecessary and add debug logs in queues (#177) r=@vladikoff ([0f790c16](0f790c16))
* **queues:**
  *  make queue parsing logic follow the sns format (#178) r=@vladikoff ([7beca536](7beca536))
  *  fix executor error on queues process (#174) r=@vladikoff,@philbooth ([5e9f2688](5e9f2688))



<a name="v1.118.0"></a>
## v1.118.0 (2018-08-09)


#### Bug Fixes

* **ses:**  use updated rusoto version that sends message in body (#164) r=@vladikoff ([c085cbb3](c085cbb3))



<a name="v1.117.0"></a>
## v1.117.0 (2018-08-01)


#### Features

* **settings:**
  *  enable the default provider to override requests ([ca4b2011](ca4b2011))
  *  add secret_key to settings (#147) r=@vladikoff ([1db8d449](1db8d449), closes [#146](146))



<a name="v1.116.3"></a>
## v1.116.3 (2018-07-26)

#### Refactor

* **settings:** drop NODE_ENV and add LOG_LEVEL (#141) r=@vladikoff

#### Features

* **providers:**  create socketlabs provider ([13cd2213](13cd2213))



<a name="v1.116.2"></a>
## v1.116.2 (2018-07-19)


#### Bug Fixes

* **docker:**  Rocket.toml no longer exists, so don't copy it (#136) ([b915b7e8](b915b7e8))



<a name="1.116.1"></a>
## 1.116.1 (2018-07-18)


#### Features

* **project:**  create healthcheck endpoints and make $PORT an env variable (#134) r=@philbooth,@vladikoff ([b69cfb53](b69cfb53), closes [#132](132), [#133](133))

#### Bug Fixes

* **deploy:**  pin to a known compatible rust version in docker and ci (#131) r=@vladikoff ([7512acf0](7512acf0), closes [#130](130))
* **docker:**  include /app/version.json in final image (dockerflow required) (#129) ([16f7630f](16f7630f))



<a name="1.116.0"></a>
## 1.116.0 (2018-07-12)


#### Breaking Changes

* **logging:**  turn off rocket logs for production (#125) r=@vladikoff ([825e3993](825e3993), closes [#111](111))

#### Bug Fixes

* **docs:**  better docs for the settings module ([ba9f8b88](ba9f8b88))
* **scripts:**
  *  don't try to deploy docs if they haven't changed ([e6e3350c](e6e3350c))
  *  stop gh-pages script from failing for pull requests ([8e48f36e](8e48f36e))
  *  update references to bin names with `fxa-email-` prefix ([fb56a209](fb56a209))
* **settings:**  get message data hmac key setting to work with env variables (#110) r=@philbooth,@vladikoff ([90bec93f](90bec93f), closes [#109](109))

#### Features

* **docker:**
  *  copy Rocket.toml in the docker image (#107) r=@brizental ([05f93b9d](05f93b9d), closes [#106](106))
  *  set ROCKET_ENV to prod (#105) r=@brizental ([b3e3ac29](b3e3ac29))
* **docs:**  generate developer docs with rustdoc ([f2edb78c](f2edb78c))
* **logging:**
  *  turn off rocket logs for production (#125) r=@vladikoff ([825e3993](825e3993), closes [#111](111))
  *  add null logger for testing environment (#102) r=@philbooth,@vladikoff ([199cd825](199cd825), closes [#82](82))
* **providers:**  implement smtp provider ([20b7fc08](20b7fc08))



<a name="1.115.0"></a>
## 1.115.0 (2018-06-26)


#### Bug Fixes

* **api:**  limit `to` field to a single recipient ([b6dad721](b6dad721))
* **bounces:**  ensure db errors don't get converted to 429 responses (#59) r=@vladikoff ([5986e841](5986e841))
* **config:**  inject config in rocket managed state ([50f8d523](50f8d523))
* **db:**
  *  fix broken BounceSubtype deserialization ([fa796dfe](fa796dfe))
  *  add missing derive(Debug) ([da70321d](da70321d))
  *  add missing fields/values to auth_db::BounceRecord ([79e0ea31](79e0ea31))
* **errors:**
  *  return JSON payloads for error responses ([b5343d54](b5343d54))
  *  include more useful messages in wrapping errors ([58bf9bec](58bf9bec))
* **logging:**  add mozlog logging for requests ([49ed73cd](49ed73cd))
* **queues:**
  *  use correct name when deserializing bouncedRecipients ([0cc089e9](0cc089e9))
  *  accept partially-filled notifications from sendgrid ([0a6c0432](0a6c0432))
  *  fix nonsensical parse logic for sqs notifications ([1c21d6ec](1c21d6ec))
* **sendgrid:**  return message id from the sendgrid provider ([fe8ec12f](fe8ec12f))
* **validation:**
  *  make email regex less restrictive (#86) r=@vladikoff,@rfk,@philbooth ([3ec3e039](3ec3e039), closes [#81](81))
  *  relax the sendgrid API key validation regex (#55) r=@vbudhram,@vladikoff ([008f1191](008f1191))
  *  allow RFC5321 compliant email addresses ([66f5d5c0](66f5d5c0), closes [#44](44))

#### Features

* **api:**  implement a basic /send endpoint ([6c3361c2](6c3361c2))
* **config:**  add configuration ([a86015fb](a86015fb))
* **db:**
  *  implement AuthDb::create_bounce ([ca44a94b](ca44a94b))
  *  check the emailBounces table before sending email ([490a69e1](490a69e1))
* **docs:**  add a readme doc ([5fd4e6aa](5fd4e6aa))
* **logging:**  add mozlog to settings and scrub sensitive data (#74) r=@philbooth,@vladikoff ([f4271b9e](f4271b9e), closes [#18](18))
* **metadata:**
  *  send message metadata in outgoing notifications (#73) r=@vladikoff,@brizental ([2aa1459d](2aa1459d), closes [#4](4))
  *  store caller-specific metadata with the message id ([98b738a9](98b738a9))
* **providers:**  add custom headers option ([efb8f0d7](efb8f0d7))
* **queues:**
  *  return futures instead of blocking for queue handling ([6c154a04](6c154a04))
  *  handle SES bounce, complaint and delivery notifications ([4338f24c](4338f24c))
* **sendgrid:**  implement basic sending via sendgrid ([25947a96](25947a96))
* **ses:**
  *  add support for aws access and secret keys ([da3cdf69](da3cdf69))
  *  implement basic ses-based email sending ([4ab1d9ce](4ab1d9ce))



