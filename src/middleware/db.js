import idb from 'idb';
import resources from './resources'

export default function db(resource) {
  const dbPromise = idb.open('data', 1, upgradeDB => {
    resources.forEach(res => {
      upgradeDB.createObjectStore(res);
      upgradeDB.createObjectStore(res + '.ts');
      upgradeDB.createObjectStore(res + '.hs');
    });
  });
  return Object.assign({},
    dbOps(dbPromise, resource),
    {
      ts: dbOps(dbPromise, resource + '.ts'),
      hs: dbOps(dbPromise, resource + '.hs')
    }
  );
}

function dbOps(dbPromise, objectStore) {
  return {
    get(key) {
      return dbPromise.then(db => {
        return db.transaction(objectStore)
          .objectStore(objectStore).get(key);
      });
    },
    set(key, val) {
      return dbPromise.then(db => {
        const tx = db.transaction(objectStore, 'readwrite');
        tx.objectStore(objectStore).put(val, key);
        return tx.complete;
      });
    },
    delete(key) {
      return dbPromise.then(db => {
        const tx = db.transaction(objectStore, 'readwrite');
        tx.objectStore(objectStore).delete(key);
        return tx.complete;
      });
    },
    clear() {
      return dbPromise.then(db => {
        const tx = db.transaction(objectStore, 'readwrite');
        tx.objectStore(objectStore).clear();
        return tx.complete;
      });
    },
    keys() {
      return dbPromise.then(db => {
        const tx = db.transaction(objectStore);
        const keys = [];
        const store = tx.objectStore(objectStore);
        (store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
          if (!cursor) return;
          keys.push(cursor.key);
          cursor.continue();
        });
        return tx.complete.then(() => keys);
      });
    }
  };
}
