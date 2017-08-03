'use strict';

describe('Weer.GetNotifiersSingleton', () => {

  it('exports global Weer variable', () => {
    assert.isDefined(Weer, 'Weer is defined');
    assert.isDefined(Weer.Utils, 'Weer.Utils is defined');
    assert.isDefined(Weer.GetNotifiersSingleton, 'Weer.GetNotifiersSingleton is defined');
  });

});
