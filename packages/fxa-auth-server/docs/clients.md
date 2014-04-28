#Configuring OAuth clients

## How to register a client manually

Generally when you connect applications to OAuth the provider generates the id and secret tokens for you but what if you are creating your own client and ne
ver had to generate those keys for yourself.

To add a client manually, you can add entries in your deployment configuration file in the 'clients' array.

    {
      // ... rest of your config ...
      "clients": [
      {
          "id": "4a60bf43fc311d195b18d985ad0deed1",
          "secret": "b048895cbc44241bd68b18ab7d34d1aef8ba34441877ef96c28c706fc1e096fc",
          "name": "Awsy",
          "imageUri": "https://mozorg.cdn.mozilla.net/media/img/firefox/new/header-firefox.png",
          "redirectUri": "https://mozilla.org",
          "whitelisted": true
        }
      ]
    }

The `id` and `secret` keys, in this context, can be seen as username and passwords. They do not need to be generated in relation between one and another. In
 other words, they are not public and private keys.

Create manually both client id and secret with random strings of 32 and 64 bits respectively in your config.

At this time, there is no utility to generate id and secret values. You can use the commands below to generate appropriate values for your client.

    node
    var crypto = require('crypto');
    var tempGenerator = function(len){ return crypto.randomBytes(Math.ceil(len/2)).toString('hex').slice(0,len); };
    
Generate a 32 bit key:

    tempGenerator(32)
    // '4a60bf43fc311d195b18d985ad0deed1'

Client secret:

    tempGenerator(64)
    // 'b048895cbc44241bd68b18ab7d34d1aef8ba34441877ef96c28c706fc1e096fc'

