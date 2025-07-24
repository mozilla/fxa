"""
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0
"""

# Note, this is NOT finished yet - still need a requirements file, steps to install,
# steps in CI for installing, and much more.

import sys
from marionette_driver.marionette import Marionette
from marionette_driver import Wait
from marionette_driver.errors import NoSuchElementException

# Launch Firefox with Marionette
client = Marionette(host='localhost', port=2828)
client.start_session()
client.set_context(Marionette.CONTEXT_CONTENT)

if len(sys.argv) > 1:
    SCREENSHOT_PATH_BASE = sys.argv[1]
else:
    raise ValueError("Screenshot path must be provided as a command-line argument.")

try:
    # build screenshot path with file name
    SCREENSHOT_PATH = f"{SCREENSHOT_PATH_BASE}/pairing_qr_screenshot.png"

    # Should add a wait here to ensure the page is loaded and
    # QR code is visible
    # client.find_element('id', 'pairingQrCode')

    # save screenshot
    with open(SCREENSHOT_PATH, "wb") as fh:
        client.save_screenshot(fh=fh)

    print(SCREENSHOT_PATH)  # Print the path so it can be captured by the caller if necessary

except Exception as e:
    print(f"An error occurred: {e}")
finally:
    print('Cleaning up...')
    client.delete_session()
