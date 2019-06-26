## Using HTTPS in development

Add this to `local.json`:

```
  "use_https": true,
  "key_path": "../tests/tools/certs/server.key",
  "cert_path": "../tests/tools/certs/server.crt",
```

## Create self-signed certificates

Run `generate_certs.sh` and follow the steps.

NOTE: No passphrase set for the certificate. If you are getting warnings in Google Chrome,
add 'server.crt' (from 'tests/tools/certs') to your keychain. In OS X, after you add 'server.crt',
right click on the certificate, select 'Get Info' - 'Trust' - 'Always Trust', close window, restart Chrome.
