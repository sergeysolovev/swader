export default {
  default: makeCancelable(),
  make: (promise, onfulfilled, onrejected) =>
    makeCancelable(promise, onfulfilled, onrejected, () => false)
}

function makeCancelable(promise, onfulfilled, onrejected, hasCanceled) {
  promise = promise || Promise.resolve();
  hasCanceled = hasCanceled || (() => false);
  let isCanceled = false;
  let wrapper = new Promise((resolve, reject) => promise
    .then(val =>  isCanceled || hasCanceled() ? reject({isCanceled: true}) : resolve(val))
    .catch(err => isCanceled || hasCanceled() ? reject({isCanceled: true}) : reject(err))
  )
    .then(onfulfilled)
    .catch(error => { if (error && !error.isCanceled) { throw(error); } })
    .catch(onrejected);
  return {
    do: function() { isCanceled = true; },
    with: (promise, onfulfilled, onrejected) =>
      makeCancelable(promise, onfulfilled, onrejected, () => isCanceled),
    extract: wrapper,
  };
}