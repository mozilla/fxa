flow-setup-2fa-inline-complete-success-banner = Two-step authentication enabled
flow-setup-2fa-inline-complete-success-banner-description = To protect all your connected devices, you should sign out everywhere you’re using this account, and then sign back in using your new two-step authentication.

flow-setup-2fa-inline-complete-backup-code = Backup authentication codes
flow-setup-2fa-inline-complete-backup-phone = Recovery phone

# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info = { $count ->
  [one] { $count } code remaining
  *[other] { $count } codes remaining
}

flow-setup-2fa-inline-complete-backup-code-description = This is the safest recovery method if you can’t sign in with your mobile device or authenticator app.
flow-setup-2fa-inline-complete-backup-phone-description = This is the easiest recovery method if you can’t sign in with your authenticator app.

flow-setup-2fa-inline-complete-learn-more-link = How this protects your account

# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Continue to { $serviceName }
