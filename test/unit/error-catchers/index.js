'use strict';

describe('Weer.ErrorCatchers', () => {

  it('exports global Weer variable', () => {
    assert.isDefined(Weer, 'Weer is defined');
    assert.isDefined(Weer.Utils, 'Weer.Utils is defined');
    assert.isDefined(Weer.ErrorCatchers, 'Weer.ErrorCatchers is defined');
  });

});
