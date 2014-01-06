# Contribution guidelines to fxa-js-client

## Development

`grunt build` - builds the regular and minified version of the library
`grunt dev` - builds the library, runs jshint, shows library size, runs tests, watches for changes
`grunt debug` - builds the regular library, runs test, watches for changes. Helpful when you are debugging.

### Testing

This library uses [The Intern](https://github.com/theintern/intern/wiki) testing framework.

Run `grunt test` to run local tests via Node.js
`grunt intern:browser` - Locally run tests in Selenium (Requires `java -jar selenium-server-standalone-2.37.0.jar`).
`grunt intern:sauce` - Run tests on SauceLabs.


## Documentation

Running `grunt doc` will create a `docs` directory, browse the documentation by opening `docs/index.html`.

Write documentation using [YUIDoc Syntax](http://yui.github.io/yuidoc/syntax/).
