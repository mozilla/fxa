## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the fourth step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Add a hint to help find your key
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
flow-recovery-key-hint-message-v2 = This hint should help you remember where you stored your account recovery key. We’ll show it to you when you use it to recover your data.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
  .label = Enter a hint (optional)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Finish
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Places to store your key:
flow-recovery-key-download-storage-ideas-folder-v2 = Folder on secure device
flow-recovery-key-download-storage-ideas-cloud = Trusted cloud storage
flow-recovery-key-download-storage-ideas-print-v2 = Printed physical copy
flow-recovery-key-download-storage-ideas-pwd-manager = Password manager

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Account recovery key created
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = The hint must contain fewer than 255 characters.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = The hint cannot contain unsafe unicode characters. Only letters, numbers, punctuation marks and symbols are allowed.
