var test = require('tap').test
var inherits = require('util').inherits
var crypto = require('crypto')
var P = require('p-promise')
var hkdf = require('../../hkdf')
var config = require('../../config').root()

var dbs = require('../../kv')(config)

function fakeCrypto(bytes) {
  return {
    randomBytes: function (size, cb) {
      cb(null, bytes)
    },
    createHmac: crypto.createHmac
  }
}

// Test vectors
// https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol#Test_Vectors

var useSession = {
  sessionToken: Buffer(
    '8081828384858687' +
    '88898a8b8c8d8e8f' +
    '9091929394959697' +
    '98999a9b9c9d9e9f',
    'hex'),
  tokenId:
    '31217a79ba0d62e9' +
    'c6e33cee374f0879' +
    '3171b2a39d14cc8f' +
    'f680540b5028d069',
  key:
    '6c87cfeba3a216d4' +
    'b1829e62478500ac' +
    'd2953158130cae0b' +
    '2c92ef8a2ea6089a'
}

var accountKeys = {
  keyFetchToken: Buffer(
  '6061626364656667' +
  '68696a6b6c6d6e6f' +
  '7071727374757677' +
  '78797a7b7c7d7e7f',
  'hex'),
  tokenId:
    '7f784ba2bd89097f' +
    '743632d21316d987' +
    '38e146a9e7123a98' +
    '39a87c96b3bb99cb',
  key:
    '6dedf96237deb067' +
    'f4232af00b3c7148' +
    'e815635c147a7215' +
    'a64906bdb2823471',
  hmacKey:
    'ca24f43285899356' +
    '5d698251dbe6c7f7' +
    'da5f9ad003835a41' +
    'edf7c813124c5499',
  xorKey:
    '9dff4835ffdbacd6' +
    '5e27f5dde15a1f18' +
    '994ff75f70bab7db' +
    'b5c4c9771e657704' +
    '4666cf97273e2a96' +
    '02993f5b1e258d8f' +
    '3b4d837e505f8458' +
    '41a986882ef36631',
  kA:
    '2021222324252627' +
    '28292a2b2c2d2e2f' +
    '3031323334353637' +
    '38393a3b3c3d3e3f',
  wrapKb:
    '4041424344454647' +
    '48494a4b4c4d4e4f' +
    '5051525354555657' +
    '58595a5b5c5d5e5f',
  ciphertext:
    'bdde6a16dbfe8af1' +
    '760edff6cd773137' +
    'a97ec56c448f81ec' +
    '8dfdf34c2258493b' +
    '06278dd4637b6cd1' +
    '4ad075105268c3c0' +
    '6b1cd12d040ad20f' +
    '19f0dcd372ae386e',
  hmac:
    '6f7972302f00dfe8' +
    '2d5a8ce0553b0ffe' +
    '80e073078d4f30f9' +
    '0c48537f8ca92222'
}

var sessionAuth = {
  K: Buffer(
    'e68fd0112bfa31dc' +
    'ffc8e9c96a1cbadb' +
    '4c3145978ff35c73' +
    'e5bf8d30bbc7499a',
    'hex'),
  hmacKey:
    'e252adb2c217c2a1' +
    '02b4bd3f71294430' +
    'e367145b107d1e8d' +
    'e35684bbdf13f1e9',
  xorKey:
    '75a6ff483b6afe43' +
    'f80f95b5e2061ce3' +
    '961996ec4c2eeb9c' +
    '350ebfabdd766549' +
    '342a0b2d910c9f5b' +
    'b2dee20f2af61849' +
    'a4a20ff16ee4a25f' +
    'cb6e832effa77f59',
  keyFetchToken:
    '6061626364656667' +
    '68696a6b6c6d6e6f' +
    '7071727374757677' +
    '78797a7b7c7d7e7f',
  sessionToken:
    '8081828384858687' +
    '88898a8b8c8d8e8f' +
    '9091929394959697' +
    '98999a9b9c9d9e9f',
  ciphertext:
    '15c79d2b5f0f9824' +
    '9066ffde8e6b728c' +
    'e668e49f385b9deb' +
    '4d77c5d0a10b1b36' +
    'b4ab89ae158919dc' +
    '3a576884a67b96c6' +
    '34339d62fa7134c8' +
    '53f719b5633ae1c6',
  hmac:
    'b27381d49ca93e61' +
    '3247c49a0cd0c901' +
    '0332f186bb07c23f' +
    '33ad176916d607c4'
}

