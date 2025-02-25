## SubRow component

tfa-row-backup-codes-title = Backup authentication codes
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = No codes available
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 = { $numCodesAvailable ->
  [one] { $numCodesAvailable } code remaining
  *[other] { $numCodesAvailable } codes remaining
}
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Create new codes
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Add
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = This is the safest recovery method if you canʼt use your mobile device or authenticator app.

# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Recovery phone
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = No phone number added
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Change
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Add
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Remove
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Remove recovery phone
tfa-row-backup-phone-delete-restriction-v2 = If you want to remove your recovery phone, add backup authentication codes or disable two-step authentication first to avoid getting locked out of your account.
# "this" refers to recovery phone
tfa-row-backup-phone-description = This is the easier recovery method if you canʼt use your authenticator app.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Learn about SIM swap risk
