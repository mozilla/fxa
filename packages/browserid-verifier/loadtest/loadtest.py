
import json
import time
import random

import browserid
import browserid.jwt
from browserid.tests.support import make_assertion

from loads import TestCase


PERCENT_INVALID_REQUESTS = 50

ONE_YEAR = 60 * 60 * 24 * 365

MOCKMYID_DOMAIN = "mockmyid.s3-us-west-2.amazonaws.com"
MOCKMYID_PRIVATE_KEY = browserid.jwt.DS128Key({
    "algorithm": "DS",
    "x": "385cb3509f086e110c5e24bdd395a84b335a09ae",
    "y": "738ec929b559b604a232a9b55a5295afc368063bb9c20fac4e53a74970a4db795"
         "6d48e4c7ed523405f629b4cc83062f13029c4d615bbacb8b97f5e56f0c7ac9bc1"
         "d4e23809889fa061425c984061fca1826040c399715ce7ed385c4dd0d40225691"
         "2451e03452d3c961614eb458f188e3e8d2782916c43dbe2e571251ce38262",
    "p": "ff600483db6abfc5b45eab78594b3533d550d9f1bf2a992a7a8daa6dc34f8045a"
         "d4e6e0c429d334eeeaaefd7e23d4810be00e4cc1492cba325ba81ff2d5a5b305a"
         "8d17eb3bf4a06a349d392e00d329744a5179380344e82a18c47933438f891e22a"
         "eef812d69c8f75e326cb70ea000c3f776dfdbd604638c2ef717fc26d02e17",
    "q": "e21e04f911d1ed7991008ecaab3bf775984309c3",
    "g": "c52a4a0ff3b7e61fdf1867ce84138369a6154f4afa92966e3c827e25cfa6cf508b"
         "90e5de419e1337e07a2e9e2a3cd5dea704d175f8ebf6af397d69e110b96afb17c7"
         "a03259329e4829b0d03bbc7896b15b4ade53e130858cc34d96269aa89041f40913"
         "6c7242a38895c9d5bccad4f389af1d7a4bd1398bd072dffa896233397a",
})


INVALID_PRIVATE_KEY = browserid.jwt.DS128Key({
    "algorithm": "DS",
    "x": "abcdef0123456789abcdef0123456789abcdef01",
    "y": "738ec929b559b604a232a9b55a5295afc368063bb9c20fac4e53a74970a4db795"
         "6d48e4c7ed523405f629b4cc83062f13029c4d615bbacb8b97f5e56f0c7ac9bc1"
         "d4e23809889fa061425c984061fca1826040c399715ce7ed385c4dd0d40225691"
         "2451e03452d3c961614eb458f188e3e8d2782916c43dbe2e571251ce38262",
    "p": "ff600483db6abfc5b45eab78594b3533d550d9f1bf2a992a7a8daa6dc34f8045a"
         "d4e6e0c429d334eeeaaefd7e23d4810be00e4cc1492cba325ba81ff2d5a5b305a"
         "8d17eb3bf4a06a349d392e00d329744a5179380344e82a18c47933438f891e22a"
         "eef812d69c8f75e326cb70ea000c3f776dfdbd604638c2ef717fc26d02e17",
    "q": "e21e04f911d1ed7991008ecaab3bf775984309c3",
    "g": "c52a4a0ff3b7e61fdf1867ce84138369a6154f4afa92966e3c827e25cfa6cf508b"
         "90e5de419e1337e07a2e9e2a3cd5dea704d175f8ebf6af397d69e110b96afb17c7"
         "a03259329e4829b0d03bbc7896b15b4ade53e130858cc34d96269aa89041f40913"
         "6c7242a38895c9d5bccad4f389af1d7a4bd1398bd072dffa896233397a",
})


class VerifierLoadTest(TestCase):

    server_url = "https://verifier.stage.mozaws.net"

    def _make_assertion(self, email=None, audience=None, **kwds):
        if email is None:
            email = "user%d@%s" % (random.randint(0, 1000000), MOCKMYID_DOMAIN)
        if audience is None:
            audience = "https://secret.mozilla.com"
        if "exp" not in kwds:
            kwds["exp"] = int((time.time() + ONE_YEAR) * 1000)
        if "issuer" not in kwds:
            kwds["issuer"] = MOCKMYID_DOMAIN
        if "issuer_keypair" not in kwds:
            kwds["issuer_keypair"] = (None, MOCKMYID_PRIVATE_KEY)
        return make_assertion(email, audience, **kwds)

    def _verify_assertion(self, assertion, audience=None, **kwds):
        if assertion is None:
            assertion = self._make_assertion()
        if audience is None:
            audience = "https://secret.mozilla.com"
        body = {
            "assertion": assertion,
            "audience": audience,
        }
        body.update(kwds)
        body = json.dumps(body)
        r = self.session.post(self.server_url + "/v2", body, headers={
            "Content-Type": "application/json"
        })
        self.assertEquals(r.status_code, 200)
        return json.loads(r.content)

    def test_verifier(self):
        if random.randint(0, 99) < PERCENT_INVALID_REQUESTS:
            self.test_invalid_assertion()
        else:
            self.test_valid_assertion()

    def test_valid_assertion(self):
        assertion = self._make_assertion()
        data = self._verify_assertion(assertion)
        self.assertEquals(data["status"], "okay")

    def test_invalid_assertion(self):
        # Randomly pick and run a _test_invalid_assertion_<foo>() method.
        tests = []
        for nm in dir(self):
            if nm.startswith("_test_invalid_assertion"):
                tests.append(getattr(self, nm))
        random.choice(tests)()

    def _test_invalid_assertion_nonprimary(self):
        assertion = self._make_assertion("test@mozilla.com")
        data = self._verify_assertion(assertion)
        self.assertEquals(data["status"], "failure")

    def _test_invalid_assertion_expired(self):
        exp = int(time.time() - ONE_YEAR) * 1000,
        assertion = self._make_assertion(exp=exp)
        data = self._verify_assertion(assertion)
        self.assertEquals(data["status"], "failure")

    def _test_invalid_assertion_wrongissuer(self):
        assertion = self._make_assertion(issuer="login.mozilla.org")
        data = self._verify_assertion(assertion)
        self.assertEquals(data["status"], "failure")

    def _test_invalid_assertion_wrongkey(self):
        issuer_keypair = (None, INVALID_PRIVATE_KEY)
        assertion = self._make_assertion(issuer_keypair=issuer_keypair)
        data = self._verify_assertion(assertion)
        self.assertEquals(data["status"], "failure")
