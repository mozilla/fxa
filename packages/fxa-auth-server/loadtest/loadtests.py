
import os
import copy
import hmac
import json
import math
import base64
import random
import hashlib
import binascii
import urlparse
import hawkauthlib

from requests.auth import AuthBase

from loads import TestCase


# Error constants used by the fxa-auth-server API.

ERROR_ACCOUNT_EXISTS = 101
ERROR_UNKNOWN_ACCOUNT = 102


# The tests need a public key for the server to sign, but we don't actually
# do anything with it.  It suffices to use a fixed dummy key throughout.

DUMMY_PUBLIC_KEY = {
    'algorithm': 'RS',
    'n': '475938596723561050357149433919674961454460669256778579' \
         '095393476820271428065297309134131686299358278907987200' \
         '7974809511698859885077002492642203267408776123',
    'e': '65537',
}


# We don't want to do any key-stretching during the loadtest, because it
# takes a long time.  Instead we start from a fixed set of SRP credentials
# and mix in just enough user-account-specific information to make the
# authentication work properly.

DUMMY_CREDENTIALS = {
    'email': None,
    'srpPw': 'f6c1cc977d2811c55f0260f0318c8cbe13d215' \
             '120f5d4f1113b33f32db670e81',
    'unwrapBKey': 'c8bdcea80dd5ebc94b870f57b840a5f9ea1d82d5e' \
                  'ae72a5081831c7f3667be74',
    'srp': {
      'type': 'SRP-6a/SHA256/2048/v1',
      'salt': 'f4f435710b693852e6602a58c902a37539e4ce8' \
              '351c6495f0b28b4c5cbad0cd4',
      'verifier': None,
    },
    'passwordStretching': {
        'type': 'PBKDF2/scrypt/PBKDF2/v1',
        'PBKDF2_rounds_1': 20000,
        'scrypt_N': 65536,
        'scrypt_r': 8,
        'scrypt_p': 1,
        'PBKDF2_rounds_2': 20000,
        'salt': 'AAAAAA'
    },
}


# Build an SRP verifier to go with the dummy credentials defined above.

SRP_N = int('AC6BDB41 324A9A9B F166DE5E 1389582F AF72B665 1987EE07 FC319294' \
            '3DB56050 A37329CB B4A099ED 8193E075 7767A13D D52312AB 4B03310D' \
            'CD7F48A9 DA04FD50 E8083969 EDB767B0 CF609517 9A163AB3 661A05FB' \
            'D5FAAAE8 2918A996 2F0B93B8 55F97993 EC975EEA A80D740A DBF4FF74' \
            '7359D041 D5C33EA7 1D281E44 6B14773B CA97B43A 23FB8016 76BD207A' \
            '436C6481 F1D2B907 8717461A 5B9D32E6 88F87748 544523B5 24B0D57D' \
            '5EA77A27 75D2ECFA 032CFBDB F52FB378 61602790 04E57AE6 AF874E73' \
            '03CE5329 9CCC041C 7BC308D8 2A5698F3 A8D0C382 71AE35F8 E9DBFBB6' \
            '94B5C803 D89F7AE4 35DE236D 525F5475 9B65E372 FCD68EF2 0FA7111F'
            '9E4AFF73'.replace(' ', ''), 16)

SRP_N_bitlength = 2048


SRP_g = 2


def SRP_HASH(bytes):
    return hashlib.sha256(bytes).digest()


def get_dummy_srp_x(email):
    """Build an SRP 'x' to go with DUMMY_CREDENTIALS for the given email."""
    salt = DUMMY_CREDENTIALS['srp']['salt'].decode('hex')
    pwd = DUMMY_CREDENTIALS['srpPw'].decode('hex')
    return bytes2int(SRP_HASH(salt + SRP_HASH(email + ":" + pwd)))


def get_dummy_srp_v(email):
    """Build an SRP 'v' to go with DUMMY_CREDENTIALS for the given email."""
    x = get_dummy_srp_x(email)
    v = int2bytes(pow(SRP_g, x, SRP_N)).encode('hex')
    while len(v) < 512:
        v = "0" + v
    assert len(v) == 512
    return v


