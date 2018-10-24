# Service Clients

Do you wish to allow users to authenticate to your app, as well as fetch
some information about them? Then you don't want to be a Service Client.
Be a regular client.

Service Clients exist as privileged apps that need to be able to request
information about a user, without ever having received permission to do
so. Sounds nefarious. However, as said, these are **privileged** apps,
meaning they are also run by **us** (Mozilla). So these apps are not
gaining access to something that we don't already know. Plus, before
ever being promoted to a Service Client, real humans are involved to
make sure it's the correct use case.

## All Powerful

A Service Client exists by being in the config array `serviceClients`.
Each entry (if any) is an object, with the following values:

- `id` - `String`: a unique hex value in identical format to regular
  client ids.
- `name` - `String`: a plaintext name for the client that's friendly to
  human readers.
- `scope` - `String`: space-separated scopes that this client will be
  using when requesting access tokens.
- `jku` - `String`: a unique URL that will host a JWK Set. Unique as in
  unique in the current list of Service Clients.

## JKUs and JWK Sets

Imagine a service client with the `jku` of `https://example.dom.ain/keys`.
The document hosted at that URL should contain something like:

```json
{
  "keys":[{
    "kid":"key-id-can-whatever-1",
    "use": "sig",
    "kty":"RSA",
    "n":"W_lCUvksZMVxW2JLNtoyPPshvSHng28H5FggSBGBjmzv3eHkMgRdc8hpOkgcPwXYxHdVM6udtVdXZtbGN8nUyQX8gxD3AJg-GSrH3UOsoArPLCmcxwIEpk4B0wqwP68oK8dQHt0iK3N-XeCnMpv75ULlVn3LEOZT8CsuNraVOthYeClUb8r1PjRwqRB06QGNqnnhcPMmh-6cRzQ9HmTMz6CDcugiH5n2sjrvpeBugEsnXt3KpzVdSc4usXrIEmLRuFjwFbkzoo7FiAtSoXxBqc074qz8ejm-V0-2Wv3p6ePeLODeYkPQho4Lb1TBdoidr9RHY29Out4mhzb4nUrHHQ",
    "e":"AQAB"
  }]
}
```

This JKU is important when making requests for access tokens.

## JWTs and Authorization

To request an access token, a service client must generate a signed [JWT][],
and then send it to our [/v1/token][] endpoint.

Here's an example of creating a JWT in JavaScript:

```js
var now = Math.floor(Date.now() / 1000); // in seconds
var header = {
  alg: 'RS256',
  typ: 'JWT',
  jku: 'https://basket.mozilla.org/.well-known/jku',
  kid: 'k1'
};
var claims = {
  scope: 'profile:email',
  aud: 'https://oauth.accounts.firefox.com/v1/token',
  iat: now,
  exp: now + (60 * 5),
  sub: '9b052aebbc48c8376257c777e2a7f009'
};

var token = base64(JSON.stringify(header)) + '.' + base64(JSON.stringify(claims));
var sig = rsa256(Buffer.from(token, 'base64'), privateKey);
var jwt = token + '.' + base64(sig);
```

Once you have a signed JWT, you would make the following request:

```sh
curl -v \
-X POST \
-H "Content-Type: application/json" \
"https://oauth.accounts.firefox.com/v1/token" \
-d '{
  "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
  "assertion": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImprdSI6Imh0dHBzOi8vYmFza2V0LmFjY291bnRzLmZpcmVmb3guY29tLy53ZWxsLWtub3duL2prdSIsImtpZCI6ImsxIn0.eyJzdWIiOiI1OTAxYmQwOTM3NmZhZGFhNTkwMWJkMDkzNzZmYWRhYUBhY2NvdW50cy5maXJlZm94LmNvbSIsInNjb3BlIjoicHJvZmlsZTplbWFpbCIsImF1ZCI6Imh0dHBzOi8vb2F1dGguYWNjb3VudHMuZmlyZWZveC5jb20vdjEvdG9rZW4iLCJpYXQiOjE0NDM2NjI0ODEsImV4cCI6MTQ0MzY2Mjc4MX0.Kmwfq7yZrKpwrcZ78NTLPs8v4ijMhoKVNZ45VJY-skyK_XD_U5DJeKq8IE6PspU6B6p0DPkW1EEKeKOAbpyzFIBi9uG7l329x32JkzXGwybxannbGrdd5DFZbIaBSZDf-64MXbxGBGQ8xy18dfXmgbmNsvYPRZqqS2gmoM1EvWg"
}'
```

The response is described in the [API docs][/v1/token].

[/v1/token]: ./api.md#post-v1token
[JWT]: http://jwt.io/
