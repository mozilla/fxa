
import os
import random
import hashlib

import fxa.errors
from fxa._utils import APIClient
from fxa.core import Client

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


class LoadTest(TestCase):

    server_url = 'https://api-accounts.stage.mozaws.net'


    def setUp(self):
        super(LoadTest, self).setUp()
        self.client = Client(APIClient(self.server_url, session=self.session))

    def test_auth_server(self):
        # Authenticate as a new or existing user.
        if random.randint(0, 100) < ACCOUNT_CREATE_PERCENT:
            session = self._authenticate_as_new_user()
        else:
            session = self._authenticate_as_existing_user()
        # Fetch keys and make some number of signing requests.
        session.fetch_keys()
        session.check_session_status()
        session.get_random_bytes()
        num_sign_reqs = random.randint(SIGN_REQS_MIN, SIGN_REQS_MAX)
        for i in xrange(num_sign_reqs):
            session.sign_certificate(DUMMY_PUBLIC_KEY)
        # Teardown the session, and maybe the whole account.
        session.destroy_session()
        if random.randint(0, 100) < ACCOUNT_DELETE_PERCENT:
            self.client.destroy_account(
                email=session.email,
                stretchpwd=self._get_stretchpwd(session.email),
            )

    def _get_stretchpwd(self, email):
        return hashlib.sha256(email).hexdigest()

    def _authenticate_as_new_user(self):
        # Authenticate as a brand-new user account.
        # Assume it doesn't exist, try to create the account.
        # But it's not big deal if it happens to already exist.
        email = "loads-fxa-%s-new@restmail.lcip.org" % (uniq(),)
        kwds = {
            "email": email,
            "stretchpwd": self._get_stretchpwd(email),
            "keys": True,
            "preVerified": True,
        }
        try:
            return self.client.create_account(**kwds)
        except fxa.errors.ClientError, e:
            if e.errno != ERROR_ACCOUNT_EXISTS:
                raise
            kwds.pop("preVerified")
            return self.client.login(**kwds)

    def _authenticate_as_existing_user(self):
        # Authenticate as an existing user account.
        # We select from a small pool of known accounts, creating it
        # if it does not exist.  This should mean that all the accounts
        # are created quickly at the start of the loadtest run.
        email = "loads-fxa-%s-old@restmail.lcip.org" % (random.randint(1, 999),)
        kwds = {
            "email": email,
            "stretchpwd": self._get_stretchpwd(email),
            "keys": True,
        }
        try:
            return self.client.login(**kwds)
        except fxa.errors.ClientError, e:
            if e.errno != ERROR_UNKNOWN_ACCOUNT:
                raise
            kwds["preVerified"] = True
            # Account creation might likewise fail due to a race.
            try:
                return self.client.create_account(**kwds)
            except fxa.errors.ClientError, e:
                if e.errno != ERROR_ACCOUNT_EXISTS:
                    raise
                # Assume a normal login will now succeed.
                kwds.pop("preVerified")
                return self.client.login(**kwds)
