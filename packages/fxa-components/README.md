# Shared components for FxA React Apps

## Testing

This package uses [Jest](https://jestjs.io/) to test its code. By default `npm test` will test all JS files under `src/`.

Test specific tests with the following commands:

```bash
# Test for the component ComponentName
npm run test -- ComponentName

# Grep for "description"
npm run test -- -t "description"

# Watch files for changes and re-run
npm run test -- --watch
```

Refer to Jest's [CLI documentation](https://jestjs.io/docs/en/cli) for more advanced test configuration.

## Architectural decisions

The FxA team has made intentional decisions when it comes to the design of this package and its related packages' code bases. Learn more in the following ADRs:

- 0002 - [Use React, Redux, and Typescript for subscription management pages](https://github.com/mozilla/fxa/blob/master/docs/adr/0002-use-react-redux-and-typescript-for-subscription-management-pages.md)
- 0009 - [Consistency in testing tools](https://github.com/mozilla/fxa/blob/master/docs/adr/0009-testing-stacks.md)
- 0013 - [React Toolchain for Settings Redesign](https://github.com/mozilla/fxa/blob/master/docs/adr/0013-react-toolchain-for-settings-redesign.md)
- 0015 - [Use CSS Variables, Prefer SCSS over CSS-in-JS](https://github.com/mozilla/fxa/blob/master/docs/adr/0015-use-css-variables-and-scss.md)

## License

MPL-2.0
