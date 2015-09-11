<a name="0.45.0"></a>
## 0.45.0 (2015-09-11)


#### Bug Fixes

* **token:** disable expiration error ([c9547a8b](http://github.com/mozilla/fxa-oauth-server/commit/c9547a8b541b23956676b182df22b83c8a786e61))
* **version:** use explicit path with git-config ([e0af8bcc](http://github.com/mozilla/fxa-oauth-server/commit/e0af8bccda69f478f286a86f4b11f6da485cc0f6))


#### Features

* **db:** remove clients.secret column ([0e39d1ee](http://github.com/mozilla/fxa-oauth-server/commit/0e39d1ee67818722d32f5ae0455ea56cf5d0cec1), closes [#323](http://github.com/mozilla/fxa-oauth-server/issues/323))


<a name="0.44.0"></a>
## 0.44.0 (2015-08-26)


#### Bug Fixes

* **authorization:** allow empty scope with implicit grant ([1d6ac8e5](http://github.com/mozilla/fxa-oauth-server/commit/1d6ac8e55d28683072f448e022c33154bb4d7397), closes [#315](http://github.com/mozilla/fxa-oauth-server/issues/315))
* **db:** don't change client database at startup; footgun ([8877f818](http://github.com/mozilla/fxa-oauth-server/commit/8877f818ec46a05a283e95e10fd8398756ad907c))


<a name="0.43.0"></a>
## 0.43.0 (2015-08-04)


#### Bug Fixes

* **db:** we need to enforce only a minimum patch level (not {n,n+1}) ([e12f54d5](http://github.com/mozilla/fxa-oauth-server/commit/e12f54d5dc83c9f9595f7cc765ccc7e932361177))
* **events:** require events to be configured in production ([1bef9e0a](http://github.com/mozilla/fxa-oauth-server/commit/1bef9e0aa26e15921d48205335a32565b255a6da))
* **server:** exit if db patch level is wrong ([78d63829](http://github.com/mozilla/fxa-oauth-server/commit/78d6382980a8ce1e6adbcb2af5825f643cbcbccd))


#### Breaking Changes

* Server will fail to start up if `config.events` is not
  set with values when in production.
 ([1bef9e0a](http://github.com/mozilla/fxa-oauth-server/commit/1bef9e0aa26e15921d48205335a32565b255a6da))


<a name="0.42.0"></a>
## 0.42.0 (2015-07-22)


#### Bug Fixes

* **config:** set expiration.accessToken default to 2 weeks ([7a4742de](http://github.com/mozilla/fxa-oauth-server/commit/7a4742dea75e59e66153273d77dd6cd5dd4b9d84))
* **sql:**
  * remove references to the `whitelisted` column; this is now the `trusted` column ([6b4d1ec3](http://github.com/mozilla/fxa-oauth-server/commit/6b4d1ec3f3fb72aa376ab28aa191198014f1bd84))
  * undo 155d2ce; for mysql-patcher fix up that database ([eb9f40d1](http://github.com/mozilla/fxa-oauth-server/commit/eb9f40d10389eb0de6a08b70089851789ac7f932))
  * fix the schema issue with the trailing comma ([069caeb4](http://github.com/mozilla/fxa-oauth-server/commit/069caeb4891c90c4d77649acded270b01785adca), closes [#299](http://github.com/mozilla/fxa-oauth-server/issues/299))
* **tests:** sleep additional half second to adjust for mysql round of timestamp ([a02f5161](http://github.com/mozilla/fxa-oauth-server/commit/a02f5161d632e383ec55decc314a81668b600c82))


#### Features

* **api:** add ttl parameter to POST /authorization ([36087fe6](http://github.com/mozilla/fxa-oauth-server/commit/36087fe6dd4589d6451e007aa76edc4f0db2fcca))


<a name"0.41.0"></a>
## 0.41.0 (2015-07-07)


#### Bug Fixes

* **api:**
  * tolerate an empty client_secret in /destroy ([25a4d308](https://github.com/mozilla/fxa-oauth-server/commit/25a4d308))
  * accept and ignore client_secret param in /destroy ([c797ed23](https://github.com/mozilla/fxa-oauth-server/commit/c797ed23))
  * use invalidRequestParameter instead of invalidRedirect for invalid redirect acti ([55eff2dd](https://github.com/mozilla/fxa-oauth-server/commit/55eff2dd))
  * fail on invalid action parameters ([0c73ae79](https://github.com/mozilla/fxa-oauth-server/commit/0c73ae79))
* **config:** update redirect_uri values to not be blank ([5267c62a](https://github.com/mozilla/fxa-oauth-server/commit/5267c62a))


#### Features

* **refresh_tokens:** add refresh_tokens to /token endpoint ([16e787f0](https://github.com/mozilla/fxa-oauth-server/commit/16e787f0), closes [#209](https://github.com/mozilla/fxa-oauth-server/issues/209))


<a name"0.39.0"></a>
## 0.39.0 (2015-06-10)


#### Bug Fixes

* **api:**
  * Correct the error codes changed in 2781b3a ([d0dba7c9](https://github.com/mozilla/fxa-oauth-server/commit/d0dba7c9))
  * Change InvalidAssertions error code to  401 ([2781b3a2](https://github.com/mozilla/fxa-oauth-server/commit/2781b3a2))
  * ensure /destroy endpoint returns an empty object in response body. ([6efd47d1](https://github.com/mozilla/fxa-oauth-server/commit/6efd47d1))
* **clients:** fixes client registration to use payload.whitelisted ([83e145b0](https://github.com/mozilla/fxa-oauth-server/commit/83e145b0))
* **docs:**
  * Change Status Code for Invalid Assertion based ([780aaee3](https://github.com/mozilla/fxa-oauth-server/commit/780aaee3))
  * document keys and verification_redirect options ([ef8c47a5](https://github.com/mozilla/fxa-oauth-server/commit/ef8c47a5))
  * Update description of the `action` param to match latest reality. ([b475fcbc](https://github.com/mozilla/fxa-oauth-server/commit/b475fcbc))
* **fatal-error:** Exit with non-zero exit code for fatal errors ([7c90ff08](https://github.com/mozilla/fxa-oauth-server/commit/7c90ff08), closes [#244](https://github.com/mozilla/fxa-oauth-server/issues/244))


#### Features

* **clients:** remove obsolete generate-client.js script ([62ab0adb](https://github.com/mozilla/fxa-oauth-server/commit/62ab0adb), closes [#231](https://github.com/mozilla/fxa-oauth-server/issues/231))


<a name"0.36.1"></a>
### 0.36.1 (2015-04-30)


#### Bug Fixes

* **db:** remove db name from clients ([c7244393](https://github.com/mozilla/fxa-oauth-server/commit/c7244393))


#### Features

* **auth:** redirect to content-server oauth root by default ([34ad867c](https://github.com/mozilla/fxa-oauth-server/commit/34ad867c), closes [#245](https://github.com/mozilla/fxa-oauth-server/issues/245))
* **clients:**
  * add `terms_uri` and `privacy_uri` properties to clients. ([51ae9043](https://github.com/mozilla/fxa-oauth-server/commit/51ae9043))
  * report `trusted` property in GET /client/:id ([c58d237b](https://github.com/mozilla/fxa-oauth-server/commit/c58d237b))
* **untrusted-clients:** restrict scopes that untrusted clients can request ([8fd228ad](https://github.com/mozilla/fxa-oauth-server/commit/8fd228ad), closes [#243](https://github.com/mozilla/fxa-oauth-server/issues/243))


<a name"0.36.0"></a>
## 0.36.0 (2015-04-27)


#### Features

* **authorization:** exit early if assertion invalid returns first ([5a27ee61](https://github.com/mozilla/fxa-oauth-server/commit/5a27ee61))
* **config:**
  * add browserid pool maxSockets option ([0bb40ba1](https://github.com/mozilla/fxa-oauth-server/commit/0bb40ba1))
  * add mysql pool conectionLimit option ([ca220ae7](https://github.com/mozilla/fxa-oauth-server/commit/ca220ae7))
* **developers:** adds support for oauth developers ([abe0e52a](https://github.com/mozilla/fxa-oauth-server/commit/abe0e52a))
* **logging:**
  * add log of time taken in authorization endpoint ([02ec0d20](https://github.com/mozilla/fxa-oauth-server/commit/02ec0d20))
  * add log when mysql pool enqueues ([461b5c19](https://github.com/mozilla/fxa-oauth-server/commit/461b5c19))


<a name"0.35.0"></a>
## 0.35.0 (2015-04-13)


#### Bug Fixes

* **clients:** support client/client_id route via the internal server ([ce04da76](https://github.com/mozilla/fxa-oauth-server/commit/ce04da76))


<a name="0.33.0"></a>
## 0.33.0 (2015-03-16)


#### Bug Fixes

* **clients:** fixes client endpoint for clients with no redirect_uri ([6d47110f](http://github.com/mozilla/fxa-oauth-server/commit/6d47110f5a3bbf4eb2e540c7ba09325e16dfec92), closes [#228](http://github.com/mozilla/fxa-oauth-server/issues/228))
* **travis:** install libgmp3-dev so optionaldep bigint will be built for browserid-crypto ([a64cb183](http://github.com/mozilla/fxa-oauth-server/commit/a64cb183457e713fea092002cbecffd57961bb74))


#### Features

* **clients:** move client management api to a separate port ([07a61af2](http://github.com/mozilla/fxa-oauth-server/commit/07a61af2141e7fffc54d08a16acac48073103570))


<a name="0.30.3"></a>
### 0.30.3 (2015-02-20)


#### Bug Fixes

* **clients:** update email validation ([92d4bfc3](http://github.com/mozilla/fxa-oauth-server/commit/92d4bfc30d5c9f17483f964195b8836bbb1e6557))
* **db:** make the clients key mandatory in the config file ([ac7a39e8](http://github.com/mozilla/fxa-oauth-server/commit/ac7a39e8ad8506523a6721f87c9d70e70349aef7))


#### Features

* **docker:** Dockerfile and README update for basic docker development workflow ([342d87bb](http://github.com/mozilla/fxa-oauth-server/commit/342d87bb56d8204f83aad65449c02b2f2a233fec))


<a name="0.30.2"></a>
### 0.30.2 (2015-02-09)


#### Bug Fixes

* **api:** remove stray payload restriction from authorization route ([e0d53682](http://github.com/mozilla/fxa-oauth-server/commit/e0d536821060dc044d875cbf5004c90c226cb09c))
* **logging:** use route.path in debug message, not route.url ([7d9efc25](http://github.com/mozilla/fxa-oauth-server/commit/7d9efc253465c5d95d20f216a2ff6e42be82f1ca))


<a name="0.30.1"></a>
### 0.30.1 (2015-02-03)


#### Bug Fixes

* **api:**
  * allow application/x-form-urlencoded ([6cc91e28](http://github.com/mozilla/fxa-oauth-server/commit/6cc91e285fc51045a365dbacb3617ef29093dbc3))
  * reject requests with invalid parameters ([3b4fa244](http://github.com/mozilla/fxa-oauth-server/commit/3b4fa244454e5b33edf44d14a6da8be1d0fe98a6), closes [#210](http://github.com/mozilla/fxa-oauth-server/issues/210))


#### Breaking Changes

* If you're passing invalid parameters, stop it.
 ([3b4fa244](http://github.com/mozilla/fxa-oauth-server/commit/3b4fa244454e5b33edf44d14a6da8be1d0fe98a6))


<a name="0.30.0"></a>
## 0.30.0 (2015-02-02)


#### Bug Fixes

* **api:** reject requests with bad content-types ([26672287](http://github.com/mozilla/fxa-oauth-server/commit/26672287010658048afb5e83363319076799d976), closes [#199](http://github.com/mozilla/fxa-oauth-server/issues/199))
* **clients:** fix server error when omitting optional fields in client registration ([80768c51](http://github.com/mozilla/fxa-oauth-server/commit/80768c51ea3cd1a26194f19951061992fd75bc1a))


#### Features

* **api:**
  * add `auth_at` to token response schema. ([bc8454df](http://github.com/mozilla/fxa-oauth-server/commit/bc8454df90b1c4d8b94fc4bac993b76a8371432f))
  * allow destroying token without client_secret ([7b4d01ff](http://github.com/mozilla/fxa-oauth-server/commit/7b4d01ffc87dd3da74bf5eb7fc21ee07290090fd))
* **db:** add basic migration infrastructure to mysql backend ([012e605c](http://github.com/mozilla/fxa-oauth-server/commit/012e605c501c5d135c16387ac6593931da73f589))


<a name="0.29.0"></a>
## 0.29.0 (2015-01-20)


#### Bug Fixes

* **docs:** minor spelling fixes ([33ad1ec0](http://github.com/mozilla/fxa-oauth-server/commit/33ad1ec0b67116e3f9eb46b7ac9eb8f51548178b))


#### Features

* **api:** Add `action=force_auth` to GET /v1/authorization. ([33603bd2](http://github.com/mozilla/fxa-oauth-server/commit/33603bd2dc1b8a483563512f2f1f4729d64c0fc3))


<a name="0.26.2"></a>
### 0.26.2 (2014-11-20)


#### Bug Fixes

* **logging:** use space-free tokens for mozlog ([11f73f9e](http://github.com/mozilla/fxa-oauth-server/commit/11f73f9e8e16324dba00822272f77a38828423f7))


<a name="0.26.1"></a>
### 0.26.1 (2014-11-13)


#### Features

* **logging:** log details when generating code ([81933f70](http://github.com/mozilla/fxa-oauth-server/commit/81933f70a61c5783adc89dcea36f9f8213609e6a))


<a name="0.26.0"></a>
## 0.26.0 (2014-11-12)


#### Bug Fixes

* **api:** set update to return an empty object ([6f334c66](http://github.com/mozilla/fxa-oauth-server/commit/6f334c668dc93f4ccba07c0aa14c316a5a433bca))
* **error:** AppError uses Error.captureStackTrace ([2337f809](http://github.com/mozilla/fxa-oauth-server/commit/2337f809938ccef433667beb319be3b4de815da3), closes [#164](http://github.com/mozilla/fxa-oauth-server/issues/164))


#### Features

* **clients:** client registration apis ([1a80294d](http://github.com/mozilla/fxa-oauth-server/commit/1a80294dc3071b208d7573475b5be71c85e2aeb0))
* **error:** add info property with link to docs ([681044c6](http://github.com/mozilla/fxa-oauth-server/commit/681044c6125b16b77cfa87a0cd7f5e2319f6bbab))
* **logging:**
  * add method, payload, and auth to summary ([df57e23c](http://github.com/mozilla/fxa-oauth-server/commit/df57e23cd737ae3a05a8b977ae377d00e570406b))
  * switch logging to mozlog ([ec0f5db1](http://github.com/mozilla/fxa-oauth-server/commit/ec0f5db1350b001176bbed84264cd1523a1d68b0), closes [#156](http://github.com/mozilla/fxa-oauth-server/issues/156))
* **verify:** added 'client' to /verify response ([4c575516](http://github.com/mozilla/fxa-oauth-server/commit/4c5755164ceba608497cf36377746a6a3fbc41a8), closes [#149](http://github.com/mozilla/fxa-oauth-server/issues/149))


#### Breaking Changes

* both the config and the logging output has changed.

Closes #156
 ([ec0f5db1](http://github.com/mozilla/fxa-oauth-server/commit/ec0f5db1350b001176bbed84264cd1523a1d68b0))


<a name="0.24.0"></a>
## 0.24.0 (2014-10-20)


#### Features

* **server:** set HSTS header for 180 days ([d43accb9](http://github.com/mozilla/fxa-oauth-server/commit/d43accb9d7749a216840ba0cf51861becf974a81))

