// Loader interface: https://webpack.js.org/api/loaders/

const ShareStore = require("./store");
const { COORDINATE_PATH } = require("./constant");

module.exports = function (source) {
  if (this.cacheable) {
    this.cacheable();
  }

  // from 'json-loader': https://github.com/webpack-contrib/json-loader/blob/master/index.js
  let value;

  try {
    value = typeof source === "string" ? JSON.parse(source) : source;

    value = JSON.stringify(value)
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  } catch(e) {
    console.warn(e);
    value = "{}";
  }

  ShareStore.addData(COORDINATE_PATH, this.resourcePath);
  return value;
}