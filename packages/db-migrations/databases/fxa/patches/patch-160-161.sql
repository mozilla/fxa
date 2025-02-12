SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('160');

INSERT INTO emailTypes (emailType) VALUES
('cadReminderFirst'),
('cadReminderSecond'),
('fraudulentAccountDeletion'),
('inactiveAccountFinalWarning'),
('inactiveAccountFirstWarning'),
('inactiveAccountSecondWarning'),
('passwordForgotOtp'),
('passwordResetWithRecoveryKeyPrompt'),
('postAddLinkedAccount'),
('postAddRecoveryPhone'),
('postChangeAccountRecovery'),
('postChangeRecoveryPhone'),
('postRemoveRecoveryPhone'),
('postSigninRecoveryCode'),
('postSigninRecoveryPhone'),
('subscriptionAccountReminderFirst'),
('subscriptionAccountReminderSecond'),
('verificationReminderFinal'),
('verificationReminderFirst'),
('verificationReminderSecond');

UPDATE dbMetadata SET value = '161' WHERE name = 'schema-patch-level';
