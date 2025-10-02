/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FluentBundle } from '@fluent/bundle';
import { ReactLocalization } from '@fluent/react';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { getFtlBundle, testL10n } from '.';
import { FtlMsg, FtlMsgProps, FtlMsgResolver } from '../utils';

jest.mock('fxa-react/lib/utils', () => {
  const originalModule = jest.requireActual('fxa-react/lib/utils');

  return {
    __esModule: true,
    ...originalModule,
    FtlMsg: (props: FtlMsgProps) => (
      <div data-testid="ftlmsg-mock" id={props.id}>
        {props.children}
      </div>
    ),
  };
});

const simpleComponent = (id: string, fallbackText = '') => (
  <FtlMsg {...{ id }}>{fallbackText}</FtlMsg>
);

const componentWithAttrs = (id: string, fallbackText = '') => (
  <FtlMsg {...{ id }} attrs={{ header: true }}>
    <h2>{fallbackText}</h2>
  </FtlMsg>
);

const componentWithVar = (fallbackText: string, name: string) => (
  <FtlMsg id="test-var" vars={{ name }}>
    <p>{fallbackText}</p>
  </FtlMsg>
);

describe('testL10n', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle(null);
  });

  it('throws if FTL ID is not found', () => {
    expect(() => {
      render(simpleComponent('not-in-bundle'));

      const ftlMsgMock = screen.getByTestId('ftlmsg-mock');
      testL10n(ftlMsgMock, bundle);
    }).toThrowError(
      'Could not retrieve Fluent message tied to ID: not-in-bundle'
    );
  });

  it('throws if FTL ID is present, but message is not found', () => {
    expect(() => {
      render(simpleComponent('test-missing-message'));

      const ftlMsgMock = screen.getByTestId('ftlmsg-mock');
      testL10n(ftlMsgMock, bundle);
    }).toThrowError(
      'Could not retrieve Fluent message tied to ID: test-missing-message'
    );
  });

  it('throws if FTL ID and attributes are present, but message is not found', () => {
    expect(() => {
      render(componentWithAttrs('test-missing-message-attrs'));

      const ftlMsgMock = screen.getByTestId('ftlmsg-mock');
      testL10n(ftlMsgMock, bundle);
    }).toThrowError(
      'Could not retrieve Fluent message tied to ID: test-missing-message-attrs'
    );
  });

  it('successfully tests simple messages', () => {
    expect(() => {
      render(simpleComponent('test-simple', 'Simple and clean'));

      const ftlMsgMock = screen.getByTestId('ftlmsg-mock');
      testL10n(ftlMsgMock, bundle);
    }).not.toThrow();
  });

  it('successfully tests messages containing attributes', () => {
    expect(() => {
      render(componentWithAttrs('test-attrs', 'When you walk away'));

      const ftlMsgMock = screen.getByTestId('ftlmsg-mock');
      testL10n(ftlMsgMock, bundle);
    }).not.toThrow();
  });

  it('successfully tests messages with terms', () => {
    expect(() => {
      render(simpleComponent('test-term', 'Lately, Mozilla is all I need'));

      const ftlMsgMock = screen.getByTestId('ftlmsg-mock');
      testL10n(ftlMsgMock, bundle);
    }).not.toThrow();
  });

  describe('testMessage', () => {
    it('throws if FTL message does not match fallback text', () => {
      expect(() => {
        render(simpleComponent('test-simple', 'testing 123'));

        const ftlMsgMock = screen.getByTestId('ftlmsg-mock');
        testL10n(ftlMsgMock, bundle);
      }).toThrowError('Fallback text does not match Fluent message');
    });

    it('throws if FTL message contains straight apostrophe', () => {
      expect(() => {
        render(
          simpleComponent('test-straight-apostrophe', "you don't hear me say")
        );

        const ftlMsgMock = screen.getByTestId('ftlmsg-mock');
        testL10n(ftlMsgMock, bundle);
      }).toThrowError('Fluent message contains a straight apostrophe');
    });

    it('throws if FTL message contains straight quote', () => {
      expect(() => {
        render(simpleComponent('test-straight-quote', '"please, don’t go"'));

        const ftlMsgMock = screen.getByTestId('ftlmsg-mock');
        testL10n(ftlMsgMock, bundle);
      }).toThrowError('Fluent message contains a straight quote');
    });

    it('throws if FTL message expects variable not provided', () => {
      const name = 'Sora';
      expect(() => {
        render(componentWithVar(`${name} smiled at me`, name));

        const ftlMsgMock = screen.getByTestId('ftlmsg-mock');
        testL10n(ftlMsgMock, bundle);
      }).toThrowError('Unknown variable: $name');
    });

    it('successfully tests messages with variables', () => {
      const name = 'Sora';
      expect(() => {
        render(componentWithVar(`${name} smiled at me`, name));

        const ftlMsgMock = screen.getByTestId('ftlmsg-mock');
        testL10n(ftlMsgMock, bundle, { name });
      }).not.toThrow();
    });
  });

  describe('test getFtlMsg', () => {
    let ftlMsgResolver: FtlMsgResolver;
    let l10n: ReactLocalization;

    beforeAll(() => {
      l10n = new ReactLocalization([bundle], undefined, () => {});
      ftlMsgResolver = new FtlMsgResolver(l10n, true);
    });

    it('throws if there are no en bundles', () => {
      const emptyL10n = new ReactLocalization([], undefined, () => {});
      const emptyResolver = new FtlMsgResolver(emptyL10n, true);
      expect(() => {
        emptyResolver.getMsg('test-foo', 'foo-bar');
      }).toThrow(
        `No 'en' bundles loaded. The 'en' bundle is the default and should always be loaded.`
      );
    });

    it('throws if ftl message does not exist', () => {
      expect(() => {
        ftlMsgResolver.getMsg('test-foo', 'foo-bar');
      }).toThrow('Could not locate message in en bundle. Message id: test-foo');
    });

    it('throws if no id is provided', () => {
      expect(() => {
        ftlMsgResolver.getMsg('', '');
      }).toThrow('An l10n id must be provided.');
    });

    it('throws if fallback text is not provided', () => {
      expect(() => {
        ftlMsgResolver.getMsg('test-simple', '');
      }).toThrow('Fallback text must be provided.');
    });

    it('throws if fallback text contains straight single quote', () => {
      expect(() => {
        ftlMsgResolver.getMsg(
          'test-straight-apostrophe',
          `you don't hear me say`
        );
      }).toThrow(
        `Fluent message contains a straight apostrophe (') and must be updated to its curly equivalent (’). Fluent message: you don't hear me say`
      );
    });

    it('throws if fallback text contains straight double quote', () => {
      expect(() => {
        ftlMsgResolver.getMsg('test-straight-quote', `"please, don’t go"`);
      }).toThrow(
        `Fluent message contains a straight quote (") and must be updated to its curly equivalent (“”). Fluent message: "please, don’t go"`
      );
    });

    it('throws if attributes are missing', () => {
      const name = 'foo';
      expect(() => {
        ftlMsgResolver.getMsg('test-var', `${name} smiled at me`, { n: name });
      }).toThrow(
        'Errors encountered formatting fluent message. Fluent errors: Unknown variable: $name'
      );
    });

    it('returns translated string with updated attribute values', () => {
      const name = 'foo';
      const msg = ftlMsgResolver.getMsg('test-var', `${name} smiled at me`, {
        name,
      });
      expect(msg).toContain('foo smiled at me');
    });

    it('handles dom overlays', () => {
      const msg = ftlMsgResolver.getMsg(
        'test-dom-overlay',
        `<img data-l10n-name='devices-image' alt="Devices">`
      );
      expect(msg).toContain(
        `<img data-l10n-name='devices-image' alt="Devices">`
      );
    });

    it('Detects bad dom case 1', () => {
      expect(() => {
        ftlMsgResolver.getMsg('test-bad-dom-overlay-1', `<img`);
      }).toThrow(
        'Fluent message contains start of dom overlay with no end tag. Ensue dom overlay is well formed.'
      );
    });

    it('Detects bad dom case 2', () => {
      expect(() => {
        ftlMsgResolver.getMsg('test-bad-dom-overlay-2', `img>`);
      }).toThrow(
        `Fluent message contains a '>' character that doesn't appear to be part of a dom tag. Either encode with html entity or check dom overlay is well formed.`
      );
    });

    it('Detects bad dom case 3', () => {
      expect(() => {
        ftlMsgResolver.getMsg('test-bad-dom-overlay-3', `<img> >`);
      }).toThrow(
        `Fluent message contains a '>' character that doesn't appear to be part of a dom tag. Either encode with html entity or check dom overlay is well formed.`
      );
    });

    it('Detects bad dom case 4', () => {
      expect(() => {
        ftlMsgResolver.getMsg('test-bad-dom-overlay-4', `<img< >`);
      }).toThrow(
        `Fluent message contains a '<' character inside a dom overlay tag. Check that dom overlay is well formed.`
      );
    });

    it('Detects bad dom case 5', () => {
      expect(() => {
        ftlMsgResolver.getMsg('test-bad-dom-overlay-5', `< <img>`);
      }).toThrow(
        `Fluent message contains a '<' character inside a dom overlay tag. Check that dom overlay is well formed.`
      );
    });

    it('Detects bad dom case 6', () => {
      expect(() => {
        ftlMsgResolver.getMsg('test-bad-dom-overlay-6', `> <img>`);
      }).toThrow(
        `Fluent message contains a '>' character that doesn't appear to be part of a dom tag. Either encode with html entity or check dom overlay is well formed.`
      );
    });
  });
});
