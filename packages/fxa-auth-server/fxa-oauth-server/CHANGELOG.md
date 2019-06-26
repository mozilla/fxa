<a name="1.124.0"></a>

# [1.124.0](https://github.com/mozilla/fxa-oauth-server/compare/v1.123.2...v1.124.0) (2018-10-30)

### Bug Fixes

- **2fa:** Allow an explicit `null` value for `acr_values` param. ([47f4c61](https://github.com/mozilla/fxa-oauth-server/commit/47f4c61))
- **api:** accept and ignore client_secret param in /destroy ([c797ed2](https://github.com/mozilla/fxa-oauth-server/commit/c797ed2))
- **api:** allow application/x-form-urlencoded ([6cc91e2](https://github.com/mozilla/fxa-oauth-server/commit/6cc91e2))
- **api:** Change InvalidAssertions error code to 401 ([2781b3a](https://github.com/mozilla/fxa-oauth-server/commit/2781b3a))
- **api:** clean up response of client-tokens delete endpoint (#3) (#449); r=rfk ([9c63273](https://github.com/mozilla/fxa-oauth-server/commit/9c63273)), closes [#3](https://github.com/mozilla/fxa-oauth-server/issues/3) [#449](https://github.com/mozilla/fxa-oauth-server/issues/449)
- **api:** Correct the error codes changed in 2781b3a ([d0dba7c](https://github.com/mozilla/fxa-oauth-server/commit/d0dba7c))
- **api:** ensure /destroy endpoint returns an empty object in response body. ([6efd47d](https://github.com/mozilla/fxa-oauth-server/commit/6efd47d))
- **api:** fail on invalid action parameters ([0c73ae7](https://github.com/mozilla/fxa-oauth-server/commit/0c73ae7))
- **api:** reject requests with bad content-types ([2667228](https://github.com/mozilla/fxa-oauth-server/commit/2667228)), closes [#199](https://github.com/mozilla/fxa-oauth-server/issues/199)
- **api:** reject requests with invalid parameters ([3b4fa24](https://github.com/mozilla/fxa-oauth-server/commit/3b4fa24)), closes [#210](https://github.com/mozilla/fxa-oauth-server/issues/210)
- **api:** remove stray payload restriction from authorization route ([e0d5368](https://github.com/mozilla/fxa-oauth-server/commit/e0d5368))
- **api:** set update to return an empty object ([6f334c6](https://github.com/mozilla/fxa-oauth-server/commit/6f334c6))
- **api:** tolerate an empty client_secret in /destroy ([25a4d30](https://github.com/mozilla/fxa-oauth-server/commit/25a4d30))
- **api:** use invalidRequestParameter instead of invalidRedirect for invalid redirect acti ([55eff2d](https://github.com/mozilla/fxa-oauth-server/commit/55eff2d))
- **authorization:** allow empty scope with implicit grant ([1d6ac8e](https://github.com/mozilla/fxa-oauth-server/commit/1d6ac8e)), closes [#315](https://github.com/mozilla/fxa-oauth-server/issues/315)
- **authorization:** Correctly handle non-existing URL scopes during authorization. (#594) r=@vladiko ([21654a3](https://github.com/mozilla/fxa-oauth-server/commit/21654a3)), closes [#594](https://github.com/mozilla/fxa-oauth-server/issues/594) [#593](https://github.com/mozilla/fxa-oauth-server/issues/593)
- **authorization:** handle action parameter in GET/authorization ([cfa6d97](https://github.com/mozilla/fxa-oauth-server/commit/cfa6d97))
- **buffer:** #527 Migrate deprecated buffer calls (#528) r=@vladikoff ([fd85207](https://github.com/mozilla/fxa-oauth-server/commit/fd85207)), closes [#527](https://github.com/mozilla/fxa-oauth-server/issues/527) [#528](https://github.com/mozilla/fxa-oauth-server/issues/528) [#527](https://github.com/mozilla/fxa-oauth-server/issues/527)
- **changelog:** Fixes #524 automated changelog is borked (#542) r=@vladikoff ([d743721](https://github.com/mozilla/fxa-oauth-server/commit/d743721)), closes [#524](https://github.com/mozilla/fxa-oauth-server/issues/524) [#542](https://github.com/mozilla/fxa-oauth-server/issues/542)
- **changelog:** update to latest changelog version (#556) ([bc9256e](https://github.com/mozilla/fxa-oauth-server/commit/bc9256e)), closes [#556](https://github.com/mozilla/fxa-oauth-server/issues/556)
- **ci:** remove geodb workaround ([521f4fe](https://github.com/mozilla/fxa-oauth-server/commit/521f4fe))
- **ci:** remove nsp (#602) ([64ade86](https://github.com/mozilla/fxa-oauth-server/commit/64ade86)), closes [#602](https://github.com/mozilla/fxa-oauth-server/issues/602) [#596](https://github.com/mozilla/fxa-oauth-server/issues/596) [#597](https://github.com/mozilla/fxa-oauth-server/issues/597)
- **ci:** Run MySQL tests in Circle (#586) r=@vbudhram ([4b1c4e4](https://github.com/mozilla/fxa-oauth-server/commit/4b1c4e4)), closes [#586](https://github.com/mozilla/fxa-oauth-server/issues/586) [#581](https://github.com/mozilla/fxa-oauth-server/issues/581)
- **ci:** turn on memcached in travis and circle ([eb86a37](https://github.com/mozilla/fxa-oauth-server/commit/eb86a37)), closes [#2681](https://github.com/mozilla/fxa-oauth-server/issues/2681)
- **clients:** fix server error when omitting optional fields in client registration ([80768c5](https://github.com/mozilla/fxa-oauth-server/commit/80768c5)), closes [#203](https://github.com/mozilla/fxa-oauth-server/issues/203)
- **clients:** fixes client endpoint for clients with no redirect_uri ([6d47110](https://github.com/mozilla/fxa-oauth-server/commit/6d47110)), closes [#228](https://github.com/mozilla/fxa-oauth-server/issues/228)
- **clients:** fixes client registration to use payload.whitelisted ([83e145b](https://github.com/mozilla/fxa-oauth-server/commit/83e145b))
- **clients:** match the notes client with fxa-dev and other envs (#585); r=rfk ([e24a582](https://github.com/mozilla/fxa-oauth-server/commit/e24a582)), closes [#585](https://github.com/mozilla/fxa-oauth-server/issues/585)
- **clients:** support client/client_id route via the internal server ([ce04da7](https://github.com/mozilla/fxa-oauth-server/commit/ce04da7))
- **clients:** update email validation ([92d4bfc](https://github.com/mozilla/fxa-oauth-server/commit/92d4bfc))
- **codes:** Remove authorization codes after use. ([e0f8961](https://github.com/mozilla/fxa-oauth-server/commit/e0f8961))
- **config:** Add environment config options ([14a9b4a](https://github.com/mozilla/fxa-oauth-server/commit/14a9b4a))
- **config:** expose clients config as OAUTH_CLIENTS ([04ebf6f](https://github.com/mozilla/fxa-oauth-server/commit/04ebf6f))
- **config:** expose more environment variables for config ([7a1dd19](https://github.com/mozilla/fxa-oauth-server/commit/7a1dd19))
- **config:** For dev, the openid issuer is http://127.0.0.1:3030 (#583) r=@vladikoff ([38e1d73](https://github.com/mozilla/fxa-oauth-server/commit/38e1d73)), closes [#583](https://github.com/mozilla/fxa-oauth-server/issues/583) [mozilla/fxa-content-server#6362](https://github.com/mozilla/fxa-content-server/issues/6362)
- **config:** mark config sentryDsn and mysql password sensitive (#511) r=@vladikoff ([d98fbcd](https://github.com/mozilla/fxa-oauth-server/commit/d98fbcd)), closes [#511](https://github.com/mozilla/fxa-oauth-server/issues/511)
- **config:** option autoUpdateClients, will be disable in prod/stage ([802a0b2](https://github.com/mozilla/fxa-oauth-server/commit/802a0b2))
- **config:** remove 00000... from hashedSecrets ([8dcfd56](https://github.com/mozilla/fxa-oauth-server/commit/8dcfd56)), closes [#339](https://github.com/mozilla/fxa-oauth-server/issues/339)
- **config:** reverting 'mark config sentryDsn and mysql password sensitive (#511) r=@vladikof ([41bd7c0](https://github.com/mozilla/fxa-oauth-server/commit/41bd7c0)), closes [#511](https://github.com/mozilla/fxa-oauth-server/issues/511)
- **config:** set expiration.accessToken default to 2 weeks ([7a4742d](https://github.com/mozilla/fxa-oauth-server/commit/7a4742d))
- **config:** update config to use getProperties ([c2ed6eb](https://github.com/mozilla/fxa-oauth-server/commit/c2ed6eb)), closes [#349](https://github.com/mozilla/fxa-oauth-server/issues/349)
- **config:** Update contentUrl ([e1622b2](https://github.com/mozilla/fxa-oauth-server/commit/e1622b2))
- **config:** Update name and redirectUri ([2a16cdd](https://github.com/mozilla/fxa-oauth-server/commit/2a16cdd))
- **config:** update redirect_uri values to not be blank ([5267c62](https://github.com/mozilla/fxa-oauth-server/commit/5267c62))
- **db:** don't change client database at startup; footgun ([8877f81](https://github.com/mozilla/fxa-oauth-server/commit/8877f81))
- **db:** Drop foreign key constraints. ([7ee117c](https://github.com/mozilla/fxa-oauth-server/commit/7ee117c))
- **db:** ensure strict mode (#448) r=rfk,seanmonstar ([8d309c5](https://github.com/mozilla/fxa-oauth-server/commit/8d309c5)), closes [#448](https://github.com/mozilla/fxa-oauth-server/issues/448) [#446](https://github.com/mozilla/fxa-oauth-server/issues/446)
- **db:** Fix an old db patch to apply cleanly in local dev. ([c7fa633](https://github.com/mozilla/fxa-oauth-server/commit/c7fa633))
- **db:** Fix case-consistency of SQL query from #612 ([9e55714](https://github.com/mozilla/fxa-oauth-server/commit/9e55714)), closes [#612](https://github.com/mozilla/fxa-oauth-server/issues/612)
- **db:** make schema.sql accuratley reflect latest patch state ([b17b000](https://github.com/mozilla/fxa-oauth-server/commit/b17b000))
- **db:** make the clients key mandatory in the config file ([ac7a39e](https://github.com/mozilla/fxa-oauth-server/commit/ac7a39e))
- **db:** remove db name from clients ([c724439](https://github.com/mozilla/fxa-oauth-server/commit/c724439))
- **db:** Restore foreign key constraints on core tables. ([2bd0845](https://github.com/mozilla/fxa-oauth-server/commit/2bd0845))
- **db:** we need to enforce only a minimum patch level (not {n,n+1}) ([e12f54d](https://github.com/mozilla/fxa-oauth-server/commit/e12f54d))
- **dependencies:** move fxa-jwtool from dev-dependencies to dependencies ([79b0427](https://github.com/mozilla/fxa-oauth-server/commit/79b0427)), closes [#345](https://github.com/mozilla/fxa-oauth-server/issues/345)
- **dependencies:** switch back to main generate-rsa-keypair now that my fix to it was merged ([1c1268b](https://github.com/mozilla/fxa-oauth-server/commit/1c1268b))
- **deps:** add filtered npm audit ([71048b3](https://github.com/mozilla/fxa-oauth-server/commit/71048b3)), closes [mozilla/fxa#303](https://github.com/mozilla/fxa/issues/303)
- **deps:** ignore npm advisories 39, 48, 658 ([238b0a1](https://github.com/mozilla/fxa-oauth-server/commit/238b0a1)), closes [/github.com/mozilla/fxa-auth-server/pull/2643/files#r220807985](https://github.com//github.com/mozilla/fxa-auth-server/pull/2643/files/issues/r220807985)
- **deps:** switch from URIjs to urijs ([ecdf31e](https://github.com/mozilla/fxa-oauth-server/commit/ecdf31e)), closes [#347](https://github.com/mozilla/fxa-oauth-server/issues/347)
- **deps:** update mocha and other dev deps ([b99e82d](https://github.com/mozilla/fxa-oauth-server/commit/b99e82d))
- **deps:** update newrelic and request r=@shane-tomlinson ([b6d6c93](https://github.com/mozilla/fxa-oauth-server/commit/b6d6c93))
- **deps:** update some dependencies ([09aa7b0](https://github.com/mozilla/fxa-oauth-server/commit/09aa7b0))
- **deps:** update to hapi 14 and joi 9 ([9bc87c0](https://github.com/mozilla/fxa-oauth-server/commit/9bc87c0)), closes [#424](https://github.com/mozilla/fxa-oauth-server/issues/424)
- **deps:** update to hapi 16, add srinkwrap scripts, update other prod deps ([c102046](https://github.com/mozilla/fxa-oauth-server/commit/c102046))
- **deps:** update to mozlog 2.0.2 ([29342a9](https://github.com/mozilla/fxa-oauth-server/commit/29342a9)), closes [#337](https://github.com/mozilla/fxa-oauth-server/issues/337)
- **doc:** Putting a little emphasis on email first (#584) r=@shane-tomlinson ([8ad17c1](https://github.com/mozilla/fxa-oauth-server/commit/8ad17c1)), closes [#584](https://github.com/mozilla/fxa-oauth-server/issues/584)
- **docker:** base image node:8-alpine and upgrade to npm6 (#567) r=@jbuck,@vladikoff ([d4060be](https://github.com/mozilla/fxa-oauth-server/commit/d4060be)), closes [#567](https://github.com/mozilla/fxa-oauth-server/issues/567)
- **docs:** add git guidelines link ([a00167c](https://github.com/mozilla/fxa-oauth-server/commit/a00167c))
- **docs:** Change Status Code for Invalid Assertion based ([780aaee](https://github.com/mozilla/fxa-oauth-server/commit/780aaee))
- **docs:** document keys and verification_redirect options ([ef8c47a](https://github.com/mozilla/fxa-oauth-server/commit/ef8c47a))
- **docs:** minor spelling fixes ([33ad1ec](https://github.com/mozilla/fxa-oauth-server/commit/33ad1ec))
- **docs:** note that codes are single use ([6fe39f7](https://github.com/mozilla/fxa-oauth-server/commit/6fe39f7)), closes [#214](https://github.com/mozilla/fxa-oauth-server/issues/214)
- **docs:** Update description of the `action` param to match latest reality. ([b475fcb](https://github.com/mozilla/fxa-oauth-server/commit/b475fcb))
- **email:** ensure mock senders take precedence over the email service ([29f379d](https://github.com/mozilla/fxa-oauth-server/commit/29f379d))
- **error:** AppError uses Error.captureStackTrace ([2337f80](https://github.com/mozilla/fxa-oauth-server/commit/2337f80)), closes [#164](https://github.com/mozilla/fxa-oauth-server/issues/164)
- **events:** require events to be configured in production ([1bef9e0](https://github.com/mozilla/fxa-oauth-server/commit/1bef9e0))
- **fatal-error:** Exit with non-zero exit code for fatal errors ([7c90ff0](https://github.com/mozilla/fxa-oauth-server/commit/7c90ff0)), closes [#244](https://github.com/mozilla/fxa-oauth-server/issues/244)
- **headers:** add cache-control headers to api endpoints; extend tests ([5a81ef9](https://github.com/mozilla/fxa-oauth-server/commit/5a81ef9))
- **headers:** make "cache-control" value configurable ([5ba82ea](https://github.com/mozilla/fxa-oauth-server/commit/5ba82ea))
- **key-data:** Correctly handle non-existent scopes when finding key data. ([34d9493](https://github.com/mozilla/fxa-oauth-server/commit/34d9493))
- **key-data:** Fail cleanly when the client has no allowedScopes. ([fafcef5](https://github.com/mozilla/fxa-oauth-server/commit/fafcef5))
- **keys:** Generate unique 'kid' field when regenerating JWK keys ([5b9acae](https://github.com/mozilla/fxa-oauth-server/commit/5b9acae))
- **keys:** replace scope key TLD (#505) r=@rfk ([a5e6d8f](https://github.com/mozilla/fxa-oauth-server/commit/a5e6d8f)), closes [#505](https://github.com/mozilla/fxa-oauth-server/issues/505)
- **log:** add remoteAddressChain to summary (#417) ([568cfa6](https://github.com/mozilla/fxa-oauth-server/commit/568cfa6)), closes [#417](https://github.com/mozilla/fxa-oauth-server/issues/417) [#415](https://github.com/mozilla/fxa-oauth-server/issues/415)
- **log:** avoid crashing on bad payload (#411) r=rfk,jrgm ([19ebed5](https://github.com/mozilla/fxa-oauth-server/commit/19ebed5)), closes [#411](https://github.com/mozilla/fxa-oauth-server/issues/411) [#410](https://github.com/mozilla/fxa-oauth-server/issues/410)
- **logging:** log the reason for account deletions ([3092ac1](https://github.com/mozilla/fxa-oauth-server/commit/3092ac1))
- **logging:** use route.path in debug message, not route.url ([7d9efc2](https://github.com/mozilla/fxa-oauth-server/commit/7d9efc2))
- **logging:** use space-free tokens for mozlog ([11f73f9](https://github.com/mozilla/fxa-oauth-server/commit/11f73f9))
- **logs:** add scope and client_id logs to verify route (#447) r=seanmonstar ([33eb39e](https://github.com/mozilla/fxa-oauth-server/commit/33eb39e)), closes [#447](https://github.com/mozilla/fxa-oauth-server/issues/447) [#444](https://github.com/mozilla/fxa-oauth-server/issues/444)
- **mailer:** Fix the bulk-mailer, add lots of tests. ([806129d](https://github.com/mozilla/fxa-oauth-server/commit/806129d))
- **memorydb:** token createdAt used instead of client createdAt (#436) r=vladikoff,seanmonstar ([02dec66](https://github.com/mozilla/fxa-oauth-server/commit/02dec66)), closes [#436](https://github.com/mozilla/fxa-oauth-server/issues/436) [#421](https://github.com/mozilla/fxa-oauth-server/issues/421)
- **metrics:** use correct format for email service notifications ([ec3ff7b](https://github.com/mozilla/fxa-oauth-server/commit/ec3ff7b))
- **monorepo:** Update CI config for oauth-server import. ([6a5675c](https://github.com/mozilla/fxa-oauth-server/commit/6a5675c))
- **mysql:** Correctly aggregate tokens by clientid. (#576) r=@vladikoff ([2c2cd22](https://github.com/mozilla/fxa-oauth-server/commit/2c2cd22)), closes [#576](https://github.com/mozilla/fxa-oauth-server/issues/576)
- **newrelic:** update to v2.1.0 ([87a3aee](https://github.com/mozilla/fxa-oauth-server/commit/87a3aee))
- **node:** use node 6.12.0 (#501) r=@vladikoff ([167c973](https://github.com/mozilla/fxa-oauth-server/commit/167c973)), closes [#501](https://github.com/mozilla/fxa-oauth-server/issues/501)
- **node:** use node 6.12.3 (#510) r=@vladikoff ([adc1fc0](https://github.com/mozilla/fxa-oauth-server/commit/adc1fc0)), closes [#510](https://github.com/mozilla/fxa-oauth-server/issues/510)
- **node:** Use Node.js v6.14.0 (#537) ([f32a3d7](https://github.com/mozilla/fxa-oauth-server/commit/f32a3d7)), closes [#537](https://github.com/mozilla/fxa-oauth-server/issues/537)
- **nodejs:** update to 6.11.1 for security fixes ([a0520c0](https://github.com/mozilla/fxa-oauth-server/commit/a0520c0))
- **oauth:** another notes dev client (#546) ([9d5ec8e](https://github.com/mozilla/fxa-oauth-server/commit/9d5ec8e)), closes [#546](https://github.com/mozilla/fxa-oauth-server/issues/546)
- **openid:** Generate openid keys on npm postinstall to file ([5f15afa](https://github.com/mozilla/fxa-oauth-server/commit/5f15afa))
- **patcher:** Fix patcher with no pre-loaded clients ([dcc47b9](https://github.com/mozilla/fxa-oauth-server/commit/dcc47b9))
- **pkce:** Don't require PKCE in the direct grant flow. (#566) r=@vladikoff ([d70fe6d](https://github.com/mozilla/fxa-oauth-server/commit/d70fe6d)), closes [#566](https://github.com/mozilla/fxa-oauth-server/issues/566) [#559](https://github.com/mozilla/fxa-oauth-server/issues/559)
- **pkce:** match pkce implementation to specifications (#498) r=rfk ([cf1c836](https://github.com/mozilla/fxa-oauth-server/commit/cf1c836)), closes [#498](https://github.com/mozilla/fxa-oauth-server/issues/498) [#495](https://github.com/mozilla/fxa-oauth-server/issues/495)
- **profile:** remove the `profileChangedAt` column on tokens table ([5e87bce](https://github.com/mozilla/fxa-oauth-server/commit/5e87bce))
- **purge:** add purgeExpiredTokensById to select, then delete by primary key (#580); r=rfk ([adfff65](https://github.com/mozilla/fxa-oauth-server/commit/adfff65)), closes [#580](https://github.com/mozilla/fxa-oauth-server/issues/580)
- **purge-expired:** accept a list of pocket-id's ([1c843a9](https://github.com/mozilla/fxa-oauth-server/commit/1c843a9))
- **purge-expired:** log uncaughtException; minimum log level of info ([264271e](https://github.com/mozilla/fxa-oauth-server/commit/264271e))
- **purge-expired:** moar logging ([80c360e](https://github.com/mozilla/fxa-oauth-server/commit/80c360e))
- **purge-expired:** Promise.delay takes milliseconds; allow subsecond delay ([10c6103](https://github.com/mozilla/fxa-oauth-server/commit/10c6103))
- **purge-expired:** set db.autoUpdateClients config to false ([bc66fc3](https://github.com/mozilla/fxa-oauth-server/commit/bc66fc3))
- **purge-expired:** use db.getClient() to check for unknown clientId ([c33f1d9](https://github.com/mozilla/fxa-oauth-server/commit/c33f1d9))
- **route:** make email false by default (#533) r=@rfk ([aa68fb9](https://github.com/mozilla/fxa-oauth-server/commit/aa68fb9)), closes [#533](https://github.com/mozilla/fxa-oauth-server/issues/533)
- **scopes:** Document scope-handling rules, use shared code to enforce them. (#551); r=vbudhr ([237886d](https://github.com/mozilla/fxa-oauth-server/commit/237886d)), closes [#551](https://github.com/mozilla/fxa-oauth-server/issues/551)
- **scopes:** Dont treat `foo:write` as a sub-scope of `foo`. ([b4b30c2](https://github.com/mozilla/fxa-oauth-server/commit/b4b30c2))
- **scripts:** Fix varname typo in test runner script. (#535) ([02804a8](https://github.com/mozilla/fxa-oauth-server/commit/02804a8)), closes [#535](https://github.com/mozilla/fxa-oauth-server/issues/535)
- **scripts:** Use pure JS module to generate RSA keypairs (#439) r=vladikoff ([3380e1c](https://github.com/mozilla/fxa-oauth-server/commit/3380e1c)), closes [#439](https://github.com/mozilla/fxa-oauth-server/issues/439)
- **security:** enable x-content-type-options nosniff ([5ea5001](https://github.com/mozilla/fxa-oauth-server/commit/5ea5001))
- **security:** enable X-XSS-Protection 1; mode=block ([52ca1e5](https://github.com/mozilla/fxa-oauth-server/commit/52ca1e5))
- **security:** set x-frame-options deny ([21ea05d](https://github.com/mozilla/fxa-oauth-server/commit/21ea05d))
- **server:** exit if db patch level is wrong ([78d6382](https://github.com/mozilla/fxa-oauth-server/commit/78d6382))
- **shrinkwrap:** restore deleted npm-shrinkwrap.json ([6383481](https://github.com/mozilla/fxa-oauth-server/commit/6383481))
- **spelling:** minor spelling fix in tests (#403) r=vladikoff ([d4ff105](https://github.com/mozilla/fxa-oauth-server/commit/d4ff105)), closes [#403](https://github.com/mozilla/fxa-oauth-server/issues/403)
- **sql:** fix the schema issue with the trailing comma ([069caeb](https://github.com/mozilla/fxa-oauth-server/commit/069caeb)), closes [#299](https://github.com/mozilla/fxa-oauth-server/issues/299)
- **sql:** remove references to the `whitelisted` column; this is now the `trusted` column ([6b4d1ec](https://github.com/mozilla/fxa-oauth-server/commit/6b4d1ec))
- **sql:** undo 155d2ce; for mysql-patcher fix up that database ([eb9f40d](https://github.com/mozilla/fxa-oauth-server/commit/eb9f40d)), closes [#301](https://github.com/mozilla/fxa-oauth-server/issues/301)
- **test:** encrypt refresh_token on db query (#414) r=seanmonstar,vladikoff ([7f52d46](https://github.com/mozilla/fxa-oauth-server/commit/7f52d46)), closes [#414](https://github.com/mozilla/fxa-oauth-server/issues/414) [#413](https://github.com/mozilla/fxa-oauth-server/issues/413)
- **test:** fix unhandled rejection error with memory db impl (#454) r=vladikoff ([c870eba](https://github.com/mozilla/fxa-oauth-server/commit/c870eba)), closes [#454](https://github.com/mozilla/fxa-oauth-server/issues/454)
- **tests:** check insert of utf8mb4 ([4e6a77a](https://github.com/mozilla/fxa-oauth-server/commit/4e6a77a))
- **tests:** double before hook timeout for tests on slow machines ([2333416](https://github.com/mozilla/fxa-oauth-server/commit/2333416))
- **tests:** mock outstanding error logs in test suite r=@vladikoff ([6a5d3ce](https://github.com/mozilla/fxa-oauth-server/commit/6a5d3ce)), closes [#334](https://github.com/mozilla/fxa-oauth-server/issues/334)
- **tests:** More reliable generation of RSA keys for tests ([981d0b7](https://github.com/mozilla/fxa-oauth-server/commit/981d0b7))
- **tests:** Refactor use of process.exit() to be outside of code under test. ([47f4f17](https://github.com/mozilla/fxa-oauth-server/commit/47f4f17))
- **tests:** sleep additional half second to adjust for mysql round of timestamp ([a02f516](https://github.com/mozilla/fxa-oauth-server/commit/a02f516))
- **tests:** speed up and upgrade the test runner (#467) r=seanmonstar ([2e76c9e](https://github.com/mozilla/fxa-oauth-server/commit/2e76c9e)), closes [#467](https://github.com/mozilla/fxa-oauth-server/issues/467)
- **token:** disable expiration error ([c9547a8](https://github.com/mozilla/fxa-oauth-server/commit/c9547a8))
- **tokens:** Added scripts that purge expired access tokens. ([10bbb24](https://github.com/mozilla/fxa-oauth-server/commit/10bbb24))
- **tokens:** Avoid quadratic behaviour when listing active clients. (#9); r=vladikoff ([15c3065](https://github.com/mozilla/fxa-oauth-server/commit/15c3065)), closes [#9](https://github.com/mozilla/fxa-oauth-server/issues/9)
- **tokens:** Begin expiring access tokens beyond a configurable epoch. ([b346326](https://github.com/mozilla/fxa-oauth-server/commit/b346326))
- **tokens:** invalidate refresh tokens on client-token DELETE action (#508) ([df0ca82](https://github.com/mozilla/fxa-oauth-server/commit/df0ca82)), closes [#508](https://github.com/mozilla/fxa-oauth-server/issues/508) [#507](https://github.com/mozilla/fxa-oauth-server/issues/507)
- **tokens:** ttl parameter must be positive (#429) r=vladikoff ([1764d73](https://github.com/mozilla/fxa-oauth-server/commit/1764d73)), closes [#429](https://github.com/mozilla/fxa-oauth-server/issues/429)
- **travis:** build on node 0.10, 0.12, 4, no allowed failures ([6684e8c](https://github.com/mozilla/fxa-oauth-server/commit/6684e8c))
- **travis:** install libgmp3-dev so optionaldep bigint will be built for browserid-crypto ([a64cb18](https://github.com/mozilla/fxa-oauth-server/commit/a64cb18))
- **travis:** remove broken validate shrinkwrap ([1729764](https://github.com/mozilla/fxa-oauth-server/commit/1729764))
- **travis:** run tests with 6 and 8 (#497) r=vladikoff ([a49b272](https://github.com/mozilla/fxa-oauth-server/commit/a49b272)), closes [#497](https://github.com/mozilla/fxa-oauth-server/issues/497)
- **travis:** test on node4/node6 with default npm & g++-4.8 ([b4e1dd8](https://github.com/mozilla/fxa-oauth-server/commit/b4e1dd8))
- **validation:** Allow redirect uris with existing query params. (#548); r=philbooth ([b93e6a1](https://github.com/mozilla/fxa-oauth-server/commit/b93e6a1)), closes [#548](https://github.com/mozilla/fxa-oauth-server/issues/548)
- **validation:** Restrict characters allowed in 'scope' parameter. ([7dd2a39](https://github.com/mozilla/fxa-oauth-server/commit/7dd2a39))
- **version:** use cwd and env var to get version (#452) r=vladikoff ([a3b1aa2](https://github.com/mozilla/fxa-oauth-server/commit/a3b1aa2)), closes [#452](https://github.com/mozilla/fxa-oauth-server/issues/452)
- **version:** use explicit path with git-config ([e0af8bc](https://github.com/mozilla/fxa-oauth-server/commit/e0af8bc))

### chore

- **api:** remove metrics context data from deprecated endpoints ([d884148](https://github.com/mozilla/fxa-oauth-server/commit/d884148)), closes [#2496](https://github.com/mozilla/fxa-oauth-server/issues/2496)
- **awsbox:** remove unused awsbox ([f053c9f](https://github.com/mozilla/fxa-oauth-server/commit/f053c9f))
- **build:** Bump eslint-config-fxa to latest version ([fe45e0b](https://github.com/mozilla/fxa-oauth-server/commit/fe45e0b))
- **build:** create changelogs each release ([16f1f5b](https://github.com/mozilla/fxa-oauth-server/commit/16f1f5b)), closes [#158](https://github.com/mozilla/fxa-oauth-server/issues/158)
- **build:** switch to grunt-nsp ([ac31672](https://github.com/mozilla/fxa-oauth-server/commit/ac31672))
- **ci:** drop node 4 as a supported env (#478) ([176c828](https://github.com/mozilla/fxa-oauth-server/commit/176c828)), closes [#478](https://github.com/mozilla/fxa-oauth-server/issues/478)
- **clients:** add credentials for FF/FFOS/Fennec/FxA clients in dev ([b501abe](https://github.com/mozilla/fxa-oauth-server/commit/b501abe))
- **clients:** remove deprecated 'whitelisted' column from clients table. ([cf16f8a](https://github.com/mozilla/fxa-oauth-server/commit/cf16f8a))
- **clients:** rename "whitelisted" property to "trusted". ([b8927a8](https://github.com/mozilla/fxa-oauth-server/commit/b8927a8))
- **config:** add local loop dev credentials ([70cc480](https://github.com/mozilla/fxa-oauth-server/commit/70cc480))
- **config:** add Notes trailing slash to redirect in dev.json (#536) ([e8bf2e5](https://github.com/mozilla/fxa-oauth-server/commit/e8bf2e5)), closes [#536](https://github.com/mozilla/fxa-oauth-server/issues/536)
- **config:** add oauth console into dev config ([14d7bab](https://github.com/mozilla/fxa-oauth-server/commit/14d7bab))
- **config:** remove duplicate 'canGrant' field in config file ([259da3d](https://github.com/mozilla/fxa-oauth-server/commit/259da3d))
- **config:** Update convict and switch on strict validation. ([1f49ad4](https://github.com/mozilla/fxa-oauth-server/commit/1f49ad4))
- **db:** Add db migration to revert change that couldn't go to production. ([9382239](https://github.com/mozilla/fxa-oauth-server/commit/9382239))
- **dep:** replaced bidcrypto dep with fxa-jwtool ([7d71239](https://github.com/mozilla/fxa-oauth-server/commit/7d71239))
- **dependencies:** bump hapi version ([13c2d57](https://github.com/mozilla/fxa-oauth-server/commit/13c2d57))
- **dependencies:** dependency upgrades ([4430228](https://github.com/mozilla/fxa-oauth-server/commit/4430228))
- **dependencies:** update 'jwcrypto' dependency to 'browserid-crypto' ([b9bf102](https://github.com/mozilla/fxa-oauth-server/commit/b9bf102)), closes [#151](https://github.com/mozilla/fxa-oauth-server/issues/151)
- **dependencies:** update convict ([8dfa52f](https://github.com/mozilla/fxa-oauth-server/commit/8dfa52f))
- **dependencies:** update most dependencies ([ad61ecb](https://github.com/mozilla/fxa-oauth-server/commit/ad61ecb))
- **dependencies:** updating deps ([e412925](https://github.com/mozilla/fxa-oauth-server/commit/e412925))
- **dependencies:** upgrade mozlog to 2.0.3 ([262bbc9](https://github.com/mozilla/fxa-oauth-server/commit/262bbc9))
- **deps:** Generate shrinkwrap for latest dependency updates ([84e69b5](https://github.com/mozilla/fxa-oauth-server/commit/84e69b5))
- **deps:** update deps, fix nsp (#517) r=@philbooth ([9f12267](https://github.com/mozilla/fxa-oauth-server/commit/9f12267)), closes [#517](https://github.com/mozilla/fxa-oauth-server/issues/517)
- **deps:** Update hapi dependency. (#457), r=@vbudhram ([24a570f](https://github.com/mozilla/fxa-oauth-server/commit/24a570f)), closes [#457](https://github.com/mozilla/fxa-oauth-server/issues/457)
- **deps:** Update hapi to latest version (#482) r=vladikoff ([6b2810e](https://github.com/mozilla/fxa-oauth-server/commit/6b2810e)), closes [#482](https://github.com/mozilla/fxa-oauth-server/issues/482)
- **deps:** Update hapi to v16.6.3 (#526) ([78c88ad](https://github.com/mozilla/fxa-oauth-server/commit/78c88ad)), closes [#526](https://github.com/mozilla/fxa-oauth-server/issues/526)
- **deps:** Update request package to latest version (#407) r=vladikoff ([b8ef1d7](https://github.com/mozilla/fxa-oauth-server/commit/b8ef1d7)), closes [#407](https://github.com/mozilla/fxa-oauth-server/issues/407)
- **dev:** add 321Done untrusted client ([a291205](https://github.com/mozilla/fxa-oauth-server/commit/a291205))
- **dev:** add Firefox Notes Web Extension client to development config ([3960e5f](https://github.com/mozilla/fxa-oauth-server/commit/3960e5f))
- **dev:** add Notes supprot scope in dev (#492) ([85af2a2](https://github.com/mozilla/fxa-oauth-server/commit/85af2a2)), closes [#492](https://github.com/mozilla/fxa-oauth-server/issues/492)
- **docker:** remove old docker self-host files ([9f5247f](https://github.com/mozilla/fxa-oauth-server/commit/9f5247f))
- **docker:** Update to node 6.11.5 (#494) ([6eb07cf](https://github.com/mozilla/fxa-oauth-server/commit/6eb07cf)), closes [#494](https://github.com/mozilla/fxa-oauth-server/issues/494)
- **docker:** Use official node image & update to Node.js v4.8.2 (#462) r=vladikoff ([b1924b0](https://github.com/mozilla/fxa-oauth-server/commit/b1924b0)), closes [#462](https://github.com/mozilla/fxa-oauth-server/issues/462)
- **docs:** Add a comment about privKey/pubKey confusion in gen_keys ([d2edd4b](https://github.com/mozilla/fxa-oauth-server/commit/d2edd4b))
- **docs:** add a note about dev envs ([0663c19](https://github.com/mozilla/fxa-oauth-server/commit/0663c19)), closes [#148](https://github.com/mozilla/fxa-oauth-server/issues/148)
- **docs:** add CircleCI badge to readme ([acff566](https://github.com/mozilla/fxa-oauth-server/commit/acff566))
- **docs:** move self-host docker file ([2180f92](https://github.com/mozilla/fxa-oauth-server/commit/2180f92))
- **docs:** remove older Docker files (#426) ([370c898](https://github.com/mozilla/fxa-oauth-server/commit/370c898)), closes [#426](https://github.com/mozilla/fxa-oauth-server/issues/426)
- **grunt:** make 'grunt release' generate changelog also ([87d5861](https://github.com/mozilla/fxa-oauth-server/commit/87d5861))
- **license:** Update license to be SPDX compliant ([ff83ec2](https://github.com/mozilla/fxa-oauth-server/commit/ff83ec2))
- **lint:** add ESLint ([1531061](https://github.com/mozilla/fxa-oauth-server/commit/1531061)), closes [#274](https://github.com/mozilla/fxa-oauth-server/issues/274)
- **logging:** Log additional details for debugging expired tokens ([22cf3ab](https://github.com/mozilla/fxa-oauth-server/commit/22cf3ab))
- **npm:** update to npm5 (#522) r=@vbudhram ([3783605](https://github.com/mozilla/fxa-oauth-server/commit/3783605)), closes [#522](https://github.com/mozilla/fxa-oauth-server/issues/522)
- **package:** npm shrinkwrap ([1ed76d9](https://github.com/mozilla/fxa-oauth-server/commit/1ed76d9))
- **package:** pin blanket to 1.1.6 ([072385b](https://github.com/mozilla/fxa-oauth-server/commit/072385b))
- **package:** remove main from package.json ([ebc60a5](https://github.com/mozilla/fxa-oauth-server/commit/ebc60a5)), closes [#206](https://github.com/mozilla/fxa-oauth-server/issues/206)
- **release:** add tasks "grunt version" and "grunt version:patch" to create release tags ([1be1380](https://github.com/mozilla/fxa-oauth-server/commit/1be1380))
- **release:** use CHANGELOG.md instead of CHANGELOG during bump ([520b39c](https://github.com/mozilla/fxa-oauth-server/commit/520b39c))
- **tests:** remove weird mocking magic ([47389fa](https://github.com/mozilla/fxa-oauth-server/commit/47389fa))
- **tests:** Uniformly use promises rather than done() callback. ([2a4731f](https://github.com/mozilla/fxa-oauth-server/commit/2a4731f))
- **tokens:** add a comment about why we're inserting an empty string for email ([eed414b](https://github.com/mozilla/fxa-oauth-server/commit/eed414b))
- **travis:** drop node 0.12 support ([b4eba46](https://github.com/mozilla/fxa-oauth-server/commit/b4eba46))
- **travis:** Only install libgmp3-dev on Travis ([cfafb19](https://github.com/mozilla/fxa-oauth-server/commit/cfafb19))
- **travis:** Tell Travis to use #fxa-bots ([17134db](https://github.com/mozilla/fxa-oauth-server/commit/17134db))
- **travis:** use npm@2 for more stable installs ([3c3e127](https://github.com/mozilla/fxa-oauth-server/commit/3c3e127))
- **version:** add /**version** route with source repo ([37a08f2](https://github.com/mozilla/fxa-oauth-server/commit/37a08f2))
- **version:** generate legacy-format output for ./config/version.json ([51b5f3b](https://github.com/mozilla/fxa-oauth-server/commit/51b5f3b))

### docs

- **api:** Update `email` behavior for GET /v1/authorization. ([755ec9a](https://github.com/mozilla/fxa-oauth-server/commit/755ec9a))
- **authorization:** Document email param in GET /authorization ([fbf1eb7](https://github.com/mozilla/fxa-oauth-server/commit/fbf1eb7))
- **service-clients:** Document Service Clients, JKUs, and JWTs ([d2f1ef3](https://github.com/mozilla/fxa-oauth-server/commit/d2f1ef3)), closes [#329](https://github.com/mozilla/fxa-oauth-server/issues/329)
- **service-clients:** Document Service Clients, JKUs, and JWTs ([799f0e2](https://github.com/mozilla/fxa-oauth-server/commit/799f0e2)), closes [#329](https://github.com/mozilla/fxa-oauth-server/issues/329)
- **verify:** fix misnamed 'scopes' response property ([b5728cf](https://github.com/mozilla/fxa-oauth-server/commit/b5728cf)), closes [#261](https://github.com/mozilla/fxa-oauth-server/issues/261)
- **workflow:** fixes workflow typo ([318d9e1](https://github.com/mozilla/fxa-oauth-server/commit/318d9e1))

### Features

- **2fa:** check acr values during authorization flow ([c20682a](https://github.com/mozilla/fxa-oauth-server/commit/c20682a))
- **amr:** Report `amr` and `acr` claims in the id_token. (#530); r=vbudhram ([8181f7f](https://github.com/mozilla/fxa-oauth-server/commit/8181f7f)), closes [#530](https://github.com/mozilla/fxa-oauth-server/issues/530)
- **api:** Add `action=force_auth` to GET /v1/authorization. ([33603bd](https://github.com/mozilla/fxa-oauth-server/commit/33603bd)), closes [#190](https://github.com/mozilla/fxa-oauth-server/issues/190)
- **api:** add `auth_at` to token response schema. ([bc8454d](https://github.com/mozilla/fxa-oauth-server/commit/bc8454d)), closes [#181](https://github.com/mozilla/fxa-oauth-server/issues/181)
- **api:** add ttl parameter to POST /authorization ([36087fe](https://github.com/mozilla/fxa-oauth-server/commit/36087fe))
- **api:** allow destroying token without client_secret ([7b4d01f](https://github.com/mozilla/fxa-oauth-server/commit/7b4d01f))
- **auth:** Accept client credentials in the Authorization header. (#514); r=philbooth ([1c50807](https://github.com/mozilla/fxa-oauth-server/commit/1c50807)), closes [#514](https://github.com/mozilla/fxa-oauth-server/issues/514)
- **auth:** redirect to content-server oauth root by default ([34ad867](https://github.com/mozilla/fxa-oauth-server/commit/34ad867)), closes [#245](https://github.com/mozilla/fxa-oauth-server/issues/245)
- **authorization:** add uri validation on the authorization endpoint (#428) r=jrgm,seanmonstar ([fcc0b52](https://github.com/mozilla/fxa-oauth-server/commit/fcc0b52)), closes [#428](https://github.com/mozilla/fxa-oauth-server/issues/428) [#387](https://github.com/mozilla/fxa-oauth-server/issues/387) [#388](https://github.com/mozilla/fxa-oauth-server/issues/388)
- **authorization:** Directly return `code` in authorization response. (#541); r=philbooth ([7ad1e56](https://github.com/mozilla/fxa-oauth-server/commit/7ad1e56)), closes [#541](https://github.com/mozilla/fxa-oauth-server/issues/541)
- **authorization:** exit early if assertion invalid returns first ([5a27ee6](https://github.com/mozilla/fxa-oauth-server/commit/5a27ee6))
- **authorization:** Require tokenVerified=true for key-bearing scopes. (#561) r=@vladikoff ([f9ad63e](https://github.com/mozilla/fxa-oauth-server/commit/f9ad63e)), closes [#561](https://github.com/mozilla/fxa-oauth-server/issues/561) [/github.com/mozilla-services/tokenserver/blob/master/tokenserver/views.py#L140](https://github.com//github.com/mozilla-services/tokenserver/blob/master/tokenserver/views.py/issues/L140)
- **ci:** move to CircleCI 2 (#554) r=@jbuck ([97e4f62](https://github.com/mozilla/fxa-oauth-server/commit/97e4f62)), closes [#554](https://github.com/mozilla/fxa-oauth-server/issues/554)
- **clients:** add `terms_uri` and `privacy_uri` properties to clients. ([51ae904](https://github.com/mozilla/fxa-oauth-server/commit/51ae904))
- **clients:** add notion of Service Clients in config ([8cfdffe](https://github.com/mozilla/fxa-oauth-server/commit/8cfdffe)), closes [#327](https://github.com/mozilla/fxa-oauth-server/issues/327)
- **clients:** Added initial support for using previous client secret ([4f9df20](https://github.com/mozilla/fxa-oauth-server/commit/4f9df20))
- **clients:** client registration apis ([1a80294](https://github.com/mozilla/fxa-oauth-server/commit/1a80294)), closes [#60](https://github.com/mozilla/fxa-oauth-server/issues/60)
- **clients:** move client management api to a separate port ([07a61af](https://github.com/mozilla/fxa-oauth-server/commit/07a61af))
- **clients:** remove obsolete generate-client.js script ([62ab0ad](https://github.com/mozilla/fxa-oauth-server/commit/62ab0ad)), closes [#231](https://github.com/mozilla/fxa-oauth-server/issues/231)
- **clients:** report `trusted` property in GET /client/:id ([c58d237](https://github.com/mozilla/fxa-oauth-server/commit/c58d237))
- **codes:** Delete authorization codes when revoking client access. (#578); r=philbooth ([b905b7c](https://github.com/mozilla/fxa-oauth-server/commit/b905b7c)), closes [#578](https://github.com/mozilla/fxa-oauth-server/issues/578)
- **config:** add browserid pool maxSockets option ([0bb40ba](https://github.com/mozilla/fxa-oauth-server/commit/0bb40ba))
- **config:** add mysql pool conectionLimit option ([ca220ae](https://github.com/mozilla/fxa-oauth-server/commit/ca220ae))
- **db:** add basic migration infrastructure to mysql backend ([012e605](https://github.com/mozilla/fxa-oauth-server/commit/012e605)), closes [#183](https://github.com/mozilla/fxa-oauth-server/issues/183)
- **db:** remove clients.secret column ([0e39d1e](https://github.com/mozilla/fxa-oauth-server/commit/0e39d1e)), closes [#323](https://github.com/mozilla/fxa-oauth-server/issues/323)
- **deps:** update server dependencies ([80ac3cf](https://github.com/mozilla/fxa-oauth-server/commit/80ac3cf))
- **deps:** update to bluebird 3 ([8f4c664](https://github.com/mozilla/fxa-oauth-server/commit/8f4c664)), closes [#570](https://github.com/mozilla/fxa-oauth-server/issues/570)
- **developers:** adds support for oauth developers ([abe0e52](https://github.com/mozilla/fxa-oauth-server/commit/abe0e52))
- **docker:** Add CloudOps Dockerfile & CircleCI build instructions ([a80b4b4](https://github.com/mozilla/fxa-oauth-server/commit/a80b4b4))
- **docker:** Additional Dockerfile for self-hosting ([83a8b6c](https://github.com/mozilla/fxa-oauth-server/commit/83a8b6c))
- **docker:** Dockerfile and README update for basic docker development workflow ([342d87b](https://github.com/mozilla/fxa-oauth-server/commit/342d87b))
- **docker:** Shrink Docker image size (#438) r=vladikoff ([13d13b9](https://github.com/mozilla/fxa-oauth-server/commit/13d13b9)), closes [#438](https://github.com/mozilla/fxa-oauth-server/issues/438)
- **docker:** support feature branches (#464) r=jrgm ([f94fd61](https://github.com/mozilla/fxa-oauth-server/commit/f94fd61)), closes [#464](https://github.com/mozilla/fxa-oauth-server/issues/464)
- **email-first:** Add support for the email-first flow. (#540); r=philbooth,rfk ([cb11145](https://github.com/mozilla/fxa-oauth-server/commit/cb11145)), closes [#540](https://github.com/mozilla/fxa-oauth-server/issues/540) [#539](https://github.com/mozilla/fxa-oauth-server/issues/539)
- **error:** add info property with link to docs ([681044c](https://github.com/mozilla/fxa-oauth-server/commit/681044c))
- **hpkp:** Add the hpkp headers to all requests (#416) r=vladikoff ([6b8a8c8](https://github.com/mozilla/fxa-oauth-server/commit/6b8a8c8)), closes [#416](https://github.com/mozilla/fxa-oauth-server/issues/416)
- **keys:** Add created-at timestamp to our public keys. (#453); r=seanmonstar,vladikoff ([511d9a6](https://github.com/mozilla/fxa-oauth-server/commit/511d9a6)), closes [#453](https://github.com/mozilla/fxa-oauth-server/issues/453)
- **keys:** add key-data docs, move client_id into payload (#491); r=rfk ([a9152c3](https://github.com/mozilla/fxa-oauth-server/commit/a9152c3)), closes [#491](https://github.com/mozilla/fxa-oauth-server/issues/491)
- **keys:** add keys_jwe support (#486) r=rfk ([6a4efd1](https://github.com/mozilla/fxa-oauth-server/commit/6a4efd1)), closes [#486](https://github.com/mozilla/fxa-oauth-server/issues/486) [#484](https://github.com/mozilla/fxa-oauth-server/issues/484)
- **keys:** Check lastAuthAt freshness when fetching key data. (#502) r=@vladikoff ([855adee](https://github.com/mozilla/fxa-oauth-server/commit/855adee)), closes [#502](https://github.com/mozilla/fxa-oauth-server/issues/502)
- **keys:** Check lastAuthAt freshness when fetching key data. (#506) r=@vladikoff ([e0de2f3](https://github.com/mozilla/fxa-oauth-server/commit/e0de2f3)), closes [#506](https://github.com/mozilla/fxa-oauth-server/issues/506)
- **lb:** Add `__lbheartbeat__` endpoint (#458), r=@jbuck ([c387907](https://github.com/mozilla/fxa-oauth-server/commit/c387907)), closes [#458](https://github.com/mozilla/fxa-oauth-server/issues/458)
- **logging:** add log of time taken in authorization endpoint ([02ec0d2](https://github.com/mozilla/fxa-oauth-server/commit/02ec0d2))
- **logging:** add log when mysql pool enqueues ([461b5c1](https://github.com/mozilla/fxa-oauth-server/commit/461b5c1))
- **logging:** add method, payload, and auth to summary ([df57e23](https://github.com/mozilla/fxa-oauth-server/commit/df57e23)), closes [#174](https://github.com/mozilla/fxa-oauth-server/issues/174)
- **logging:** log details when generating code ([81933f7](https://github.com/mozilla/fxa-oauth-server/commit/81933f7))
- **logging:** switch logging to mozlog ([ec0f5db](https://github.com/mozilla/fxa-oauth-server/commit/ec0f5db)), closes [#156](https://github.com/mozilla/fxa-oauth-server/issues/156)
- **logs:** add sentry support (#499), r=@vbudhram ([ef34859](https://github.com/mozilla/fxa-oauth-server/commit/ef34859)), closes [#499](https://github.com/mozilla/fxa-oauth-server/issues/499)
- **metrics:** add code and config for email service notification queue ([ccd5556](https://github.com/mozilla/fxa-oauth-server/commit/ccd5556)), closes [#2633](https://github.com/mozilla/fxa-oauth-server/issues/2633)
- **monorepo:** Move everything into a subdirectory. ([8453f6e](https://github.com/mozilla/fxa-oauth-server/commit/8453f6e))
- **node:** update to node 8 (#544) r=@jrgm ([e9b08ae](https://github.com/mozilla/fxa-oauth-server/commit/e9b08ae)), closes [#544](https://github.com/mozilla/fxa-oauth-server/issues/544)
- **node:** upgrade to node 6 ([57c61ab](https://github.com/mozilla/fxa-oauth-server/commit/57c61ab))
- **oauth:** add methods to support oauth client management (#405) r=seanmonstar ([2748510](https://github.com/mozilla/fxa-oauth-server/commit/2748510)), closes [#405](https://github.com/mozilla/fxa-oauth-server/issues/405)
- **oauth:** make server compatible with AppAuth (#534) r=@rfk ([ff9e422](https://github.com/mozilla/fxa-oauth-server/commit/ff9e422)), closes [#534](https://github.com/mozilla/fxa-oauth-server/issues/534)
- **oauth:** Track last time refreshToken was used (#412) r=vladikoff,seanmonstar ([25c455a](https://github.com/mozilla/fxa-oauth-server/commit/25c455a)), closes [#412](https://github.com/mozilla/fxa-oauth-server/issues/412) [#275](https://github.com/mozilla/fxa-oauth-server/issues/275)
- **openid:** add initial OpenID Connect support ([93f8758](https://github.com/mozilla/fxa-oauth-server/commit/93f8758)), closes [#362](https://github.com/mozilla/fxa-oauth-server/issues/362)
- **openid:** add profileChangedAt to claims (#607), r=@rfk ([f6e93eb](https://github.com/mozilla/fxa-oauth-server/commit/f6e93eb)), closes [#607](https://github.com/mozilla/fxa-oauth-server/issues/607)
- **openid:** Add support for OIDC `login_hint` query param. ([200ce43](https://github.com/mozilla/fxa-oauth-server/commit/200ce43))
- **openid:** add the openid connect `at_hash` value (#598), r=@rfk ([d08310e](https://github.com/mozilla/fxa-oauth-server/commit/d08310e)), closes [#598](https://github.com/mozilla/fxa-oauth-server/issues/598)
- **openid:** Allow untrusted reliers to request `openid` scope. (#516), r=@vbudhram ([f764dc8](https://github.com/mozilla/fxa-oauth-server/commit/f764dc8)), closes [#516](https://github.com/mozilla/fxa-oauth-server/issues/516)
- **pkce:** add ability for PKCE clients to use refresh_tokens (#476) r=seanmonstar ([7b401eb](https://github.com/mozilla/fxa-oauth-server/commit/7b401eb)), closes [#476](https://github.com/mozilla/fxa-oauth-server/issues/476) [#472](https://github.com/mozilla/fxa-oauth-server/issues/472)
- **pkce:** add PKCE support to the oauth server (#466) r=seanmonstar ([ed59c0e](https://github.com/mozilla/fxa-oauth-server/commit/ed59c0e)), closes [#466](https://github.com/mozilla/fxa-oauth-server/issues/466)
- **refresh_tokens:** add refresh_tokens to /token endpoint ([16e787f](https://github.com/mozilla/fxa-oauth-server/commit/16e787f)), closes [#209](https://github.com/mozilla/fxa-oauth-server/issues/209)
- **scopes:** add key-data and scope support (#487) r=rfk ([f3fcae5](https://github.com/mozilla/fxa-oauth-server/commit/f3fcae5)), closes [#487](https://github.com/mozilla/fxa-oauth-server/issues/487) [#483](https://github.com/mozilla/fxa-oauth-server/issues/483)
- **scopes:** allow https:// scopes (#490); r=rfk ([f892bcb](https://github.com/mozilla/fxa-oauth-server/commit/f892bcb)), closes [#490](https://github.com/mozilla/fxa-oauth-server/issues/490) [#489](https://github.com/mozilla/fxa-oauth-server/issues/489)
- **scripts:** Add script to generate an oauth client ([f21f657](https://github.com/mozilla/fxa-oauth-server/commit/f21f657))
- **server:** set HSTS header for 180 days ([d43accb](https://github.com/mozilla/fxa-oauth-server/commit/d43accb))
- **server:** update to Hapi 17 ([0ebfebe](https://github.com/mozilla/fxa-oauth-server/commit/0ebfebe))
- **shared:** add new locales ([d6e88df](https://github.com/mozilla/fxa-oauth-server/commit/d6e88df))
- **sync:** add local test client for sync (#549) ([61ed2e7](https://github.com/mozilla/fxa-oauth-server/commit/61ed2e7)), closes [#549](https://github.com/mozilla/fxa-oauth-server/issues/549)
- **sync:** add oldsync scope (#550) r=@rfk ([f2e7bb4](https://github.com/mozilla/fxa-oauth-server/commit/f2e7bb4)), closes [#550](https://github.com/mozilla/fxa-oauth-server/issues/550)
- **token:** reject expired tokens ([4f519ca](https://github.com/mozilla/fxa-oauth-server/commit/4f519ca)), closes [#365](https://github.com/mozilla/fxa-oauth-server/issues/365)
- **tokens:** add support for password change and reset event (#485) r=rfk ([f5873f9](https://github.com/mozilla/fxa-oauth-server/commit/f5873f9)), closes [#485](https://github.com/mozilla/fxa-oauth-server/issues/485) [#481](https://github.com/mozilla/fxa-oauth-server/issues/481)
- **tokens:** allow using JWT grants from Service Clients ([55f88a9](https://github.com/mozilla/fxa-oauth-server/commit/55f88a9)), closes [#328](https://github.com/mozilla/fxa-oauth-server/issues/328)
- **tokens:** allow using JWT grants from Service Clients ([0a0e303](https://github.com/mozilla/fxa-oauth-server/commit/0a0e303)), closes [#328](https://github.com/mozilla/fxa-oauth-server/issues/328)
- **untrusted-clients:** restrict scopes that untrusted clients can request ([8fd228a](https://github.com/mozilla/fxa-oauth-server/commit/8fd228a)), closes [#243](https://github.com/mozilla/fxa-oauth-server/issues/243)
- **verify:** add opt out parameter to verify endpoint ([e4c54ff](https://github.com/mozilla/fxa-oauth-server/commit/e4c54ff)), closes [#358](https://github.com/mozilla/fxa-oauth-server/issues/358)
- **verify:** added 'client' to /verify response ([4c57551](https://github.com/mozilla/fxa-oauth-server/commit/4c57551)), closes [#149](https://github.com/mozilla/fxa-oauth-server/issues/149)

### JsonFormatter

- outputs JSON in same format as fxa-auth-server ([c89ca92](https://github.com/mozilla/fxa-oauth-server/commit/c89ca92))

### Refactor

- **client:** scope added in memory and sql (#445) r=vladikoff ([4efc383](https://github.com/mozilla/fxa-oauth-server/commit/4efc383)), closes [#445](https://github.com/mozilla/fxa-oauth-server/issues/445) [#431](https://github.com/mozilla/fxa-oauth-server/issues/431)
- **clients:** remove terms and privacy uris ([5c1e0be](https://github.com/mozilla/fxa-oauth-server/commit/5c1e0be)), closes [#406](https://github.com/mozilla/fxa-oauth-server/issues/406)
- **config:** Use human-readable duration values in config ([20aa8fa](https://github.com/mozilla/fxa-oauth-server/commit/20aa8fa))
- **db:** add hashedSecret column to clients ([9ceaf1f](https://github.com/mozilla/fxa-oauth-server/commit/9ceaf1f)), closes [#155](https://github.com/mozilla/fxa-oauth-server/issues/155)
- **db:** clients.secret to clients.hashedSecret, remove clients.whitelisted ([155d2ce](https://github.com/mozilla/fxa-oauth-server/commit/155d2ce)), closes [#155](https://github.com/mozilla/fxa-oauth-server/issues/155) [#267](https://github.com/mozilla/fxa-oauth-server/issues/267)
- **email:** Fixes #352 Remove ability to fetch email address (#543) r=@shane-tomlinson ([068bd4b](https://github.com/mozilla/fxa-oauth-server/commit/068bd4b)), closes [#352](https://github.com/mozilla/fxa-oauth-server/issues/352) [#543](https://github.com/mozilla/fxa-oauth-server/issues/543)
- **keys:** rename keyMaterial, timestamp to keyRotationSecret, k… (#500) r=@rfk ([48ec2a3](https://github.com/mozilla/fxa-oauth-server/commit/48ec2a3)), closes [#500](https://github.com/mozilla/fxa-oauth-server/issues/500)
- **lint:** remove jscs, update eslint rules (#477), r=@vbudhram ([8bc148a](https://github.com/mozilla/fxa-oauth-server/commit/8bc148a)), closes [#477](https://github.com/mozilla/fxa-oauth-server/issues/477)

### Reverts

- **keys:** Check lastAuthAt freshness when fetching key data ([5d772f6](https://github.com/mozilla/fxa-oauth-server/commit/5d772f6))
- **service-tokens): Revert "docs(service-clients:** Document Service Clients, JKUs, and JWTs" ([6be9ac2](https://github.com/mozilla/fxa-oauth-server/commit/6be9ac2))
- **service-tokens): Revert "feat(tokens:** allow using JWT grants from Service Clients" ([d3cc78a](https://github.com/mozilla/fxa-oauth-server/commit/d3cc78a))
- **tokens:** dont reject expired tokens, again ([e8b563e](https://github.com/mozilla/fxa-oauth-server/commit/e8b563e))

### test

- **api:** rename assertRequestParam to assertInvalidRequestParam ([3f00eb3](https://github.com/mozilla/fxa-oauth-server/commit/3f00eb3)), closes [#280](https://github.com/mozilla/fxa-oauth-server/issues/280)
- **db:** fixing db.removeUser tests for mysql ([94f96bf](https://github.com/mozilla/fxa-oauth-server/commit/94f96bf))

### BREAKING CHANGES

- [object Object]
- [object Object]
- [object Object]

<a name="1.123.2"></a>

## [1.123.2](https://github.com/mozilla/fxa-oauth-server/compare/v1.123.1...v1.123.2) (2018-10-30)

### Bug Fixes

- **db:** Restore foreign key constraints on core tables. ([2bd0845](https://github.com/mozilla/fxa-oauth-server/commit/2bd0845))

<a name="1.123.1"></a>

## [1.123.1](https://github.com/mozilla/fxa-oauth-server/compare/v1.123.0...v1.123.1) (2018-10-26)

### Bug Fixes

- **profile:** remove the `profileChangedAt` column on tokens table ([5e87bce](https://github.com/mozilla/fxa-oauth-server/commit/5e87bce))

<a name="1.123.0"></a>

# [1.123.0](https://github.com/mozilla/fxa-oauth-server/compare/v1.122.0...v1.123.0) (2018-10-16)

### Bug Fixes

- **db:** Drop foreign key constraints. ([7ee117c](https://github.com/mozilla/fxa-oauth-server/commit/7ee117c))
- **db:** Fix case-consistency of SQL query from #612 ([9e55714](https://github.com/mozilla/fxa-oauth-server/commit/9e55714)), closes [#612](https://github.com/mozilla/fxa-oauth-server/issues/612)

<a name="1.122.0"></a>

# [1.122.0](https://github.com/mozilla/fxa-oauth-server/compare/v1.120.0...v1.122.0) (2018-10-02)

### Bug Fixes

- **ci:** remove nsp (#602) ([64ade86](https://github.com/mozilla/fxa-oauth-server/commit/64ade86)), closes [#602](https://github.com/mozilla/fxa-oauth-server/issues/602) [#596](https://github.com/mozilla/fxa-oauth-server/issues/596) [#597](https://github.com/mozilla/fxa-oauth-server/issues/597)
- **key-data:** Correctly handle non-existent scopes when finding key data. ([34d9493](https://github.com/mozilla/fxa-oauth-server/commit/34d9493))

### Features

- **openid:** add profileChangedAt to claims (#607), r=@rfk ([f6e93eb](https://github.com/mozilla/fxa-oauth-server/commit/f6e93eb)), closes [#607](https://github.com/mozilla/fxa-oauth-server/issues/607)

<a name="1.121.0"></a>

# [1.121.0](https://github.com/mozilla/fxa-oauth-server/compare/v1.120.0...v1.121.0) (2018-09-18)

### Bug Fixes

- **ci:** remove nsp (#602) ([64ade86](https://github.com/mozilla/fxa-oauth-server/commit/64ade86)), closes [#602](https://github.com/mozilla/fxa-oauth-server/issues/602) [#596](https://github.com/mozilla/fxa-oauth-server/issues/596) [#597](https://github.com/mozilla/fxa-oauth-server/issues/597)
- **key-data:** Correctly handle non-existent scopes when finding key data. ([34d9493](https://github.com/mozilla/fxa-oauth-server/commit/34d9493))

<a name="1.120.0"></a>

# [1.120.0](https://github.com/mozilla/fxa-oauth-server/compare/v1.117.0...v1.120.0) (2018-09-06)

### Bug Fixes

- **authorization:** Correctly handle non-existing URL scopes during authorization. (#594) r=@vladiko ([21654a3](https://github.com/mozilla/fxa-oauth-server/commit/21654a3)), closes [#594](https://github.com/mozilla/fxa-oauth-server/issues/594) [#593](https://github.com/mozilla/fxa-oauth-server/issues/593)
- **ci:** Run MySQL tests in Circle (#586) r=@vbudhram ([4b1c4e4](https://github.com/mozilla/fxa-oauth-server/commit/4b1c4e4)), closes [#586](https://github.com/mozilla/fxa-oauth-server/issues/586) [#581](https://github.com/mozilla/fxa-oauth-server/issues/581)
- **scopes:** Document scope-handling rules, use shared code to enforce them. (#551); r=vbudhr ([237886d](https://github.com/mozilla/fxa-oauth-server/commit/237886d)), closes [#551](https://github.com/mozilla/fxa-oauth-server/issues/551)

### Features

- **openid:** add the openid connect `at_hash` value (#598), r=@rfk ([d08310e](https://github.com/mozilla/fxa-oauth-server/commit/d08310e)), closes [#598](https://github.com/mozilla/fxa-oauth-server/issues/598)

<a name="1.119.0"></a>

# [1.119.0](https://github.com/mozilla/fxa-oauth-server/compare/v1.117.0...v1.119.0) (2018-08-21)

### Bug Fixes

- **authorization:** Correctly handle non-existing URL scopes during authorization. (#594) r=@vladiko ([21654a3](https://github.com/mozilla/fxa-oauth-server/commit/21654a3)), closes [#594](https://github.com/mozilla/fxa-oauth-server/issues/594) [#593](https://github.com/mozilla/fxa-oauth-server/issues/593)
- **ci:** Run MySQL tests in Circle (#586) r=@vbudhram ([4b1c4e4](https://github.com/mozilla/fxa-oauth-server/commit/4b1c4e4)), closes [#586](https://github.com/mozilla/fxa-oauth-server/issues/586) [#581](https://github.com/mozilla/fxa-oauth-server/issues/581)
- **scopes:** Document scope-handling rules, use shared code to enforce them. (#551); r=vbudhr ([237886d](https://github.com/mozilla/fxa-oauth-server/commit/237886d)), closes [#551](https://github.com/mozilla/fxa-oauth-server/issues/551)

<a name="1.117.0"></a>

# [1.117.0](https://github.com/mozilla/fxa-oauth-server/compare/v1.115.2...v1.117.0) (2018-07-24)

### Bug Fixes

- **clients:** match the notes client with fxa-dev and other envs (#585); r=rfk ([e24a582](https://github.com/mozilla/fxa-oauth-server/commit/e24a582)), closes [#585](https://github.com/mozilla/fxa-oauth-server/issues/585)
- **config:** For dev, the openid issuer is http://127.0.0.1:3030 (#583) r=@vladikoff ([38e1d73](https://github.com/mozilla/fxa-oauth-server/commit/38e1d73)), closes [#583](https://github.com/mozilla/fxa-oauth-server/issues/583) [mozilla/fxa-content-server#6362](https://github.com/mozilla/fxa-content-server/issues/6362)
- **doc:** Putting a little emphasis on email first (#584) r=@shane-tomlinson ([8ad17c1](https://github.com/mozilla/fxa-oauth-server/commit/8ad17c1)), closes [#584](https://github.com/mozilla/fxa-oauth-server/issues/584)
- **purge:** add purgeExpiredTokensById to select, then delete by primary key (#580); r=rfk ([adfff65](https://github.com/mozilla/fxa-oauth-server/commit/adfff65)), closes [#580](https://github.com/mozilla/fxa-oauth-server/issues/580)

### Features

- **codes:** Delete authorization codes when revoking client access. (#578); r=philbooth ([b905b7c](https://github.com/mozilla/fxa-oauth-server/commit/b905b7c)), closes [#578](https://github.com/mozilla/fxa-oauth-server/issues/578)

<a name="1.116.0"></a>

# [1.116.0](https://github.com/mozilla/fxa-oauth-server/compare/v1.115.2...v1.116.0) (2018-07-11)

### Features

- **codes:** Delete authorization codes when revoking client access. (#578); r=philbooth ([b905b7c](https://github.com/mozilla/fxa-oauth-server/commit/b905b7c)), closes [#578](https://github.com/mozilla/fxa-oauth-server/issues/578)

<a name="1.115.2"></a>

## [1.115.2](https://github.com/mozilla/fxa-oauth-server/compare/v1.115.1...v1.115.2) (2018-07-04)

### Bug Fixes

- **mysql:** Correctly aggregate tokens by clientid. (#576) r=@vladikoff ([2c2cd22](https://github.com/mozilla/fxa-oauth-server/commit/2c2cd22)), closes [#576](https://github.com/mozilla/fxa-oauth-server/issues/576)

<a name="1.115.1"></a>

## [1.115.1](https://github.com/mozilla/fxa-oauth-server/compare/v1.115.0...v1.115.1) (2018-06-27)

### Bug Fixes

- **tokens:** Avoid quadratic behaviour when listing active clients. (#9); r=vladikoff ([15c3065](https://github.com/mozilla/fxa-oauth-server/commit/15c3065)), closes [#9](https://github.com/mozilla/fxa-oauth-server/issues/9)

<a name="1.115.0"></a>

# [1.115.0](https://github.com/mozilla/fxa-oauth-server/compare/v1.113.1...v1.115.0) (2018-06-25)

<a name="1.114.0"></a>

# [1.114.0](https://github.com/mozilla/fxa-oauth-server/compare/v1.113.1...v1.114.0) (2018-06-13)

### Bug Fixes

- **docker:** base image node:8-alpine and upgrade to npm6 (#567) r=@jbuck,@vladikoff ([d4060be](https://github.com/mozilla/fxa-oauth-server/commit/d4060be)), closes [#567](https://github.com/mozilla/fxa-oauth-server/issues/567)

<a name="1.113.1"></a>

## [1.113.1](https://github.com/mozilla/fxa-oauth-server/compare/v1.113.0...v1.113.1) (2018-06-09)

### Bug Fixes

- **pkce:** Don't require PKCE in the direct grant flow. (#566) r=@vladikoff ([d70fe6d](https://github.com/mozilla/fxa-oauth-server/commit/d70fe6d)), closes [#566](https://github.com/mozilla/fxa-oauth-server/issues/566) [#559](https://github.com/mozilla/fxa-oauth-server/issues/559)

### Features

- **authorization:** Require tokenVerified=true for key-bearing scopes. (#561) r=@vladikoff ([f9ad63e](https://github.com/mozilla/fxa-oauth-server/commit/f9ad63e)), closes [#561](https://github.com/mozilla/fxa-oauth-server/issues/561) [/github.com/mozilla-services/tokenserver/blob/master/tokenserver/views.py#L140](https://github.com//github.com/mozilla-services/tokenserver/blob/master/tokenserver/views.py/issues/L140)

<a name="1.113.0"></a>

# [1.113.0](https://github.com/mozilla/fxa-oauth-server/compare/v1.112.1...v1.113.0) (2018-05-30)

<a name="1.112.1"></a>

## [1.112.1](https://github.com/mozilla/fxa-oauth-server/compare/v1.112.0...v1.112.1) (2018-05-17)

### Bug Fixes

- **changelog:** update to latest changelog version (#556) ([bc9256e](https://github.com/mozilla/fxa-oauth-server/commit/bc9256e)), closes [#556](https://github.com/mozilla/fxa-oauth-server/issues/556)

### Features

- **ci:** move to CircleCI 2 (#554) r=@jbuck ([97e4f62](https://github.com/mozilla/fxa-oauth-server/commit/97e4f62)), closes [#554](https://github.com/mozilla/fxa-oauth-server/issues/554)

<a name"1.112.0"></a>

## 1.112.0 (2018-05-16)

<a name"1.111.0"></a>

## 1.111.0 (2018-05-02)

#### Bug Fixes

- **changelog:** automated changelog is borked (#542) r=@vladikoff ([d7437211](https://github.com/mozilla/fxa-oauth-server/commit/d7437211), closes [#524](https://github.com/mozilla/fxa-oauth-server/issues/524))
- **oauth:** another notes dev client (#546) ([9d5ec8e5](https://github.com/mozilla/fxa-oauth-server/commit/9d5ec8e5))
- **validation:** Allow redirect uris with existing query params. (#548); r=philbooth ([b93e6a16](https://github.com/mozilla/fxa-oauth-server/commit/b93e6a16))

#### Features

- **node:** update to node 8 (#544) r=@jrgm ([e9b08ae0](https://github.com/mozilla/fxa-oauth-server/commit/e9b08ae0))
- **sync:**
  - add oldsync scope (#550) r=@rfk ([f2e7bb47](https://github.com/mozilla/fxa-oauth-server/commit/f2e7bb47))
  - add local test client for sync (#549) ([61ed2e73](https://github.com/mozilla/fxa-oauth-server/commit/61ed2e73))

<a name"1.110.0"></a>

## 1.110.0 (2018-04-18)

#### Bug Fixes

- **tests:** mock outstanding error logs in test suite r=@vladikoff ([6a5d3ceb](https://github.com/mozilla/fxa-oauth-server/commit/6a5d3ceb), closes [#334](https://github.com/mozilla/fxa-oauth-server/issues/334))

#### Features

- **authorization:** Directly return `code` in authorization response. (#541); r=philbooth ([7ad1e56f](https://github.com/mozilla/fxa-oauth-server/commit/7ad1e56f))
- **email-first:** Add support for the email-first flow. (#540); r=philbooth,rfk ([cb11145e](https://github.com/mozilla/fxa-oauth-server/commit/cb11145e), closes [#539](https://github.com/mozilla/fxa-oauth-server/issues/539))

<a name"1.109.0"></a>

## 1.109.0 (2018-04-03)

### Bug Fixes

- **buffer:** #527 Migrate deprecated buffer calls (#528) r=@vladikoff ([fd85207](https://github.com/mozilla/fxa-oauth-server/commit/fd85207)), closes [#527](https://github.com/mozilla/fxa-oauth-server/issues/527)
- **node:** Use Node.js v6.14.0 (#537) ([f32a3d7](https://github.com/mozilla/fxa-oauth-server/commit/f32a3d7))
- **route:** make email false by default (#533) r=@rfk ([aa68fb9](https://github.com/mozilla/fxa-oauth-server/commit/aa68fb9))
- **scripts:** Fix varname typo in test runner script. (#535) ([02804a8](https://github.com/mozilla/fxa-oauth-server/commit/02804a8)), closes [(#535](https://github.com/(/issues/535)
- **tests:** mock outstanding error logs in test suite r=@vladikoff ([6a5d3ce](https://github.com/mozilla/fxa-oauth-server/commit/6a5d3ce))

### chore

- **config:** add Notes trailing slash to redirect in dev.json (#536) ([e8bf2e5](https://github.com/mozilla/fxa-oauth-server/commit/e8bf2e5))

### Features

- **amr:** Report `amr` and `acr` claims in the id_token. (#530); r=vbudhram ([8181f7f](https://github.com/mozilla/fxa-oauth-server/commit/8181f7f))
- **email-first:** Add support for the email-first flow. (#540); r=philbooth,rfk ([cb11145](https://github.com/mozilla/fxa-oauth-server/commit/cb11145)), closes [#539](https://github.com/mozilla/fxa-oauth-server/issues/539)
- **oauth:** make server compatible with AppAuth (#534) r=@rfk ([ff9e422](https://github.com/mozilla/fxa-oauth-server/commit/ff9e422))

<a name"1.108.0"></a>

## 1.108.0 (2018-03-21)

#### Bug Fixes

- **buffer:** #527 Migrate deprecated buffer calls (#528) r=@vladikoff ([fd852072](https://github.com/mozilla/fxa-oauth-server/commit/fd852072), closes [#527](https://github.com/mozilla/fxa-oauth-server/issues/527))

#### Features

- **amr:** Report `amr` and `acr` claims in the id_token. (#530); r=vbudhram ([8181f7f6](https://github.com/mozilla/fxa-oauth-server/commit/8181f7f6))

<a name"1.107.0"></a>

## 1.107.0 (2018-03-08)

<a name"1.106.0"></a>

## 1.106.0 (2018-02-21)

<a name"1.105.0"></a>

## 1.105.0 (2018-02-07)

#### Features

- **openid:** Allow untrusted reliers to request `openid` scope. (#516), r=@vbudhram ([f764dc82](https://github.com/mozilla/fxa-oauth-server/commit/f764dc82))

<a name"1.104.0"></a>

## 1.104.0 (2018-01-24)

#### Bug Fixes

- **config:**
  - reverting 'mark config sentryDsn and mysql password sensitive (#511) r=@vladikof ([41bd7c00](https://github.com/mozilla/fxa-oauth-server/commit/41bd7c00))
  - mark config sentryDsn and mysql password sensitive (#511) r=@vladikoff ([d98fbcde](https://github.com/mozilla/fxa-oauth-server/commit/d98fbcde))

#### Features

- **auth:** Accept client credentials in the Authorization header. (#514); r=philbooth ([1c508078](https://github.com/mozilla/fxa-oauth-server/commit/1c508078))
- **keys:** Check lastAuthAt freshness when fetching key data. (#506) r=@vladikoff ([e0de2f3b](https://github.com/mozilla/fxa-oauth-server/commit/e0de2f3b))

<a name"1.103.0"></a>

## 1.103.0 (2018-01-08)

#### Bug Fixes

- **node:** use node 6.12.3 (#510) r=@vladikoff ([adc1fc02](https://github.com/mozilla/fxa-oauth-server/commit/adc1fc02))

<a name"1.100.2"></a>

### 1.100.2 (2017-12-04)

#### Bug Fixes

- **tokens:** invalidate refresh tokens on client-token DELETE action (#508) ([df0ca82a](https://github.com/mozilla/fxa-oauth-server/commit/df0ca82a), closes [#507](https://github.com/mozilla/fxa-oauth-server/issues/507))

<a name"1.100.1"></a>

### 1.100.1 (2017-11-27)

#### Bug Fixes

- **keys:** replace scope key TLD (#505) r=@rfk ([a5e6d8f4](https://github.com/mozilla/fxa-oauth-server/commit/a5e6d8f4))

#### Features

- **keys:** Check lastAuthAt freshness when fetching key data. (#502) r=@vladikoff ([855adee4](https://github.com/mozilla/fxa-oauth-server/commit/855adee4))

<a name"1.100.0"></a>

## 1.100.0 (2017-11-15)

#### Bug Fixes

- **node:** use node 6.12.0 (#501) r=@vladikoff ([167c9734](https://github.com/mozilla/fxa-oauth-server/commit/167c9734))

#### Features

- **logs:** add sentry support (#499), r=@vbudhram ([ef34859b](https://github.com/mozilla/fxa-oauth-server/commit/ef34859b))

<a name"1.99.0"></a>

## 1.99.0 (2017-11-03)

#### Bug Fixes

- **pkce:** match pkce implementation to specifications (#498) r=rfk ([cf1c836b](https://github.com/mozilla/fxa-oauth-server/commit/cf1c836b), closes [#495](https://github.com/mozilla/fxa-oauth-server/issues/495))
- **travis:** run tests with 6 and 8 (#497) r=vladikoff ([a49b2727](https://github.com/mozilla/fxa-oauth-server/commit/a49b2727))

<a name"1.98.1"></a>

### 1.98.1 (2017-10-26)

<a name"1.98.0"></a>

## 1.98.0 (2017-10-18)

<a name"1.97.0"></a>

## 1.97.0 (2017-10-03)

#### Bug Fixes

- **deps:** update newrelic and request r=@shane-tomlinson ([b6d6c93c](https://github.com/mozilla/fxa-oauth-server/commit/b6d6c93c))

#### Features

- **keys:**
  - add key-data docs, move client_id into payload (#491); r=rfk ([a9152c35](https://github.com/mozilla/fxa-oauth-server/commit/a9152c35))
  - add keys_jwe support (#486) r=rfk ([6a4efd1b](https://github.com/mozilla/fxa-oauth-server/commit/6a4efd1b), closes [#484](https://github.com/mozilla/fxa-oauth-server/issues/484))
- **scopes:**
  - allow https:// scopes (#490); r=rfk ([f892bcba](https://github.com/mozilla/fxa-oauth-server/commit/f892bcba), closes [#489](https://github.com/mozilla/fxa-oauth-server/issues/489))
  - add key-data and scope support (#487) r=rfk ([f3fcae5a](https://github.com/mozilla/fxa-oauth-server/commit/f3fcae5a), closes [#483](https://github.com/mozilla/fxa-oauth-server/issues/483))

<a name"1.96.0"></a>

## 1.96.0 (2017-09-19)

#### Features

- **tokens:** add support for password change and reset event (#485) r=rfk ([f5873f9d](https://github.com/mozilla/fxa-oauth-server/commit/f5873f9d), closes [#481](https://github.com/mozilla/fxa-oauth-server/issues/481))

<a name"1.95.1"></a>

### 1.95.1 (2017-09-14)

<a name"1.95.0"></a>

## 1.95.0 (2017-09-06)

<a name"1.94.0"></a>

## 1.94.0 (2017-08-23)

#### Bug Fixes

- **newrelic:** update to v2.1.0 ([87a3aeee](https://github.com/mozilla/fxa-oauth-server/commit/87a3aeee))

#### Features

- **pkce:** add ability for PKCE clients to use refresh_tokens (#476) r=seanmonstar ([7b401ebf](https://github.com/mozilla/fxa-oauth-server/commit/7b401ebf), closes [#472](https://github.com/mozilla/fxa-oauth-server/issues/472))

<a name"1.92.0"></a>

## 1.92.0 (2017-07-26)

<a name"1.91.0"></a>

## 1.91.0 (2017-07-12)

#### Bug Fixes

- **nodejs:** update to 6.11.1 for security fixes ([a0520c0c](https://github.com/mozilla/fxa-oauth-server/commit/a0520c0c))

#### Features

- **node:** upgrade to node 6 ([57c61ab1](https://github.com/mozilla/fxa-oauth-server/commit/57c61ab1))

<a name"1.90.0"></a>

## 1.90.0 (2017-06-28)

#### Features

- **pkce:** add PKCE support to the oauth server (#466) r=seanmonstar ([ed59c0e6](https://github.com/mozilla/fxa-oauth-server/commit/ed59c0e6))

<a name"1.89.0"></a>

## 1.89.0 (2017-06-14)

#### Bug Fixes

- **tests:**
  - double before hook timeout for tests on slow machines ([23334169](https://github.com/mozilla/fxa-oauth-server/commit/23334169))
  - speed up and upgrade the test runner (#467) r=seanmonstar ([2e76c9e4](https://github.com/mozilla/fxa-oauth-server/commit/2e76c9e4))

#### Features

- **docker:** support feature branches (#464) r=jrgm ([f94fd61a](https://github.com/mozilla/fxa-oauth-server/commit/f94fd61a))

<a name"1.86.0"></a>

## 1.86.0 (2017-05-03)

<a name"1.85.0"></a>

## 1.85.0 (2017-04-19)

#### Bug Fixes

- **config:**
  - expose clients config as OAUTH_CLIENTS ([04ebf6fd](https://github.com/mozilla/fxa-oauth-server/commit/04ebf6fd))
  - Add environment config options ([14a9b4a6](https://github.com/mozilla/fxa-oauth-server/commit/14a9b4a6))
- **patcher:** Fix patcher with no pre-loaded clients ([dcc47b98](https://github.com/mozilla/fxa-oauth-server/commit/dcc47b98))

#### Features

- **lb:** Add `__lbheartbeat__` endpoint (#458), r=@jbuck ([c387907c](https://github.com/mozilla/fxa-oauth-server/commit/c387907c))

<a name"1.84.1"></a>

### 1.84.1 (2017-04-05)

<a name"1.84.0"></a>

## 1.84.0 (2017-04-04)

#### Bug Fixes

- **config:** expose more environment variables for config ([7a1dd19e](https://github.com/mozilla/fxa-oauth-server/commit/7a1dd19e))
- **test:** fix unhandled rejection error with memory db impl (#454) r=vladikoff ([c870eba4](https://github.com/mozilla/fxa-oauth-server/commit/c870eba4))

#### Features

- **scripts:** Add script to generate an oauth client ([f21f657a](https://github.com/mozilla/fxa-oauth-server/commit/f21f657a))

<a name"1.83.0"></a>

## 1.83.0 (2017-03-21)

#### Bug Fixes

- **tests:** check insert of utf8mb4 ([4e6a77a8](https://github.com/mozilla/fxa-oauth-server/commit/4e6a77a8))
- **version:** use cwd and env var to get version (#452) r=vladikoff ([a3b1aa28](https://github.com/mozilla/fxa-oauth-server/commit/a3b1aa28))

#### Features

- **keys:** Add created-at timestamp to our public keys. (#453); r=seanmonstar,vladikoff ([511d9a63](https://github.com/mozilla/fxa-oauth-server/commit/511d9a63))

<a name"1.81.0"></a>

## 1.81.0 (2017-02-24)

#### Bug Fixes

- **api:** clean up response of client-tokens delete endpoint (#3) (#449); r=rfk ([9c632731](https://github.com/mozilla/fxa-oauth-server/commit/9c632731))
- **db:** ensure strict mode (#448) r=rfk,seanmonstar ([8d309c5b](https://github.com/mozilla/fxa-oauth-server/commit/8d309c5b), closes [#446](https://github.com/mozilla/fxa-oauth-server/issues/446))
- **logs:** add scope and client_id logs to verify route (#447) r=seanmonstar ([33eb39ec](https://github.com/mozilla/fxa-oauth-server/commit/33eb39ec), closes [#444](https://github.com/mozilla/fxa-oauth-server/issues/444))

<a name"0.80.0"></a>

## 0.80.0 (2017-02-07)

#### Features

- **client:** scope is now returned in client-tokens (#445) r=vladikoff ([4efc383effc80](https://github.com/mozilla/fxa-oauth-server/commit/4efc383effc80))

<a name"0.79.0"></a>

## 0.79.0 (2017-01-25)

#### Bug Fixes

- **headers:**
  - make "cache-control" value configurable ([5ba82ea6](https://github.com/mozilla/fxa-oauth-server/commit/5ba82ea6))
  - add cache-control headers to api endpoints; extend tests ([5a81ef94](https://github.com/mozilla/fxa-oauth-server/commit/5a81ef94))
- **keys:** Generate unique 'kid' field when regenerating JWK keys ([5b9acae3](https://github.com/mozilla/fxa-oauth-server/commit/5b9acae3))
- **scripts:** Use pure JS module to generate RSA keypairs (#439) r=vladikoff ([3380e1cc](https://github.com/mozilla/fxa-oauth-server/commit/3380e1cc))

#### Features

- **docker:** Shrink Docker image size (#438) r=vladikoff ([13d13b9e](https://github.com/mozilla/fxa-oauth-server/commit/13d13b9e))

<a name"0.78.0"></a>

## 0.78.0 (2017-01-11)

#### Bug Fixes

- **security:**
  - set x-frame-options deny ([21ea05dd](https://github.com/mozilla/fxa-oauth-server/commit/21ea05dd))
  - enable X-XSS-Protection 1; mode=block ([52ca1e56](https://github.com/mozilla/fxa-oauth-server/commit/52ca1e56))
  - enable x-content-type-options nosniff ([5ea5001c](https://github.com/mozilla/fxa-oauth-server/commit/5ea5001c))

<a name"0.77.0"></a>

## 0.77.0 (2017-01-04)

#### Bug Fixes

- **codes:** Remove authorization codes after use. ([e0f8961d](https://github.com/mozilla/fxa-oauth-server/commit/e0f8961d))
- **memorydb:** token createdAt used instead of client createdAt (#436) r=vladikoff,seanmonstar ([02dec664](https://github.com/mozilla/fxa-oauth-server/commit/02dec664), closes [#421](https://github.com/mozilla/fxa-oauth-server/issues/421))
- **tokens:** Begin expiring access tokens beyond a configurable epoch. ([b3463264](https://github.com/mozilla/fxa-oauth-server/commit/b3463264))

<a name"0.76.0"></a>

## 0.76.0 (2016-12-13)

#### Bug Fixes

- **deps:** update to hapi 16, add srinkwrap scripts, update other prod deps ([c102046e](https://github.com/mozilla/fxa-oauth-server/commit/c102046e))

#### Features

- **authorization:** add uri validation on the authorization endpoint (#428) r=jrgm,seanmonstar ([fcc0b52a](https://github.com/mozilla/fxa-oauth-server/commit/fcc0b52a), closes [#387](https://github.com/mozilla/fxa-oauth-server/issues/387), [#388](https://github.com/mozilla/fxa-oauth-server/issues/388))

<a name"0.74.0"></a>

## 0.75.0 (2016-11-30)

#### Bug Fixes

- **tokens:** ttl parameter must be positive (#429) r=vladikoff ([1764d73a](https://github.com/mozilla/fxa-oauth-server/commit/1764d73a))

#### Features

- **hpkp:** Add the hpkp headers to all requests (#416) r=vladikoff ([6b8a8c86](https://github.com/mozilla/fxa-oauth-server/commit/6b8a8c86))

<a name"0.73.0"></a>

## 0.73.0 (2016-11-02)

#### Bug Fixes

- **deps:** update to hapi 14 and joi 9 ([9bc87c01](https://github.com/mozilla/fxa-oauth-server/commit/9bc87c01), closes [#424](https://github.com/mozilla/fxa-oauth-server/issues/424))
- **travis:** test on node4/node6 with default npm & g++-4.8 ([b4e1dd8e](https://github.com/mozilla/fxa-oauth-server/commit/b4e1dd8e))

<a name"0.71.0"></a>

## 0.71.0 (2016-10-05)

#### Features

- **docker:** Add CloudOps Dockerfile & CircleCI build instructions ([a80b4b47](https://github.com/mozilla/fxa-oauth-server/commit/a80b4b47))
- **shared:** add new locales ([d6e88df0](https://github.com/mozilla/fxa-oauth-server/commit/d6e88df0))

<a name"0.70.0"></a>

## 0.70.0 (2016-09-21)

#### Bug Fixes

- **purge-expired:**
  - accept a list of pocket-id's ([1c843a93](https://github.com/mozilla/fxa-oauth-server/commit/1c843a93))
  - Promise.delay takes milliseconds; allow subsecond delay ([10c61034](https://github.com/mozilla/fxa-oauth-server/commit/10c61034))
  - moar logging ([80c360e7](https://github.com/mozilla/fxa-oauth-server/commit/80c360e7))
  - set db.autoUpdateClients config to false ([bc66fc37](https://github.com/mozilla/fxa-oauth-server/commit/bc66fc37))
  - use db.getClient() to check for unknown clientId ([c33f1d9c](https://github.com/mozilla/fxa-oauth-server/commit/c33f1d9c))
  - log uncaughtException; minimum log level of info ([264271ef](https://github.com/mozilla/fxa-oauth-server/commit/264271ef))

<a name"0.69.0"></a>

## 0.69.0 (2016-09-08)

#### Bug Fixes

- **log:** add remoteAddressChain to summary (#417) ([568cfa64](https://github.com/mozilla/fxa-oauth-server/commit/568cfa64), closes [#415](https://github.com/mozilla/fxa-oauth-server/issues/415))

#### Features

- **oauth:**
  - add methods to support oauth client management (#405) r=seanmonstar ([27485107](https://github.com/mozilla/fxa-oauth-server/commit/27485107))
  - Track last time refreshToken was used (#412) r=vladikoff,seanmonstar ([25c455a6](https://github.com/mozilla/fxa-oauth-server/commit/25c455a6), closes [#275](https://github.com/mozilla/fxa-oauth-server/issues/275))

<a name"0.68.0"></a>

## 0.68.0 (2016-08-24)

#### Bug Fixes

- **log:** avoid crashing on bad payload (#411) r=rfk,jrgm ([19ebed51](https://github.com/mozilla/fxa-oauth-server/commit/19ebed51), closes [#410](https://github.com/mozilla/fxa-oauth-server/issues/410))
- **test:** encrypt refresh_token on db query (#414) r=seanmonstar,vladikoff ([7f52d46d](https://github.com/mozilla/fxa-oauth-server/commit/7f52d46d))

<a name"0.66.0"></a>

## 0.66.0 (2016-07-27)

#### Bug Fixes

- **deps:** update some dependencies ([09aa7b0e](https://github.com/mozilla/fxa-oauth-server/commit/09aa7b0e))
- **spelling:** minor spelling fix in tests (#403) r=vladikoff ([d4ff105b](https://github.com/mozilla/fxa-oauth-server/commit/d4ff105b))

<a name"0.65.0"></a>

## 0.65.0 (2016-07-13)

#### Bug Fixes

- **scopes:** Dont treat `foo:write` as a sub-scope of `foo`. ([b4b30c29](https://github.com/mozilla/fxa-oauth-server/commit/b4b30c29))
- **tokens:** Added scripts that purge expired access tokens. ([10bbb240](https://github.com/mozilla/fxa-oauth-server/commit/10bbb240))

<a name"0.64.0"></a>

## 0.64.0 (2016-07-02)

#### Bug Fixes

- **scopes:** Dont treat `foo:write` as a sub-scope of `foo`. ([fe2f1fef](https://github.com/mozilla/fxa-oauth-server/commit/fe2f1fef))

<a name"0.61.0"></a>

## 0.61.0 (2016-05-04)

- **travis:** drop node 0.12 support ([b4eba468](https://github.com/mozilla/fxa-oauth-server/commit/b4eba468))

<a name"0.59.0"></a>

## 0.59.0 (2016-03-30)

<a name"0.57.0"></a>

## 0.57.0 (2016-03-05)

#### Bug Fixes

- **db:** Fix an old db patch to apply cleanly in local dev. ([c7fa6336](https://github.com/mozilla/fxa-oauth-server/commit/c7fa6336))
- **dependencies:** switch back to main generate-rsa-keypair now that my fix to it was merged ([1c1268b0](https://github.com/mozilla/fxa-oauth-server/commit/1c1268b0))
- **shrinkwrap:** restore deleted npm-shrinkwrap.json ([63834811](https://github.com/mozilla/fxa-oauth-server/commit/63834811))
- **tests:**
  - More reliable generation of RSA keys for tests ([981d0b7c](https://github.com/mozilla/fxa-oauth-server/commit/981d0b7c))
  - Refactor use of process.exit() to be outside of code under test. ([47f4f176](https://github.com/mozilla/fxa-oauth-server/commit/47f4f176))
- **validation:** Restrict characters allowed in 'scope' parameter. ([7dd2a391](https://github.com/mozilla/fxa-oauth-server/commit/7dd2a391))

<a name"0.56.0"></a>

## 0.56.0 (2016-02-10)

#### Bug Fixes

- **openid:** Generate openid keys on npm postinstall to file ([5f15afaa](https://github.com/mozilla/fxa-oauth-server/commit/5f15afaa))

#### Features

- **clients:** Added initial support for using previous client secret ([4f9df20c](https://github.com/mozilla/fxa-oauth-server/commit/4f9df20c))
- **docker:** Additional Dockerfile for self-hosting ([83a8b6c1](https://github.com/mozilla/fxa-oauth-server/commit/83a8b6c1))

<a name"0.53.1"></a>

### 0.53.1 (2016-01-11)

<a name"0.53.0"></a>

## 0.53.0 (2016-01-04)

#### Bug Fixes

- **deps:** switch from URIjs to urijs ([ecdf31ed](https://github.com/mozilla/fxa-oauth-server/commit/ecdf31ed), closes [#347](https://github.com/mozilla/fxa-oauth-server/issues/347))
- **travis:** build on node 0.10, 0.12, 4, no allowed failures ([6684e8c8](https://github.com/mozilla/fxa-oauth-server/commit/6684e8c8))

#### Features

- **openid:**
  - Add support for OIDC `login_hint` query param. ([200ce433](https://github.com/mozilla/fxa-oauth-server/commit/200ce433))
  - add initial OpenID Connect support ([93f87582](https://github.com/mozilla/fxa-oauth-server/commit/93f87582), closes [#362](https://github.com/mozilla/fxa-oauth-server/issues/362))

<a name"0.51.0"></a>

## 0.51.0 (2015-12-02)

#### Bug Fixes

- **config:** option autoUpdateClients, will be disable in prod/stage ([802a0b22](https://github.com/mozilla/fxa-oauth-server/commit/802a0b22))

#### Features

- **token:** reject expired tokens ([4f519ca0](https://github.com/mozilla/fxa-oauth-server/commit/4f519ca0), closes [#365](https://github.com/mozilla/fxa-oauth-server/issues/365))

<a name"0.50.0"></a>

## 0.50.0 (2015-11-18)

#### Bug Fixes

- **config:** update config to use getProperties ([c2ed6ebd](https://github.com/mozilla/fxa-oauth-server/commit/c2ed6ebd), closes [#349](https://github.com/mozilla/fxa-oauth-server/issues/349))
- **db:** make schema.sql accuratley reflect latest patch state ([b17b0008](https://github.com/mozilla/fxa-oauth-server/commit/b17b0008))
- **docs:** add git guidelines link ([a00167ce](https://github.com/mozilla/fxa-oauth-server/commit/a00167ce))
- **travis:** remove broken validate shrinkwrap ([1729764f](https://github.com/mozilla/fxa-oauth-server/commit/1729764f))

#### Features

- **tokens:** allow using JWT grants from Service Clients ([55f88a9c](https://github.com/mozilla/fxa-oauth-server/commit/55f88a9c), closes [#328](https://github.com/mozilla/fxa-oauth-server/issues/328))
- **verify:** add opt out parameter to verify endpoint ([e4c54ff6](https://github.com/mozilla/fxa-oauth-server/commit/e4c54ff6), closes [#358](https://github.com/mozilla/fxa-oauth-server/issues/358))

<a name"0.48.1"></a>

### 0.48.1 (2015-10-28)

#### Bug Fixes

- **docs:** note that codes are single use ([6fe39f7b](https://github.com/mozilla/fxa-oauth-server/commit/6fe39f7b), closes [#214](https://github.com/mozilla/fxa-oauth-server/issues/214))

<a name"0.48.0"></a>

## 0.48.0 (2015-10-20)

#### Bug Fixes

- **config:** remove 00000... from hashedSecrets ([8dcfd560](https://github.com/mozilla/fxa-oauth-server/commit/8dcfd560), closes [#339](https://github.com/mozilla/fxa-oauth-server/issues/339))
- **dependencies:** move fxa-jwtool from dev-dependencies to dependencies ([79b0427a](https://github.com/mozilla/fxa-oauth-server/commit/79b0427a), closes [#345](https://github.com/mozilla/fxa-oauth-server/issues/345))

#### Features

- **tokens:** allow using JWT grants from Service Clients ([0a0e3034](https://github.com/mozilla/fxa-oauth-server/commit/0a0e3034), closes [#328](https://github.com/mozilla/fxa-oauth-server/issues/328))

<a name="0.47.0"></a>

## 0.47.0 (2015-10-07)

#### Bug Fixes

- **deps:** update to mozlog 2.0.2 ([29342a92](http://github.com/mozilla/fxa-oauth-server/commit/29342a92445baa4ea45cc3f93c6a62e24c6d03d7), closes [#337](http://github.com/mozilla/fxa-oauth-server/issues/337))

<a name="0.46.0"></a>

## 0.46.0 (2015-09-23)

#### Features

- **clients:** add notion of Service Clients in config ([8cfdffe8](http://github.com/mozilla/fxa-oauth-server/commit/8cfdffe8ba4e335e36949b6d3601b03ed0def2dd), closes [#327](http://github.com/mozilla/fxa-oauth-server/issues/327))

<a name="0.45.0"></a>

## 0.45.0 (2015-09-11)

#### Bug Fixes

- **token:** disable expiration error ([c9547a8b](http://github.com/mozilla/fxa-oauth-server/commit/c9547a8b541b23956676b182df22b83c8a786e61))
- **version:** use explicit path with git-config ([e0af8bcc](http://github.com/mozilla/fxa-oauth-server/commit/e0af8bccda69f478f286a86f4b11f6da485cc0f6))

#### Features

- **db:** remove clients.secret column ([0e39d1ee](http://github.com/mozilla/fxa-oauth-server/commit/0e39d1ee67818722d32f5ae0455ea56cf5d0cec1), closes [#323](http://github.com/mozilla/fxa-oauth-server/issues/323))

<a name="0.44.0"></a>

## 0.44.0 (2015-08-26)

#### Bug Fixes

- **authorization:** allow empty scope with implicit grant ([1d6ac8e5](http://github.com/mozilla/fxa-oauth-server/commit/1d6ac8e55d28683072f448e022c33154bb4d7397), closes [#315](http://github.com/mozilla/fxa-oauth-server/issues/315))
- **db:** don't change client database at startup; footgun ([8877f818](http://github.com/mozilla/fxa-oauth-server/commit/8877f818ec46a05a283e95e10fd8398756ad907c))

<a name="0.43.0"></a>

## 0.43.0 (2015-08-04)

#### Bug Fixes

- **db:** we need to enforce only a minimum patch level (not {n,n+1}) ([e12f54d5](http://github.com/mozilla/fxa-oauth-server/commit/e12f54d5dc83c9f9595f7cc765ccc7e932361177))
- **events:** require events to be configured in production ([1bef9e0a](http://github.com/mozilla/fxa-oauth-server/commit/1bef9e0aa26e15921d48205335a32565b255a6da))
- **server:** exit if db patch level is wrong ([78d63829](http://github.com/mozilla/fxa-oauth-server/commit/78d6382980a8ce1e6adbcb2af5825f643cbcbccd))

#### Breaking Changes

- Server will fail to start up if `config.events` is not
  set with values when in production.
  ([1bef9e0a](http://github.com/mozilla/fxa-oauth-server/commit/1bef9e0aa26e15921d48205335a32565b255a6da))

<a name="0.42.0"></a>

## 0.42.0 (2015-07-22)

#### Bug Fixes

- **config:** set expiration.accessToken default to 2 weeks ([7a4742de](http://github.com/mozilla/fxa-oauth-server/commit/7a4742dea75e59e66153273d77dd6cd5dd4b9d84))
- **sql:**
  - remove references to the `whitelisted` column; this is now the `trusted` column ([6b4d1ec3](http://github.com/mozilla/fxa-oauth-server/commit/6b4d1ec3f3fb72aa376ab28aa191198014f1bd84))
  - undo 155d2ce; for mysql-patcher fix up that database ([eb9f40d1](http://github.com/mozilla/fxa-oauth-server/commit/eb9f40d10389eb0de6a08b70089851789ac7f932))
  - fix the schema issue with the trailing comma ([069caeb4](http://github.com/mozilla/fxa-oauth-server/commit/069caeb4891c90c4d77649acded270b01785adca), closes [#299](http://github.com/mozilla/fxa-oauth-server/issues/299))
- **tests:** sleep additional half second to adjust for mysql round of timestamp ([a02f5161](http://github.com/mozilla/fxa-oauth-server/commit/a02f5161d632e383ec55decc314a81668b600c82))

#### Features

- **api:** add ttl parameter to POST /authorization ([36087fe6](http://github.com/mozilla/fxa-oauth-server/commit/36087fe6dd4589d6451e007aa76edc4f0db2fcca))

<a name"0.41.0"></a>

## 0.41.0 (2015-07-07)

#### Bug Fixes

- **api:**
  - tolerate an empty client_secret in /destroy ([25a4d308](https://github.com/mozilla/fxa-oauth-server/commit/25a4d308))
  - accept and ignore client_secret param in /destroy ([c797ed23](https://github.com/mozilla/fxa-oauth-server/commit/c797ed23))
  - use invalidRequestParameter instead of invalidRedirect for invalid redirect acti ([55eff2dd](https://github.com/mozilla/fxa-oauth-server/commit/55eff2dd))
  - fail on invalid action parameters ([0c73ae79](https://github.com/mozilla/fxa-oauth-server/commit/0c73ae79))
- **config:** update redirect_uri values to not be blank ([5267c62a](https://github.com/mozilla/fxa-oauth-server/commit/5267c62a))

#### Features

- **refresh_tokens:** add refresh_tokens to /token endpoint ([16e787f0](https://github.com/mozilla/fxa-oauth-server/commit/16e787f0), closes [#209](https://github.com/mozilla/fxa-oauth-server/issues/209))

<a name"0.39.0"></a>

## 0.39.0 (2015-06-10)

#### Bug Fixes

- **api:**
  - Correct the error codes changed in 2781b3a ([d0dba7c9](https://github.com/mozilla/fxa-oauth-server/commit/d0dba7c9))
  - Change InvalidAssertions error code to 401 ([2781b3a2](https://github.com/mozilla/fxa-oauth-server/commit/2781b3a2))
  - ensure /destroy endpoint returns an empty object in response body. ([6efd47d1](https://github.com/mozilla/fxa-oauth-server/commit/6efd47d1))
- **clients:** fixes client registration to use payload.whitelisted ([83e145b0](https://github.com/mozilla/fxa-oauth-server/commit/83e145b0))
- **docs:**
  - Change Status Code for Invalid Assertion based ([780aaee3](https://github.com/mozilla/fxa-oauth-server/commit/780aaee3))
  - document keys and verification_redirect options ([ef8c47a5](https://github.com/mozilla/fxa-oauth-server/commit/ef8c47a5))
  - Update description of the `action` param to match latest reality. ([b475fcbc](https://github.com/mozilla/fxa-oauth-server/commit/b475fcbc))
- **fatal-error:** Exit with non-zero exit code for fatal errors ([7c90ff08](https://github.com/mozilla/fxa-oauth-server/commit/7c90ff08), closes [#244](https://github.com/mozilla/fxa-oauth-server/issues/244))

#### Features

- **clients:** remove obsolete generate-client.js script ([62ab0adb](https://github.com/mozilla/fxa-oauth-server/commit/62ab0adb), closes [#231](https://github.com/mozilla/fxa-oauth-server/issues/231))

<a name"0.36.1"></a>

### 0.36.1 (2015-04-30)

#### Bug Fixes

- **db:** remove db name from clients ([c7244393](https://github.com/mozilla/fxa-oauth-server/commit/c7244393))

#### Features

- **auth:** redirect to content-server oauth root by default ([34ad867c](https://github.com/mozilla/fxa-oauth-server/commit/34ad867c), closes [#245](https://github.com/mozilla/fxa-oauth-server/issues/245))
- **clients:**
  - add `terms_uri` and `privacy_uri` properties to clients. ([51ae9043](https://github.com/mozilla/fxa-oauth-server/commit/51ae9043))
  - report `trusted` property in GET /client/:id ([c58d237b](https://github.com/mozilla/fxa-oauth-server/commit/c58d237b))
- **untrusted-clients:** restrict scopes that untrusted clients can request ([8fd228ad](https://github.com/mozilla/fxa-oauth-server/commit/8fd228ad), closes [#243](https://github.com/mozilla/fxa-oauth-server/issues/243))

<a name"0.36.0"></a>

## 0.36.0 (2015-04-27)

#### Features

- **authorization:** exit early if assertion invalid returns first ([5a27ee61](https://github.com/mozilla/fxa-oauth-server/commit/5a27ee61))
- **config:**
  - add browserid pool maxSockets option ([0bb40ba1](https://github.com/mozilla/fxa-oauth-server/commit/0bb40ba1))
  - add mysql pool conectionLimit option ([ca220ae7](https://github.com/mozilla/fxa-oauth-server/commit/ca220ae7))
- **developers:** adds support for oauth developers ([abe0e52a](https://github.com/mozilla/fxa-oauth-server/commit/abe0e52a))
- **logging:**
  - add log of time taken in authorization endpoint ([02ec0d20](https://github.com/mozilla/fxa-oauth-server/commit/02ec0d20))
  - add log when mysql pool enqueues ([461b5c19](https://github.com/mozilla/fxa-oauth-server/commit/461b5c19))

<a name"0.35.0"></a>

## 0.35.0 (2015-04-13)

#### Bug Fixes

- **clients:** support client/client_id route via the internal server ([ce04da76](https://github.com/mozilla/fxa-oauth-server/commit/ce04da76))

<a name="0.33.0"></a>

## 0.33.0 (2015-03-16)

#### Bug Fixes

- **clients:** fixes client endpoint for clients with no redirect_uri ([6d47110f](http://github.com/mozilla/fxa-oauth-server/commit/6d47110f5a3bbf4eb2e540c7ba09325e16dfec92), closes [#228](http://github.com/mozilla/fxa-oauth-server/issues/228))
- **travis:** install libgmp3-dev so optionaldep bigint will be built for browserid-crypto ([a64cb183](http://github.com/mozilla/fxa-oauth-server/commit/a64cb183457e713fea092002cbecffd57961bb74))

#### Features

- **clients:** move client management api to a separate port ([07a61af2](http://github.com/mozilla/fxa-oauth-server/commit/07a61af2141e7fffc54d08a16acac48073103570))

<a name="0.30.3"></a>

### 0.30.3 (2015-02-20)

#### Bug Fixes

- **clients:** update email validation ([92d4bfc3](http://github.com/mozilla/fxa-oauth-server/commit/92d4bfc30d5c9f17483f964195b8836bbb1e6557))
- **db:** make the clients key mandatory in the config file ([ac7a39e8](http://github.com/mozilla/fxa-oauth-server/commit/ac7a39e8ad8506523a6721f87c9d70e70349aef7))

#### Features

- **docker:** Dockerfile and README update for basic docker development workflow ([342d87bb](http://github.com/mozilla/fxa-oauth-server/commit/342d87bb56d8204f83aad65449c02b2f2a233fec))

<a name="0.30.2"></a>

### 0.30.2 (2015-02-09)

#### Bug Fixes

- **api:** remove stray payload restriction from authorization route ([e0d53682](http://github.com/mozilla/fxa-oauth-server/commit/e0d536821060dc044d875cbf5004c90c226cb09c))
- **logging:** use route.path in debug message, not route.url ([7d9efc25](http://github.com/mozilla/fxa-oauth-server/commit/7d9efc253465c5d95d20f216a2ff6e42be82f1ca))

<a name="0.30.1"></a>

### 0.30.1 (2015-02-03)

#### Bug Fixes

- **api:**
  - allow application/x-form-urlencoded ([6cc91e28](http://github.com/mozilla/fxa-oauth-server/commit/6cc91e285fc51045a365dbacb3617ef29093dbc3))
  - reject requests with invalid parameters ([3b4fa244](http://github.com/mozilla/fxa-oauth-server/commit/3b4fa244454e5b33edf44d14a6da8be1d0fe98a6), closes [#210](http://github.com/mozilla/fxa-oauth-server/issues/210))

#### Breaking Changes

- If you're passing invalid parameters, stop it.
  ([3b4fa244](http://github.com/mozilla/fxa-oauth-server/commit/3b4fa244454e5b33edf44d14a6da8be1d0fe98a6))

<a name="0.30.0"></a>

## 0.30.0 (2015-02-02)

#### Bug Fixes

- **api:** reject requests with bad content-types ([26672287](http://github.com/mozilla/fxa-oauth-server/commit/26672287010658048afb5e83363319076799d976), closes [#199](http://github.com/mozilla/fxa-oauth-server/issues/199))
- **clients:** fix server error when omitting optional fields in client registration ([80768c51](http://github.com/mozilla/fxa-oauth-server/commit/80768c51ea3cd1a26194f19951061992fd75bc1a))

#### Features

- **api:**
  - add `auth_at` to token response schema. ([bc8454df](http://github.com/mozilla/fxa-oauth-server/commit/bc8454df90b1c4d8b94fc4bac993b76a8371432f))
  - allow destroying token without client_secret ([7b4d01ff](http://github.com/mozilla/fxa-oauth-server/commit/7b4d01ffc87dd3da74bf5eb7fc21ee07290090fd))
- **db:** add basic migration infrastructure to mysql backend ([012e605c](http://github.com/mozilla/fxa-oauth-server/commit/012e605c501c5d135c16387ac6593931da73f589))

<a name="0.29.0"></a>

## 0.29.0 (2015-01-20)

#### Bug Fixes

- **docs:** minor spelling fixes ([33ad1ec0](http://github.com/mozilla/fxa-oauth-server/commit/33ad1ec0b67116e3f9eb46b7ac9eb8f51548178b))

#### Features

- **api:** Add `action=force_auth` to GET /v1/authorization. ([33603bd2](http://github.com/mozilla/fxa-oauth-server/commit/33603bd2dc1b8a483563512f2f1f4729d64c0fc3))

<a name="0.26.2"></a>

### 0.26.2 (2014-11-20)

#### Bug Fixes

- **logging:** use space-free tokens for mozlog ([11f73f9e](http://github.com/mozilla/fxa-oauth-server/commit/11f73f9e8e16324dba00822272f77a38828423f7))

<a name="0.26.1"></a>

### 0.26.1 (2014-11-13)

#### Features

- **logging:** log details when generating code ([81933f70](http://github.com/mozilla/fxa-oauth-server/commit/81933f70a61c5783adc89dcea36f9f8213609e6a))

<a name="0.26.0"></a>

## 0.26.0 (2014-11-12)

#### Bug Fixes

- **api:** set update to return an empty object ([6f334c66](http://github.com/mozilla/fxa-oauth-server/commit/6f334c668dc93f4ccba07c0aa14c316a5a433bca))
- **error:** AppError uses Error.captureStackTrace ([2337f809](http://github.com/mozilla/fxa-oauth-server/commit/2337f809938ccef433667beb319be3b4de815da3), closes [#164](http://github.com/mozilla/fxa-oauth-server/issues/164))

#### Features

- **clients:** client registration apis ([1a80294d](http://github.com/mozilla/fxa-oauth-server/commit/1a80294dc3071b208d7573475b5be71c85e2aeb0))
- **error:** add info property with link to docs ([681044c6](http://github.com/mozilla/fxa-oauth-server/commit/681044c6125b16b77cfa87a0cd7f5e2319f6bbab))
- **logging:**
  - add method, payload, and auth to summary ([df57e23c](http://github.com/mozilla/fxa-oauth-server/commit/df57e23cd737ae3a05a8b977ae377d00e570406b))
  - switch logging to mozlog ([ec0f5db1](http://github.com/mozilla/fxa-oauth-server/commit/ec0f5db1350b001176bbed84264cd1523a1d68b0), closes [#156](http://github.com/mozilla/fxa-oauth-server/issues/156))
- **verify:** added 'client' to /verify response ([4c575516](http://github.com/mozilla/fxa-oauth-server/commit/4c5755164ceba608497cf36377746a6a3fbc41a8), closes [#149](http://github.com/mozilla/fxa-oauth-server/issues/149))

#### Breaking Changes

- both the config and the logging output has changed.

Closes #156
([ec0f5db1](http://github.com/mozilla/fxa-oauth-server/commit/ec0f5db1350b001176bbed84264cd1523a1d68b0))

<a name="0.24.0"></a>

## 0.24.0 (2014-10-20)

#### Features

- **server:** set HSTS header for 180 days ([d43accb9](http://github.com/mozilla/fxa-oauth-server/commit/d43accb9d7749a216840ba0cf51861becf974a81))
