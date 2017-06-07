import cancelable from './cancelable'
import sinon from 'sinon'

describe('cancelable.default', () => {
  it(`should return cancelable, i.e. an object with
      a property .do that is a function
      a property .extract that has .then function and
      a property .with that is a function`, () => {
    const cancel = cancelable.default;
    expect(typeof cancel).toBe('object');
    expect(typeof cancel.do).toBe('function');
    expect(typeof cancel.extract).toBe('object');
    expect(typeof cancel.extract.then).toBe('function');
    expect(typeof cancel.with).toBe('function');
  });
})

describe('cancelable.make(...)', () => {
  it(`should return cancelable, i.e. an object with
      a property .do that is a function
      a property .extract that has .then function and
      a property .with that is a function`, () => {
    const cancel = cancelable.make();
    expect(typeof cancel).toBe('object');
    expect(typeof cancel.do).toBe('function');
    expect(typeof cancel.extract).toBe('object');
    expect(typeof cancel.extract.then).toBe('function');
    expect(typeof cancel.with).toBe('function');
  });

  it(`should resolve with undefined value
      when used with empty arguments list`, () => {
    const cancel = cancelable.make();
    return cancel.extract.then(
      val => expect(val).toBe(undefined),
      () => Promise.reject('it should resolve'));
  });

  it('should resolve with the same value as resolved @promise', () => {
    const value = Object();
    const promise = Promise.resolve(value);
    const cancel = cancelable.make(promise);
    return cancel.extract.then(
      val => expect(val).toBe(value),
      err => Promise.reject('it should resolve'));
  });

  it(`should reject with the same value as rejected @promise`, () => {
    const error = Error();
    const promise = Promise.reject(error);
    const cancel = cancelable.make(promise);
    return cancel.extract.then(
      () => Promise.reject('it should not resolve'),
      err => expect(err).toBe(error));
  });

  it(`should reject with the same value as rejected @promise
      when @onfulfilled defined`, () => {
    const error = Error();
    const promise = Promise.reject(error);
    const onfulfilled = sinon.spy();
    const cancel = cancelable.make(promise, onfulfilled);
    return cancel.extract.then(
      () => Promise.reject('it should reject'),
      err => {
        expect(err).toBe(error);
        expect(onfulfilled.notCalled).toBe(true);
      }
    );
  });

  it(`should call @onrejected with the same value as rejected @promise
      should not call @onfulfilled`, () => {
    const error = Error();
    const promise = Promise.reject(error);
    const onrejected = sinon.spy();
    const onfulfilled = sinon.spy();
    const cancel = cancelable.make(promise, onfulfilled, onrejected);
    return cancel.extract.then(
      () => {
        expect(onrejected.calledWith(error)).toBe(true);
        expect(onfulfilled.notCalled).toBe(true);
      },
      err => Promise.reject('it should resolve')
    );
  });

  it(`should call @onfulfilled with the same value as resolved @promise
      should not call @onrejected`, () => {
    const value = Object();
    const promise = Promise.resolve(value);
    const onrejected = sinon.spy();
    const onfulfilled = sinon.spy();
    const cancel = cancelable.make(promise, onfulfilled, onrejected);
    return cancel.extract.then(
      () => {
        expect(onfulfilled.calledWith(value)).toBe(true);
        expect(onrejected.notCalled).toBe(true);
      },
      err => Promise.reject('it should resolve')
    );
  });

  it(`should not call @onfulfilled
      should not call @onrejected
      when canceled resolved @promise`, () => {
    const value = Object();
    const promise = Promise.resolve(value);
    const onfulfilled = sinon.spy();
    const onrejected = sinon.spy();
    const cancel = cancelable.make(promise, onfulfilled, onrejected);
    cancel.do();
    return cancel.extract.then(
      () => {
        expect(onfulfilled.notCalled).toBe(true);
        expect(onrejected.notCalled).toBe(true);
      },
      err => Promise.reject('it should resolve'));
  });

  it(`should not call @onfulfilled
      should not call @onrejected
      when canceled rejected @promise`, () => {
    const error = Error();
    const promise = Promise.reject(error);
    const onfulfilled = sinon.spy();
    const onrejected = sinon.spy();
    const cancel = cancelable.make(promise, onfulfilled, onrejected);
    cancel.do();
    return cancel.extract.then(
      () => {
        expect(onfulfilled.notCalled).toBe(true);
        expect(onrejected.notCalled).toBe(true);
      },
      err => Promise.reject('it should resolve'));
  });
});

