class ShareStore {
  constructor() {
    this.__store = new Map();
  }

  setData(k, v) {
    console.log("[STORE] SET", k, v);
    this.__store.set(k, v);
  }

  pushData2Array(k, v) {
    const exists = this.__store.has(k);
    this.__store.set(k, exists ? [...this.__store.values(k), v] : [v]);
  }

  getData(k) {
    return this.__store.get(k);
  }

  delByKey(k) {
    this.__store.delete(k);
  }

  clear() {
    this.__store.clear();
  }
}

module.exports = new ShareStore;