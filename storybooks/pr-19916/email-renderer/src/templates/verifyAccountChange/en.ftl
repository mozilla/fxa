# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Use { $code } to change your account
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview = { $expirationTime ->
  [one] This code expires in { $expirationTime } minute.
  *[other] This code expires in { $expirationTime } minutes.
}
verifyAccountChange-title = Are you changing your account info?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Help us keep your account safe by approving this change on:
verifyAccountChange-prompt = If yes, here is your authorization code:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice = { $expirationTime ->
  [one] It expires in { $expirationTime } minute.
  *[other] It expires in { $expirationTime } minutes.
}
