# FIRSTRUN channel protocol

## v1

### Commands
A command is a postMessage sent from FxA to the parent IFRAME.

#### ping
Sent on startup. Used to determine the parent's origin. The parent should respond with a `ping`. No data is sent.

#### loaded
Sent on startup. Sent after the first screen is visible. No data is sent.

#### login
Sent when a user successfully signs in, including after a user verifies
their email after an account unlock.

#### signup_must_verify
The user has successfully completed the signup form and must verify
their email address.

#### verification_complete
The user has successfully verified their email address.

#### resize
Sent when the content height changes. The `data` field will be an object that contains `height`.
* `height` {Number} - the content height

### Message format
Since all messages are sent over postMessage, commands and data must be represented by strings. A JSON.stringify serialized object containing a command and data object is used.

```
{
  command: <command>,
  data: <data>
}
```

* `command` {String} - The command.
* `data` {Object} - Data object. Can be empty, i.e., `{}`.

### Command order
1. ping
1. loaded
1. login

OR

1. ping
1. loaded
1. signup_must_verify
1. verification_complete (if firstrun page is still open)

The same format is used for both incoming messages and responses.

### Expected responses
A single `ping` will be sent from Firefox Accounts on startup to determine the relier's origin. A `ping` response must be sent for Firefox Accounts to load.