def int2bytes(x, size=None):
    """Convert a Python integer to bigendian bytestring."""
    hexbytes = hex(x)[2:].rstrip("L").encode("ascii")
    if len(hexbytes) % 2:
        hexbytes = "0" + hexbytes
    if size is not None:
        while len(hexbytes) < size * 2:
            hexbytes = "00" + hexbytes
        assert len(hexbytes) == size * 2
    return binascii.unhexlify(hexbytes)


def bytes2int(bytes):
    """Convert a bigendian bytestring to a Python integer."""
    hexbytes = binascii.hexlify(bytes)
    return int(hexbytes, 16)


def uniq(size=10):
    """Generate a short random hex string."""
    return os.urandom(size // 2 + 1).encode('hex')[:size]


def HKDF_extract(salt, IKM, hashmod=hashlib.sha256):
    """HKDF-Extract; see RFC-5869 for the details."""
    if salt is None:
        salt = b"\x00" * hashmod().digest_size
    return hmac.new(salt, IKM, hashmod).digest()


def HKDF_expand(PRK, info, L, hashmod=hashlib.sha256):
    """HKDF-Expand; see RFC-5869 for the details."""
    digest_size = hashmod().digest_size
    N = int(math.ceil(L * 1.0 / digest_size))
    assert N <= 255
    T = b""
    output = []
    for i in xrange(1, N + 1):
        data = T + info + chr(i)
        T = hmac.new(PRK, data, hashmod).digest()
        output.append(T)
    return b"".join(output)[:L]


def HKDF(secret, salt, info, size, hashmod=hashlib.sha256):
    """HKDF-extract-and-expand as a single function."""
    PRK = HKDF_extract(salt, secret, hashmod)
    return HKDF_expand(PRK, info, size, hashmod)


def derive_bundle_keys(key, keyInfo, size):
    keyInfo = 'identity.mozilla.com/picl/v1/' + keyInfo
    keyMaterial = HKDF(key, "", keyInfo, 32 + size)
    return keyMaterial[:32], keyMaterial[32:]


def unbundle(key, keyInfo, payload):
    hmacKey, xorKey = derive_bundle_keys(key, keyInfo, len(payload))
    ciphertext = payload[0:-32]
    expectedHmac = payload[-32:]
    actualHmac = hmac.new(hmacKey, ciphertext, hashlib.sha256).digest()
    if expectedHmac != actualHmac:
        raise ValueError("bad hmac", expectedHmac, actualHmac)
    plaintext = []
    for i in xrange(len(ciphertext)):
        plaintext.append(chr(ord(ciphertext[i]) ^ ord(xorKey[i])))
    return "".join(plaintext)


class HawkAuth(AuthBase):

    def __init__(self, server_url, tokendata, tokentype):
        self.server_url = server_url
        keyInfo = 'identity.mozilla.com/picl/v1/' + tokentype
        keyMaterial = HKDF(tokendata, "", keyInfo, 32*3)
        self.tokenid = keyMaterial[:32]
        self.authKey = keyMaterial[32:64]
        self.bundleKey = keyMaterial[64:]

    def __call__(self, req):
        # Requets doesn't seem to include the port in the Host header,
        # and loads replaces hostnames with IPs.  Undo all this rubbish
        # so that we can calculate the correct signature.
        req.headers['Host'] = urlparse.urlparse(self.server_url).netloc
        id = self.tokenid.encode('hex')
        params = {}
        if req.body:
            payloadStr = 'hawk.1.payload\napplication/json\n'
            payloadStr += req.body + '\n'
            params['hash'] = base64.b64encode(SRP_HASH(payloadStr))
        hawkauthlib.sign_request(req, id, self.authKey, params=params)
        return req


class LoadTest(TestCase):

    server_url = 'http://api-accounts.loadtest.lcip.org'
    #server_url = 'http://127.0.0.1:9000/'

    def makeurl(self, path):
        return urlparse.urljoin(self.server_url, path)

    def makehawkauth(self, tokendata, tokentype):
        return HawkAuth(self.server_url, tokendata, tokentype)

    def setUp(self):
        super(LoadTest, self).setUp()
        self.credentials = copy.deepcopy(DUMMY_CREDENTIALS)
        self.tokens = {}

    def tearDown(self):
        self.tokens = None
        self.credentials = None
        super(LoadTest, self).tearDown()

    def test_auth_server(self):
        self._pick_user_and_authenticate()
        if 'keyfetch' in self.tokens:
            self._fetch_keys()
        self._fetch_random_bytes()
        for i in xrange(random.randint(10, 100)):
            self._sign_public_key()

    def _pick_user_and_authenticate(self):
        email = self._pick_user()
        if "new" in email:
            self._authenticate_as_new_user()
        else:
            self._authenticate_as_existing_user()

    def _pick_user(self):
        # User emails look like this:
        #
        #    loads-<id>-(raw|srp)-(old|new)@restmail.lcip.org
        #
        # The components mean:
        #    * id:   randomly-generated id
        #    * raw:  uses /raw_password auth endpoints
        #    * srp:  uses srp-protocol auth endpoints
        #    * old:  we expect this account to already exist
        #    * new:  we expect this account to not exist
        #
        # Note that we can't mix 'raw' and 'srp' operations on the one account
        # because then we'd have to do keystretching in the loadtest client.
        #
        # We want the following ratios:
        #   * 2 new-user signup per 10 existing-account logins
        #   * 50/50 split between raw and srp authentication methods
        #
        auth = random.choice(['raw', 'srp'])
        status = random.choice((['new'] * 2) + (['old'] * 10))
        if status == 'old':
            id = str(random.randint(1, 999))
        else:
            id =  uniq()
        email = "loads-%s-%s-%s@restmail.lcip.org" % (id, auth, status)
        self.credentials['email'] = email.encode('hex')
        return email

    def _authenticate_as_new_user(self):
        # Authenticate as a brand-new user account.
        # Assume it doesn't exist, try to create the account.
        # But it's not big deal if it happens to already exist.
        email = self.credentials['email'].decode('hex')
        self.credentials['srp']['verifier'] = get_dummy_srp_v(email)
        res = self._create_account()
        if res.status_code != 200:
            self.assertEqual(res.status_code, 400)
            err = res.json()
            self.assertEqual(err['errno'], ERROR_ACCOUNT_EXISTS)
        res = self._start_session()
        self.assertEqual(res.status_code, 200)
        return res

    def _authenticate_as_existing_user(self):
        # Authenticate as an existing user account.
        # We select from a small pool of known accounts, creating it
        # if it does not exist.  This should mean that all the accounts
        # are created quickly at the start of the loadtest run.
        email = self.credentials['email'].decode('hex')
        self.credentials['srp']['verifier'] = get_dummy_srp_v(email)
        res = self._start_session()
        if res.status_code != 200:
            self.assertEqual(res.status_code, 400)
            err = res.json()
            self.assertEqual(err['errno'], ERROR_UNKNOWN_ACCOUNT)
            res = self._create_account()
            # Account creation might fail in turn, due to a race condition.
            if res.status_code != 200:
                self.assertEqual(res.status_code, 400)
                err = res.json()
                self.assertEqual(err['errno'], ERROR_ACCOUNT_EXISTS)
            res = self._start_session()
            self.assertEqual(res.status_code, 200)
        return res

    def _create_account(self):
        email = self.credentials['email'].decode('hex')
        if "srp" in email:
            return self._create_account_srp()
        else:
            return self._create_account_raw()

    def _create_account_srp(self):
        res = self._req_POST('/v1/account/create', {
          'email': self.credentials['email'],
          'srp': self.credentials['srp'],
          'passwordStretching': self.credentials['passwordStretching'],
        })
        return res

    def _create_account_raw(self):
        res = self._req_POST('/v1/raw_password/account/create', {
          'email': self.credentials['email'],
          'password': 'password',
        })
        return res

    def _start_session(self):
        email = self.credentials['email'].decode('hex')
        if "srp" in email:
            return self._start_session_srp()
        else:
            return self._start_session_raw()

    def _start_session_srp(self):
        # Grab the srp session token.
        res = self._req_POST('/v1/auth/start', {
          'email': self.credentials['email'],
        })
        if res.status_code != 200:
            return res
        authdata = res.json()
        self.assertEqual(authdata['srp']['salt'],
                         self.credentials['srp']['salt'])
        # SRP mumbo-jumbo.  Should hand this off to a library...
        n = SRP_N_bitlength / 8
        B = binascii.unhexlify(authdata['srp']['B'])
        self.assertNotEqual(bytes2int(B) % SRP_N, 0)
        a = bytes2int(os.urandom(32)) % SRP_N
        A = int2bytes(pow(SRP_g, a, SRP_N), n)
        while not bytes2int(A):
            a = bytes2int(os.urandom(32)) % SRP_N
            A = int2bytes(pow(SRP_g, a, SRP_N), n)
        k = bytes2int(SRP_HASH(int2bytes(SRP_N, n) + int2bytes(SRP_g, n)))
        x = get_dummy_srp_x(binascii.unhexlify(self.credentials['email']))
        u = bytes2int(SRP_HASH(A + B))
        s = bytes2int(B) - (k * pow(SRP_g, x, SRP_N))
        S = int2bytes(pow(s, a + u * x, SRP_N), n)
        K = SRP_HASH(S)
        M = SRP_HASH(A + B + S)
        # Complete the srp handshake.
        res = self._req_POST('/v1/auth/finish', {
          'srpToken': authdata['srpToken'],
          'A': A.encode('hex'),
          'M': M.encode('hex'),
        })
        if res.status_code != 200:
            return res
        authbundle = binascii.unhexlify(res.json()['bundle'])
        authtoken = unbundle(K, 'auth/finish', authbundle)
        # Trade authtoken for a sessiontoken.
        auth = self.makehawkauth(authtoken, 'authToken')
        res = self._req_POST('/v1/session/create', {}, auth=auth)
        if res.status_code != 200:
            return res
        bundle = binascii.unhexlify(res.json()['bundle'])
        tokenData = unbundle(auth.bundleKey, 'session/create', bundle)
        self.tokens['keyfetch'] = tokenData[:32]
        self.tokens['session'] = tokenData[32:]
        return res

    def _start_session_raw(self):
        res = self._req_POST('/v1/raw_password/session/create', {
          'email': self.credentials['email'],
          'password': 'password',
        })
        if res.status_code != 200:
            return res
        sessionToken = res.json()['sessionToken']
        self.tokens['session'] = sessionToken.decode('hex')
        return res

    def _fetch_keys(self):
        auth = self.makehawkauth(self.tokens.pop('keyfetch'), 'keyFetchToken')
        res = self._req_GET('/v1/account/keys', auth=auth)
        self.assertEqual(res.status_code, 200)
        return res

    def _fetch_random_bytes(self):
        res = self._req_POST('/v1/get_random_bytes', {})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()['data']), 64)
        return res

    def _sign_public_key(self):
        auth = self.makehawkauth(self.tokens['session'], 'sessionToken')
        payload = {
            'publicKey': DUMMY_PUBLIC_KEY,
            'duration': 1000,
        }
        res = self._req_POST('/v1/certificate/sign', payload, auth=auth)
        self.assertEqual(res.status_code, 200)
        return res

    # Raw request-making methods.
    # These are just skinny helpers over the methods on self.session.

    def _req_GET(self, url, auth=None):
        url = self.makeurl(url)
	return self.session.get(url, auth=auth)

    def _req_POST(self, url, payload, auth=None):
        url = self.makeurl(url)
        data = json.dumps(payload)
        headers = {
            'Content-Type': 'application/json',
        }
	return self.session.post(url, data=data, auth=auth, headers=headers)
