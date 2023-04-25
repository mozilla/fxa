## DownloadRecoveryKeyAsFile
## These strings are used in an unformatted plain text file that users can download to save their recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download recovery key as a plain text file
# .title will displayed as a tooltip on the button
recovery-key-download-button = Download your recovery key
  .title = Download

# Heading in the text file. No formatting will be applied to the text. All caps is used in English to show this is a header.
recovery-key-file-header = SAVE YOUR ACCOUNT RECOVERY KEY

# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this key can result in data loss.
recovery-key-file-instructions = Store this file containing your account recovery key in a place you’ll remember. Or print it and keep a physical copy. Your account recovery key can help you recover { -brand-firefox } data if you forget your password.

# { $recoveryKeyValue } is the recovery key, a randomly generated code in latin characters
# 🔑 is included for visual interest and to draw attention to the key
recovery-key-file-key-value = 🔑 Key:  { $recoveryKeyValue }

# { $email }  - The primary email associated with the account
recovery-key-file-user-email = • { -product-firefox-account }: { $email }

# Date when the recovery key was created and this file was downloaded
# { $downloadDate } is a formatted date in the user's preferred locale
# e.g., "12/11/2012" if run in en-US locale with time zone America/Los_Angeles
recovery-key-file-download-date = • Key generated: { $downloadDate }

# Link to get more information and support
# { $supportUrl } will be a URL such as https://mzl.la/3bNrM1I
# The URL will not be hyperlinked and will be presented as plain text in the downloaded file
recovery-key-file-support = • Learn more about your account recovery key: { $supportURL }
