# common-password-list

Imported from the original repo, updated for TypeScript, and restructured for vendoring.

## Using

## Usage:

```typescript
import passwordCheck from '@fxa/vendored/common-password-list';

// returns true
passwordCheck('password');

// returns false
passwordCheck('@!#^GDSAQ@#^Q#@^$YAESFDAS');
```

## Building

Run `nx build common-password-list` to build the library.

## Running unit tests

Run `nx test common-password-list` to execute the unit tests via [Jest](https://jestjs.io).
