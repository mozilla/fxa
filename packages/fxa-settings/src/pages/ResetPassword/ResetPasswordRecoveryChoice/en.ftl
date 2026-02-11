## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their
# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Reset your password
password-reset-recovery-method-subheader = Choose a recovery method
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Let’s make sure it’s you using your recovery methods.
password-reset-recovery-method-phone = Recovery phone
password-reset-recovery-method-code = Backup authentication codes
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
  { $numBackupCodes ->
      [one] { $numBackupCodes } code remaining
      *[other] { $numBackupCodes } codes remaining
  }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = There was a problem sending a code to your recovery phone
password-reset-recovery-method-send-code-error-description = Please try again later or use your backup authentication codes.
