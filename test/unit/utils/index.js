'use strict';

describe('Weer.Utils', () => {

  it('exports global Weer variable', () => {
    assert.isDefined(Weer, 'Weer is defined');
    assert.isDefined(Weer.Utils, 'Weer.Utils is defined');
  });

  const { Utils } = Weer;

  it('provides `mandatory`', () => {

    assert.isDefined(Utils.mandatory, 'Utils.mandatory is defined');
    expect(Utils.mandatory, '`mandatory` throws TypeError when called').to.throw(TypeError);

    // eslint-disable-next-line
    const foo = function foo(one, two = Utils.mandatory()) {};
    const wrapper = () =>
      foo('one');
    expect(wrapper, '`mandatory` throws TypeError when argument is not passed').to.throw(TypeError);

  });

  it('provides `throwIfError`', () => {

    assert.isDefined(Utils.throwIfError, '`Utils.throwIfError` is defined');
    expect(Utils.throwIfError(), 'returns undefined when called w/o args').to.be.undefined;
    expect(
      () => Utils.throwIfError(new RangeError()),
      'throws the error passed as 1st arg',
    ).to.throw(RangeError);

  });

  const setLastError = (err) => {
    expect(chrome.runtime.lastError, 'can\'t override already set lastError').to.not.exist;
    chrome.runtime.lastError = { message: err.message };
  };
  const unsetLastError = () => {
    expect(chrome.runtime.lastError, 'can\'t clear already cleared lastError').to.exist;
    chrome.runtime.lastError = undefined;
  };

  it('self test of (un)setLastError', () => {

    const msg = 'SOME MSG';
    const err = new TypeError(msg);
    setLastError(err);
    expect(chrome.runtime.lastError.message, 'lastError is assignable').to.equal(msg);

    unsetLastError(err);
    expect(chrome.runtime.lastError, 'lastError is restorable').to.not.exist;

  });

  it('provides `checkChromeError`', () => {

    assert.isDefined(Utils.checkChromeError, '`Utils.checkChromeError` is defined');
    expect(Utils.checkChromeError(), 'returns undefined if no error').to.be.undefined;

    const msg = 'CHECK ME!';
    const err = new TypeError(msg);

    setLastError(err);

    expect(Utils.checkChromeError().message, 'returns error with message on error').to.equal(msg);
    expect(Utils.checkChromeError().stack, 'returns error with stack on error').to.not.be.empty;

    unsetLastError();

    expect(Utils.checkChromeError(), 'returns undefined if no error (after restore)').to.be.undefined;

  });

  it('provides `timeouted`', (done) => {

    assert.isDefined(Utils.timeouted, '`Utils.timeouted` is defined');
    let flag = 'off';

    const newFun = Utils.timeouted((...args) => { flag = [...args]; });

    assert.isFunction(newFun, '`timeouted` returns function');
    expect(flag, 'passed function is not executed').to.equal('off');

    const nums = ['one', 'two', 'three'];
    const res = newFun(...nums);
    expect(res, 'new function returns undefined').to.be.undefined;

    setTimeout(() => {

      expect(flag, 'new function is executed').to.eql(nums);
      done();

    }, 1);

  });

  it('provides `chromified`', () => {

    assert.isDefined(Utils.chromified, '`Utils.chromified` is defined');

    const check = (passedErr) => {

      const resolver = {};
      const p1 = new Promise((resolve) => { resolver.resolve = resolve; });

      const newFun = Utils.chromified((err, ...args) => { resolver.resolve([err, ...args]); });
      assert.isFunction(newFun, '`chromified` returns function');

      if (passedErr) {
        setLastError(passedErr);
      }

      const nums = ['one', 'two', 'three'];
      const res = newFun(...nums);
      expect(res, 'new function returns undefined').to.be.undefined;
      return p1.then(([err, ...args]) => {

        if (!passedErr) {
          expect(err).to.be.undefined;
        } else {
          expect(err.message).to.equal(passedErr.message);
          unsetLastError();
        }
        expect(args).to.eql(nums);

      });

    };
    return check().then(
      () => check(new EvalError('EVAL ERR!')),
    );

  });

  it('provides `getOrDie`', (done) => {

    assert.isDefined(Utils.getOrDie, '`Utils.getOrDie` is defined');
    expect(Utils.getOrDie).to.throw(TypeError); // No args.
    let flag = 'off';
    const newFun = Utils.getOrDie((...args) => { flag = [...args]; });
    assert.isFunction(newFun, '`getOrDie` returns function');
    const err = new EvalError('foo');
    const nums = ['one', 'two', 'three'];
    setLastError(err);
    const resOne = newFun(...nums);
    expect(resOne, 'new function returns nothing').to.be.undefined;

    catchGlobal((thrown) => {

      expect(thrown.message).to.be.equal(err.message);
      expect(flag, 'funciton is not executed in case of lastError').to.equal('off');

      unsetLastError();
      const resTwo = newFun(...nums);
      expect(resTwo, 'new function returns nothing (second)').to.be.undefined;
      setTimeout(
        () => {

          expect(flag, 'new function is executed if no lastError').to.eql(nums);
          done();

        },
        0,
      );

    });

  });

  it('provides `assert`', () => {

    expect(Utils.assert, 'throws if no arguments').to.throw(Error);
    expect(() => Utils.assert(null), 'throws if falsy arg').to.throw(Error);
    expect(() => Utils.assert(''), 'throws if empty string').to.throw(Error);
    expect(() => Utils.assert(undefined), 'throws if undefined').to.throw(Error);
    expect(() => Utils.assert(undefined, 'BAZZ'), 'throws if undefined').to.throw(Error, 'BAZZ');
    expect(() => Utils.assert(true)).to.not.throw();
    expect(() => Utils.assert('a')).to.not.throw();
    expect(() => Utils.assert(2)).to.not.throw();

  });

  it('provides error/errorEvent to plain object converters', () => {

    assert.isDefined(
      Utils.errorToPlainObject,
      'Utils.errorToPlainObject is defined',
    );
    assert.isDefined(
      Utils.errorEventToPlainObject,
      'Utils.errorEventToPlainObject is defined',
    );

  });

});
