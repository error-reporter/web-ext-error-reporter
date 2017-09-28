'use strict';

describe('Weer.GetNotifiersSingleton', () => {

  it('exports global Weer variable', () => {
    assert.isDefined(Weer, 'Weer is defined');
    assert.isDefined(Weer.Utils, 'Weer.Utils is defined');
    assert.isDefined(Weer.GetNotifiersSingleton, 'Weer.GetNotifiersSingleton is defined');
  });

  describe('GetNotifiersSingleton', () => {

    const getNoty = (opts = {}) =>
      Weer.GetNotifiersSingleton({
        sendReports:{
          toEmail: 'homerjsimpson@example.com',
          ...opts,
        }
      });
    const noty = getNoty();

    it('is creatable with constructor', () => {

      const one = getNoty();
      assert.isDefined(one);
      const two = getNoty({ inLanguages: ['ru'] });
      assert.isDefined(two);

    });

    chrome.notifications.create.callsFake((id, ops, cb) => cb());

    it('returns singleton', () => {

      const one = getNoty();
      const two = getNoty();
      assert.isDefined(one);
      expect(one).to.equal(two);

    });

    it('exposes `handleErrorMessage`', (done) => {

      expect(noty.handleErrorMessage).to.throw(TypeError);
      expect(chrome.notifications.create.callCount).to.not.be.ok;
      noty.handleErrorMessage({ payload: { message: 'Hi from error!', } }).then(
        (ifNotied) => {

          expect(ifNotied).to.be.true;
          expect(chrome.notifications.create.callCount).to.equal(1);
          chrome.notifications.create.reset();
          done();

        }
      );

    });

    it('exposes `getErrorTypeToLabelMap`', () => {

      assert.isDefined(noty.getErrorTypeToLabelMap);
      const map = noty.getErrorTypeToLabelMap();
      assert.instanceOf(map, Map);
      expect(map.size).to.be.ok;
      expect([...map.keys()]).to.include.members(['ext-error', 'pac-error']);

    });

    const map = noty.getErrorTypeToLabelMap();
    const errTypes = [...map.keys()];

    it('exposes `isOn`', () => {

      const ifAllOn = errTypes.every((k) => noty.isOn(k));
      assert(ifAllOn, 'All error types are "on" by default.');
      expect(noty.isOn).to.throw(TypeError);
      const errType = 'ext-error';
      expect(noty.isOn(errType)).to.equal(true);
      expect(() => noty.isOn('unknown-error-type')).to.throw(Error);

    });

    it('exposes `switch`', () => {

      const errType = 'ext-error';
      expect(noty.isOn(errType)).to.equal(true);
      expect(() => noty.switch()).to.throw(Error);
      expect(() => noty.switch('FOO')).to.throw(Error);
      expect(noty.switch('off', errType)).to.be.undefined;
      expect(noty.isOn(errType)).to.be.false;
      noty.switch('off');
      const ifAllOff = errTypes.every((k) => noty.isOn(k) === false);
      expect(ifAllOff).to.be.true;
      noty.switch('on');
      const ifAllOn = errTypes.every((k) => noty.isOn(k));
      expect(ifAllOn).to.be.true;
      noty.switch('off', errType);
      const ifAllStillOn = errTypes.every((k) => noty.isOn(k));
      expect(ifAllStillOn).to.be.false;

    });

  });

});
