'use strict';

describe('Weer', () => {

  it('exports global Weer variable', () => {
    assert.isDefined(Weer, 'Weer is defined');
    assert.isDefined(Weer.Utils, 'Weer.Utils is defined');
    assert.isDefined(Weer.ErrorCatchers, 'Weer.ErrorCatchers is defined');
    assert.isDefined(Weer.GetNotifiersSingleton, 'Weer.GetNotifiersSingleton is defined');
    assert.isDefined(Weer.install, 'Weer.Install is defined');
  });

});
