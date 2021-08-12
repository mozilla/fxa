# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

codes-reminder-title = Low recovery codes remaining
codes-reminder-description = We noticed that you are running low on recovery codes. Please consider generating new codes to avoid getting locked out of your account.
codes-generate = Generate codes:
lowRecoveryCodes-subject =
    { NUMBER($numberRemaining) ->
        [one] 1 recovery code remaining
       *[other] { NUMBER($numberRemaining) } recovery codes remaining
    }
