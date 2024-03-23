const Spritesmith = require("spritesmith");
const Vinyl = require("vinyl");
const path = require("path");
const VirtualModulesPlugin = require('webpack-virtual-modules');

const _PACKAGE_NAME = "SpritePNG_Plugin";

/**
 * @NOTE
 *  - Compiler docs: https://webpack.js.org/api/compiler-hooks
 *  - Compilation docs: https://webpack.js.org/api/compilation-hooks/
 *  - https://github.com/twolfson/spritesmith
 *  - Refer: https://github.com/DauMoe/image-sprite-webpack-plugin
 */

module.exports = class SpritePNG_Plugin {
  constructor(option = {}) {
    this._outputPath = option.outputPath;
    this._includes = option.includes; // Reg and Array are allowed
    this._outputDir = null;
    this._publicPath = null;
    this._coordinateMeta = null;
    this._coordinateRelativePath = null;
  }

  isPng = (filePath) => filePath?.endsWith('.png');

  createSpriteSheet(imagesData, callback) {
    Spritesmith.run({
      src: imagesData
    }, (err, result) => {
      if (err) throw err;
      callback(result)
    })
  }

  inWhiteList(filePath) {
    if (!this._includes) return true;
    const isReg = this._includes instanceof RegExp;
    const isArr = Array.isArray(this._includes);
    if (!(isReg || isArr)) throw Error(`"includes" can be "RegExp" or "Array" only but receive "${typeof this._includes}"`);
    if (isReg) return !this._includes.test(filePath);
    if (isArr) return !this._includes.includes(filePath);
  }

  apply(compiler) {
    const virtualModules = new VirtualModulesPlugin({
      "src/test.json": "{}"
    });

    virtualModules.apply(compiler);

    compiler.hooks.thisCompilation.tap({ name: _PACKAGE_NAME }, (compilation) => {
      const RawSource = compilation.compiler.webpack.sources.RawSource

      this._outputDir = this._outputPath
          ? path.resolve(process.cwd(), this._outputPath)
          : compiler.outputPath;
      
      this._publicPath = compilation.outputOptions.publicPath;

      // Use "tapAsync" instead of "tap" because create sprite is async function
      compilation.hooks.processAssets.tapAsync(
        {
          name: _PACKAGE_NAME,
          stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        (assets, callback) => {
          const imagesPath = Object.keys(assets).filter(filePath => this.inWhiteList(filePath) && this.isPng(filePath));

          // Create image File Buffer
          const imagesData = imagesPath.map(assetPath => new Vinyl({
            path: path.join(this._outputDir, assetPath),
            contents: assets[assetPath].source()
          }));

          if (imagesPath.length > 0) {
            // Create sprite
            this.createSpriteSheet(imagesData, ({ coordinates, properties, image }) => {
              const spriteSource = new RawSource(image);
              compilation.updateAsset(imagesPath[0], spriteSource);

              // Remove all un-necessary assets
              imagesPath.forEach((imagePath, idx) => {
                if (idx > 0) compilation.deleteAsset(imagePath)
              });

              //Generate coordinate mapping
              let coordinateMeta = {};
              coordinateMeta["width"] = properties.width;
              coordinateMeta["height"] = properties.height;
              coordinateMeta["frames"] = {};
              Object.keys(coordinates).map(relativePath => {
                coordinateMeta["frames"][path.basename(relativePath)] = coordinates[relativePath];
              });
              virtualModules.writeModule('src/test.json', JSON.stringify(coordinateMeta));
              callback();
            });
          } else {
            callback();
          }
        }
      );
    })
  }
}