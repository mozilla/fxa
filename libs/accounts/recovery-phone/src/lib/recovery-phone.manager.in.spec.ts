import {
  PhoneNumberLookupData,
  RecoveryPhoneManager,
} from './recovery-phone.manager';
import {
  AccountDatabase,
  AccountDbProvider,
  testAccountDatabaseSetup,
} from '@fxa/shared/db/mysql/account';
import { Test } from '@nestjs/testing';
import { RecoveryPhoneFactory } from '@fxa/shared/db/mysql/account';

describe('RecoveryPhoneManager', () => {
  let recoveryPhoneManager: RecoveryPhoneManager;
  let db: AccountDatabase;

  // Taken from: https://www.twilio.com/docs/lookup/v2-api#code-lookup-with-data-packages
  const mockLookUpData: PhoneNumberLookupData = {
    callingCountryCode: '1',
    countryCode: 'US',
    phoneNumber: '+15005550000',
    nationalFormat: '500 555 0000',

    callerName: 'test',
    valid: true,
    validationErrors: [],
    preFill: null,
    url: '',
    smsPumpingRisk: {},
    reassignedNumber: {},
    lineStatus: {},
    simSwap: {},

    lineTypeIntelligence: {},
    identityMatch: {},
    phoneNumberQualityScore: {},
    callForwarding: {},
  };

  const mockRedis = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  beforeAll(async () => {
    db = await testAccountDatabaseSetup([
      'accounts',
      'recoveryPhones',
      'recoveryCodes',
    ]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        RecoveryPhoneManager,
        {
          provide: AccountDbProvider,
          useValue: db,
        },
        {
          provide: 'RecoveryPhoneRedis',
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
      phoneNumber,
      mockLookUpData
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
      mockPhone.phoneNumber,
      mockLookUpData
    );

    expect(insertIntoSpy).toBeCalledWith('recoveryPhones');
  });

  it('should fail for invalid format phone number', async () => {
    const mockPhone = RecoveryPhoneFactory();
    const phoneNumber = '1234567890a';
    await expect(
      recoveryPhoneManager.registerPhoneNumber(
        mockPhone.uid.toString('hex'),
        phoneNumber,
        mockLookUpData
      )
    ).rejects.toThrow('Invalid phone number format');
  });

  it('should throw if recovery phone already exists', async () => {
    const mockPhone = RecoveryPhoneFactory();
    const { uid, phoneNumber } = mockPhone;
    await recoveryPhoneManager.registerPhoneNumber(
      uid.toString('hex'),
      phoneNumber,
      mockLookUpData
    );

    await expect(
      recoveryPhoneManager.registerPhoneNumber(
        uid.toString('hex'),
        phoneNumber,
        mockLookUpData
      )
    ).rejects.toThrow('Recovery number already exists');
  });

  it('should remove a recovery phone', async () => {
    const deleteFromSpy = jest.spyOn(db, 'deleteFrom');
    const mockPhone = RecoveryPhoneFactory();

    const { uid, phoneNumber } = mockPhone;
    await recoveryPhoneManager.registerPhoneNumber(
      uid.toString('hex'),
      phoneNumber,
      mockLookUpData
    );

    const result = await recoveryPhoneManager.removePhoneNumber(
      mockPhone.uid.toString('hex')
    );
    expect(deleteFromSpy).toBeCalledWith('recoveryPhones');
    expect(result).toBe(true);
  });

  it('should throw if no phone number removed', async () => {
    const deleteFromSpy = jest.spyOn(db, 'deleteFrom');
    const mockPhone = RecoveryPhoneFactory();

    const { uid } = mockPhone;
    await expect(
      recoveryPhoneManager.removePhoneNumber(uid.toString('hex'))
    ).rejects.toThrow('Recovery number does not exist');
    expect(deleteFromSpy).toBeCalledWith('recoveryPhones');
  });

  it('should handle database errors gracefully', async () => {
    const insertIntoSpy = jest
      .spyOn(db, 'insertInto')
      .mockImplementation(() => {
        throw new Error('Database error');
      });

    const mockPhone = RecoveryPhoneFactory();
    const { uid, phoneNumber } = mockPhone;
    await expect(
      recoveryPhoneManager.registerPhoneNumber(
        uid.toString('hex'),
        phoneNumber,
        mockLookUpData
      )
    ).rejects.toThrow('Database error');

    insertIntoSpy.mockRestore();
  });

  it('should store unconfirmed phone number data in Redis', async () => {
    const mockPhone = RecoveryPhoneFactory();
    const { uid, phoneNumber } = mockPhone;
    const code = '123456';
    const isSetup = true;
    await recoveryPhoneManager.storeUnconfirmed(
      uid.toString('hex'),
      code,
      phoneNumber,
      isSetup,
      mockLookUpData
    );

    const expectedData = JSON.stringify({
      phoneNumber,
      isSetup,
      lookupData: JSON.stringify(mockLookUpData),
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

  it('should return false if no recovery codes', async () => {
    const mockPhone = RecoveryPhoneFactory();
    const { uid } = mockPhone;

    const result = await recoveryPhoneManager.hasRecoveryCodes(
      uid.toString('hex')
    );

    expect(result).toBe(false);
  });

  it('should return true if user has recovery codes', async () => {
    const mockPhone = RecoveryPhoneFactory();
    const { uid } = mockPhone;

    await db.insertInto('recoveryCodes').values({ uid: uid }).execute();

    const result = await recoveryPhoneManager.hasRecoveryCodes(
      uid.toString('hex')
    );

    expect(result).toBe(true);
  });
});
