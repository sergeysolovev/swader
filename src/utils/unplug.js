export default {
  socket() {
    const plugged = new Set();
    return {
      plug(closure) {
        this.unplug();
        const ref = {};
        const wire = (callback) =>
          (...args) => plugged.has(ref) ? callback(...args) : {};
        plugged.add(ref);
        return closure(wire);
      },
      unplug() {
        plugged.clear();
      }
    };
  }
}