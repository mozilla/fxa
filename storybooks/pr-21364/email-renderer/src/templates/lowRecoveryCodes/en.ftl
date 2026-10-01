# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = You’re out of backup authentication codes!
codes-reminder-title-one = You’re on your last backup authentication code
codes-reminder-title-two = Time to create more backup authentication codes

codes-reminder-description-part-one = Backup authentication codes help you restore your info when you forget your password.
codes-reminder-description-part-two = Create new codes now so you don’t lose your data later.
codes-reminder-description-two-left = You only have two codes left.
codes-reminder-description-create-codes = Create new backup authentication codes to help you get back into your account if you’re locked out.

lowRecoveryCodes-action-2 = Create codes
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] No backup authentication codes left
        [one] Only 1 backup authentication code left
       *[other] Only { $numberRemaining } backup authentication codes left!
   }
