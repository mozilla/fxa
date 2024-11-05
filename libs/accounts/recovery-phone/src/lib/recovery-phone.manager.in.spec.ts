import { RecoveryPhoneManager } from './recovery-phone.manager';
import {
  AccountDatabase,
  AccountDbProvider,
  testAccountDatabaseSetup,
} from '@fxa/shared/db/mysql/account';
import { Test } from '@nestjs/testing';
import { RecoveryPhoneFactory } from './recovery-phone.factories';

describe('RecoveryPhoneManager', () => {
  let recoveryPhoneManager: RecoveryPhoneManager;
  let db: AccountDatabase;

  beforeAll(async () => {
    db = await testAccountDatabaseSetup(['accounts', 'recoveryPhones']);
    const moduleRef = await Test.createTestingModule({
      providers: [
        RecoveryPhoneManager,
        {
          provide: AccountDbProvider,
          useValue: db,
        },
      ],
    }).compile();

    recoveryPhoneManager = moduleRef.get(RecoveryPhoneManager);
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should create a recovery phone', async () => {
    const insertIntoSpy = jest.spyOn(db, 'insertInto');
    const mockPhone = RecoveryPhoneFactory();
    await recoveryPhoneManager.registerPhoneNumber(
      mockPhone.uid.toString('hex'),
      mockPhone.phoneNumber
    );

    expect(insertIntoSpy).toBeCalledWith('recoveryPhones');
  });

  it('should fail for invalid format phone number', async () => {
    const mockPhone = RecoveryPhoneFactory();
    const phoneNumber = '1234567890a';
    await expect(
      recoveryPhoneManager.registerPhoneNumber(
        mockPhone.uid.toString('hex'),
        phoneNumber
      )
    ).rejects.toThrow('Invalid phone number format');
  });

  it('should fail to register if recovery phone already exists', async () => {
    const mockPhone = RecoveryPhoneFactory();
    const { uid, phoneNumber } = mockPhone;
    await recoveryPhoneManager.registerPhoneNumber(
      uid.toString('hex'),
      phoneNumber
    );

    await expect(
      recoveryPhoneManager.registerPhoneNumber(uid.toString('hex'), phoneNumber)
    ).rejects.toThrow('Recovery number already exists');
  });

  it('should handle database errors gracefully', async () => {
    jest.spyOn(db, 'insertInto').mockImplementation(() => {
      throw new Error('Database error');
    });

    const mockPhone = RecoveryPhoneFactory();
    const { uid, phoneNumber } = mockPhone;
    await expect(
      recoveryPhoneManager.registerPhoneNumber(uid.toString('hex'), phoneNumber)
    ).rejects.toThrow('Database error');
  });
});
