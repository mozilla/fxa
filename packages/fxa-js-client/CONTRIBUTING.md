# Contribution guidelines to fxa-js-client

## Development

`grunt build` - builds the regular and minified version of the library

`grunt dev` - builds the library, runs jshint, shows library size, runs tests, watches for changes

`grunt debug` - builds the regular library, runs test, watches for changes. Helpful when you are debugging.

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
