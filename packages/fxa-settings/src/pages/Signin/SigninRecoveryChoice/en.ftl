## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Sign in
signin-recovery-method-subheader = Choose a recovery method
signin-recovery-method-details = Let’s make sure it’s you using your recovery methods.
signin-recovery-method-phone = Recovery phone
signin-recovery-method-code-v2 = Backup authentication codes
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
  { $numBackupCodes ->
      [one] { $numBackupCodes } code remaining
      *[other] { $numBackupCodes } codes remaining
  }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = There was a problem sending a code to your recovery phone
signin-recovery-method-send-code-error-description = Please try again later or use your backup authentication codes.
