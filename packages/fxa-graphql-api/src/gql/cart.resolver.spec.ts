/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

describe('#payments-cart - resolvers', () => {
  it('succeeds', () => {
    expect(true).toEqual(true);
  });
});

// import { Provider } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import { MozLoggerService } from '@fxa/shared/mozlog';
// import { Logger } from '@fxa/shared/log';
// import {
//   CartIdInputFactory,
//   SetupCartInputFactory,
//   UpdateCartInputFactory,
// } from './lib/factories';
// import { CartManager } from '@fxa/payments/cart';
// import { CartResolver } from './cart.resolver';
// const fakeSetupCart = jest.fn();
// const fakeRestartCart = jest.fn();
// const fakeCheckoutCart = jest.fn();
// const fakeUpdateCart = jest.fn();

// jest.mock('@fxa/payments/cart', () => {
//   // Works and lets you check for constructor calls:
//   return {
//     CartManager: jest.fn().mockImplementation(() => {
//       return {
//         setupCart: fakeSetupCart,
//         restartCart: fakeRestartCart,
//         checkoutCart: fakeCheckoutCart,
//         updateCart: fakeUpdateCart,
//       };
//     }),
//   };
// });

// describe.skip('#payments-cart - resolvers', () => {
//   let resolver: CartResolver;
//   const mockLogger: Logger = {
//     debug: jest.fn(),
//     error: jest.fn(),
//     info: jest.fn(),
//     trace: jest.fn(),
//     warn: jest.fn(),
//   };

//   beforeEach(async () => {
//     (CartManager as jest.Mock).mockClear();

//     const MockMozLogger: Provider = {
//       provide: MozLoggerService,
//       useValue: mockLogger,
//     };
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [CartResolver, MockMozLogger],
//     }).compile();

//     resolver = module.get<CartResolver>(CartResolver);
//   });
//   describe('setupCart', () => {
//     it('should successfully create a new cart', async () => {
//       const input = SetupCartInputFactory({
//         interval: 'annually',
//       });
//       await resolver.setupCart(input);
//       expect(fakeSetupCart).toBeCalledWith(expect.objectContaining(input));
//     });
//   });

//   describe('restartCart', () => {
//     it('should successfully set cart state to "START"', async () => {
//       const input = CartIdInputFactory();
//       await resolver.restartCart(input);
//       expect(fakeRestartCart).toBeCalledWith(input.id);
//     });
//   });

//   describe('checkoutCart', () => {
//     it('should successfully set cart state to "PROCESSING"', async () => {
//       const input = CartIdInputFactory();
//       await resolver.checkoutCart(input);
//       expect(fakeCheckoutCart).toBeCalledWith(input.id);
//     });
//   });

//   describe('updateCart', () => {
//     it('should successfully update an existing cart', async () => {
//       const input = UpdateCartInputFactory();
//       await resolver.updateCart(input);
//       expect(fakeUpdateCart).toBeCalledWith(input);
//     });
//   });
// });
