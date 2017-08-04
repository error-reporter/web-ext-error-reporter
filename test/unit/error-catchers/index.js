'use strict';

describe('Weer.ErrorCatchers', () => {

  it('exports global Weer variables', () => {
    assert.isDefined(Weer, 'Weer is defined');
    assert.isDefined(Weer.Utils, 'Weer.Utils is defined');
    assert.isDefined(Weer.ErrorCatchers, 'Weer.ErrorCatchers is defined');
  });

  it('exports installListenersOn', () => {

    const install = Weer.ErrorCatchers.installListenersOn;
    assert.isDefined(
      install,
      'ErrorCatchers.installListenersOn is defined',
    );

  });

  describe('Weer.ErrorCatchers.installListenersOn', () => {

    const install = Weer.ErrorCatchers.installListenersOn;
    const newFakeWindow = () => ({
      addEventListener: sinon.stub(),
      removeEventListener: sinon.stub(),
      chrome: {
        runtime: {
          sendMessage: sinon.stub(),
        },
      },
    });

    it('handles wrong args', (done) => {

      // Wrong args.
      expect(install, 'throws if no args').to.throw(Error);
      expect(() => install('foo'), 'throws if one arg is wrong typed').to.throw(Error);

      const fakeWin = newFakeWindow();
      const cbOne = sinon.spy();
      expect(() => install({ hostWindow: fakeWin }, cbOne), 'throws if nameForDebug is empty').to.throw(Error);
      expect(fakeWin.addEventListener.callCount).to.not.be.ok;

      setTimeout(() => {

        expect(cbOne.callCount).to.not.be.ok;
        done();

      }, 0);

    });


    it('handles non-bg window as args', (done) => {

      // Non-bg window as args.
      const fakeWin = newFakeWindow();

      fakeWin.addEventListener.callsFake(function fakeFn(type, handler) {

        if (type === 'error') {
          expect(fakeWin.chrome.runtime.sendMessage.callCount).to.not.be.ok;
          handler({ error: new Error('foo') });
          expect(fakeWin.chrome.runtime.sendMessage.callCount).to.equal(1);
        }

      });

      const cb = sinon.spy();
      const uninstall = install({
        hostWindow: fakeWin,
        nameForDebug: 'PUP',
      }, cb);
      assert.isFunction(uninstall);
      expect(fakeWin.addEventListener.callCount).to.equal(2);
      expect(fakeWin.removeEventListener.callCount).to.be.not.ok;
      uninstall();
      expect(fakeWin.removeEventListener.callCount).to.equal(2);

      setTimeout(() => {

        expect(cb.callCount).to.equal(1);
        done();

      }, 0);

    });

    it('handles fake bg window as args', (done) => {

      const originalAdder = window.addEventListener;
      const originalRemover = window.removeEventListener;
      window.addEventListener = sinon.stub();
      window.removeEventListener = sinon.stub();
      const handleErrorMessage = sinon.spy();

      window.addEventListener.callsFake(function fakeFn(type, handler) {

        if (type === 'error') {
          expect(window.chrome.runtime.sendMessage.callCount).to.not.be.ok;
          handler({ error: new Error('foo') });
          expect(window.chrome.runtime.sendMessage.callCount).to.not.be.ok;
          expect(handleErrorMessage.callCount).to.equal(1);
        }

      });

      const cb = sinon.spy();
      const uninstall = install({
        handleErrorMessage,
      }, cb);
      assert.isFunction(uninstall);
      expect(window.addEventListener.callCount).to.equal(2);
      expect(window.removeEventListener.callCount).to.be.not.ok;
      uninstall();
      expect(window.removeEventListener.callCount).to.equal(2);
      window.addEventListener = originalAdder;
      window.removeEventListener = originalRemover;

      setTimeout(() => {

        expect(cb.callCount).to.equal(1);
        done();

      }, 0);

    });

    it('catches errors on real window', (done) => {

      const handleErrorMessage = sinon.spy();
      const uninstall = install({
        handleErrorMessage,
      });
      const err = new EvalError('bar');
      catchGlobal((thrown) => {

        expect(thrown).to.equal(err);
        expect(handleErrorMessage.callCount).to.equal(1);
        uninstall();
        done();

      });
      setTimeout( // Required.
        () => { throw err; },
        0,
      );

    });

    if (/Chrome/.test(navigator.userAgent)) {
      it('catches rejected promises on real window', (done) => {

        const handleErrorMessage = sinon.spy();
        const uninstall = install({
          handleErrorMessage,
        });

        const reason = new TypeError('REASON');
        catchGlobal((thrown) => {

          expect(thrown).to.equal(reason);
          expect(handleErrorMessage.callCount).to.equal(1);
          uninstall();
          done();

        });
        Promise.resolve().then( () => Promise.reject(reason) );

      });
    }

  });

});