var passwordChange = {
  xorKey:
    'aaf041fd5f2c23e9' +
    '0c3636f93a170ef0' +
    '60456d7edf7678df' +
    '2d5297797626a07d' +
    'a96803cfe941a0c8' +
    'ea140e371871ea20' +
    '1ec38ad41a233b8e' +
    '39ff1bedf6ce0aec',
  hmacKey:
    '81a03345184a09fd' +
    '9aef6ec1a1ddf80f' +
    'c4e3d354bf8af42f' +
    'a4b32696384cb9b9',
  ciphertext:
    'ca91239e3b49458e' +
    '645f5c92567a609f' +
    '10341f0dab030ea8' +
    '552bed020a5bde02' +
    '09c9a16c4de4066f' +
    '42bda49cb4dc448f' +
    'ae723867ae968d39' +
    '8146a1564a73b453',
  hmac:
    '442223ac3a149d00' +
    'cc319a73189b8572' +
    'e323084b662f74a5' +
    'b5d1f32925ea50de'
}

var accountReset = {
  accountResetToken: Buffer(
    'a0a1a2a3a4a5a6a7' +
    'a8a9aaabacadaeaf' +
    'b0b1b2b3b4b5b6b7' +
    'b8b9babbbcbdbebf',
    'hex'),
  tokenId:
    'b421fa511242b33f' +
    'feebdef63089242f' +
    'fde11c811fd5474d' +
    'b888ade257861e23',
  key:
    'da5fb4a8e1a7fc77' +
    'dfcf43be71455f69' +
    'f6776e24f369e253' +
    'ff1f541fbb5e9bc3',
  xorKey:
    'def723a6ece08e37' + 'd5b598a25a031eda' +
    'acad44ef5186fef0' + '2a76417dc245379b' +
    '1c5825ac741dd558' + '632d933cc9455875' +
    'f099cbe46d926ace' + '201616119d47f115' +
    'ab7623e63c29c518' + '187a6139570f8457' +
    '03c84be42720bbb6' + '6097f90172a7ebf4' +
    '0a44f140828f0cd4' + '16028e67e0ef3b4c' +
    'f6e0b43055bd008a' + '1305b2b5f579b0f0' +
    'ca91d70e28265713' + 'b4d2dc5197e64dec' +
    'f0e6ee2b8acdef73' + 'ea1951f7dea374cf' +
    '2f56ac2a76f5f1e1' + '2ba46852bf6d315e' +
    '2e9419c8d4d43676' + '168044e45862c3e4' +
    '3e4a390b00950870' + '953f36112d697b43' +
    '6fd661567ca29c7e' + '68fea229b016cdad' +
    'c19bf3430a0b52c7' + 'cdd232e774c10882' +
    '507bd85a3b0c14fe' + '795367422374d774' +
    'dfa43df9f91d723d' + '4480e2d2f0776794' +
    '67481cab9c835602' + '69fa7f3086efc88e',
  plaintext:
    '4041424344454647' + '48494a4b4c4d4e4f' +
    '5051525354555657' + '58595a5b5c5d5e5f' +
    '1111111111111111' + '1111111111111111' +
    '1111111111111111' + '1111111111111111' +
    '1111111111111111' + '1111111111111111' +
    '1111111111111111' + '1111111111111111' +
    '1111111111111111' + '1111111111111111' +
    '1111111111111111' + '1111111111111111' +
    '1111111111111111' + '1111111111111111' +
    '1111111111111111' + '1111111111111111' +
    '1111111111111111' + '1111111111111111' +
    '1111111111111111' + '1111111111111111' +
    '1111111111111111' + '1111111111111111' +
    '1111111111111111' + '1111111111111111' +
    '1111111111111111' + '1111111111111111' +
    '1111111111111111' + '1111111111111111' +
    '1111111111111111' + '1111111111111111' +
    '1111111111111111' + '1111111111111111',
  ciphertext:
    '9eb661e5a8a5c870' + '9dfcd2e9164e5095' +
    'fcfc16bc05d3a8a7' + '722f1b269e1869c4' +
    '0d4934bd650cc449' + '723c822dd8544964' +
    'e188daf57c837bdf' + '310707008c56e004' +
    'ba6732f72d38d409' + '096b7028461e9546' +
    '12d95af53631aaa7' + '7186e81063b6fae5' +
    '1b55e051939e1dc5' + '07139f76f1fe2a5d' +
    'e7f1a52144ac119b' + '0214a3a4e468a1e1' +
    'db80c61f39374602' + 'a5c3cd4086f75cfd' +
    'e1f7ff3a9bdcfe62' + 'fb0840e6cfb265de' +
    '3e47bd3b67e4e0f0' + '3ab57943ae7c204f' +
    '3f8508d9c5c52767' + '079155f54973d2f5' +
    '2f5b281a11841961' + '842e27003c786a52' +
    '7ec770476db38d6f' + '79efb338a107dcbc' +
    'd08ae2521b1a43d6' + 'dcc323f665d01993' +
    '416ac94b2a1d05ef' + '684276533265c665' +
    'ceb52ce8e80c632c' + '5591f3c3e1667685' +
    '76590dba8d924713' + '78eb6e2197fed99f'
}

