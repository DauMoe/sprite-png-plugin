const fs = require("fs");
const path = require("path");
const ShareStore = require("./ShareStore");

// Docs: https://webpack.js.org/api/loaders/

/**
 * @WIP
 * Loader will replace all resource path by the first path
 * because we just need one sprite image after all
 */

const replaceBackSplash = filePath => filePath.split(path.sep).join(path.posix.sep);

module.exports = function (source) {
  if (this.cacheable) {
    this.cacheable();
  }

  const options = this.getOptions();

  const replacement = (resourcePath) => {
    // const opts = { context };
    // return options.replacement instanceof Function ? options.replacement(resourcePath, opts) || null : options.replacement
    return "E:/PTC/sprite_webpack_plugin/example/src/another/test_1.png"
  };

  const replacementPath = replacement(this.resourcePath);
  const isTheSamePath = replacementPath === this.resourcePath;
  // if (replacementPath === null || isTheSamePath) {
  //   isTheSamePath && progress(`Skip replace because replacement returned the same path [${replacementPath}]`);
  //   return source; // Skip replacement
  // }
  // if (fs.existsSync(replacementPath)) {
  //   this.addDependency(replacementPath);
  // } else {
  //   throw new Exception("HAVE AN ERROR HERE WITH REPALCEMENT PATH");
  // }
  return fs.readFileSync(replacementPath, { flag: 'r' });
}

// const replacement = (g) => {

// }