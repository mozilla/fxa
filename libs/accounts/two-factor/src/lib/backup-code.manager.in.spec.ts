import { BackupCodeManager } from './backup-code.manager';
import {
  AccountDatabase,
  AccountDbProvider,
  testAccountDatabaseSetup,
} from '@fxa/shared/db/mysql/account';
import { RecoveryCodeFactory } from './backup-code.factories';
import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';

function getMockUid() {
  return faker.string.hexadecimal({
    length: 32,
    prefix: '',
    casing: 'lower',
  });
}

describe('BackupCodeManager', () => {
  let backupCodeManager: BackupCodeManager;
  let db: AccountDatabase;

  async function createRecoveryCode(db: AccountDatabase, uid: string) {
    return db
      .insertInto('recoveryCodes')
      .values({
        ...RecoveryCodeFactory({
          uid: Buffer.from(uid, 'hex'),
        }),
      })
      .execute();
  }

  beforeEach(async () => {
    db = await testAccountDatabaseSetup(['accounts', 'recoveryCodes']);
    const moduleRef = await Test.createTestingModule({
      providers: [
        BackupCodeManager,
        {
          provide: AccountDbProvider,
          useValue: db,
        },
      ],
    }).compile();

    backupCodeManager = moduleRef.get(BackupCodeManager);
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should return that the user has backup codes and count them', async () => {
    const mockUid = getMockUid();
    await createRecoveryCode(db, mockUid);
    await createRecoveryCode(db, mockUid);
    await createRecoveryCode(db, mockUid);

    const result = await backupCodeManager.getCountForUserId(mockUid);
    expect(result.hasBackupCodes).toBe(true);
    expect(result.count).toBe(3);
  });

  it('should return that the user has no backup codes', async () => {
    const result = await backupCodeManager.getCountForUserId('abcd');
    expect(result.hasBackupCodes).toBe(false);
    expect(result.count).toBe(0);
  });

  it('should handle multiple users with different backup code counts', async () => {
    const mockUid1 = getMockUid();
    const mockUid2 = getMockUid();
    await createRecoveryCode(db, mockUid1);
    await createRecoveryCode(db, mockUid1);
    await createRecoveryCode(db, mockUid2);

    const result1 = await backupCodeManager.getCountForUserId(mockUid1);
    const result2 = await backupCodeManager.getCountForUserId(mockUid2);

    expect(result1.hasBackupCodes).toBe(true);
    expect(result1.count).toBe(2);
    expect(result2.hasBackupCodes).toBe(true);
    expect(result2.count).toBe(1);
  });

  it('should handle database errors gracefully', async () => {
    jest.spyOn(db, 'selectFrom').mockImplementation(() => {
      throw new Error('Database error');
    });

    await expect(
      backupCodeManager.getCountForUserId(getMockUid())
    ).rejects.toThrow('Database error');
  });
});
