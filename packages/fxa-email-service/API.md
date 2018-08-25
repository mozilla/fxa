# Firefox Accounts email service API

## Overview

### Response format

```
{
  "code": 400,  // Matches the HTTP status code
  "errno": 107, // Stable application-level error number
  "error": "Bad Request", // String description of the error type
  "message": "Invalid parameter in request body", // Specific error message
}
```

### Defined errors

- `code: 500, errno: 100`: Rocket Error
- `code: 400, errno: 101`: Missing Email Parameters
- `code: 500, errno: 102`: Invalid Email Parameters
- `code: 500, errno: 103`: Invalid Provider
- `code: 500, errno: 104`: Provider Error
- `code: 500, errno: 105`: Email Parsing Error
- `code: 429, errno: 106`: Bounce Complaint Error
- `code: 429, errno: 107`: Bounce Soft Error
- `code: 429, errno: 108`: Bounce Hard Error
- `code: 500, errno: 109`: Database Error
- `code: 500, errno: 110`: Queue Error
- `code: 500, errno: 111`: Invalid Notification Type
- `code: 500, errno: 112`: Missing Notification Payload
- `code: 500, errno: 113`: Missing SQS Message Field
- `code: 500, errno: 114`: SQS Message Hash Mismatch
- `code: 500, errno: 115`: SQS Message Parsing Error
- `code: 500, errno: 116`: Duration Error
- `code: 500, errno: 117`: MessageDataError
- `code: 500, errno: 118`: Not Implemeneted

The following errors include additional response properties:

- `errno: 100`
- `errno: 101`
- `errno: 102`
- `errno: 103`
- `errno: 104` name
- `errno: 105`
- `errno: 106` address, bouncedAt, bouce
- `errno: 107` address, bouncedAt, bouce
- `errno: 108` address, bouncedAt, bouce
- `errno: 109`
- `errno: 110`
- `errno: 111`
- `errno: 112`
- `errno: 113` queue, field
- `errno: 114` queue, hash, body
- `errno: 115` queue, message, body
- `errno: 116`
- `errno: 117`
- `errno: 118`
