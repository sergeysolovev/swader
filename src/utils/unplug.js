export default {
  socket() {
    const plugged = new Set();
    return {
      plug(closure) {
        this.unplug();
        const ref = {};
        const unplugged = { unplugged: true };
        plugged.add(ref);
        return closure((promise, onFulfilled, onRejected) => {
          const wrapper = new Promise((resolve, reject) => promise
            .then(val => plugged.has(ref) ? resolve(val) : reject(unplugged))
            .catch(rsn => plugged.has(ref) ? reject(rsn) : reject(unplugged))
          )
            .then(onFulfilled)
            .catch(rsn => { if (rsn && !rsn.unplugged) { throw rsn; } })
            .catch(onRejected);
          return { extract: wrapper };
        });
      },
      unplug() {
        plugged.clear();
      }
    };
  }
}