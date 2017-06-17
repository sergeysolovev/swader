import unplug from './unplug'

describe('unplug', () => {
  it('is an object with socket function', () => {
    expect(unplug).toMatchObject({
      socket: expect.any(Function)
    });
  });

  describe('.socket()', () => {
    it('returns an object with two functions: plug, unplug', () => {
      expect(unplug.socket()).toMatchObject({
        plug: expect.any(Function),
        unplug: expect.any(Function)
      });
    });

    describe('.unplug()', () => {
      it('does not throw if called before plug', () => {
        const socket = unplug.socket();
        expect(() => socket.unplug()).not.toThrow();
      });
    });

    describe('.plug()', () => {
      it('resolves the same value as original promise', () => {
        const socket = unplug.socket();
        const value = {};
        const promise = Promise.resolve(value);
        const plugged = socket.plug(wire => wire(promise));
        return expect(plugged.extract).resolves.toBe(value);
      });

      it('rejects the same reason as original promise', () => {
        const socket = unplug.socket();
        const reason = new Error();
        const promise = Promise.reject(reason);
        const plugged = socket.plug(wire => wire(promise));
        return expect(plugged.extract).rejects.toBe(reason);
      });

      it('resolves undefined if it was unplugged', () => {
        const socket = unplug.socket();
        const promise = Promise.resolve({});
        const plugged = socket.plug(wire => wire(promise));
        socket.unplug();
        return expect(plugged.extract).resolves.toBeUndefined();
      });
    });
  });
});
