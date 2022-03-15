# Overview

This is a rough estimation of the amount of work needed to support [RFC8626](https://datatracker.ietf.org/doc/html/rfc8628) or Device Authorization Grant.

TLDR; Most likely about 2-3 sprints worth of work.

# Device Authorization Request

We will need to add a new oauth endpoint to support.

Example Request:

```
POST /device_authorization HTTP/1.1
Host: server.example.com
Content-Type: application/x-www-form-urlencoded

client_id=1406020730
```

Example Response:

```
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{
"device_code": "GmRhmhcxhwAzkoEqiMEg_DnyEysNkuNhszIySk9eS",
"user_code": "WDJB-MJHT",
"verification_uri": "https://example.com/device",
"verification_uri_complete": "https://example.com/device?user_code=WDJB-MJHT",
"expires_in": 1800,
"interval": 5
}
```

# Add front end screens for user interaction

We will need to add two front end screens to support this, one that displays the code and the other that allows user to enter the code.

Example screen for limited input device (ie Tv, Kobo)

```
+-------------------------------------------------+
|                                                 |
|  Scan the QR code or, using     +------------+  |
|  a browser on another device,   |[_]..  . [_]|  |
|  visit:                         | .  ..   . .|  |
|  https://example.com/device     | . .  . ....|  |
|                                 |.   . . .   |  |
|  And enter the code:            |[_]. ... .  |  |
|  WDJB-MJHT                      +------------+  |
|                                                 |
+-------------------------------------------------+
```

Behind the scenes, this page is polling to see if the code becomes verified.

Example screen for the authorization (ie Firefox Desktop)

```
+-----------------------------------------------+
|                                               |
|  Authorize this login:                        |
|  Code:                                        |
|                                               |
+-----------------------------------------------+
```

# Device Access Token Request

The client is polling behind the scenes for the device code to be verified

Example request

```
POST /token HTTP/1.1
Host: server.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Adevice_code
&device_code=GmRhmhcxhwAzkoEqiMEg_DnyEysNkuNhszIySk9eS
&client_id=1406020730
```

# Device Access Token Response

Example response

```
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{
"authorization_pending": true,
"slow_down": 5,
"access_denied": false,
"expired_token": false,
"interval": 5
}
```

# Oauth database migration

To support this feature we will need to add a new table to store `device_code` and `user_code`. We could also store this in redis only since these codes do expire.

# Other considerations
