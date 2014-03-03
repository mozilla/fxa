# Contribution guidelines to fxa-js-client

## Build Library

Note: Java is required to build the library due to a custom SJCL build.

```
npm run-script setup
npm start
```

The `build` directory should have `fxa-client.js` and `fxa-client.min.js`.


## Development

`grunt build` - builds the regular and minified version of the library

`grunt dev` - builds the library, runs jshint, shows library size, runs tests, watches for changes

`grunt debug` - builds the regular library, runs test, watches for changes. Helpful when you are debugging.

`grunt release` - will prepare a new release of this library with the version in `package.json`.
 It will create or update the repositories in `build` and `docs`. If the version in `package.json` has not changed,
 then the tagging will be skipped.


### SJCL Notes

Currently [SJCL](http://bitwiseshiftleft.github.io/sjcl/) is built with `./configure --without-random --without-ocb2 --without-gcm --without-ccm`.
Adjust this if you need other SJCL features.


## Testing

This library uses [The Intern](https://github.com/theintern/intern/wiki) testing framework.

`grunt test` - run local tests via Node.js

`grunt intern:browser` - Locally run tests in Selenium (Requires `java -jar selenium-server-standalone-2.37.0.jar`).

`grunt intern:sauce` - Run tests on SauceLabs.


## Documentation

Running `grunt doc` will create a `docs` directory, browse the documentation by opening `docs/index.html`.

Write documentation using [YUIDoc Syntax](http://yui.github.io/yuidoc/syntax/).
