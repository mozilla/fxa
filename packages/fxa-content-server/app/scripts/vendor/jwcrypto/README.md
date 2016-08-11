## build jwcrypto.*.js

jwcrypto.*.js is built from source using browserify 13.1.0:

```bash
browserify -s jwcrypto index.ds.js > jwcrypto.ds.js
browserify -s jwcrypto index.rs.js > jwcrypto.rs.js
```

`jwcrypto.ds.js` is used by the content server. It contains only the DSA
components necessary to generate an assertion.
`jwcrypto.rs.js` is used by the unit tests. It contains both DSA and RSA
components, RSA is necessary to unbundle and verify assertions.
