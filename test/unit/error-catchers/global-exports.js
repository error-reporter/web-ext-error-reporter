'use strict';

describe('Weer', () => {

  it('exports global Weer variable', () => {
    assert.isDefined(Weer, 'Weer has been defined');
    assert.isDefined(Weer.Utils, 'Weer.Utils has been defined');
    assert.isDefined(Weer.ErrorCatchers, 'Weer.ErrorCatchers has been defined');
  });

});
