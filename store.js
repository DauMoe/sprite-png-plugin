/**
 * @TARGET share data between loader and plugin via store
 * @REFER https://stackoverflow.com/questions/46308248/webpack-share-data-between-custom-loader-and-plugin
 */

class Store {
  constructor() {
    this.__store = new Map(); // follow him
    this.addData = this.addData.bind(this);
    this.getDate = this.getDate.bind(this);
    this.clearStore = this.clearStore.bind(this);
  }

  addData(key, value) {
    this.__store.set(key, value);
  }

  getDate(key) {
    return this.__store.get(key);
  }

  clearStore() {
    this.__store.clear();
  }
}

module.exports = new Store();