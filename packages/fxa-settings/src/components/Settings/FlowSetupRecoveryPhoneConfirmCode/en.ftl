## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Enter verification code

# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = A 6-digit code was sent to <span>{ $phoneNumber }</span> by text message. This code expires after 5 minutes.
flow-setup-phone-confirm-code-input-label = Enter 6-digit code
flow-setup-phone-confirm-code-button = Confirm
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Code expired?
flow-setup-phone-confirm-code-resend-code-button = Resend code
flow-setup-phone-confirm-code-resend-code-success = Code sent
flow-setup-phone-confirm-code-success-message-v2 = Recovery phone added
