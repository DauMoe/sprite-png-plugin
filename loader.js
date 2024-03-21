// Loader interface: https://webpack.js.org/api/loaders/

const ShareStore = require("./store");
const { COORDINATE_PATH } = require("./constant");
const path = require("path");

module.exports = function (source) {
  if (this.cacheable) {
    this.cacheable();
  }

  const { coordinateFileName } = this.getOptions();
  const relativePath = this.resourcePath;

  if (!coordinateFileName) throw Error('"coordinateFileName" option is required')
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

  if (path.basename(relativePath) == coordinateFileName) {
    if (ShareStore.getData(COORDINATE_PATH)) throw Error('"coordinateFileName" must be unique file name')
    ShareStore.addData(COORDINATE_PATH, this.resourcePath);
  }

  return value;
}