# shared/crypto

Shared cryptographic helpers for FxA. Currently exposes
`bufferEqualsConstantTime`, a length-safe constant-time comparison used for
secret, token, and HMAC checks across auth-server and the NestJS libs.