var KBundle = require('../../bundle/bundle')(fakeCrypto(accountKeys.keyFetchToken), P, hkdf)
var KToken = require('../../models/token')(inherits, KBundle)

var SBundle = require('../../bundle/bundle')(fakeCrypto(useSession.sessionToken), P, hkdf)
var SToken = require('../../models/token')(inherits, SBundle)

var RBundle = require('../../bundle/bundle')(fakeCrypto(accountReset.accountResetToken), P, hkdf)
var RToken = require('../../models/token')(inherits, RBundle)

var KeyFetchToken = require('../../models/key_fetch_token')(inherits, KToken, dbs.store)
var AccountResetToken = require('../../models/account_reset_token')(inherits, RToken, crypto, dbs.store)
var SessionToken = require('../../models/session_token')(inherits, SToken, dbs.store)

var AuthToken = require('../../models/auth_token')(inherits, SToken, dbs.store)
var tokens = {
  AuthToken: AuthToken,
  KeyFetchToken: KeyFetchToken,
  AccountResetToken: AccountResetToken,
  SessionToken: SessionToken
}

function FakeAccount() {
  this.sessionTokenIds = {}
  this.resetTokenId = null
}
var account = new FakeAccount()
FakeAccount.get = function () { return P(account) }
FakeAccount.prototype.addSessionToken = function (t) {
  this.sessionTokenIds[t.id] = true
  return P(null)
}
FakeAccount.prototype.setAuthToken = function (t) {
  this.authTokenId = t.id
  return P(null)
}

var AuthBundle = require('../../models/auth_bundle')(inherits, require('../../bundle'), FakeAccount, tokens)

test(
  'create / get',
  function (t) {
    KeyFetchToken.create('xxx')
      .then(
        function () {
          return KeyFetchToken.get(accountKeys.tokenId)
        }
      )
      .done(
        function (token) {
          t.equal(token.uid, 'xxx')
          t.equal(token.id.toString('hex'), accountKeys.tokenId)
          t.equal(token.key.toString('hex'), accountKeys.key)
          t.equal(token.hmacKey.toString('hex'), accountKeys.hmacKey)
          t.equal(token.xorKey.toString('hex'), accountKeys.xorKey)
          t.end()
        },
        function (err) {
          t.fail(err)
          t.end()
        }
      )
  }
)

test(
  '/account/keys',
  function (t) {
    KeyFetchToken.create('xxx')
      .done(
        function (token) {
          t.equal(token.uid, 'xxx')
          t.equal(token.id.toString('hex'), accountKeys.tokenId)
          t.equal(token.key.toString('hex'), accountKeys.key)
          t.equal(token.hmacKey.toString('hex'), accountKeys.hmacKey)
          t.equal(token.xorKey.toString('hex'), accountKeys.xorKey)

          var b = token.bundle(accountKeys.kA, accountKeys.wrapKb)
          t.equal(b.toString('hex'), accountKeys.ciphertext + accountKeys.hmac)
          t.end()
        },
        function (err) {
          t.fail(err)
          t.end()
        }
      )
  }
)

// test(
//   '/session/auth/finish',
//   function (t) {
//     account = new FakeAccount()
//     AuthBundle.login(sessionAuth.K, 'xxx')
//       .done(
//         function (authBundle) {
//           var b = authBundle.bundle
//           t.equal(b, sessionAuth.ciphertext + sessionAuth.hmac)
//           t.end()
//         },
//         function (err) {
//           t.fail(err)
//           t.end()
//         }
//       )
//   }
// )

// test(
//   '/password/change/auth/finish',
//   function (t) {
//     account = new FakeAccount()
//     AuthBundle.passwordChange(sessionAuth.K, 'xxx')
//       .done(
//         function (changePasswordBundle) {
//           var b = changePasswordBundle.bundle
//           t.equal(b, passwordChange.ciphertext + passwordChange.hmac)
//           t.end()
//         },
//         function (err) {
//           t.fail(err)
//           t.end()
//         }
//       )
//   }
// )

test(
  'login sets authToken on account',
  function (t) {
    account = new FakeAccount()
    t.equal(!!account.authTokenId, false)
    AuthBundle.login(sessionAuth.K, 'xxx')
      .done(
        function () {
          t.equal(!!account.authTokenId, true)
          t.end()
        },
        function (err) {
          t.fail(err)
          t.end()
        }
      )
  }
)

test(
  'teardown',
  function (t) {
    dbs.cache.close()
    dbs.store.close()
    t.end()
  }
)
