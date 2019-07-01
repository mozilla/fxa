/* This Source Code Form is subject to the terms of the Mozilla Public
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Cocktail from 'lib/cocktail';
import View from 'views/base';

describe('lib/cocktail', () => {
  it('mixes in as expected on non-circular dependencies', () => {
    let functionFrom1Count = 0;
    let functionFrom2Count = 0;
    let functionFrom3Count = 0;
    let functionFrom4Count = 0;
    let functionFrom3And4Count = 0;

    const Mixin4 = {
      functionFrom4() {
        functionFrom4Count++;
      },

      functionFrom3And4() {
        functionFrom3And4Count++;
      },

      propertyFrom3And4: {
        prop4: 'val4',
      },

      propertyFrom4: {
        prop: 'val',
      },
    };

    const Mixin3 = {
      functionFrom3() {
        functionFrom3Count++;
      },

      functionFrom3And4() {
        functionFrom3And4Count++;
      },

      propertyFrom3: {
        prop: 'val',
      },

      propertyFrom3And4: {
        prop3: 'val3',
      },
    };

    const Mixin2 = {
      functionFrom2() {
        functionFrom2Count++;
      },

      propertyFrom2: true,

      dependsOn: [Mixin3, Mixin4],
    };

    const Mixin1 = {
      functionFrom1() {
        functionFrom1Count++;
      },

      propertyFrom1: 1,

      dependsOn: [
        // Mixin4 is intentionally required by two mixins to ensure
        // it's only actually mixed in once.
        Mixin2,
        Mixin4,
      ],
    };
    const MixedInView = View.extend();
    Cocktail.mixin(MixedInView, Mixin1);

    const view = new MixedInView();
    assert.isFunction(view.functionFrom1);
    assert.isFunction(view.functionFrom2);
    assert.isFunction(view.functionFrom3);
    assert.isFunction(view.functionFrom4);

    assert.equal(view.propertyFrom3And4.prop3, 'val3');
    assert.equal(view.propertyFrom3And4.prop4, 'val4');

    view.functionFrom1();
    assert.equal(functionFrom1Count, 1);
    view.functionFrom2();
    assert.equal(functionFrom2Count, 1);
    view.functionFrom3();
    assert.equal(functionFrom3Count, 1);
    view.functionFrom4();
    assert.equal(functionFrom4Count, 1);

    view.functionFrom3And4();
    assert.equal(functionFrom3And4Count, 2);
  });

  it('isMixedIn returns `true` if `target` contains all properties of `mixin`', () => {
    const view = new View();
    const mixin = {
      methodName() {
        return true;
      },

      propertyName: 'propertyValue',
    };

    assert.isFalse(Cocktail.isMixedIn(view, mixin));

    Cocktail.mixin(view, mixin);

    assert.isTrue(Cocktail.isMixedIn(view, mixin));
    assert.isTrue(view.methodName());
    assert.equal(view.propertyName, 'propertyValue');
  });
});
