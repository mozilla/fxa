
import os
import hmac
import json
import math
import time
import random
import hashlib
import urlparse
import hawkauthlib
from base64 import b64encode

from requests.auth import AuthBase

from loads import TestCase

# Parameters to affect the proportion of various reqs in the loadtest.

ACCOUNT_CREATE_PERCENT = 20  # percent of runs that should create a new account
ACCOUNT_DELETE_PERCENT = 10  # percent of runs that should delete the account
SIGN_REQS_MIN = 10   # range for number of key-sign requests per run
SIGN_REQS_MAX = 100

# Error constants used by the fxa-auth-server API.

ERROR_ACCOUNT_EXISTS = 101
ERROR_UNKNOWN_ACCOUNT = 102


# The tests need a public key for the server to sign, but we don't actually
# do anything with it.  It suffices to use a fixed dummy key throughout.

DUMMY_PUBLIC_KEY = {
    'algorithm': 'RS',
    'n': '475938596723561050357149433919674961454460669256778579'
         '095393476820271428065297309134131686299358278907987200'
         '7974809511698859885077002492642203267408776123',
    'e': '65537',
}


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


class HawkAuth(AuthBase):

    timeskew = 0

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
            params['hash'] = b64encode(hashlib.sha256(payloadStr).digest())
        params["ts"] = str(int(time.time()) + self.timeskew)
        hawkauthlib.sign_request(req, id, self.authKey, params=params)
        return req


class LoadTest(TestCase):

    server_url = 'https://api-accounts.stage.mozaws.net'

    def makeurl(self, path):
        return urlparse.urljoin(self.server_url, path)

    def makehawkauth(self, tokendata, tokentype):
        return HawkAuth(self.server_url, tokendata, tokentype)

    def setUp(self):
        super(LoadTest, self).setUp()
        self.credentials = {}
        self.tokens = {}

    def tearDown(self):
        self.tokens = None
        self.credentials = None
        super(LoadTest, self).tearDown()

    def test_auth_server(self):
        # Authenticate as a new or existing user.
        if random.randint(0, 100) < ACCOUNT_CREATE_PERCENT:
            self._authenticate_as_new_user()
        else:
            self._authenticate_as_existing_user()
        # Fetch keys and make some number of signing requests.
        self._fetch_keys()
        self._fetch_session_status()
        self._fetch_random_bytes()
        num_sign_reqs = random.randint(SIGN_REQS_MIN, SIGN_REQS_MAX)
        for i in xrange(num_sign_reqs):
            self._sign_public_key()
        # Teardown the session, and maybe the whole account.
        self._destroy_session()
        if random.randint(0, 100) < ACCOUNT_DELETE_PERCENT:
            self._destroy_account()

    def _setup_credentials(self, email):
        self.credentials['email'] = email
        self.credentials['authPW'] = hashlib.sha256(email).hexdigest()

    def _authenticate_as_new_user(self):
        # Authenticate as a brand-new user account.
        # Assume it doesn't exist, try to create the account.
        # But it's not big deal if it happens to already exist.
        email = "loads-%s-new@restmail.lcip.org" % (uniq(),)
        self._setup_credentials(email)
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
        email = "loads-%s-old@restmail.lcip.org" % (random.randint(1, 999),)
        self._setup_credentials(email)
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
        res = self._req_POST('/v1/account/create', {
            'email': self.credentials['email'],
            'authPW': self.credentials['authPW'],
            'preVerified': True,
        })
        return res

    def _start_session(self):
        res = self._req_POST('/v1/account/login?keys=true', {
            'email': self.credentials['email'],
            'authPW': self.credentials['authPW'],
        })
        if res.status_code != 200:
            return res
        body = res.json()
        self.assertTrue(body['verified'])
        self.tokens['session'] = body['sessionToken'].decode('hex')
        self.tokens['keyfetch'] = body['keyFetchToken'].decode('hex')
        return res

    def _fetch_keys(self):
        auth = self.makehawkauth(self.tokens['keyfetch'], 'keyFetchToken')
        res = self._req_GET('/v1/account/keys', auth=auth)
        self.assertEqual(res.status_code, 200)
        return res

    def _fetch_session_status(self):
        auth = self.makehawkauth(self.tokens['session'], 'sessionToken')
        res = self._req_GET('/v1/session/status', auth=auth)
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

    def _destroy_session(self):
        auth = self.makehawkauth(self.tokens['session'], 'sessionToken')
        res = self._req_POST('/v1/session/destroy', payload={}, auth=auth)
        self.assertEqual(res.status_code, 200)
        return res

    def _destroy_account(self):
        res = self._req_POST('/v1/account/destroy', {
            'email': self.credentials['email'],
            'authPW': self.credentials['authPW'],
        })
        self.assertEqual(res.status_code, 200)
        return res

    # Raw request-making methods.
    # These are just skinny helpers over the methods on self.session.

    def _req_GET(self, url, auth=None):
        url = self.makeurl(url)
        res = self.session.get(url, auth=auth)
        if self._maybe_adjust_timeskew(res):
            res = self.session.get(url, auth=auth)
        return res

    def _req_POST(self, url, payload, auth=None):
        url = self.makeurl(url)
        data = json.dumps(payload)
        headers = {
            'Content-Type': 'application/json',
        }
        res = self.session.post(url, data=data, auth=auth, headers=headers)
        if self._maybe_adjust_timeskew(res):
            res = self.session.post(url, data=data, auth=auth, headers=headers)
        return res

    def _maybe_adjust_timeskew(self, res):
        if res.status_code != 401:
            return False
        try:
            err = res.json()
        except Exception:
            return False
        if err.get("errno", 0) != 111:
            return False
        HawkAuth.timeskew = err["serverTime"] - int(time.time())
        return True
