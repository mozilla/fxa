# FIRSTRUN channel protocol

A command is a postMessage sent from FxA to the parent IFRAME.

## Message format

Since all messages are sent over postMessage, commands and data must be represented by strings. A JSON.stringify serialized object containing a command and data object is used.

```
{
  command: <command>,
  data: <data>
}
```

-   `command` {String} - The command.
-   `data` {Object} - Data object. Can be empty, i.e., `{}`.

## v1

### Commands

#### loaded

Sent on startup. Sent after the first screen is visible. No data is sent.

#### login

Sent when a user successfully signs in, including after a user verifies
their email after an account unlock.

#### resize

Sent when the content height changes. The `data` field will be an object that contains `height`.

-   `height` {Number} - the content height

#### signup_must_verify

The user has successfully completed the signup form and must verify
their email address.

The `data` field contains:

-   `emailOptIn` {Boolean} - whether the user has opted in to receiving marketing email

#### verification_complete

The user has successfully verified their email address.

## v2

### Commands

#### form_disabled

The form on the current page has been disabled.

#### form_enabled

The form on the current page has been enabled.

#### form_engaged

The form on the current page has been engaged with, i.e., modified.

#### loaded

Sent on startup. Sent after the first screen is visible. No data is sent.

#### login

Sent when a user successfully signs in, including after a
user verifies their email after an account unlock.

### navigated

The user has navigated to a new page within the app.
`data` will include a `url` field.

-   `url` {String} - the updated url pathname

#### resize

Sent when the content height changes. The `data` field will be an object that contains `height`.

-   `height` {Number} - the content height

#### signup_must_verify

The user has successfully completed the signup form and must verify
their email address.

The `data` field contains:

-   `emailOptIn` {Boolean} - whether the user has opted in to receiving marketing email

#### verification_complete

The user has successfully verified their email address.

## Command order

1. loaded
1. login

OR

1. loaded
1. signup_must_verify
1. verification_complete (if firstrun page is still open)

The same format is used for both incoming messages and responses.