describe('cancelable.make(...).with(...)', () => {
  it(`should return cancelable, i.e. an object with
      a property .do that is a function
      a property .extract that has .then function and
      a property .with that is a function`, () => {
    const cancelWith = cancelable.make().with();
    expect(typeof cancelWith).toBe('object');
    expect(typeof cancelWith.do).toBe('function');
    expect(typeof cancelWith.extract).toBe('object');
    expect(typeof cancelWith.extract.then).toBe('function');
    expect(typeof cancelWith.with).toBe('function');
  });

  it(`should call @onfulfilled of inner with a value from the outer closure
      should not call @onrejected of inner
      when outer promise is resolved and
      when inner promise is resolved`, () => {
    let cancel;
    const value = Object();
    const outerValue = { value };
    const outerPromise = Promise.resolve(outerValue);
    const onfulfilled = sinon.spy();
    const onrejected = sinon.spy();
    const outerOnfulfilled = sinon.spy(outerVal => {
      cancel.with(
        Promise.resolve(outerVal.value),
        onfulfilled,
        onrejected
      );
    });
    const outerOnrejected = sinon.spy();
    cancel = cancelable.make(
      outerPromise,
      outerOnfulfilled,
      outerOnrejected);
    return cancel.extract.then(
      () => {
        expect(onfulfilled.calledWith(value)).toBe(true);
        expect(outerOnfulfilled.calledWith(outerValue)).toBe(true);
        expect(onfulfilled.calledAfter(outerOnfulfilled)).toBe(true);
        expect(onrejected.notCalled).toBe(true);
        expect(outerOnrejected.notCalled).toBe(true);
      },
      err => Promise.reject('it should resolve')
    );
  });

  it(`should not call @onfulfilled of inner
      should not call @onrejected of inner
      when outer promise is canceled and
      when inner promise is resolved`, () => {
    let cancel;
    const value = Object();
    const outerValue = { value };
    const outerPromise = Promise.resolve(outerValue);
    const onfulfilled = sinon.spy();
    const onrejected = sinon.spy();
    const beforeCancel = sinon.spy();
    const outerOnfulfilled = sinon.spy(outerVal => {
      beforeCancel();
      cancel.do();
      cancel.with(
        Promise.resolve(outerVal.value),
        onfulfilled,
        onrejected
      );
    });
    const outerOnrejected = sinon.spy();
    cancel = cancelable.make(
      outerPromise,
      outerOnfulfilled,
      outerOnrejected);
    const doCancel = sinon.spy(cancel, 'do');
    return cancel.extract.then(
      () => {
        expect(outerOnfulfilled.calledWith(outerValue)).toBe(true);
        expect(beforeCancel.calledBefore(doCancel)).toBe(true);
        expect(onfulfilled.notCalled).toBe(true);
        expect(onrejected.notCalled).toBe(true);
        expect(outerOnrejected.notCalled).toBe(true);
      },
      err => Promise.reject('it should resolve')
    );
  });

  it(`should not call @onfulfilled of inner
      should not call @onrejected of inner
      when outer promise is canceled and
      when inner promise is rejected`, () => {
    let cancel;
    const value = Error();
    const outerValue = { value };
    const outerPromise = Promise.resolve(outerValue);
    const onfulfilled = sinon.spy();
    const onrejected = sinon.spy();
    const beforeCancel = sinon.spy();
    const outerOnfulfilled = sinon.spy(outerVal => {
      beforeCancel();
      cancel.do();
      cancel.with(
        Promise.reject(outerVal.value),
        onfulfilled,
        onrejected
      );
    });
    const outerOnrejected = sinon.spy();
    cancel = cancelable.make(
      outerPromise,
      outerOnfulfilled,
      outerOnrejected);
    const doCancel = sinon.spy(cancel, 'do');
    return cancel.extract.then(
      () => {
        expect(outerOnfulfilled.calledWith(outerValue)).toBe(true);
        expect(beforeCancel.calledBefore(doCancel)).toBe(true);
        expect(onfulfilled.notCalled).toBe(true);
        expect(onrejected.notCalled).toBe(true);
        expect(outerOnrejected.notCalled).toBe(true);
      },
      err => Promise.reject('it should resolve')
    );
  });
})