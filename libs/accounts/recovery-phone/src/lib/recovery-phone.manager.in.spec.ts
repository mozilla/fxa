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

  const mockRedis = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  beforeAll(async () => {
    db = await testAccountDatabaseSetup(['accounts', 'recoveryPhones']);
    const moduleRef = await Test.createTestingModule({
      providers: [
        RecoveryPhoneManager,
        {
          provide: AccountDbProvider,
          useValue: db,
        },
        {
          provide: 'Redis',
          useValue: mockRedis,
        },
      ],
    }).compile();

    recoveryPhoneManager = moduleRef.get(RecoveryPhoneManager);
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should get a recovery phone', async () => {
    const mockPhone = RecoveryPhoneFactory();

    const { uid, phoneNumber } = mockPhone;
    await recoveryPhoneManager.registerPhoneNumber(
      uid.toString('hex'),
      phoneNumber
    );

    const result = await recoveryPhoneManager.getConfirmedPhoneNumber(
      uid.toString('hex')
    );
    expect(result.uid).toEqual(mockPhone.uid);
    expect(result.phoneNumber).toEqual(mockPhone.phoneNumber);
  });

  it('should throw if no recovery phone found', async () => {
    const mockPhone = RecoveryPhoneFactory();

    const { uid } = mockPhone;

    await expect(
      recoveryPhoneManager.getConfirmedPhoneNumber(uid.toString('hex'))
    ).rejects.toThrow('Recovery number does not exist');
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

  it('should throw if recovery phone already exists', async () => {
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

  it('should remove a recovery phone', async () => {
    const deleteFromSpy = jest.spyOn(db, 'deleteFrom');
    const mockPhone = RecoveryPhoneFactory();

    const { uid, phoneNumber } = mockPhone;
    await recoveryPhoneManager.registerPhoneNumber(
      uid.toString('hex'),
      phoneNumber
    );

    const result = await recoveryPhoneManager.removePhoneNumber(
      mockPhone.uid.toString('hex')
    );
    expect(deleteFromSpy).toBeCalledWith('recoveryPhones');
    expect(result).toBe(true);
  });

  it('should return false if no phone number removed', async () => {
    const deleteFromSpy = jest.spyOn(db, 'deleteFrom');
    const mockPhone = RecoveryPhoneFactory();

    const result = await recoveryPhoneManager.removePhoneNumber(
      mockPhone.uid.toString('hex')
    );
    expect(deleteFromSpy).toBeCalledWith('recoveryPhones');
    expect(result).toBe(false);
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

  it('should store unconfirmed phone number data in Redis', async () => {
    const mockPhone = RecoveryPhoneFactory();
    const { uid, phoneNumber } = mockPhone;
    const code = '123456';
    const isSetup = true;
    const lookupData = { foo: 'bar' };

    await recoveryPhoneManager.storeUnconfirmed(
      uid.toString('hex'),
      code,
      phoneNumber,
      isSetup,
      lookupData
    );

    const expectedData = JSON.stringify({
      phoneNumber,
      isSetup,
      lookupData: JSON.stringify(lookupData),
    });
    const redisKey = `sms-attempt:${uid.toString('hex')}:${code}`;

    expect(mockRedis.set).toHaveBeenCalledWith(
      redisKey,
      expectedData,
      'EX',
      600
    );
  });

  it('should return null if no unconfirmed phone number data is found in Redis', async () => {
    const mockPhone = RecoveryPhoneFactory();
    const { uid } = mockPhone;
    const code = '123456';

    mockRedis.get.mockResolvedValue(null);

    const result = await recoveryPhoneManager.getUnconfirmed(
      uid.toString('hex'),
      code
    );

    expect(result).toBeNull();
  });
});
