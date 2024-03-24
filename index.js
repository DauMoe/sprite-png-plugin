const plugin = require("./plugin");
const _loader = require("./loader");

const SpritePng = plugin;

SpritePng.prototype.loader = function() {
  return require.resolve("./loader");
}

// SpritePng.loader = SpritePng.prototype.loader.bind(_loader);

module.exports = SpritePng;