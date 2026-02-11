## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Download and continue
  .title = Download and continue

recovery-key-pdf-heading = Account Recovery Key

# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Generated: { $date }

# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Account Recovery Key

# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = This key allows you to recover your encrypted browser data (including passwords, bookmarks, and history) if you forget your password. Store it in a place you’ll remember.

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Places to store your key

# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Learn more about your account recovery key

# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Sorry, there was a problem downloading your account recovery key.
