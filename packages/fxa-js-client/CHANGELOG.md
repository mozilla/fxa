<a name="0.1.30"></a>

### 0.1.30 (2015-07-20)

#### Bug Fixes

- **client:** throw harder on bad client init ([c3b06b4d](https://github.com/mozilla/fxa-js-client/commit/c3b06b4df48ef01910c2c98fee01b676e0ea58af))
- **tests:** fix account.js tests ([c0cc0d59](https://github.com/mozilla/fxa-js-client/commit/c0cc0d5915589366f6e6af01259065f70975eb60))

<a name="0.1.29"></a>

### 0.1.29 (2015-06-10)

#### Bug Fixes

- **docs:** include keys for signUp ([dff42d0d](https://github.com/mozilla/fxa-js-client/commit/dff42d0d185524cfccf02a67af0e4c696875e54c), closes [#140](https://github.com/mozilla/fxa-js-client/issues/140))
- **tests:** remove account devices, add unlock verify code ([13c1b836](https://github.com/mozilla/fxa-js-client/commit/13c1b836ffe9ad5cdde43a4a809d83d33795ce75), closes [#151](https://github.com/mozilla/fxa-js-client/issues/151))

#### Features

- **client:**
  - Pass along `reason` in `signIn` ([b33b1d53](https://github.com/mozilla/fxa-js-client/commit/b33b1d53d8b49e1e069c733d897a063309346194))
  - signIn can now pass along a `service` option. ([0188dbb2](https://github.com/mozilla/fxa-js-client/commit/0188dbb233286cefd3145f53b39e8279ad0c6e40))

<a name="0.1.28"></a>

### 0.1.28 (2015-02-12)

#### Features

- **client:** Add account unlock functionality. ([2f8e642c](https://github.com/mozilla/fxa-js-client/commit/2f8e642c3600e29fedd3913b60e417f376593754))

<a name="0.1.27"></a>

### 0.1.27 (2014-12-09)

#### Bug Fixes

- **docs:** fixes typo for certificateSign ([ab22f068](https://github.com/mozilla/fxa-js-client/commit/ab22f0682bae8a70768562fd9f3b6057243f3475))

#### Features

- **client:** Return `unwrapBKey` in `signUp` if `keys=true` is specified. ([1cd19e52](https://github.com/mozilla/fxa-js-client/commit/1cd19e52feb188905ae41c5d66e540fa2b1aee5b))

<a name="0.1.26"></a>

### 0.1.26 (2014-09-23)

#### Bug Fixes

- **request:** return an error object when the response is an HTML error page ([38a25556](https://github.com/mozilla/fxa-js-client/commit/38a25556001c2afcc9f9e87901964bca04bca624))

<a name="0.1.25"></a>

### 0.1.25 (2014-09-15)

#### Features

- **client:** Pass along the `resume` parameter to the auth-server ([07cff4ec](https://github.com/mozilla/fxa-js-client/commit/07cff4ec9568f2243400755dbed7ce4c077aa02b))

<a name="0.1.24"></a>

### 0.1.24 (2014-09-03)

#### Bug Fixes

- **tests:** use a locale that is supported by the auth-mailer for header tests ([2e13d22e](https://github.com/mozilla/fxa-js-client/commit/2e13d22e30751b8cea836fe5585a696fdbb79149))

#### Features

- **client:** signUp accepts a `preVerifyToken` option. ([35b4b232](https://github.com/mozilla/fxa-js-client/commit/35b4b2326a452520efb7901ae53411f1b42baabe))

<a name="0.1.23"></a>

### 0.1.23 (2014-06-12)

<a name="0.1.22"></a>

### 0.1.22 (2014-06-11)

<a name="0.1.20"></a>

### 0.1.20 (2014-05-16)

#### Bug Fixes

- **xhr:** make the default payload null ([83666223](https://github.com/mozilla/fxa-js-client/commit/83666223b6fdf4c6993bb4fefce9f0d63c6b38d4))
