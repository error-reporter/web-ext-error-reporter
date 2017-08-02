'use strict';

describe('Weer', () => {

  it('exports global Weer variable', () => {
    assert.isDefined(Weer, 'Weer has been defined');
    assert.isDefined(Weer.Utils, 'Weer.Utils has been defined');
    assert.isDefined(Weer.ErrorCatchers, 'Weer.ErrorCatchers has been defined');
    assert.isDefined(Weer.GetNotifiersSingleton, 'Weer.GetNotifiersSingleton has been defined');
    assert.isDefined(Weer.Install, 'Weer.Install has been defined');
  });

});
