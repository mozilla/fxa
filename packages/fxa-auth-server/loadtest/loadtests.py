
import os
import hmac
import json
import math
import random
import hashlib
import urlparse
import hawkauthlib
from base64 import b64encode

from requests.auth import AuthBase

from loads import TestCase


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
        self.credentials = {}
        self.tokens = {}

    def tearDown(self):
        self.tokens = None
        self.credentials = None
        super(LoadTest, self).tearDown()

    def test_auth_server(self):
        self._pick_user_and_authenticate()
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
        #    loads-<id>-(old|new)@restmail.net
        #
        # The components mean:
        #    * id:   randomly-generated id
        #    * old:  we expect this account to already exist
        #    * new:  we expect this account to not exist
        #
        # We want 2 new-user signups per 10 existing-account logins.
        #
        status = random.choice((['new'] * 2) + (['old'] * 10))
        if status == 'old':
            id = str(random.randint(1, 999))
        else:
            id = uniq()
        email = "loads-%s-%s@restmail.lcip.org" % (id, status)
        self.credentials['email'] = email
        self.credentials['authPW'] = hashlib.sha256(email).hexdigest()
        return email

    def _authenticate_as_new_user(self):
        # Authenticate as a brand-new user account.
        # Assume it doesn't exist, try to create the account.
        # But it's not big deal if it happens to already exist.
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
