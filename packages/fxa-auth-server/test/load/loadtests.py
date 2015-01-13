
import os
import random
import hashlib

import fxa.errors
from fxa._utils import APIClient
from fxa.core import Client

from loads import TestCase

# Parameters to affect the proportion of various reqs in the loadtest.
#
# This is loosely modelled on production traffic analysis performed in:
#
#    https://bugzilla.mozilla.org/show_bug.cgi?id=1097584
#
# Based on the above we aim for the following breakdown:
#
#    * 95% of tests are a login flow that does various session operations:
#        * 70% of these use an existing account
#        * 30% of these create a new account
#            * 10% of those call the resend_code endpoint
#            * 80% of those call the verify_code endpoint
#            * 2% of those will delete the account when they're done
#        * each flow does an average of 500 status poll operations
#          (this is by far the most frequent request in current prod traffic)
#        * each flow fetches the keys exactly once
#        * each flow does an average of 50 cert sign requests
#        * 20% of flows will explicitly check the session status
#        * 10% of flows will explicitly tear down the session once complete
#        * 5% of flows will generate some random bytes
#    * 3% of tests exercise the password reset flow
#    * 1% of tests exercise are the password change flow
#    * 1% of are simple requests for the browserid support document

PERCENT_TEST_LOGIN = 95
PERCENT_TEST_RESET = 3
PERCENT_TEST_CHANGE = 1
PERCENT_TEST_SUPPORTDOC = 1

PERCENT_LOGIN_CREATE = 30
PERCENT_LOGIN_CREATE_RESEND = 10
PERCENT_LOGIN_CREATE_VERIFY = 80
PERCENT_LOGIN_CREATE_DESTROY = 2
PERCENT_LOGIN_STATUS = 20
PERCENT_LOGIN_TEARDOWN = 10
PERCENT_LOGIN_RANDBYTES = 5

LOGIN_POLL_REQS_MIN = 10
LOGIN_POLL_REQS_MAX = 1000

LOGIN_SIGN_REQS_MIN = 10
LOGIN_SIGN_REQS_MAX = 90

# Error constants used by the fxa-auth-server API.

