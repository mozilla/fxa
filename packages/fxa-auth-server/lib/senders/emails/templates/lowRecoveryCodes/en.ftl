codes-reminder-title = Low recovery codes remaining
codes-reminder-description = We noticed that you are running low on recovery codes. Please consider generating new codes to avoid getting locked out of your account.
codes-generate = Generate codes
codes-generate-plaintext = { codes-generate }:
lowRecoveryCodes-subject =
    { NUMBER($numberRemaining) ->
        [one] 1 recovery code remaining
       *[other] { NUMBER($numberRemaining) } recovery codes remaining
    }
lowRecoveryCodes-action = { codes-generate }
