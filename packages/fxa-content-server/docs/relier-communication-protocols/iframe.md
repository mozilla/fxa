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

### Command format
Since all commands are sent over postMessage, commands and their data must be represented by strings. The format is:

```
command!!!data
```

* `command` {String} - The command.
* `data` {String} - JSON.stringify'd data. Can be empty.

The separator is `!!!`

### Command order
1. ping
1. loaded
1. oauth_complete

OR

1. ping
1. loaded
1. oauth_cancel

### Expected responses
A `ping` command expects a response. Respond with `ping!!!`. If no `ping` response is received, Firefox Accounts will refuse to load.
