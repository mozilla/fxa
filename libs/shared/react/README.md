# shared-react

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build shared-react` to build the library.

## Running unit tests

Run `nx test shared-react` to execute the unit tests via [Jest](https://jestjs.io).

## Localization

Unlike `packages/fxa-react`, `shared-react` does not have it's own l10n translation pipeline setup yet. Instead it makes use of the existing pipeline in `packages/fxa-react`, and the l10n grunt scripts have been updated to include the `shared-react` projects path, i.e. `libs/shared/react/src/**`.

For applications using React components in `shared-react`, to include the ftl translations, make sure to include `react` in your l10n-bundeling script, so that the `react.ftl` files are included in your `main.ftl` bundle.
