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

    describe('.plug(closure) where closure: (wire) => {...}', () => {
      it('returns the same value as passed closure', () => {
        const value = {};
        const socket = unplug.socket();
        expect(socket.plug(wire => value)).toBe(value);
      });

      describe('wire: ((args) => a) => ((args) => a)', () => {
        it('always returns a function' , () => {
          const value = {};
          const socket = unplug.socket();
          socket.plug(wire => {
            expect(wire()).toEqual(expect.any(Function));
            expect(wire({})).toEqual(expect.any(Function));
            expect(wire(() => {})).toEqual(expect.any(Function));
            socket.unplug();
            expect(wire()).toEqual(expect.any(Function));
            expect(wire({})).toEqual(expect.any(Function));
            expect(wire(() => {})).toEqual(expect.any(Function));
          });
        });

        describe('wired: ((args) => a)', () => {
          it(`calls target func with
              the same args as wired (stubs it)` , () => {
            const socket = unplug.socket();
            const targetFunc = jest.fn();
            socket.plug(wire => {
              const wired = wire(targetFunc);
              [[], [undefined], [{}], [{},{}]].forEach(targetArgs => {
                wired(...targetArgs);
                expect(targetFunc).toBeCalledWith(...targetArgs);
              })
            });
          });

          it(`does not call target func if socket was unplugged
              before wiring`, () => {
            const socket = unplug.socket();
            const targetFunc = jest.fn();
            socket.plug(wire => {
              socket.unplug();
              const wired = wire(targetFunc);
              [[], [undefined], [{}], [{},{}]].forEach(targetArgs =>
                wired(...targetArgs));
            });
            expect(targetFunc).not.toBeCalled();
          });

          it(`does not call target func if socket was unplugged
              after wiring`, () => {
            const socket = unplug.socket();
            const targetFunc = jest.fn();
            socket.plug(wire => {
              const wired = wire(targetFunc);
              socket.unplug();
              [[], [undefined], [{}], [{},{}]].forEach(targetArgs =>
                wired(...targetArgs));
            });
            expect(targetFunc).not.toBeCalled();
          });

          it(`does not call target func if socket was plugged again`, () => {
            const socket = unplug.socket();
            const targetFunc = jest.fn();
            const plug = ({plugBeforeWiring, plugAfterWiring}) => {
              socket.plug(wire => {
                if (plugBeforeWiring) { socket.plug(Function()); }
                const wired = wire(targetFunc);
                if (plugAfterWiring) { socket.plug(Function()); }
                wired();
              });
            }

            [true, false, true].forEach(plugAfterWiring =>
              plug({plugAfterWiring}));
            expect(targetFunc).toHaveBeenCalledTimes(1);

            targetFunc.mockClear();

            [false, true, false].forEach(plugAfterWiring =>
              plug({plugAfterWiring}));
            expect(targetFunc).toHaveBeenCalledTimes(2);

            targetFunc.mockClear();

            [true, false, true].forEach(plugBeforeWiring =>
              plug({plugBeforeWiring}));
            expect(targetFunc).toHaveBeenCalledTimes(1);

            targetFunc.mockClear();

            [false, true, false].forEach(plugBeforeWiring =>
              plug({plugBeforeWiring}));
            expect(targetFunc).toHaveBeenCalledTimes(2);
          });
        });
      });
    });
  });
});
