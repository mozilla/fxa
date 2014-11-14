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

