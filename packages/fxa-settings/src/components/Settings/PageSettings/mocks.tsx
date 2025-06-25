import { isMobileDevice } from '../../../lib/utilities';
import { Account } from '../../../models';
import { MOCK_ACCOUNT, mockEmail } from '../../../models/mocks';
import { MOCK_SERVICES } from '../ConnectedServices/mocks';
import { MOCK_LINKED_ACCOUNTS } from '../LinkedAccounts/mocks';

const SERVICES_NON_MOBILE = MOCK_SERVICES.filter((d) => !isMobileDevice(d));

export const coldStartAccount = {
  ...MOCK_ACCOUNT,
  displayName: null,
  avatar: { id: null, url: null },
  recoveryKey: { exists: false },
  totp: { exists: false, verified: false },
  attachedClients: [SERVICES_NON_MOBILE[0]],
} as unknown as Account;

export const partiallyFilledOutAccount = {
  ...MOCK_ACCOUNT,
  displayName: null,
  totp: { exists: true, verified: false },
  attachedClients: SERVICES_NON_MOBILE,
  linkedAccounts: MOCK_LINKED_ACCOUNTS,
} as unknown as Account;

export const accountEligibleForRecoveryKey = {
  ...MOCK_ACCOUNT,
  displayName: null,
  recoveryKey: { exists: false, estimatedSyncDeviceCount: 2 },
  totp: { exists: false, verified: false },
  attachedClients: MOCK_SERVICES,
  linkedAccounts: MOCK_LINKED_ACCOUNTS,
} as unknown as Account;

export const completelyFilledOutAccount = {
  ...MOCK_ACCOUNT,
  subscriptions: [{ created: 1, productName: 'x' }],
  emails: [mockEmail(), mockEmail('johndope2@gmail.com', false)],
  attachedClients: SERVICES_NON_MOBILE,
  linkedAccounts: MOCK_LINKED_ACCOUNTS,
  totp: { exists: true, verified: true },
  backupCodes: {
    hasBackupCodes: true,
    count: 3,
  },
  recoveryPhone: {
    exists: true,
    phoneNumber: '1234',
    available: true,
    nationalFormat: '',
  },
} as unknown as Account;

export const accountEligibleForRecoveryPhoneOnly = {
  ...MOCK_ACCOUNT,
  recoveryKey: { exists: false, estimatedSyncDeviceCount: 0 },
  totp: { exists: true, verified: true },
  backupCodes: {
    hasBackupCodes: true,
    count: 3,
  },
  recoveryPhone: {
    exists: false,
    phoneNumber: null,
    available: true,
    nationalFormat: null,
  },
} as unknown as Account;

export const accountEligibleForRecoveryPhoneAndKey = {
  ...MOCK_ACCOUNT,
  recoveryKey: { exists: false, estimatedSyncDeviceCount: 2 },
  totp: { exists: true, verified: true },
  backupCodes: {
    hasBackupCodes: true,
    count: 3,
  },
  recoveryPhone: {
    exists: false,
    phoneNumber: null,
    available: true,
    nationalFormat: null,
  },
} as unknown as Account;