ERROR_ACCOUNT_EXISTS = 101
ERROR_UNKNOWN_ACCOUNT = 102
ERROR_INVALID_CODE = 105
ERROR_INVALID_TOKEN = 110


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

    def _pick(self, *choices):
        """Pick one from a list of (item, weighting) options."""
        sum_weights = sum(choice[1] for choice in choices)
        remainder = random.randint(0, sum_weights - 1)
        for choice, weight in choices:
            remainder -= weight
            if remainder < 0:
                return choice
        assert False, "somehow failed to pick from {}".format(choices)

    def _perc(self, percent):
        """Decide whether to do something, given desired percentage of runs."""
        return random.randint(0, 99) < percent

    def test_auth_server(self):
        """Top-level method to run a randomly-secleted auth-server test."""
        which_test = self._pick(
            (self.test_login_session_flow, PERCENT_TEST_LOGIN),
            (self.test_password_reset_flow, PERCENT_TEST_RESET),
            (self.test_password_change_flow, PERCENT_TEST_CHANGE),
            (self.test_support_doc_flow, PERCENT_TEST_SUPPORTDOC),
        )
        which_test()

    def test_login_session_flow(self):
        """Do a full login-flow with cert signing etc."""
        # Login as either a new or existing user.
        if self._perc(PERCENT_LOGIN_CREATE):
            session = self._authenticate_as_new_user()
            can_delete = True
        else:
            session = self._authenticate_as_existing_user()
            can_delete = False
        try:
            # Do a whole lot of account status polling.
            n_poll_reqs = random.randint(LOGIN_POLL_REQS_MIN,
                                         LOGIN_POLL_REQS_MAX)
            for i in xrange(n_poll_reqs):
                session.get_email_status()
            # Always fetch the keys.
            session.fetch_keys()
            # Sometimes check the session status.
            if self._perc(PERCENT_LOGIN_STATUS):
                session.check_session_status()
            # Sometimes get some random bytes.
            if self._perc(PERCENT_LOGIN_RANDBYTES):
                session.get_random_bytes()
            # Always do some number of signing requests.
            n_sign_reqs = random.randint(LOGIN_SIGN_REQS_MIN,
                                         LOGIN_SIGN_REQS_MAX)
            for i in xrange(n_sign_reqs):
                session.sign_certificate(DUMMY_PUBLIC_KEY)
            # Sometimes tear down the session.
            if self._perc(PERCENT_LOGIN_TEARDOWN):
                session.destroy_session()
        except fxa.errors.ClientError as e:
            # There's a small chance this could fail due to concurrent
            # password change destroying the session token.
            if e.errno != ERROR_INVALID_TOKEN:
                raise
        # Sometimes destroy the account.
        if can_delete:
            if self._perc(PERCENT_LOGIN_CREATE_DESTROY):
                self.client.destroy_account(
                    email=session.email,
                    stretchpwd=self._get_stretchpwd(session.email),
                )

    def _get_stretchpwd(self, email):
        return hashlib.sha256(email).hexdigest()

    def _get_new_user_email(self):
        uid = uniq()
        return "loads-fxa-{}-new@restmail.lcip.org".format(uid)

    def _get_existing_user_email(self):
        uid = random.randint(1, 999)
        return "loads-fxa-{}-old@restmail.lcip.org".format(uid)

    def _authenticate_as_new_user(self):
        # Authenticate as a brand-new user account.
        # Assume it doesn't exist, and try to create the account.
        # But it's not big deal if it happens to already exist.
        email = self._get_new_user_email()
        kwds = {
            "email": email,
            "stretchpwd": self._get_stretchpwd(email),
            "keys": True,
            "preVerified": True,
        }
        try:
            session = self.client.create_account(**kwds)
        except fxa.errors.ClientError as e:
            if e.errno != ERROR_ACCOUNT_EXISTS:
                raise
            kwds.pop("preVerified")
            session = self.client.login(**kwds)
        # Sometimes resend the confirmation email.
        if self._perc(PERCENT_LOGIN_CREATE_RESEND):
            session.resend_email_code()
        # Sometimes (pretend to) verify the confirmation code.
        if self._perc(PERCENT_LOGIN_CREATE_VERIFY):
            try:
                session.verify_email_code(uniq(32))
            except fxa.errors.ClientError as e:
                if e.errno != ERROR_INVALID_CODE:
                    raise
        return session

    def _authenticate_as_existing_user(self):
        # Authenticate as an existing user account.
        # We select from a small pool of known accounts, creating it
        # if it does not exist.  This should mean that all the accounts
        # are created quickly at the start of the loadtest run.
        email = self._get_existing_user_email()
        kwds = {
            "email": email,
            "stretchpwd": self._get_stretchpwd(email),
            "keys": True,
        }
        try:
            return self.client.login(**kwds)
        except fxa.errors.ClientError as e:
            if e.errno != ERROR_UNKNOWN_ACCOUNT:
                raise
            kwds["preVerified"] = True
            # Account creation might likewise fail due to a race.
            try:
                return self.client.create_account(**kwds)
            except fxa.errors.ClientError as e:
                if e.errno != ERROR_ACCOUNT_EXISTS:
                    raise
                # Assume a normal login will now succeed.
                kwds.pop("preVerified")
                return self.client.login(**kwds)

    def test_password_reset_flow(self):
        email = self._get_existing_user_email()
        pft = self.client.send_reset_code(email)
        # XXX TODO: how to get the reset code?
        # I don't want to actually poll restmail during a loadtest...
        pft.get_status()
        try:
            pft.verify_code("0" * 32)
        except fxa.errors.ClientError as e:
            if e.errno != ERROR_INVALID_CODE:
                raise
        pft.get_status()

    def test_password_change_flow(self):
        email = self._get_existing_user_email()
        stretchpwd = self._get_stretchpwd(email)
        try:
            self.client.change_password(
                email,
                oldstretchpwd=stretchpwd,
                newstretchpwd=stretchpwd,
            )
        except fxa.errors.ClientError as e:
            if e.errno != ERROR_UNKNOWN_ACCOUNT:
                raise
            # Create the "existing" account if it doens't yet exist.
            kwds = {
                "email": email,
                "stretchpwd": stretchpwd,
                "preVerified": True,
            }
            try:
                self.client.create_account(**kwds)
            except fxa.errors.ClientError as e:
                if e.errno != ERROR_UNKNOWN_ACCOUNT:
                    raise
            else:
                self.client.change_password(
                    email,
                    oldstretchpwd=stretchpwd,
                    newstretchpwd=stretchpwd,
                )

    def test_support_doc_flow(self):
        self.session.get(self.server_url + "/.well-known/browserid")
