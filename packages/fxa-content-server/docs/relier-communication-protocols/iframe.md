# IFRAME channel protocol

## v1

### Commands
A command is a postMessage sent from FxA to the parent IFRAME.

#### ping
Sent on startup. Used to determine the parent's origin. The parent should respond with a `ping`. No data is sent.

#### loaded
Sent on startup. Sent after the first screen is visible. No data is sent.

#### oauth_complete
Sent if the user completes authentication. The `data` field will be an object with three fields:
* `state` {String} - The `state` token sent by the relier.
* `code` {String} - The OAuth code that can be traded for a token that can be used to access protected resources.
* `redirect` {String} - The URI that the user would have been redirected to had the redirect flow been used.

#### oauth_cancel
Sent when a user indicates they want to close the iframe. The parent should close the iframe.

#### resize
Sent when the content height changes. The `data` field will be an object that contains `height`.
* `height` {Number} - the content height

### Message format
Since all messages are sent over postMessage, commands and data must be represented by strings. A JSON.stringify serialized object containing a command and data object is used.

```
{
  command: <command>
  data: <data>
}
```

* `command` {String} - The command.
* `data` {Object} - Data object. Can be empty.

### Command order
1. ping
1. loaded
1. oauth_complete

OR

1. ping
1. loaded
1. oauth_cancel

The same format is used for both incoming messages and responses.

### Expected responses
A single `ping` will be sent from Firefox Accounts on startup to determine the relier's origin. A `ping` response must be sent for Firefox Accounts to load.
