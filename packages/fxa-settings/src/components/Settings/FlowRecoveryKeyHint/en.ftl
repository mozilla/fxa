## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the fourth step in the account recovery key creation flow
# "Storage hint" can be any information the user finds useful to help them remember where they saved or stored their account recovery key.
flow-recovery-key-hint-header = Great! Now add a storage hint
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
flow-recovery-key-hint-message = Add a hint about where you stored your account recovery key. We can show it to you during the password reset to recover your data.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input =
  .label = Enter your storage hint (optional)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Finish
# Success message displayed in alert bar after the user has completed the account recovery key creation flow without saving a hint.
flow-recovery-key-success-alert-no-hint = Account recovery key enabled.
# Success message displayed in alert bar after the user has completed the account recovery key creation flow and saved a hint.
flow-recovery-key-success-alert-with-hint = Account recovery key enabled and storage hint saved.
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = The hint must contain fewer than 255 characters.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = The hint cannot contain unsafe unicode characters. Only letters, numbers, punctuation marks and symbols are allowed.
